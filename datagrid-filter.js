DatagridFilter = function(grid){
  //过滤开关toolbar
  var toolbar=[{
    text:'过滤2',
    iconCls:'icon-filter',
    handler:function(){
      //关掉过滤的时候去掉已有输入的缓存
      if(grid.datagrid('options').filterRow)
        DatagridFilter.filterTable[grid[0].id]=[];
      grid.datagrid({filterRow:!grid.datagrid('options').filterRow});
      grid.datagrid('addToolbarItem',toolbar);
    }
  }];
  //添加过滤的toolbar
  grid.datagrid('addToolbarItem',toolbar);
}
//缓存输入的filter filterTable[tableid]
DatagridFilter.filterTable=[];
//清除已有高亮
DatagridFilter.clearHighlight = function(dc, i, field){
  var ele=dc.body2.find('tr[datagrid-row-index="' + i + '"] td[field="'+field+'"] div');
  var str=ele.html();
  if(str){
    str=str.replace('<span style="color:red">','');
    str=str.replace('</span>','');
    ele.html(str);
  }
}
//保存所有的filter filterTables[tableId]
$.extend($.fn.datagrid.defaults.view, {
  onAfterRender: function (target) {
    var dc = $.data(target, 'datagrid').dc;
    var filterColumns=[];
    if(DatagridFilter.filterTable[target.id])
      filterColumns=DatagridFilter.filterTable[target.id];
    if (dc.header2.find('[filter="true"]').length == 0) {
      var header = dc.header1; //固定列表头
      var header2 = dc.header2; // 常规列表头
      var filterRow = $('<tr></tr>');
      var opts = $.data(target, 'datagrid').options;

      //add filter row
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
                    DatagridFilter.clearHighlight(dc, i, field);
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
                    DatagridFilter.clearHighlight(dc, i, field);
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
                    DatagridFilter.clearHighlight(dc, i, field);
                    dc.body1.find('tr[datagrid-row-index="' + i + '"]').show();
                    dc.body2.find('tr[datagrid-row-index="' + i + '"]').show();
                  }
                  continue;
                }
              }
              if (value != '') {
                for (var i = 0; i < dgData.length; i++) {
                  DatagridFilter.clearHighlight(dc, i, field);
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
                  DatagridFilter.clearHighlight(dc, i, field);
                  if(idx==0||(idx>0 && dc.body2.find('tr[datagrid-row-index="' + i + '"]').is(':visible'))){
                    dc.body1.find('tr[datagrid-row-index="' + i + '"]').show();
                    dc.body2.find('tr[datagrid-row-index="' + i + '"]').show();
                  }
                }
              }
            }
          });
        })
      }
    }
    DatagridFilter.filterTable[target.id]=filterColumns;
  }
});
$.extend($.fn.datagrid.methods, {
  addToolbarItem : function (jq, items) {
    return jq.each(function () {
      //add toolbar item
      var dpanel=$(this).datagrid('getPanel');
      var toolbar = dpanel.find('div.datagrid-toolbar');
      if (!toolbar.length) {
        toolbar = $("<div class=\"datagrid-toolbar\"><table cellspacing=\"0\" cellpadding=\"0\"><tr></tr></table></div>").prependTo(dpanel);
      }
      var tr = toolbar.find("tr");
      for (var i = 0; i < items.length; i++) {
        var btn = items[i];
        if (btn == "-") {
          $("<td><div class=\"dialog-tool-separator\"></div></td>").appendTo(tr);
        } else {
          var td = $("<td></td>").appendTo(tr);
          var b = $("<a href=\"javascript:void(0)\"></a>").appendTo(td);
          b[0].onclick = eval(btn.handler || function () {});
          b.linkbutton($.extend({}, btn, {plain : true}));
        }
      }
    });
  }
});