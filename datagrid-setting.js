DatagridSetting = function(grid,tableName,settingData) {
  this.settingData=settingData||[];//默认配置
  this.settingFlag=0;//load flag: 0初始化;1第一次远程加载数据;2配置
  this.grid=grid;
  this.tableName=tableName;
}
$.extend($.fn.datagrid.methods, {
  addToolbarItem : function (jq, items) {
    return jq.each(function () {
      //add toolbar item
      var dpanel=$(this).datagrid('getPanel');
      var opt=$(this).datagrid('options');
      if(opt.toolbar==null)
        opt.toolbar=[];
      var toolbar = dpanel.find('div.datagrid-toolbar');
      if (!toolbar.length) {
        toolbar = $("<div class=\"datagrid-toolbar\"><table cellspacing=\"0\" cellpadding=\"0\"><tr></tr></table></div>").prependTo(dpanel);
      }
      var tr = toolbar.find("tr");
      for (var i = 0; i < items.length; i++) {
        opt.toolbar.push(items[i]);
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
DatagridSetting.prototype.init = function(){
  var that=this;
  var opt=this.grid.datagrid('options');
  var tableName=this.tableName;
  if(opt.configureUrl!=null) {
    $.ajax({
      url: opt.configureUrl,
      dataType: 'json',
      success: function (data) {
        localStorage.setItem(tableName, data.columns);
        that.settingData=data.columns;
        opt.configureUrl = null;
        that.settingFlag = 2;
        that.setColumnOptions();
      }
    });
  }
  else{
    that.settingData=localStorage.getItem(tableName).split(',');
    if(that.settingData){
      that.settingFlag = 2;
      that.setColumnOptions();
    }
  }
}
//direct==0 上移 / direct==1 下移
DatagridSetting.upOrDownColumn = function(direct){
  var selected=$('#checkedList').datagrid("getSelections");
  //如果往下,要从下往下移
  if(direct==1)
    selected.reverse();
  var top=0;
  //最前都选择的不做处理
  while(direct==0&&$('#checkedList').datagrid("getRowIndex",selected[0])==top) {
    selected.splice(0, 1);
    top++;
  }

  for(var i=0;i<selected.length;i++){
    var index=$('#checkedList').datagrid("getRowIndex",selected[i]);
    var swapIndex=direct==0?index-1:index+1;
    if(top<=swapIndex&&swapIndex<$('#checkedList').datagrid("getRows").length){
      $('#checkedList').datagrid("deleteRow",index);
      $('#checkedList').datagrid("insertRow",{index:swapIndex,row:selected[i]});
      $('#checkedList').datagrid("selectRow",swapIndex);
    }
  }
}
//左右移动
DatagridSetting.leftOrRightColumn = function(from,to,selectedRow){
  var selected=[];
  if(selectedRow)
    selected.push(selectedRow);
  else
    selected=from.datagrid("getSelections");
  for(var i=0;i<selected.length;i++){
    selected[i].change=!selected[i].change;
    if(selected[i]) {
      var index = from.datagrid("getRowIndex", selected[i]);
      from.datagrid("deleteRow", index);
      if(to.datagrid("getData").total==0)
        to.datagrid({data:[selected[i]]});
      else
        to.datagrid("appendRow", selected[i]);
    }
  }
}
DatagridSetting.prototype.addToolbar = function(){
  var that=this;
  var toolbar=[{
    text:'配置', iconCls:'icon-tip',
    handler:function(){
      $('#settingDialog').show();
      var oldColumns=that.grid.datagrid('options').columns[0];
      var visibleColumns=[],hiddenColumns=[];
      for(var i=0;i<oldColumns.
          length;i++){
        if(!oldColumns[i].hidden)
          visibleColumns.push({ck:false,text:oldColumns[i].title,value:oldColumns[i].field,change:false});
        else
          hiddenColumns.push({ck:false,text:oldColumns[i].title,value:oldColumns[i].field,change:false});
      }
      $('#hiddenList').datagrid({
        height:300,
        width:200,
        singleSelect: false,
        data:hiddenColumns,
        selectOnCheck:true,
        columns:[[
          {field:'ck',checkbox:true},
          {field:'value',hidden:true},
          {field:'text',title:'隐藏列',width:198},
          {field:'change',hidden:true}
        ]],
        onDblClickRow: function(index,row){
          DatagridSetting.leftOrRightColumn($('#hiddenList'),$('#checkedList'),row);
        },
        rowStyler: function(index,row){
          if (row.change){
            return 'color:red;';
          }
        }
      });
      $('#checkedList').datagrid({
        height:300,
        width:200,
        singleSelect: false,
        selectOnCheck:true,
        columns:[[
          {field:'ck',checkbox:true},
          {field:'value',hidden:true},
          {field:'text',title:'显示列',width:198},
          {field:'change',hidden:true}
        ]],
        data:visibleColumns,
        onDblClickRow: function(index,row){
          DatagridSetting.leftOrRightColumn($('#checkedList'),$('#hiddenList'),row);
        },
        rowStyler: function(index,row){
          if (row.change){
            return 'color:blue;';
          }
        }
      });
      $('#settingDialog').dialog({
        width:'500px',
        closed:false,
        modal:true,
        buttons: [{
          text: "全选",
          handler: function () {
            var hiddens=$('#hiddenList').datagrid('getData').rows;
            for(var i=0;i<hiddens.length;i++)
              hiddens[i].change=!hiddens[i].change;
            if($('#checkedList').datagrid("getData").total==0) {
              $('#checkedList').datagrid({data:hiddens});
            }
            else{
              for (var i = 0; i < hiddens.length; i++)
                $('#checkedList').datagrid('appendRow', hiddens[i]);
            }
            $('#hiddenList').datagrid({data:[]});
          }
        },{
          text: "全不选",
          handler: function () {
            var checks=$('#checkedList').datagrid('getData').rows;
            for(var i=0;i<checks.length;i++)
              checks[i].change=!checks[i].change;
            if($('#hiddenList').datagrid("getData").total==0) {
              $('#hiddenList').datagrid({data:checks});
            }
            else {
              for (var i = 0; i < checks.length; i++)
                $('#hiddenList').datagrid('appendRow', checks[i]);
            }
            $('#checkedList').datagrid({data:[]});
          }
        }, {
          text: "确定",
          handler: function () {
            var columns = $('#checkedList').datagrid("getData");
            var orderColumns=[];
            for(var i=0;i<columns.total;i++)
              orderColumns.push(columns.rows[i].value);
            that.setColumnOptions(orderColumns);
            $('#settingDialog').dialog("close");
          }
        }, {
          text: "关闭",
          handler: function () {
            $('#settingDialog').dialog("close");
          }
        }]
      });
    }
  }];
  this.grid.datagrid('addToolbarItem',toolbar);
}
//根据配置显示datagrid
DatagridSetting.prototype.setColumnOptions=function(orderColumns){
  orderColumns=orderColumns||this.settingData;
  var columnOptions=this.grid.datagrid('options').columns[0];
  for(var i=0;i<orderColumns.length;i++){
    if(orderColumns[i]==columnOptions[i].field) {
      columnOptions[i].hidden=false;
      continue;
    }
    for(var j=i+1;j<columnOptions.length;j++){
      if(orderColumns[i]==columnOptions[j].field){
        columnOptions[j].hidden=false;
        var temp=columnOptions[i];
        columnOptions[i]=columnOptions[j];
        columnOptions[j]=temp;
        break;
      }
    }
  }
  for(var i=orderColumns.length;i<columnOptions.length;i++)
    columnOptions[i].hidden=true;
  this.grid.datagrid({
    columns:[columnOptions],data:this.grid.datagrid('getData')
  });
}
$(function() {
  $('#checkButton').click(function () {
    DatagridSetting.leftOrRightColumn($('#hiddenList'), $('#checkedList'));
    return false;
  });
  $('#uncheckButton').click(function () {
    DatagridSetting.leftOrRightColumn($('#checkedList'), $('#hiddenList'));
    return false;
  });
  $('#upButton').click(function () {
    DatagridSetting.upOrDownColumn(0);
    return false;
  });
  $('#downButton').click(function () {
    DatagridSetting.upOrDownColumn(1);
    return false;
  });
});
