var result="";
var showPopup, createCopy;

function onRequest(request, sender, sendResponse) {
  if(request.ask=="ed2klinks"){
    showPopup(request.result,sender.tab.id);		
  }
};

chrome.extension.onRequest.addListener(onRequest);
chrome.tabs.onSelectionChanged.addListener(function(id,obj){
  chrome.tabs.sendRequest(id,{ask:"getResult"},function(response){
    if (!chrome.runtime.lastError) {
      console.log(response.result);
      result = response.result;
    }
  });
});

showPopup = function(re,id){
  result = re;	
  chrome.pageAction.show(id);
}

createCopy = function(re){		
  chrome.tabs.create({url:"copy.html"},callback);
  function callback(tab){		
    chrome.tabs.sendRequest(tab.id,re,function(response){});
  }
}
