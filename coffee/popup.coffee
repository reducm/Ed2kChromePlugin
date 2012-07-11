contabid=0
maxid=0
result = []
table = {}
trs =""
selectedIDS = {}
data_map = {
  "confirmScope": confirmScope,
  "cleanSearch":cleanSearch,
  "cleanScope":cleanScope,
  "selectAll":selectAll,
  "selectOpsite":selectOpsite,
  "cleanSelect":cleanSelect,
  "confirmCopy":confirmCopy
}

$(document).ready(()->
  result = chrome.extension.getBackgroundPAge().result
  result = dealEd2k(result)
  table = $("#table")
  trs = wrap_tr(result)
  table.append(trs)

  $("input[data-map]").live("click",()->
    data_map[$(this).attr("data-map")]()
  )

  $("#searchText").live("keyup", ()->
    check_selected()
    st = $(this).val()
    templinkobj = {}
    for key,r of result
      templinkobj[key] = r if key.toLocaleLowerCase().indexOf(st.toLocaleLowerCase())>-1
    temptrtd = wrap_tr(templinkobj)
    table.remove(table.find("tbody"))
    table.append(temptrtd)
    check_selected()
  )
  
  table.delegate("td[ee]","click",()->
    dealChecked($(this))
    scanColor()
  ).delegate("tr", "mouseenter",()->
    $(this).css("cursor", "pointer")
    $(this).addClass("selected_tr")
  ).delegate("tr", "mouseout", ()->
    cb = $(this).find("input[type='checkbox']")
    unless checked(cb)
      $(this).removeClass("selected_tr")
  )
)

dealEd2k = (linkarr)->
  re = {}
  count = 0
  for link in linkarr
    regex2 = /ed2k:\/\/\|file\|(.+?)\|(.+?)\|.+?\//ig
    tmp = regex2.exec(link)
    continue if !tmp
    name = decodeURI(tmp[1])
    continue if re[name]?
    count++
    re[name] = id:count, link:tmp[0], big:(tmp[2]/(1024*1024))
  maxid = count
  re

wrap_tr = (linkobj)->
  trtd = $("<tbody></tobdy>")
  for key,obj of linobj
    tr = $("<tr id=\"tr_#{obj.id}\"></tr>")
    tr.append("<td><input type=\"checkbox\" id=\"cb_#{obj.id}\" ed2k=\"#{obj.link}\" /></td>")
    tr.append("<td ee=\"ee\">#{obj.id}</td>")
    tr.append("<td ee=\"ee\" style=\"max-width:470px;overflow-x:hidden;word-brek:keep-all;\">#{key}</td>")
    tr.append("<td ee=\"ee\">#{dealBig(obj.big)}</td>")
    trtd.append(tr)
  trtd

dealBig = (num)->
  num = num.toFixed(3)
  numstr=""
  if num < 1
    numstr = "#{num*1000}KB"
  else if num>=1 and num<10
    numstr = "#{Math.round(num*10)/10}MB"
  else
    numstr = "#{Math.floor(num)}MB"
  numstr

check_selected = ()->
  $("input[type='checkbox']").each(()->
    if checked($(this))
      id = $($this).attr("id")
      id = id.substring(3, id.length)
      selectedIDS[id]=0
    for key,selected_id of selectedIDS
      temp = $("#cb_#{key}")
      temp.attr("checked",true) if temp?
  )

dealChecked = (td) ->
  cb = td.siblings("td").find("input[type='checkbox']")
  toggle_check(cb)

scanColor = ()->
  $("tr").each(()->
    cb = $(this).find("input[type='checkbox']")
    if checked(cb)
      $(this).addClass("selected_tr")
    else
      $(this).removeClass("selected_tr")
  )

confirmScope = ()->
  from = Math.floor($("#from").val())
  to = Math.floor($("#to").val())
  reg = /\d+/
  if !(reg.text(from) and reg.test(to)) || (from<=0 || to <=0) || (from)>to
    alert("范围输入有问题，请输入正确数字")
    return false
  if(to > maxid)
    alert("最大范围超出有效选项数，请输入正确数字")
    return false
  for i in [from..to]
    selectedIDS[i]=0
  check_selected()
  scanColor()
  return true


checked = (element)->
  element.attr("checked")=="checked"

toggle_check = (checkbox)->
  if checked(checkbox)
    checkbox.attr("checked", false)
  else
    checkbox.attr("checked", true)

