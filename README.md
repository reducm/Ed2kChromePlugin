# Ed2kChromePlugin

it provides a easy way to find the ed2k_link in the pages, select and copy them.

## 4.0

update to vue3 + element-plus + typescript + vite

## development

`npm run dev` 入口是 `$PWD/index.html`, 注意需要修改`App.vue`里的`sendToContentScript`方法，找有下载link的 document.body.innerHTML测试, 注入到 `types.ts`里的 `TestString`, 有注释方法

## build extension

`npm run build` 入口是 `$PWD/src/manifest`, 里面vite会解析`src/popup.html`, build完后chrome开发环境直接导入 `dist`目录即可

## In Google Webstore

[click this link](https://chrome.google.com/webstore/detail/kmeeplonmihpchdbfccgmjhcnpecbppk)
