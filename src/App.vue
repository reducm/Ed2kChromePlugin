<template>
  <div class="container">
    <el-container>
      <el-main>
        <div v-if="hasData">
          <el-row>
            <el-col :span="16">
              <el-form :inline="true">
                <el-form-item :label="t('select_scope')">
                  <el-input-number v-model="fromNum" :controls="false" size="mini"></el-input-number>
                  -
                  <el-input-number v-model="toNum" :controls="false" size="mini"></el-input-number>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="selectFromTo" size="mini">
                    {{
                      t("confirm_scope")
                    }}
                  </el-button>
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="6">
              <el-from :inline="true">
                <el-form-item :label="t('search_filename')">
                  <el-input
                      v-model="searchText"
                      size="mini"
                      placeholder="filename"
                      @keyup="searchFilename"
                      clearable
                      @clear="searchClear"
                  />
                </el-form-item>
              </el-from>
            </el-col>

            <el-col :span="12">
              <el-button type="warning" @click="fetchDocument" size="mini">{{ t("refresh") }}</el-button>

              <el-button type="primary" @click="selectAll" size="mini">{{ t("button_selectall") }}</el-button>

              <el-button
                  type="primary"
                  @click="selectOpposite"
                  size="mini"
              >{{ t("button_selectopposite") }}
              </el-button>

              <el-button
                  v-if="selectedData.length > 0"
                  type="success"
                  size="mini"
                  @click="copy"
              >copy
              </el-button>

              <el-button
                  v-if="selectedData.length > 0"
                  type="danger"
                  @click="clean"
                  size="mini"
              >{{ t("clean_scope") }}
              </el-button>
            </el-col>
          </el-row>

          <el-tabs v-model="activeName" @tab-click="handleTabChange">
            <el-tab-pane v-for="type in TYPES" v-bind:key="type" :label="type" :name="type">
              <el-table
                  :ref="`${type}TableRef`"
                  :data="tableData(type)"
                  striple
                  fit
                  style="width: 100%"
                  max-height="600"
                  @selection-change="handleTableSelectChange"
              >
                <el-table-column type="selection" width="55"/>
                <el-table-column prop="sequence" label="#" width="60"/>
                <el-table-column prop="fileName" label="file" width="500">
                  <template #default="scope">
                    <el-link
                        type="primary"
                        :href="scope.row.link"
                        :underline="false"
                    >{{ scope.row.fileName }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column property="fileSize" label="size"/>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div v-else>
          <el-row>
            <el-col :span="8">
              <div class="grid-content bg-purple"></div>
            </el-col>
            <el-col :span="8">
              <div class="grid-content bg-purple-light">
                <span i18n="no_data">{{ t('no_data') }}</span>
                <el-button type="warning" :icon="RefreshLeft" @click="fetchDocument" circle></el-button>
              </div>
            </el-col>
            <el-col :span="8"></el-col>
          </el-row>
        </div>
      </el-main>

      <el-dialog
          v-model="copyDialogVisible"
          :title="t('copy_success')"
          width="90%"
          :before-close="handleClose"
      >
        <el-input v-model="copyText" autosize type="textarea" :placeholder="t('result_copy')"/>

        <template #footer>
          <span class="dialog-footer">
            <el-button type="success" @click="copyToClipboard">{{ t("button_confirmcopy") }}</el-button>
            <el-button type="primary" @click="copyDialogVisible = false">{{ t("confirm_scope") }}</el-button>
          </span>
        </template>
      </el-dialog>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import {RefreshLeft} from "@element-plus/icons-vue";
</script>

<script lang="ts">
import {
  DispatchMessageType,
  DocumentContentType,
  ResponseFunctionType,
  MagnetLink,
  ed2k_regex,
  magnet_name_regex,
  magnet_regex,
  each_magnet_regex,
  Ed2kLink,
  TestString,
  magnet_xt_reg,
  magnet_dn_reg,
  magnet_xt_reg_with_no_end
} from "./types";
import {defineComponent} from "vue";
import cheerio, {Cheerio, CheerioAPI} from "cheerio";
import _, { trim } from "lodash";
import localalsJSON from "../public/_locales/en/messages.json";

const TYPES: string[] = ["ed2k", "magnet"];

export default defineComponent({
  data() {
    return {
      shit: 1,
      documentBody: "",
      magnetLinks: [] as MagnetLink[],
      ed2kLinks: [] as Ed2kLink[],
      base_magnetLinks: [] as MagnetLink[],
      base_ed2kLinks: [] as Ed2kLink[],
      activeName: TYPES[0],
      currentLinks: [] as any[],
      selectedData: [] as any[],
      fromNum: 0,
      toNum: 0,
      searchText: "" as string,
      copyDialogVisible: false,
      copyText: ""
    };
  },
  computed: {
    hasData(): boolean {
      return this.magnetLinks.length > 0 || this.ed2kLinks.length > 0;
    },
  },
  watch: {},
  created() {
    this.sendToContentScript({dispatch: "dev"});
  },
  methods: {
    handleTabChange(tab: any) {
      this.clean()
    },
    searchClear() {
      this.clean()
    },
    handleClose(done: Function) {
      done()
    },
    handleTableSelectChange(val: any) {
      this.selectedData = val;
    },
    searchFilename() {
      let text: string = this.searchText
      // console.log({searchText: text})
      if (text.length < 1) {
        this.resetAllTable()
        return
      }
      let data = this.getCurrentTableData();
      let newData = _.filter(data, (d) => d.fileName.indexOf(text) > 0)
      this.setCurrentTableData(newData)

    },
    // 复制到粘贴板
    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.copyText);
        alert("copy success!")
      } catch (err) {
        alert(`Somthing Error: ${JSON.stringify(err)} `)
      }
    },
    getCurrentTableData(): any[] {
      const key = this.getCurrentTableDataKey();
      return (<any>this)[key]
    },
    setCurrentTableData(data: any[]) {
      const key = this.getCurrentTableDataKey();
      (<any>this)[key] = data
    },
    getCurrentTableDataKey(): string {
      return `${this.activeName}Links`
    },
    resetAllTable() {
      Object.assign(this.ed2kLinks, this.base_ed2kLinks)
      Object.assign(this.magnetLinks, this.base_magnetLinks)
    },
    selectFromTo() {
      const from = this.fromNum;
      const to = this.toNum;

      if (from >= to) {
        alert("from must less than to selection");
        return;
      }
      const tableData: any[] = this.getCurrentTableData()
      let datanum = tableData.length;

      if (to > datanum) {
        alert("to selection cannot bigger than list total length");
        return;
      }

      const that = this;
      const tableKey = `${that.activeName}TableRef`;
      (<any>this).$refs[tableKey][0].clearSelection();

      // this.selectedData = [];

      // console.log({tableData, refs: that.$refs});
      for (let i = from; i <= to; i++) {
        let d = tableData[i];
        // console.log({ data: d });
        (<any>that).$refs[tableKey][0].toggleRowSelection(d);
        // this.selectedData.push(d)
      }
    },
    clean() {
      this.fromNum = 0;
      this.toNum = 0;
      this.resetAllTable()
      this.searchText = ""
      this.selectedData = []

      for (let type of TYPES) {
        let tableKey = `${type}TableRef`;
        (<any>this).$refs[tableKey][0].clearSelection();
      }

    },
    selectAll() {
      const that = this
      const tableKey: string = `${that.activeName}TableRef`;
      this.clearRefTableSelection(tableKey)
      this.toggleAllRefTableSelection(tableKey)
    },
    clearRefTableSelection(tableKey: any) {
      (<any>this).$refs[tableKey][0].clearSelection();
    },
    toggleAllRefTableSelection(tableKey: any) {
      (<any>this).$refs[tableKey][0].toggleAllSelection();
    },
    selectOpposite() {
      const that = this
      const tableKey = `${that.activeName}TableRef`;
      (<any>this).$refs[tableKey][0].toggleAllSelection();
    },
    async copy() {
      // alert(JSON.stringify(this.selectedData));
      const {selectedData} = this;
      if (selectedData.length < 1) {
        alert("you should select at lease one item!")
        return
      } else {
        const result = _.map(selectedData, (data) => data.link).join("\r\n")
        this.copyText = result
        // 4.2更新为打开也复制一次
        await this.copyToClipboard()
        this.copyDialogVisible = true;
      }

    },
    tableData(type: string): any[] {
      const key = `${type}Links`;
      // 用动态
      const data = (<any>this)[key] || [];
      // console.log({ 计算出的: data, key });
      return data;
    },
    async fetchDocument() {
      const message: DispatchMessageType = {
        dispatch: "getDocumentContent",
      };
      this.sendToContentScript(message);
    },
    // content返回point
    responseFunc(body: DocumentContentType) {
      // console.log({ 返回的页面content: body });
      this.documentBody = body.documentBody;
      this.magnetLinks = this.genMagnetLinks(this.documentBody);
      this.ed2kLinks = this.genEd2kLinks(this.documentBody);

      if(this.ed2kLinks.length == 0 && this.magnetLinks.length > 0) {
        this.activeName = TYPES[1];
      }


      Object.assign(this.base_ed2kLinks, this.ed2kLinks)
      Object.assign(this.base_magnetLinks, this.magnetLinks)
    },
    genMagnetLinks(bodyString: string): Array<MagnetLink> {
      bodyString = bodyString.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")

      // 这个已经是magnet的链接
      let magnetLinksArray: string[] =
          bodyString.match(new RegExp(magnet_regex)) || [];

      console.log({magnetLinksArray})

      // magnetLinksArray = _.map(magnetLinksArray, (a) =>
      //   a.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      // );
      // 同时把 <a href='magnet:xxxx'>找出来，里面需要看看能否用text做标题

      if (magnetLinksArray.length > 0) {
        // console.log("uniq前array长度:", magnetLinksArray.length)

        magnetLinksArray = _.uniq(magnetLinksArray);
        // 消除后面的&
        magnetLinksArray = _.map(magnetLinksArray, (link) => {
          link = trim(link).replace("\"", "").replace("'", "")
          if (link[link.length - 1] == "&") {
            return link.substring(0, link.length - 1)
          } else {
            return link
          }
        })
        const that = this

        let $ = cheerio.load(bodyString);

        // console.log("uniq后array长度:", magnetLinksArray.length)

        const resp: Array<MagnetLink> = [];
        for (let seq in magnetLinksArray) {
          let sequence = parseInt(seq);
          let link = magnetLinksArray[seq];
          // 尝试从as里找到有无这条link
          let aName: string = that.getXtSameATagName($, link)
          if (aName.length > 0) {
            // console.log(`a标签找到${aName}`, {seq, link})
            resp.push(new MagnetLink(link, sequence, aName));
            continue
          } else {
            // console.log("找不到a标签", {seq, link})
            // 可以尝试用dn_name
            try {
              const new_link = decodeURIComponent(link)
              const match = new_link.match(new RegExp(each_magnet_regex)) || []
              if(match && match[2]) {
                const dn_name = match[2]
                resp.push(new MagnetLink(link, sequence, dn_name));
              }
              continue
            } catch (error) {
              console.error("error get dn=", error)
            }
          }

          resp.push(new MagnetLink(link, sequence));
        }
        // console.log({创建出来的magnet对象们: resp});
        return resp;
      } else {
        return [];
      }
    },

    // 给到的link里获取xn再匹配a包含magnet并且link是相同xt的, 再获取里面的链接
    getXtSameATagName($: CheerioAPI, magnetLink: string): string {
      let resp = ""
      const as = $(`a[href^='magnet']`)
      const that = this
      if (as.length > 0) {
        for (let a of as) {
          let aHref = $(a).attr("href")
          // console.log({aHref, a})
          aHref = aHref || ""
          if (aHref.length < 1) continue
          if (this.magLinkIsEquals(aHref, magnetLink)) {
            resp = $(a).text()
            break
          }
        }
      }
      return resp
    },

    magLinkIsEquals(link1: string, link2: string): boolean {
      let resp = this.getXtByMagLink(link1) === this.getXtByMagLink(link2)
      // console.log("判断link是否相等", link1, link2)
      return resp
    },

    getDnByMagLink(magLink: string): string {
      try {
        let match = magLink.match(new RegExp(magnet_dn_reg)) || []
        return match[1] || ""
      } catch (e) {
        console.log("magLink get dn error", {magLink, e})
        return ""
      }
    },

    getXtByMagLink(magLink: string): string {
      try {
        // 这里要适配没有 & 的情况
        let match = magLink.match(new RegExp(magnet_xt_reg_with_no_end)) || []
        // console.log("获取link,xt", {magLink, 截取出来的: match[1]})
        return match[1] || ""
      } catch (e) {
        console.log("magnetUri decode error:", {magLink, e})
        return ""
      }
    },

    genEd2kLinks(bodyString: string): Array<Ed2kLink> {
      let ed2kLinksArray: string[] =
          bodyString.match(new RegExp(ed2k_regex)) || [];

      let $ = cheerio.load(bodyString);

      if (ed2kLinksArray.length > 0) {
        ed2kLinksArray = _.uniq(ed2kLinksArray);
        const resp: Array<Ed2kLink> = [];
        for (let seq in ed2kLinksArray) {
          let sequence = parseInt(seq);
          let link = ed2kLinksArray[sequence];
          let aQuery = $(`a[href="${link}"]`);
          if (aQuery.length > 0) {
            resp.push(new Ed2kLink(link, sequence, aQuery.text()));
          } else {
            resp.push(new Ed2kLink(link, sequence));
          }
        }
        // console.log({ 创建出来的ed2k对象们: resp });
        return resp;
      } else {
        return [];
      }
    },
    async getCurrentTab(): Promise<chrome.tabs.Tab> {
      let queryOptions = {active: true, currentWindow: true};
      let [tab] = await chrome.tabs.query(queryOptions);
      return tab;
    },
    async sendToContentScript(message: DispatchMessageType) {
      let tab = await this.getCurrentTab();
      const that = this;
      await chrome.tabs.sendMessage(tab.id!, message, that.responseFunc);
      // // 测试 先用testString
      // this.responseFunc({ documentBody: TestString });
    },
    t(messageName: string) {
      let message: string = "";
      try {
        message = chrome.i18n.getMessage(messageName);
      } catch (error) {
        console.log("翻译出错: ", {key: messageName, error});
        message = (<any>localalsJSON)[messageName]["message"];
      }
      return message;
    },
  },
});
</script>


<style scoped lang="less">
</style>
