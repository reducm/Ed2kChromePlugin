$(document).ready(function(){
    $("input").bind('click',function(){
	window.close();
    });
});
function onRequest(request, sender, sendResponse) {
    var ta = $("#ta");
    ta.val(request);
    ta.focus();
    ta.select();
};
chrome.extension.onRequest.addListener(onRequest);


