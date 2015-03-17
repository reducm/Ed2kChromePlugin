# TODO: fix bug "&" symbol show %26
contabid=0
types = ["ed2k", "magnet"]
result = []
selectedIDS = {}
magnet_regex = /magnet\:\?[^\"]+/ig
window.ed2k_bitch = {}
window.magnet_bitch = {}

$(document).ready(()->
  result = chrome.extension.getBackgroundPage().result
  console.log "result:", result
  window.ed2k_bitch = @ed2k_result = dealEd2k(result.ed2k_result)
  window.magnet_bitch = @magnet_result = dealMagnet(result.magnet_result)
  console.log @ed2k_result, @magnet_result
  that = @
    
  for prefix in types
    table_append_tr($("##{prefix}_table"), @["#{prefix}_result"])
  
  $("span[i18n]").each(()->
    $(this).html(chrome.i18n.getMessage($(this).attr('i18n')))
  )

  $("input[i18n]").each(()->
    $(this).val( chrome.i18n.getMessage( $(this).attr('i18n') ) )
  )

  data_map = {
    "confirmScope": confirmScope,
    "cleanSearch":cleanSearch,
    "cleanScope":cleanScope,
    "selectAll":selectAll,
    "selectOpposite":selectOpposite,
    "cleanSelect":cleanSelect,
    "confirmCopy":confirmCopy
  }

  $("input[data-map]").live("click",()->
    data_map[$(this).attr("data-map")]()
    return
  )

  $("#searchText").live("keyup", ()->
    table = current_table()
    type = table.data("type")
    result = that["#{type}_result"]
    check_selected()
    st = $(this).val()
    templinkobj = {}
    for key,r of result
      templinkobj[key] = r if key.toLocaleLowerCase().indexOf(st.toLocaleLowerCase())>-1
    temptrtd = wrap_tr(templinkobj)
    table.find("tbody").remove()
    table.append(temptrtd)
    check_selected()
  ).attr("placeholder",chrome.i18n.getMessage("search_placeholder"))
  
  $("table").delegate("td[ee]","click",()->
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

  console.log "resulted2kl:", result.ed2k_result.length
  console.log "resultedmgl:", result.magnet_result.length
  if result.ed2k_result.length == 0 and result.magnet_result.length > 0
    console.log "should click!"
    $("#switch_ul a[href='#magnet_links']").click()

)

dealEd2k = (linkarr = [])->
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
  $("#ed2k_table").data("maxid", count)
  re

dealMagnet = (linkarr = [])->
  re = {}
  count = 0
  for link in linkarr
    name_regex = /dn=(.+?)&/
    size_regex = /xl=(.+?)&/
    try
      name = name_regex.exec(link)[1]
    catch error
      name = null

    continue if !name

    try
      size = size_regex.exec(link)[1]
    catch error
      size = 0

    name = decodeURI(name)
    continue if re[name]?
    count++
    re[name] = id: count, link: link, big: (size/(1024*1024))
  $("#magnet_table").data("maxid", count)
  re

table_append_tr = (table, result)->
  console.log "table:", table
  console.log "result", result
  table.append(wrap_tr(result))

wrap_tr = (linkobj)->
  trtd = $("<tbody></tobdy>")
  for key,obj of linkobj
    tr = $("<tr id=\"tr_#{obj.id}\"></tr>")
    tr.append("<td><input type=\"checkbox\" id=\"cb_#{obj.id}\" ed2k=\"#{obj.link}\" /></td>")
    tr.append("<td ee=\"ee\">#{obj.id}</td>")
    tr.append("<td ee=\"ee\" style=\"max-width:470px;overflow-x:hidden;word-brek:keep-all;\">#{key}</td>")
    tr.append("<td ee=\"ee\">#{dealBig(obj.big)}</td>")
    trtd.append(tr)
  trtd

dealBig = (num)->
  return "no size data" if num == 0
  num = num.toFixed(3)
  numstr=""
  if num < 1
    numstr = "#{num*1000}KB"
  else if num>=1 and num<10
    numstr = "#{Math.round(num*10)/10}MB"
  else
    numstr = "#{Math.floor(num)}MB"
  numstr

#把有的放进selectedIDS ... 过去写的什么垃圾代码 
check_selected = ()->
  current_table().find("input[type='checkbox']").each(()->
    if checked($(this))
      id = $(this).attr("id")
      id = id.substring(3, id.length)
      selectedIDS[id]=0
    for key,selected_id of selectedIDS
      temp = $("#cb_#{key}")
      temp.prop("checked",true) if temp?
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
  maxid = parseInt( current_table().data("maxid") )
  from = Math.floor($("#from").val())
  to = Math.floor($("#to").val())
  reg = /\d+/
  if !(reg.test(from) and reg.test(to)) || (from<=0 || to <=0) || (from)>to
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

cleanScope = ()->
  $("#from").val("")
  $("#to").val("")
  cleanSelect()

selectAll = ()->
  table = current_table()
  table.find("input[type='checkbox']").each(->
    $(this).prop('checked',true)
  )
  scanColor()

selectOpposite = ()->
  table = current_table()
  table.find("input[type='checkbox']").each(->
    toggle_check($(this))
  )
  scanColor()

cleanSearch = (result = {} )->
  table = current_table()
  type = table.data("type")
  check_selected()
  $("#searchText").val("")
  table.find("tbody").remove()
  table_append_tr(table, window["#{type}_bitch"])
  scanColor()

cleanSelect = ()->
  table = current_table()
  $("input[type='checkbox']").each(->
    if $(this).prop('checked')
      $(this).prop("checked", false)
  )
  scanColor()
  selectedIDS= {}

confirmCopy = ()->
  cpresult = ""
  count = 0
  table = current_table()
  table.find("input[type='checkbox']").each(->
    if $(this).prop("checked")
      cpresult += "#{$(this).attr("ed2k")}\n"
      count++
  )
  if count==0
    alert(chrome.i18n.getMessage("error_unselected"))
    return false
  JClipboard.copy(cpresult)
  textarea = $("<textarea></textarea>")
  textarea.val(cpresult)
  $("#copy").empty().append("<span style='color:#08c;' i18n=\"copy_success\">#{chrome.i18n.getMessage("copy_success")}</span>").append(textarea)
  $("a[href='#copy']").tab("show")
  $("#copy textarea").height($("#links").height()).focus().select()
  return true

checked = (element)->
  element.prop("checked")

toggle_check = (checkbox)->
  if checked(checkbox)
    checkbox.prop("checked", false)
  else
    checkbox.prop("checked", true)

current_table = ()->
  $("#" + $("#switch_ul>li.active a").data("type") + "_table")


