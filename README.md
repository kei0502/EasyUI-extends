# EasyUI-extends

### 2016.2.4
- addToolbarItem没有toolbar时有问题的bug修复
- datagrid-setting初始化可以通过url,并存在localStorage

### 2016.2.3
- datagrid-filter可选择是否显示toolbar
- datagrid-setting中demo和功能性代码分离
- 修改addToolbarItem原来每次刷新后需要手动添加的问题

### 2016.2.2
- datagrid-filter中demo和功能性代码分离
- datagrid-detailview demo增加input失去焦点即保存的功能

### 2016.2.1
##### easyUI datagrid-detailview使用
- 左右两个表的移动
- 右边表格可拆分“件数”列的数据

##### datagrid-filter修改bug
- checkbox的话不添加搜索列
- 根据页面上的显示而非本身的data来过滤
- 添加toolbar item,可选择是否filter

##### datagrid-setting修改bug
- 多选后上下移动会循环的bug修复

### 2016.1.21
增加easyUI datagrid两项功能  
- datagrid-filter:过滤当前页的行  
已有datagrid-filter有分页问题，所以写了个对当前页的内容进行内容过滤，支持多项查询、查询字符串高亮、对数字可以进行计算查询（>,<,=,!=,>=,<=）  
- datagrid-setting:根据配置显示/隐藏列，并改变顺序，改变后不重新加载数据  
