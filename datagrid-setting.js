DatagridSetting = function(grid) {

}




var settingData=['itemid','productid'];//默认配置
var settingFlag=0;

var tableSelector;//datagrid

//direct==0 上移 / direct==1 下移
function upOrDownColumn(direct){
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
function leftOrRightColumn(from,to,selectedRow){
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
//根据配置显示datagrid
function setColumnOptions(table,orderColumns){
  var columnOptions=table.datagrid('options').columns[0];
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
  table.datagrid({
    columns:[columnOptions],data:table.datagrid('getData')
  });
}
var toolbar=[{
  text:'配置', iconCls:'icon-tip',
  handler:function(){
    $('#settingDialog').show();
    var oldColumns=tableSelector.datagrid('options').columns[0];
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
        leftOrRightColumn($('#hiddenList'),$('#checkedList'),row);
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
        leftOrRightColumn($('#checkedList'),$('#hiddenList'),row);
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
          setColumnOptions(tableSelector,orderColumns);
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
$(function(){
  tableSelector=$("#table");//datagrid
  setColumnOptions(tableSelector,settingData);
  //dataggrid-setting
  $('#checkButton').click(function(){
    leftOrRightColumn($('#hiddenList'),$('#checkedList'));
    return false;
  });
  $('#uncheckButton').click(function(){
    leftOrRightColumn($('#checkedList'),$('#hiddenList'));
    return false;
  });
  $('#upButton').click(function(){
    upOrDownColumn(0);
    return false;
  });
  $('#downButton').click(function(){
    upOrDownColumn(1);
    return false;
  });
  tableSelector.datagrid({
    url:'datagrid_data.json',
    rownumbers:true,
    singleSelect:true,
    method:'get',
    toolbar:toolbar,
    onBeforeLoad: function(){
      if(settingFlag!=0) {
        tableSelector.datagrid('loadData',$(this).datagrid('getData'));
        return false;
      }
      settingFlag=1;
      return true;
    },
    loadFilter:function(res){
      if(settingFlag!=0){
        if(settingFlag==1)
          settingFlag=2;
        return res;
      }
      return {
        'rows' : {},
        'total' : 0
      };
    },
    onLoadSuccess: function(){
      //获取已有配置数据
      if(settingFlag==1){
        setColumnOptions($(this),settingData);
      }
    }
  });
});