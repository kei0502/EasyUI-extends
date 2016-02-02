var order_grid,joborder_grid;
var checkFlag = false, uncheckFlag = false;
var editIndex = undefined;

function endEditing() {
  if(editIndex) {
    var grid = joborder_grid.datagrid('getRowDetail', editIndex[0]).find('table.ddv');
    //展开
    if (-1 != joborder_grid.datagrid('getExpander', editIndex[0])[0].className.indexOf('datagrid-row-collapse')
        && grid.datagrid('validateRow', editIndex[1])) {
      //会触发blur,改为手动refresh row
      //grid.datagrid('endEdit', editIndex[1]);
      grid.datagrid('getPanel').find('tr[datagrid-row-index="' + editIndex[1] + '"]').removeClass('datagrid-row-editing');
      //grid.datagrid('refreshRow',editIndex[1]);

      var amount = grid.datagrid('getRows')[editIndex[1]].amount;
      //var assignAmount = parseInt(grid.datagrid('getRows')[editIndex[1]].assignAmount);
      //没有endEdit后需要手动获取assignAmount
      var assignAmount = parseInt(grid.datagrid('getPanel').find('tr[datagrid-row-index="' + editIndex[1] + '"] td[field="assignAmount"] input').eq(1).val());

      if (assignAmount == 0) {
        alert('分配件数不能为0');
        //会触发blur
        //grid.datagrid('rejectChanges');
        //grid.datagrid('getPanel').find('tr[datagrid-row-index="'+editIndex[1]+'"]').removeClass('datagrid-row-editing');
        grid.datagrid('refreshRow', editIndex[1]);
      }
      else if (amount > assignAmount) {
        //会触发blur
        //grid.datagrid('acceptChanges');
        //grid.datagrid('getPanel').find('tr[datagrid-row-index="'+editIndex[1]+'"]').removeClass('datagrid-row-editing');
        grid.datagrid('updateRow', {index: editIndex[1], row: {assignAmount: assignAmount}});
        grid.datagrid('refreshRow', editIndex[1]);

        var orders = order_grid.datagrid('getRows');
        var joborder = joborder_grid.datagrid('getRows')[editIndex[0]];
        var containFlag = contains(orders, joborder, 'id');
        var updateRow;
        //拆分订单不在order中
        if (containFlag == -1) {
          updateRow = $.extend({}, joborder);
          var stockItem = $.extend({}, grid.datagrid('getRows')[editIndex[1]]);
          updateRow.cargo = [stockItem];
          if(order_grid.datagrid('getRows').length==0)
            order_grid.datagrid('loadData', {succ: 1, orders: [updateRow]});
          else
            order_grid.datagrid('appendRow', updateRow);//长度为0时append没反应
          order_grid.datagrid('expandRow', orders.length);
        }
        else {//订单已经在order中
          updateRow = orders[containFlag];
          var stockItem = $.extend({}, grid.datagrid('getRows')[editIndex[1]]);
          //订单下没有该货物,添加cargo
          var idx = contains(updateRow.cargo, stockItem, 'cargoId');
          if (idx == -1) {
            updateRow.cargo.push(stockItem);
            for (var i = 0, len = order_grid.datagrid('getRows').length; i < len; i++)
              order_grid.datagrid('collapseRow', i);
            order_grid.datagrid('updateRow', {index: containFlag, row: updateRow});
            order_grid.datagrid('expandRow', containFlag);
          }
          else {//订单下已经有该货物,修改cargo
            updateRow.cargo[idx] = stockItem;
            for (var i = 0, len = order_grid.datagrid('getRows').length; i < len; i++)
              order_grid.datagrid('collapseRow', i);
            order_grid.datagrid('updateRow', {index: containFlag, row: updateRow});
            order_grid.datagrid('expandRow', containFlag);
          }
        }
      }
      else if (assignAmount > amount) {
        alert('件数不能比原来的更大');
        //会触发blur
        //grid.datagrid('rejectChanges');
        grid.datagrid('refreshRow', editIndex[1]);
      }
      else {//所有的都分配
        //会触发blur
        //grid.datagrid('acceptChanges');
        grid.datagrid('updateRow', {index: editIndex[1], row: {assignAmount: assignAmount}});
        grid.datagrid('refreshRow', editIndex[1]);

        var orders = order_grid.datagrid('getRows');
        var joborder = joborder_grid.datagrid('getRows')[editIndex[0]];
        var containFlag = contains(orders, joborder, 'id');
        if (containFlag != -1) {
          var updateRow = orders[containFlag];
          updateRow.cargo = updateRow.cargo.filter(function (x) {
            return x.cargoId != grid.datagrid('getRows')[editIndex[1]].cargoId;
          });
          if (updateRow.cargo.length != 0) {
            order_grid.datagrid('updateRow', {index: containFlag, row: updateRow});
            order_grid.datagrid('collapseRow', containFlag);
            order_grid.datagrid('expandRow', containFlag);
          }
          else {
            order_grid.datagrid('deleteRow', containFlag);
          }
        }
      }
    }
    editIndex = undefined;
  }
}
function contains(arr, o, attr) {
  var i = arr.length;
  while (i--) {
    if (arr[i][attr] === o[attr]) {
      return i;
    }
  }
  return -1;
}

function removeFromTo(from, to) {
  var selected = from.datagrid('getSelections');
  var checked = from.datagrid('getChecked');
  var toorder = to.datagrid('getRows');
  var cache=[];//保存添加的index,所有添加完后展开行
  //destroy原有货物表,否则会有样式问题
  for (var i = 0, len = toorder.length; i < len; i++)
    to.datagrid('collapseRow', i);
  for (var i = 0, len = selected.length; i < len; i++) {
    //to中是否有该订单
    var toIndex = contains(toorder, selected[i], 'id');
    var index = from.datagrid('getRowIndex', selected[i]);
    //选中该订单下所有货物信息
    var cargoSelected = [];

    var checkflag = contains(checked, selected[i], 'id');
    //该订单全选
    if (checkflag != -1) {
      if (toIndex == -1)
        cargoSelected = selected[i].cargo;
      else
        cargoSelected = selected[i].cargo.concat();
      from.datagrid('deleteRow', index);
    }
    else {
      //展开
      if (-1 != from.datagrid('getExpander', index)[0].className.indexOf('datagrid-row-collapse'))
        cargoSelected = from.datagrid('getRowDetail', index).find('table.ddv').datagrid('getSelections');
    }
    if (cargoSelected.length != 0) {
      //删除订单下的货物
      if (checkflag == -1) {
        var updateRow = $.extend({}, selected[i]);
        for (var j = 0, jlen = cargoSelected.length; j < jlen; j++) {
          updateRow.cargo = updateRow.cargo.filter(function (x) {
            return x.cargoId != cargoSelected[j].cargoId
          });
        }
        from.datagrid('updateRow', {index: index, row: updateRow});
        from.datagrid('collapseRow', index);
      }

      //直接加所有选择的货物
      //深复制,否则修改order的值
      var updateRow = $.extend({}, selected[i]);
      updateRow.cargo = cargoSelected;
      //如果to grid有订单
      if (toIndex != -1) {
        var updateRow = $.extend({}, toorder[toIndex]);
        for (var j = 0, jlen = cargoSelected.length; j < jlen; j++) {
          var idx = contains(updateRow.cargo, cargoSelected[j], 'cargoId');
          //如果从joborder到order
          if (to == order_grid) {
            if (idx == -1) {
              cargoSelected[j].assignAmount = 0;//已分配清零
              updateRow.cargo.push(cargoSelected[j]);
            }
            else {
              updateRow.cargo[idx].assignAmount = 0;
            }
          }
          //如果从order到joborder
          else {
            if (idx == -1) {
              cargoSelected[j].assignAmount = cargoSelected[j].amount;
              updateRow.cargo.push(cargoSelected[j]);
            }
            else {//如果有,将分配的默认为剩下所有未分配
              updateRow.cargo[idx].assignAmount = cargoSelected[j].amount;
            }
          }
        }
        cache.push(toIndex);
        to.datagrid('updateRow', {index: toIndex, row: updateRow});
      }
      else {
        //如果从order到joborder,assignAmount=amount
        if (to == joborder_grid) {
          for (var j = 0, jlen = updateRow.cargo.length; j < jlen; j++)
            updateRow.cargo[j].assignAmount = updateRow.cargo[j].amount;
        }
        //如果从joborder到order,assignAmount=0
        else{
          for (var j = 0, jlen = updateRow.cargo.length; j < jlen; j++)
            updateRow.cargo[j].assignAmount = 0;
        }
        if (to.datagrid('getRows').length == 0 && to==order_grid) {
          cache.push(0);
          to.datagrid('loadData', {succ: 1, orders: [updateRow]});
        }
        else {
          cache.push(toorder.length);
          to.datagrid('appendRow', updateRow);
        }
      }
    }
  }
  //展开本次操作有关的数据行
  for(var i=0;i<cache.length;i++)
    to.datagrid('expandRow',cache[i]);
}
$(function () {
  order_grid = $('#orderTable').datagrid({
    url: 'order.json',
    selectOnCheck: true,
    checkOnSelect: false,
    columns: [[{
      field: 'orderCk',
      checkbox: true
    }, {
      field: 'depart',
      title: '出发地'
    }, {
      field: 'target',
      title: '目的地'
    }, {
      field: 'expectTime',
      title: '预计时间'
    }, {
      field: 'transType',
      title: '运输类型'
    }, {
      field: 'sendName',
      title: '发货方'
    }, {
      field: 'sendAddr',
      title: '发货地址'
    }, {
      field: 'sendPerson',
      title: '发货联系人',
    }, {
      field: 'sendMobile',
      title: '发货人联系方式'
    }, {
      field: 'receiveName',
      title: '收货方'
    }, {
      field: 'receiveAddr',
      title: '收货地址'
    }, {
      field: 'receivePerson',
      title: '收货联系人'
    }, {
      field: 'receiveMobile',
      title: '收货联系方式'
    }, {
      field: 'deliveryType',
      title: '发送方式'
    }, {
      field: 'receiptType',
      title: '回单'
    }, {
      field: 'count',
      title: '份数'
    }, {
      field: 'warning',
      title: '备注'
    }, {
      field: 'secureMoney',
      title: '保险价值'
    }, {
      field: 'fee',
      title: '代收费用'
    }, {
      field: 'feeType',
      title: '结算方式'
    }]],
    view: detailview,
    paginate: true,
    loadFilter: function (res) {
      if (res.succ) {
        return {
          'total': res.orders.length,
          'rows': res.orders
        }
      }
      else {
        return {
          'total': 0,
          'rows': []
        }
      }
    },
    detailFormatter: function (index, res) {
      return '<div style="padding:2px"><table class="ddv"></table></div>';
    },
    onCheck: function (index, row) {
      if (!checkFlag) {
        var ddv = $(this).datagrid('getRowDetail', index).find('table.ddv');
        if (-1 != $(this).datagrid('getExpander', index)[0].className.indexOf('datagrid-row-collapse'))
          ddv.datagrid('checkAll');
      } else
        checkFlag = false;
    },
    onUncheck: function (index, row) {
      if (!uncheckFlag) {
        var ddv = $(this).datagrid('getRowDetail', index).find('table.ddv');
        if (-1 != $(this).datagrid('getExpander', index)[0].className.indexOf('datagrid-row-collapse')) {
          var checked = ddv.datagrid('getChecked');
          for (var i = 0, len = checked.length; i < len; i++) {
            var index = ddv.datagrid('getRowIndex', checked[i]);
            ddv.datagrid('uncheckRow', index);
          }
        }
      } else
        uncheckFlag = false;
    },
    onExpandRow: function (index, row) {
      var ddv = $(this).datagrid('getRowDetail', index).find('table.ddv');
      ddv.datagrid({
        fitColumns: true,
        singleSelect: false,
        height: 'auto',
        columns: [[{
          field: 'cargoCk',
          checkbox: true
        }, {
          field: 'cargoName',
          title: '货物名称',
          align: 'center'
        }, {
          field: 'scale',
          title: '规格',
          align: 'center'
        }, {
          field: 'amount',
          title: '件数',
          align: 'center',
          formatter: function (v, r, i) {
            return v - r.assignAmount;
          }
        }, {
          field: 'weight',
          title: '重量',
          align: 'center'
        }, {
          field: 'volumn',
          title: '体积',
          align: 'center'
        }, {
          field: 'wrapper',
          title: '包装',
          align: 'center'
        }, {
          field: 'cargoInfo',
          title: '货物信息',
          align: 'center'
        }, {
          field: 'comments',
          title: '备注',
          align: 'center'
        }]],
        selectOnCheck: true,
        checkOnSelect: true,
        onResize: function () {
          order_grid.datagrid('fixDetailRowHeight', index);
        },
        onSelect: function (i, r) {
          //全选
          if (ddv.datagrid('getSelections').length == ddv.datagrid('getData').total) {
            var checked = order_grid.datagrid('getChecked');
            if (checked.filter(function (x) {return x == row;}).length == 0) {
              checkFlag = true;
              order_grid.datagrid('checkRow', index);
            }
          }
          order_grid.datagrid('selectRow', index);
        },
        onUnselect: function (r) {
          //全不选 onUnselectAll事件没用改用这方式
          if (ddv.datagrid('getSelections').length == 0) {
            var checked = order_grid.datagrid('getChecked');

            if (checked.filter(function (x) {return x == row;}).length > 0) {
              uncheckFlag = true;
              order_grid.datagrid('uncheckRow', index);
            }
            order_grid.datagrid('selectRow', index);
          }
        },
        data: row.cargo
      });
      var checked = $(this).datagrid('getChecked');
      if (contains(checked, row, 'id') > -1)
        ddv.datagrid('checkAll');
      $(this).datagrid('fixDetailRowHeight', index);
    }
  });

  joborder_grid = $('#joborderTable').datagrid({
    selectOnCheck: true,
    checkOnSelect: false,
    columns: [[{
      field: 'orderCk',
      checkbox: true
    }, {
      field: 'depart',
      title: '出发地'
    }, {
      field: 'target',
      title: '目的地'
    }, {
      field: 'expectTime',
      title: '预计时间'
    }, {
      field: 'transType',
      title: '运输类型'
    }, {
      field: 'sendName',
      title: '发货方'
    }, {
      field: 'sendAddr',
      title: '发货地址'
    }, {
      field: 'sendPerson',
      title: '发货联系人',
    }, {
      field: 'sendMobile',
      title: '发货人联系方式'
    }, {
      field: 'receiveName',
      title: '收货方'
    }, {
      field: 'receiveAddr',
      title: '收货地址'
    }, {
      field: 'receivePerson',
      title: '收货联系人'
    }, {
      field: 'receiveMobile',
      title: '收货联系方式'
    }, {
      field: 'deliveryType',
      title: '发送方式'
    }, {
      field: 'receiptType',
      title: '回单'
    }, {
      field: 'count',
      title: '份数'
    }, {
      field: 'warning',
      title: '备注'
    }, {
      field: 'secureMoney',
      title: '保险价值'
    }, {
      field: 'fee',
      title: '代收费用'
    }, {
      field: 'feeType',
      title: '结算方式'
    }]],
    view: detailview,
    detailFormatter: function (index, res) {
      return '<div style="padding:2px"><table class="ddv"></table></div>';
    },
    onCheck: function (index, row) {
      if (!checkFlag) {
        var ddv = $(this).datagrid('getRowDetail', index).find('table.ddv');
        if (-1 != $(this).datagrid('getExpander', index)[0].className.indexOf('datagrid-row-collapse'))
          ddv.datagrid('checkAll');
      } else
        checkFlag = false;
    },
    onUncheck: function (index, row) {
      if (!uncheckFlag) {
        var ddv = $(this).datagrid('getRowDetail', index).find('table.ddv');
        if (-1 != $(this).datagrid('getExpander', index)[0].className.indexOf('datagrid-row-collapse')) {
          var checked = ddv.datagrid('getChecked');
          for (var i = 0, len = checked.length; i < len; i++) {
            var index = ddv.datagrid('getRowIndex', checked[i]);
            ddv.datagrid('uncheckRow', index);
          }
        }
      } else
        uncheckFlag = false;
    },
    onCollapseRow: function (index, row) {
      var ddv = $(this).datagrid('getRowDetail', index).html('<div style="padding:2px"><table class="ddv"></table></div>');
    },
    onExpandRow: function (index, row) {
      var ddv = $(this).datagrid('getRowDetail', index).find('table.ddv');
      ddv.datagrid({
        fitColumns: true,
        singleSelect: false,
        height: 'auto',
        columns: [[{
          field: 'cargoCk',
          checkbox: true
        }, {
          field: 'cargoName',
          title: '货物名字',
          align: 'center'
        }, {
          field: 'scale',
          title: '规格',
          align: 'center'
        }, {
          field: 'assignAmount',
          title: '件数',
          align: 'center',
          editor: {
            type: 'numberbox',
            options: {
              min: 0,
              precision: 0
            }
          }
        }, {
          field: 'weight',
          title: '重量',
          align: 'center'
        }, {
          field: 'volumn',
          title: '体积',
          align: 'center'
        }, {
          field: 'wrapper',
          title: '包装',
          align: 'center'
        }, {
          field: 'cargoInfo',
          title: '货物信息',
          align: 'center'
        }, {
          field: 'comments',
          title: '备注',
          align: 'center'
        }]],
        selectOnCheck: true,
        checkOnSelect: true,
        onResize: function () {
          joborder_grid.datagrid('fixDetailRowHeight', index);
        },
        onDblClickCell: function (i, f, r) {
          if (f == 'assignAmount') {
            ddv.datagrid('selectRow', i).datagrid('beginEdit', i);
            editIndex = [index, i];
          }
          joborder_grid.datagrid('getPanel').find('.datagrid-row-detail .datagrid-editable-input.validatebox-text').bind('blur', function () {
            endEditing();
          });
        },
        onSelect: function (i, r) {
          if (ddv.datagrid('getSelections').length == ddv.datagrid('getData').total) {
            var checked = joborder_grid.datagrid('getChecked');
            if (checked.filter(function (x) {
                  return x == row;
                }).length == 0) {
              checkFlag = true;
              joborder_grid.datagrid('checkRow', index);
            }
          }
          joborder_grid.datagrid('selectRow', index);
        },
        onUnselect: function (i, r) {
          var checked = joborder_grid.datagrid('getChecked');
          if (contains(checked, row, 'id') > -1) {
            uncheckFlag = true;
            joborder_grid.datagrid('uncheckRow', index);
          }
          joborder_grid.datagrid('selectRow', index);
        },
        data: row.cargo
      });
      var checked = joborder_grid.datagrid('getChecked');
      if (contains(checked, row, 'id') > -1)
        ddv.datagrid('checkAll');
      joborder_grid.datagrid('fixDetailRowHeight', index);
    }
  });


  // order to joborder
  $('#addButton').click(function () {
    removeFromTo(order_grid, joborder_grid);
  });
  // joborder to order
  $('#removeButton').click(function () {
    removeFromTo(joborder_grid, order_grid);
  });
  $('#saveButton').click(function () {
    endEditing();
  });

  $(window).load(function () {
    init_window();
  });

  $(window).resize(function () {
    init_window();
  });
  var init_window = function () {
    var min_width = 600;
    var min_height = 400;
    $('body').css({
      'overflow-y': 'hidden'
    });
    var main_panel_height = $('.top-area').height();
    main_panel_height = main_panel_height + 60;
    var window_width = $(window).width();
    var window_height = $(window).height();
    if (min_width > window_width) {
      window_width = min_width;
      $('body').css({
        'overflow-x': 'scroll'
      });
    } else {
      $('body').css({
        'overflow-x': 'hidden'
      });
    }

    if (min_height > window_height) {
      window_height = min_height;
      $('body').css({
        'overflow-y': 'scroll'
      });
    } else {
      $('body').css({
        'overflow-y': 'hidden'
      });
    }

    $('.left-panel').width($('.lmr-row').width() / 2 - 42);
    $('.right-panel').width($('.lmr-row').width() / 2 - 42);

    order_grid.datagrid('resize', {
      width: $('.lmr-row').width() / 2 - 42,
      height: (window_height - main_panel_height )
    });
    joborder_grid.datagrid('resize', {
      width: $('.lmr-row').width() / 2 - 42,
      height: (window_height - main_panel_height )
    });
  };
});