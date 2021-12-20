import { DispatchMessageType, DocumentContentType, ResponseFunctionType } from "./types"

chrome.runtime.onMessage.addListener((request: DispatchMessageType, sender, sendResponse: ResponseFunctionType) => {
    // 可写成switch形式 监听所有
    if (sender === "") {
        // do something
    }

    console.log({ request })

    const documentBody = document.body.innerHTML
    const response: DocumentContentType = {documentBody}

    console.log({"contentjs的document": documentBody, response})

    // 发送回传
    sendResponse(response);

    // 重发信息
    // chrome.runtime.sendMessage({ number: request.number + 1 }, (response) => {
    //     console.log(
    //         `content script -> background infos have been received. number: ${response.number}`
    //     );
    // });
});
