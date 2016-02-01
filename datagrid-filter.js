//保存所有的filter filterTables[tableId]
var filterTables=[];
//清除已有高亮
function clearHighlight(dc, i, field){
  var ele=dc.body2.find('tr[datagrid-row-index="' + i + '"] td[field="'+field+'"] div');
  var str=ele.html();
  if(str){
    str=str.replace('<span style="color:red">','');
    str=str.replace('</span>','');
    ele.html(str);
  }
}
$.extend($.fn.datagrid.defaults.view, {
  onAfterRender: function (target) {
    var dc = $.data(target, 'datagrid').dc;
    var filterColumns=[];
    if(filterTables[target.id])
      filterColumns=filterTables[target.id];

    if (dc.header2.find('[filter="true"]').length == 0) {
      var header = dc.header1; //固定列表头
      var header2 = dc.header2; // 常规列表头
      var filterRow = $('<tr></tr>');
      var opts = $.data(target, 'datagrid').options;

      if(opts.filterRow){
        var columns = opts.columns;
        var frozenColumns = opts.frozenColumns;

        if (frozenColumns[0]) {
          $.each(frozenColumns[0], function () {
            var w = header.find('[field="' + this.field + '"] > div').width();
            if (!this.checkbox) {

              if(columns[0][x].hidden)
                filterRow.append('<td style="display:none;"><input type="text" field="' + this.field + '" style="width:' + (w - 10) + 'px;"/><div class="icon-filter" style="display:inline-block;width:10px;height:10px;"></div></td>');
              else
                filterRow.append('<td><input type="text" field="' + this.field + '" style="width:' + (w-10) + 'px"/><div class="icon-filter" style="display:inline-block;width:10px;height:10px;"></div></td>');
            }
            else {
              filterRow.append('<td style="display:none;"><input type="text" field="' + this.field + '" style="width:' + w + 'px"/></td>');
            }
          });
        }
        header.find('tbody').append(filterRow);
        filterRow = $('<tr filter="true"></tr>');

        $.each(columns[0], function (x) {
          var w = header2.find('[field="' + this.field + '"] > div').width();
          if (!this.checkbox) {
            //10px的filter icon
            if(columns[0][x].hidden)
              filterRow.append('<td style="display:none;"><input type="text" field="' + this.field + '" style="width:' + (w - 10) + 'px;"/><div class="icon-filter" style="display:inline-block;width:10px;height:10px;"></div></td>');
            else
              filterRow.append('<td><input type="text" field="' + this.field + '" style="width:' + (w-10) + 'px"/><div class="icon-filter" style="display:inline-block;width:10px;height:10px;"></div></td>');
          }
          else { //checkbox就不显示
            var w = header2.find('[field="' + this.field + '"] > div').width();
            filterRow.append('<td style="width:' + w + 'px"></td>');
          }
        });

        header2.find('tbody').append(filterRow);

        header2.find('input[type=text]').each(function () {
          $(this).on('input', function () {
            var f = $(this).attr('field'),v = $(this).val();
            var flag=false;
            var filterColumns=[];
            if(filterTables[target.id])
              filterColumns=filterTables[target.id];
            var dgData = $(target).datagrid('getRows');
            for(var i=0;i<filterColumns.length;i++){
              if(filterColumns[i].field==f) {
                filterColumns[i].value = v;
                flag=true;
                break;
              }
            }
            if(!flag)
              filterColumns.push({field:f,value:v});
            for(var idx=0;idx<filterColumns.length;idx++) {
              var field=filterColumns[idx].field;
              var value=filterColumns[idx].value;

              //数字比较大小
              if (dgData[0] && dgData[0][field] && typeof dgData[0][field] == 'number' && (value.charAt(0) > '9' || value.charAt(0) < '0')) {
                var optype = -1;
                if (value.startsWith('>='))
                  optype = 1;
                else if (value.startsWith('<='))
                  optype = 2;
                else if (value.startsWith('!='))
                  optype = 3;
                else if (value.startsWith('>'))
                  optype = 4;
                else if (value.startsWith('<'))
                  optype = 5;
                else if (value.startsWith('='))
                  optype = 6;
                if (optype > 0 && optype <= 3 && value.length >= 2)
                  value = value.substring(2);
                else if (optype > 3 && value.length >= 1)
                  value = value.substring(1);
                if (value == '') {
                  for (var i = 0; i < dgData.length; i++) {
                    clearHighlight(dc, i, field);
                    if(idx==0||(idx>0 && dc.body1.find('tr[datagrid-row-index="' + i + '"]').is(':visible'))){
                      dc.body1.find('tr[datagrid-row-index="' + i + '"]').show();
                      dc.body2.find('tr[datagrid-row-index="' + i + '"]').show();
                    }
                  }
                  continue;
                }
                var reg = /^(-?\d+)(\.\d+)?$/;
                if (optype > 0 && reg.test(value) && (value = parseInt(value))) {
                  for (var i = 0; i < dgData.length; i++) {
                    clearHighlight(dc, i, field);
                    if(idx==0||(idx>0 && dc.body1.find('tr[datagrid-row-index="' + i + '"]').is(':visible'))) {
                      if (optype == 1) {
                        if (dgData[i][field] >= value){
                          dc.body1.find('tr[datagrid-row-index="' + i + '"]').show();
                          dc.body2.find('tr[datagrid-row-index="' + i + '"]').show();
                        }
                        else{
                          dc.body1.find('tr[datagrid-row-index="' + i + '"]').hide();
                          dc.body2.find('tr[datagrid-row-index="' + i + '"]').hide();
                        }
                      }
                      else if (optype == 2) {
                        if (dgData[i][field] <= value){
                          dc.body1.find('tr[datagrid-row-index="' + i + '"]').show();
                          dc.body2.find('tr[datagrid-row-index="' + i + '"]').show();
                        }
                        else{
                          dc.body1.find('tr[datagrid-row-index="' + i + '"]').hide();
                          dc.body2.find('tr[datagrid-row-index="' + i + '"]').hide();
                        }
                      }
                      else if (optype == 3) {
                        if (dgData[i][field] != value){
                          dc.body1.find('tr[datagrid-row-index="' + i + '"]').show();
                          dc.body2.find('tr[datagrid-row-index="' + i + '"]').show();
                        }
                        else{
                          dc.body1.find('tr[datagrid-row-index="' + i + '"]').hide();
                          dc.body2.find('tr[datagrid-row-index="' + i + '"]').hide();
                        }
                      }
                      else if (optype == 4) {
                        if (dgData[i][field] > value){
                          dc.body1.find('tr[datagrid-row-index="' + i + '"]').show();
                          dc.body2.find('tr[datagrid-row-index="' + i + '"]').show();
                        }
                        else{
                          dc.body1.find('tr[datagrid-row-index="' + i + '"]').hide();
                          dc.body2.find('tr[datagrid-row-index="' + i + '"]').hide();
                        }
                      }
                      else if (optype == 5) {
                        if (dgData[i][field] < value){
                          dc.body1.find('tr[datagrid-row-index="' + i + '"]').show();
                          dc.body2.find('tr[datagrid-row-index="' + i + '"]').show();
                        }
                        else{
                          dc.body1.find('tr[datagrid-row-index="' + i + '"]').hide();
                          dc.body2.find('tr[datagrid-row-index="' + i + '"]').hide();
                        }
                      }
                      else if (optype == 6) {
                        if (dgData[i][field] == value){
                          dc.body1.find('tr[datagrid-row-index="' + i + '"]').show();
                          dc.body2.find('tr[datagrid-row-index="' + i + '"]').show();
                        }
                        else{
                          dc.body1.find('tr[datagrid-row-index="' + i + '"]').hide();
                          dc.body2.find('tr[datagrid-row-index="' + i + '"]').hide();
                        }
                      }
                    }
                  }
                  continue;
                }
                else {
                  //alert('输入数字查询错误');
                  for (var i = 0; i < dgData.length; i++) {
                    clearHighlight(dc, i, field);
                    dc.body1.find('tr[datagrid-row-index="' + i + '"]').show();
                    dc.body2.find('tr[datagrid-row-index="' + i + '"]').show();
                  }
                  continue;
                }
              }
              if (value != '') {
                for (var i = 0; i < dgData.length; i++) {
                  clearHighlight(dc, i, field);
                  if(idx==0||(idx>0 && dc.body2.find('tr[datagrid-row-index="' + i + '"]').is(':visible'))) {
                    //精确查询显示的内容
                    var index = dc.body2.find('tr[datagrid-row-index="' + i + '"] td[field="' + field + '"] div').html().indexOf(value);
                    if (index == -1){
                      dc.body1.find('tr[datagrid-row-index="' + i + '"]').hide();
                      dc.body2.find('tr[datagrid-row-index="' + i + '"]').hide();
                    }
                    else{
                      dc.body1.find('tr[datagrid-row-index="' + i + '"]').show();
                      dc.body2.find('tr[datagrid-row-index="' + i + '"]').show();
                      //highlight
                      var ele = dc.body2.find('tr[datagrid-row-index="' + i + '"] td[field="' + field + '"] div');
                      var str = ele.html();
                      str = str.substr(0, index) + '<span style="color:red">' + value + '</span>' + str.substring(index + value.length);
                      ele.html(str);
                    }


                  }
                }
              }
              else {
                for (var i = 0; i < dgData.length; i++) {
                  clearHighlight(dc, i, field);
                  if(idx==0||(idx>0 && dc.body2.find('tr[datagrid-row-index="' + i + '"]').is(':visible'))){
                    dc.body1.find('tr[datagrid-row-index="' + i + '"]').show();
                    dc.body2.find('tr[datagrid-row-index="' + i + '"]').show();
                  }
                }
              }
            }
            filterTables[target.id]=filterColumns;
          });
        })
      }
    }
    filterTables[target.id]=filterColumns;
  }
});
var toolbar=[{
  text:'过滤',
  iconCls:'icon-filter',
  handler:function(){
    $('#dg').datagrid({filterRow:!tableSelector.datagrid('options').filterRow});
  }
}];
$(function () {
  $('#dg').datagrid({
    singleSelect: true,
    data: data.slice(0, 20), pagination: true,
    pageSize: 20, rownumbers: true,filterRow:true,toolbar:toolbar
  });
  //分页
  var pager = $("#dg").datagrid("getPager");
  pager.pagination({
    total: data.length,
    onSelectPage: function (pageNo, pageSize) {
      var start = (pageNo - 1) * pageSize;
      var end = start + pageSize;
      $("#dg").datagrid("loadData", data.slice(start, end));
      pager.pagination('refresh', {
        total: data.length,
        pageNumber: pageNo
      });
      //清空filter row
      $('tr[filter="true"] input[type="text"]').val('');
    }
  });
});
