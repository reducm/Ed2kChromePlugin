var regex = /ed2k:\/\/\|file\|.+?\//ig;
var magnet_regex = /magnet\:\?[^\"]+/ig;
var result = "";
var ed2k_result = [];
var magnet_links = [];
var magnet_result = [];

function gen_magnet_result(magnet_links) {
  var m_result = [];
  var i;
  for (i = 0; i < magnet_links.length; i++) {
    m_result.push({link: magnet_links[i]['href'], name: magnet_links[i].text});
  }

  return m_result;
}

function init() {
  if (regex.test(document.body.innerHTML) || magnet_regex.test(document.body.innerHTML)) {
    ed2k_result = document.body.innerHTML.match(regex) || [];
    //magnet_result = document.body.innerHTML.match(magnet_regex) || [];
    magnet_links = $("a").filter(function() {return this.href.match(magnet_regex);}) || [];
    magnet_result = gen_magnet_result(magnet_links);

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
      //magnet_result = document.body.innerHTML.match(magnet_regex) || [];
      magnet_links = $("a").filter(function() {return this.href.match(magnet_regex);}) || [];
      magnet_result = gen_magnet_result(magnet_links);

      result = {ed2k_result: ed2k_result, magnet_result: magnet_result};
      sendResponse({result:result});
    }
  }
}
init();
chrome.extension.onRequest.addListener(onRequest);


