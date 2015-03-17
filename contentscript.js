var regex = /ed2k:\/\/\|file\|.+?\//ig;
var magnet_regex = /magnet\:\?[^\"]+/ig;
var result = "";
var ed2k_result = [];
var magnet_result = [];
function init() {
  if (regex.test(document.body.innerHTML) || magnet_regex.test(document.body.innerHTML)) {
    ed2k_result = document.body.innerHTML.match(regex) || [];
    magnet_result = document.body.innerHTML.match(magnet_regex) || [];
    result = {ed2k_result: ed2k_result, magnet_result: magnet_result};

    chrome.extension.sendRequest({ask:"ed2klinks", result:result}, function(response) {});
  } 
}

function onRequest(request,sender,sendResponse){	
  if(request.ask=="getResult"){
    if(result){
      sendResponse({result:result});
    }else{			
      ed2k_result = document.body.innerHTML.match(regex) || [];			
      magnet_result = document.body.innerHTML.match(magnet_regex) || [];
      result = {ed2k_result: ed2k_result, magnet_result: magnet_result};
      sendResponse({result:result});
    }
  }
}
init();
chrome.extension.onRequest.addListener(onRequest);


