var regex = /ed2k:\/\/\|file\|.+?\//ig;
var magnet_regex = /magnet\:\?[^\"]+/ig;
var magnet_name_regex = /dn=(.+?)&/
var result = "";
var ed2k_result = [];
var magnet_result = [];

function gen_magnet_result() {
  // 原逻辑：磁力链有 dn 时，直接返回磁力链，popup.js 去解析文件名
  var m_result =  document.body.innerHTML.match(magnet_regex)
  m_result = m_result ? m_result.filter( onlyUnique ) : []
  if (m_result && m_result[0] && m_result[0].match(magnet_name_regex)) {
    var xt_and_magnent = {};
    for (var i = 0; i < m_result.length; i++) {
      // 相同 xt 视为同一个文件
      var magnet = m_result[i]
      var xt = magnet.split('&')[0]
      xt_and_magnent[xt] = magnet
    }
    return Object.values(xt_and_magnent);
  }
  // 磁力链没 dn 时，用磁力链所在超链接 text 作为文件名
  m_result = [];
  var magnet_elements = $("a").filter(function() {return this.href.match(magnet_regex) && onlyUnique;}) || [];
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
  return m_result;
}

function gen_ed2k_result() {
  ed2k_result = document.body.innerHTML.match(regex);
  ed2k_result = ed2k_result ? ed2k_result.filter( onlyUnique ) : [];
  return ed2k_result;
}

// 去重复
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function init() {
  if (regex.test(document.body.innerHTML) || magnet_regex.test(document.body.innerHTML)) {
    ed2k_result = gen_ed2k_result();
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
      ed2k_result = gen_ed2k_result();
      magnet_result = gen_magnet_result();
      result = {ed2k_result: ed2k_result, magnet_result: magnet_result};

      sendResponse({result:result});
    }
  }
}
init();
chrome.extension.onRequest.addListener(onRequest);


