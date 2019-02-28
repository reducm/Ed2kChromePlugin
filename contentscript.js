var regex = /ed2k:\/\/\|file\|.+?\//ig;
var magnet_regex = /magnet\:\?[^\"]+/ig;
var magnet_name_regex = /dn=(.+?)&/
var result = "";
var ed2k_result = [];
var magnet_result = [];

function gen_magnet_result() {
  // 原逻辑：磁力链有 dn 时，直接返回磁力链，popup.js 去解析文件名
  var m_result =  document.body.innerHTML.match(magnet_regex) || [];
  if (m_result && m_result[0].match(magnet_name_regex)) {
    return m_result;
  }
  // 磁力链没 dn 时，用磁力链所在超链接 text 作为文件名
  m_result = [];
  var magnet_elements = $("a").filter(function() {return this.href.match(magnet_regex);}) || [];
  for (var i = 0; i < magnet_elements.length; i++) {
    name = magnet_elements[i].text;
    var previous_element = m_result[i - 1]
    var current_link = magnet_elements[i]['href']
    if (i > 0 && previous_element.name === name) {// 解决 text 重复
      previous_element.name += i.toString();
      name += (i + 1).toString();
    }
    m_result.push({link: current_link, name: name});
  }
  console.log(m_result[0]);
  return m_result;
}

function init() {
  if (regex.test(document.body.innerHTML) || magnet_regex.test(document.body.innerHTML)) {
    ed2k_result = document.body.innerHTML.match(regex) || [];
    magnet_result = gen_magnet_result();
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
      magnet_result = gen_magnet_result();
      result = {ed2k_result: ed2k_result, magnet_result: magnet_result};

      sendResponse({result:result});
    }
  }
}
init();
chrome.extension.onRequest.addListener(onRequest);


