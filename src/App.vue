

<template>
  <div class="container">
    <el-container>
      <el-main>
        <div v-if="hasData">
          <el-row>
            <el-col :span="16">
              from:<el-input-number
                v-model="fromNum"
                :controls="false"
                size="mini"
              ></el-input-number>
              to:<el-input-number
                v-model="toNum"
                :controls="false"
                size="mini"
              ></el-input-number>
              <el-button type="primary" @click="selectFromTo" size="mini"
                >select</el-button
              >
              <el-button type="primary" @click="cleanSelectFromTo" size="mini"
                >clean</el-button
              >
            </el-col>

            <el-col :span="8">
              <el-button
                type="danger"
                @click="copy"
                v-if="selectedData.length > 0"
                >copy</el-button
              >
            </el-col>
          </el-row>

          <el-tabs v-model="activeName" @tab-click="handleTabChange">
            <el-tab-pane
              v-for="type in TYPES"
              v-bind:key="type"
              :label="type"
              :name="type"
            >
              <el-table
                ref="multipleTable"
                :data="tableData(type)"
                striple
                fit
                style="width: 100%"
                max-height="500"
                @selection-change="handleTableSelectChange"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="sequence" label="#" width="60" />
                <el-table-column prop="fileName" label="file" width="500">
                  <template #default="scope">
                    <el-link
                      type="primary"
                      :href="scope.row.link"
                      :underline="false"
                      >{{ scope.row.fileName }}</el-link
                    >
                  </template>
                </el-table-column>
                <el-table-column property="fileSize" label="size" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div v-else>
          <el-row>
            <el-col :span="8"
              ><div class="grid-content bg-purple"></div
            ></el-col>
            <el-col :span="8">
              <div class="grid-content bg-purple-light">
                <span i18n="no_data">刷新读取数据</span>
                <el-button
                  type="primary"
                  :icon="RefreshLeft"
                  @click="fetchDocument"
                  circle
                ></el-button>
              </div>
            </el-col>
            <el-col :span="8"> </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { RefreshLeft } from "@element-plus/icons-vue";
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
  Ed2kLink,
  TestString
} from "./types";
import { defineComponent } from "vue";
import cheerio from "cheerio";
import _ from "lodash";

const TYPES: string[] = ["ed2k", "magnet"];

export default defineComponent({
  data() {
    return {
      shit: 1,
      documentBody: "",
      magnetLinks: [] as MagnetLink[],
      ed2kLinks: [] as Ed2kLink[],
      activeName: TYPES[0],
      currentLinks: [] as any[],
      selectedData: [] as any[],
      fromNum: 0,
      toNum: 0,
    };
  },
  computed: {
    hasData(): boolean {
      return this.magnetLinks.length > 0 || this.ed2kLinks.length > 0;
    },
  },
  created() {},
  methods: {
    handleTabChange(tab: any) {
      // ed2k
      if (tab.name == TYPES[0]) {
      } else {
      }
    },
    handleTableSelectChange(val: any ) {
      this.selectedData = val
    },
    selectFromTo() {
      const from = this.fromNum;
      const to = this.toNum;

      if(from >= to) {
        alert("from must less than to selection")
        return 
      }
      const tableData: any[] = this.tableData(this.activeName)
      let datanum = tableData.length

      if(to > datanum) {
        alert("to selection cannot bigger than list total length")
      }

      this.selectedData = []

      for(let i=from; i <= to; i++) {
        let d = tableData[i]
        console.log({data: d})
        let a = ( <any>this ).$refs.multipleTable.toggleRowSelection(d)
      }
    },
    cleanSelectFromTo(){
      this.fromNum = 0;
      this.toNum = 0;
    },
    copy(){
      alert(JSON.stringify(this.selectedData))
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
    },
    genMagnetLinks(bodyString: string): Array<MagnetLink> {
      // 这个已经是magnet的链接
      let magnetLinksArray: string[] =
        bodyString.match(new RegExp(magnet_regex)) || [];

      magnetLinksArray = _.map(magnetLinksArray, (a )=> a.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"))
      

      // 同时把 <a href='magnet:xxxx'>找出来，里面需要看看能否用text做标题
      let $ = cheerio.load(bodyString);

      if (magnetLinksArray.length > 0) {
        magnetLinksArray = _.uniq(magnetLinksArray);
        const resp: Array<MagnetLink> = [];
        for (let seq in magnetLinksArray) {
          let sequence = parseInt(seq);
          let link = magnetLinksArray[seq];
          // 尝试从as里找到有无这条link
          let aQuery = $(`a[href='${link}']`);
          if (aQuery.length > 0) {
            resp.push(new MagnetLink(link, sequence, aQuery.text()));
          } else {
            resp.push(new MagnetLink(link, sequence));
          }
        }
        console.log({ 创建出来的magnet对象们: resp });

        return resp;
      } else {
        return [];
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
          let aQuery = $(`a[href='${link}']`);
          if (aQuery.length > 0) {
            resp.push(new Ed2kLink(link, sequence, aQuery.text()));
          } else {
            resp.push(new Ed2kLink(link, sequence));
          }
        }
        console.log({ 创建出来的ed2k对象们: resp });
        return resp;
      } else {
        return [];
      }
    },
    async getCurrentTab(): Promise<chrome.tabs.Tab> {
      let queryOptions = { active: true, currentWindow: true };
      let [tab] = await chrome.tabs.query(queryOptions);
      return tab;
    },
    async sendToContentScript(message: DispatchMessageType) {
      // let tab = await this.getCurrentTab();
      // const that = this;
      // await chrome.tabs.sendMessage(tab.id!, message, that.responseFunc);
      // 测试 先用testString
      this.responseFunc({documentBody: TestString})
    },
  },
});
</script>


<style scoped lang="less">
</style>
