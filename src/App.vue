

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <h1>{{ shit }}</h1>
  <a @click="fetchDocument">fuck</a>
  {{ documentBody }}
</template>

<script lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import HelloWorld from "./components/HelloWorld.vue";
import {
  DispatchMessageType,
  DocumentContentType,
  ResponseFunctionType,
  MagnetLink,
  ed2k_regex, magnet_name_regex,magnet_regex
  
} from "./types";
import { defineComponent } from "vue";
import _ from "lodash";


export default defineComponent({
  data() {
    return {
      shit: 1,
      documentBody: "",
      magnetLinks: [] as MagnetLink[],
      ed2kLinks: [],
    };
  },

  created() {},
  methods: {
    addShit() {
      this.shit = this.shit + 1;
    },

    async fetchDocument() {
      const message: DispatchMessageType = {
        dispatch: "getDocumentContent",
      };
      this.sendToContentScript(message);
    },
    // content返回point
    responseFunc(body: DocumentContentType) {
      console.log({ 返回的页面content: body.documentBody })
      this.documentBody = body.documentBody
      this.magnetLinks = this.genMagnetLinks(this.documentBody)
    },
    genMagnetLinks(bodyString: string): Array<MagnetLink> {
      let result: string[] = bodyString.match(magnet_regex) || [];
      if (result.length > 0) {
        result = _.uniq(result)
        const resp: Array<MagnetLink> = []
        for(let seq in result) {
           let sequence = parseInt(seq)
           let link = result[seq]
           resp.push(new MagnetLink(link, sequence))
        }
        console.log({创建出来的对象们: resp})

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
      let tab = await this.getCurrentTab();
      const that = this;
      await chrome.tabs.sendMessage(tab.id!, message, that.responseFunc);
    },
  },
});
</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
