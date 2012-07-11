var re=[];
var contabid=0;
var thead = "";
var trs = "";
var selectedIDS = {};
var table={};
var maxid = 0;
var data_map = {
    "confirmScope": confirmScope,
    "cleanSearch":cleanSearch,
    "cleanScope":cleanScope,
    "selectAll":selectAll,
    "selectOpsite":selectOpsite,
    "cleanSelect":cleanSelect,
    "confirmCopy":confirmCopy
};
$(document).ready(function(){
    re= chrome.extension.getBackgroundPage().result;		
    re = dealEd2k(re);
    table  = $("#table");		
    trs =wrap_tr(re);		
    thead = table.html();		
    table.html(thead+trs);

    $("input[data-map]").live("click",function(){
	data_map[($(this).attr("data-map"))]();
    });

    $("#searchText").live("keyup",function(){
	check_selected();
	var st=$(this).val();
	var templinkobj={};
	var temptrtd="";
	for(var i in re){				
	    if(i.toLocaleLowerCase().indexOf(st.toLocaleLowerCase())>-1){
		templinkobj[i] = re[i];
	    };
	}
	temptrtd = wrap_tr(templinkobj);
	table.html(thead+temptrtd);
	check_selected();
    });

    $("td[ee]").live("click",function(){
	dealChecked($(this));
	scanColor();
    });		

    $("tr").live("mouseover",function(){
	$(this).css("cursor","pointer");
	colorSelected($(this));
    });

    $("tr").live("mouseout",function(){
	var cb = $(this).find("input[type='checkbox']");
	if(cb.attr("checked")=="checked"){
	    return;
	}
	colorNotSelected($(this));
    });		
});

function check_selected(){
    $("input[type='checkbox']").each(function(){
	if($(this).attr("checked")=="checked") {
	    var id = $(this).attr("id");
	    id = id.substring(3,id.length);
	    selectedIDS[id]=0;
	}
    });
    for(var i in selectedIDS){
	var temp = $("#cb_"+i);
	if(temp){
	    temp.attr("checked",true);
	}
    }
}

function wrap_tr(linkobj){
    var trtd = "";
    for(var i in linkobj){
	trtd += "<tr id=\"tr_"+linkobj[i].id+"\"><td><input type=\"checkbox\" id=\"cb_"+linkobj[i].id+"\" ed2k=\""+linkobj[i].link+"\" /></td>";
	trtd +="<td ee=\"ee\">"+linkobj[i].id+"</td>";
	trtd +="<td ee=\"ee\" style=\"max-width:470px;overflow-x:hidden;word-brek:keep-all;\">"+
	    i+
	    "</td>";
	trtd +="<td ee=\"ee\">"+dealBig(linkobj[i].big)+"</td>";
	trtd +="</tr>";
    }		
    return trtd;
}

function dealBig(num){
    //alert(num);
    num = num.toFixed(3);
    var numstr="";
    if(num<1) {
	numstr = num*1000+"KB";
    }else if(num>=1 && num<10){				
	numstr = (Math.round(num*10))/10+"MB";
    }else {
	numstr = Math.floor(num)+"MB";
    }
    return numstr;
}	

function dealEd2k(linkarr){		
    var result = {};		
    var count =0;
    //alert(linkarr[0]);
    for(var i=0;i<linkarr.length;i++){
	var regex2 = /ed2k:\/\/\|file\|(.+?)\|(.+?)\|.+?\//ig;
	var tmp = regex2.exec(linkarr[i]);
	if(!tmp) continue;
	var name =decodeURI(tmp[1]);
	if(result[name]) continue;
	count++;
	result[name] = {"id":count,"link":tmp[0],"big":(tmp[2])/(1024*1024)};			
    }
    maxid = count;
    return result;
}

function confirmScope() {		
    var fromobj= document.getElementById("from");
    var toobj=document.getElementById("to");
    var from = fromobj.value;
    var to = toobj.value;
    reg = /\d+/;
    from = Math.floor(from);
    to = Math.floor(to);		
    if( !(reg.test(from)&&reg.test(to)) || (from <= 0 || to <= 0 ) || (from>=to )) {			
	alert("范围输入有问题,请正确输入数字");			
	return;
    }		
    if(to > maxid){
	alert("最大范围超出有效选项数,请正确输入");
	return;
    }		

    for(var i=from; i<=to; i++) {
	selectedIDS[i] = 0;
    }
    check_selected();
    scanColor();
    return true;
}

function cleanScope() {
    var fromobj= document.getElementById("from");
    var toobj=document.getElementById("to");
    fromobj.value = "";
    toobj.value = "";
}

function selectAll() {
    $("input[type='checkbox']").each(function(){
	$(this).attr("checked",true);
    });
    scanColor();
}

function selectOpsite() {
    $("input[type='checkbox']").each(function(){			
	if($(this).attr("checked")=="checked") {
	    $(this).attr("checked",false);
	}else {
	    $(this).attr("checked",true);
	}
    });
    scanColor();
}

function cleanSearch(){
    check_selected();
    document.getElementById("searchText").value = "";
    table.html(thead+trs);
    check_selected();
    scanColor();
}

function cleanSelect(){
    $("input[type='checkbox']").each(function(){
	if($(this).attr("checked")=="checked") {
	    $(this).attr("checked",false);
	}
    });
    scanColor();
    selectedIDS = {};
}

function confirmCopy() {
    var cpresult="";
    var count=0;
    $("input[type='checkbox']").each(function(){
	if($(this).attr("checked")=="checked"){
	    cpresult += $(this).attr("ed2k")+"\n";
	    count++;
	}			
    });	
    if(count==0){
	alert("你还没有选择!");
	return;
    }
    chrome.extension.sendRequest({ask:"createCopy",result:cpresult},function(response){});		
    //chrome.tabs.sendRequest(tabid,{fuck:"fuck"});
}

function colorSelected(element){
    element.children().each(function(){
	$(this).css("background","#e3eaf2");
    });
}

function colorNotSelected(element){
    element.children().each(function(){
	$(this).css("background","#ffffff");
    });
}

function scanColor(){		
    $("tr").each(function(){
	scanColor($(this));
    });
}

function scanColor(element){		
    if(isCheckedTr(element)){
	colorSelected(element);
    }else{
	colorNotSelected(element);
    }
}

function isCheckedTr(element){
    var cb = element.find("input[type='checkbox']");
    if(cb.attr("checked")=="checked"){
	return true;
    }else {
	return false;
    }
}

function dealChecked(td){
    var cb = td.siblings("td").find("input[type='checkbox']");
    if(cb.attr("checked")=="checked"){
	cb.attr("checked",false);			
    }else {
	cb.attr("checked",true);
    }
}

function p(obj){
    console.log(obj);
    alert(obj);
}






