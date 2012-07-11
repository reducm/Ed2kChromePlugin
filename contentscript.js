var regex = /ed2k:\/\/\|file\|.+?\//ig;
var result ="";
function init() {
    if (regex.test(document.body.innerHTML)) {
	result = document.body.innerHTML.match(regex);		
	chrome.extension.sendRequest({ask:"ed2klinks",result:result}, 
		function(response) {

		});
    } 
}

function onRequest(request,sender,sendResponse){	
    if(request.ask=="getResult"){
	if(result){
	    sendResponse({result:result});
	}else{			
	    result = document.body.innerHTML.match(regex);			
	    sendResponse({result:result});
	}
    }
}
init();
chrome.extension.onRequest.addListener(onRequest);


