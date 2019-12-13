import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { AgGridReact } from 'ag-grid-react';
import { connect } from 'react-redux';
import * as actions from '../../redux/reporting/actions';
import levelOptions from './ReportParameter';
import '../ag_grid_style.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import loader from '../../images/loader.gif';
import { Modal } from "antd";
import MenuItem from "@material-ui/core/MenuItem/index";
import Select from "@material-ui/core/Select/index";
import { ClickAwayListener } from '@material-ui/core';
import CustomizedSnackbar from '../../components/CustomizedSnackbar'
import { ReportViewWrapper } from './report.style';
import $ from 'jquery';

let privateViewList = [], systemViewList = [], getParamList = []
const gridOptions =
{
  defaultColDef: {
    sortable: true,
    resizable: true,
    enableValue: true,
    hide: true,
    floatCell: true,
    editable: false,
    enablePivot: true,
  },
  autoGroupColumnDef: {
    enableValue: false,
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    cellRenderer: 'agGroupCellRenderer',
    cellClass: 'grouprow',
    cellStyle: { color: "#3c8dbc" },
    rowStyle: { color: "#3c8dbc" },
    cellRendererParams: {
      suppressCount: true,
      checkbox: false,
      footerValueGetter: '"Total"',
      // innerRenderer:this.customCellRendererFunc

    },
    filterValueGetter: function (params) {
      var colGettingGrouped = params.colDef.showRowGroup;
      var valueForOtherCol = params.api.getValue(colGettingGrouped.toString(), params.node);
      return valueForOtherCol;
    },
  },
  sideBar: true,
  pivotMode: false,
  suppressContextMenu: false,
  enableBrowserTooltips: false,
  groupIncludeTotalFooter: false,
  groupSuppressBlankHeader: true,
  rowDragManaged: true,
  accentedSort: true,
  suppressSetColumnStateEvents: true,
  floatingFilter: false,
  rowGroupPanelShow: 'always',
  pivotPanelShow: 'always',
  // pivotColumnGroupTotals: 'before',
  // pivotRowTotals: 'before',
  singleClickEdit: true,
  enterMovesDownAfterEdit: true,
  enterMovesDown: true,
  groupDefaultExpanded: '999',
  multiSortKey: 'ctrl',
  animateRows: true,
  enableRangeSelection: true,
  rowSelection: "multiple",
  rowDeselection: true,
  quickFilterText: null,
  groupSelectsChildren: false,
  pagination: true,
  suppressRowClickSelection: true,
  groupMultiAutoColumn: true,
  groupHideOpenParents: false,
  suppressMakeColumnVisibleAfterUnGroup: true,
  paginationPageSize: 1000
}

class ReportView extends Component {
  constructor(props) {
    super(props);
    this.state = {

      inputGridViewstate: [],
      visible: false,
      title: 'Please Confirm',
      listOpen: false,
      selectedLevel: '1',
      selectedReportingPeriod: (new Date()).getFullYear(),
      reportStateList: [],
      columnDefs: [],
      rowData: [],
      privateViewType: true,
      systemViewType: true,
      viewList: [],
      filteredViewList: [],
      error: null,
      selectedViewId: 0,
      selectedStateID: 0,
      currentViewName: "",
      deletedViewName: "",
      currentState: [],
      referenceView: [],
      viewName: "",
      search: "",
      isPublic: true,
      userID: "",
      IsUpdateview: 0,
      IsUpdated: true,
      IsDeleted: false,
      deleteStateID: 0,
      confirmMsg: "",
      showLoader: false
    }
    if (props.location.state != undefined) {
      this.props.history.push({
        pathname: `/reporting/view/${props.location.state.id}`,
        state: { id: props.location.state.id, viewid: props.location.state.viewid }
      })
    }
  }

  // componentWillMount() {
  //    alert(this.props.match.params.id )               
  // }


  async componentDidMount() {
    try {
      // await this.props.getUserInfo();
      await this.props.getGridViewState(false);
      await this.setState({ referenceView: this.props.gridviewstate.filter(x => x.id == this.props.location.state.id)[0], currentState: this.props.gridviewstate.filter(x => x.id == this.props.location.state.id)[0], selectedStateID: this.props.location.state.id, selectedViewId: this.props.location.state.viewid, currentViewName: this.props.gridviewstate.filter(x => x.id == this.props.location.state.id)[0].view_name });
      await this.setState({ reportStateList: this.props.gridviewstate });
      await this.createViewList();
      await this.filterViewList();
      await this.addToggleOption();
      await this.setFilterState();
      this.getCurrentFilterState();
      localStorage.setItem('previousGridViewState', JSON.stringify(this.state.currentState));
      await this.props.getGridViewStructure(this.props.location.state.viewid, this.state.currentState.level_type ? this.state.currentState.level_type : 3);
      this.setPreviousFilteredColGroupState(this.state.currentState)
      this.setGridState();
      getParamList = [];
      getParamList.push({ level: this.state.selectedLevel, reportingperiod: this.state.selectedReportingPeriod })
      // await this.props.getGridViewData(getParamList[0]);
     // await this.setState({ showLoader: false });
    } catch (error) {
      console.log(error);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.user != this.props.user) {
      this.setState({ userID: nextProps.user.user_id });
      localStorage.setItem('UserID', nextProps.user.user_id);
    }
    if (nextProps.gridviewstate != this.props.gridviewstate) {
      this.setState({ reportStateList: nextProps.gridviewstate });
    }
    if (nextProps.gridviewdata != this.props.gridviewdata) {
      this.setState({ rowData: nextProps.gridviewdata.length > 0 ? nextProps.gridviewdata : [] });
    }
    if (nextProps.gridviewstructure != this.props.gridviewstructure) {
      this.defColumns(nextProps.gridviewstructure).then(result => this.setState({ columnDefs: result }))
    }

  }

  //save previous state to compare with new selection
  setPreviousFilteredColGroupState(data) {
    try {
      const previousGridViewColState = JSON.parse(data.col_state).filter(x => x.hide == false || x.aggFunc != null)
      const previousGroupColState = JSON.parse(data.group_state).filter(x => x.open == false && (x.groupId.indexOf('pivot') > 0))
      const previousFilteredColstate = JSON.stringify(previousGridViewColState)
      const previousFilteredGroupState = JSON.stringify(previousGroupColState)
      const previousFilteredColGroupState = [];
      previousFilteredColGroupState.push({ 'previousFilteredColstate': previousFilteredColstate, 'previousFilteredGroupState': previousFilteredGroupState })
      localStorage.setItem('previousFilteredColGroupState', JSON.stringify(previousFilteredColGroupState));
    }
    catch (error) {
      console.log(error);
    }
  }

  //get current filter parameter i.e time period ,reporting period
  getCurrentFilterState() {
    try {
      let filterState = [];
      filterState.push(
        {
          level_type: parseInt(this.state.selectedLevel), reporting_period: this.state.selectedReportingPeriod
        }
      )
      localStorage.setItem('currentFilterState', JSON.stringify(filterState[0]));
    }
    catch (error) {
      console.log(error);
    }
  }

  //fire on displaycolumnchanged event in ag-grid to compare save view  
  isChangedGridState(event, isPublic) {
    event.api.expireValueCache();
    try {
      const previousFilteredColGroupState = JSON.parse(localStorage.getItem('previousFilteredColGroupState'));
      const previousFilteredColstate = previousFilteredColGroupState[0].previousFilteredColstate

      const jsonpreviousFilteredColstate = JSON.parse(previousFilteredColstate)
      Object.keys(jsonpreviousFilteredColstate).forEach(function (key) {
        delete jsonpreviousFilteredColstate[key]["width"]
      });

      var previousFilteredGroupState = previousFilteredColGroupState[0].previousFilteredGroupState
      this.gridStateMsg = [];
      var colSate = JSON.stringify(event.columnApi.getColumnState())
      var filterSate = JSON.stringify(event.api.getFilterModel())

      var previousGridViewState = JSON.parse(localStorage.getItem('previousGridViewState'));
      var currentFilterState = JSON.parse(localStorage.getItem('currentFilterState'));
      var currentColstate = [], currentGroupColState, currentColHidefilter, currentGroupfilter;
      currentColstate = event.columnApi.getColumnState()
      currentGroupColState = event.columnApi.getColumnGroupState()
      currentColHidefilter = currentColstate.filter(x => x.hide == false || x.aggFunc != null)

      var jsoncurrentColHidefilter = currentColHidefilter;
      Object.keys(jsoncurrentColHidefilter).forEach(function (key) {
        delete jsoncurrentColHidefilter[key]["width"]
      });

      currentGroupfilter = currentGroupColState.filter(x => x.open == false && (x.groupId.indexOf('pivot') > 0))

      if (event.columnApi.isPivotMode() == previousGridViewState.is_pivot_mode &&
        // JSON.stringify(currentColHidefilter) == previousFilteredColstate &&
        JSON.stringify(jsoncurrentColHidefilter) == JSON.stringify(jsonpreviousFilteredColstate) &&
        JSON.stringify(currentGroupfilter) == previousFilteredGroupState &&
        JSON.stringify(event.api.getSortModel()) == previousGridViewState.sort_state &&
        // filterSate == previousGridViewState.filter_state &&
        currentFilterState.level_type == previousGridViewState.level_type &&
        currentFilterState.reporting_period == previousGridViewState.reporting_period &&
        isPublic == undefined ? previousGridViewState.is_public == previousGridViewState.is_public : isPublic == previousGridViewState.is_public
      ) {

        this.setState({ IsUpdateview: 0 });

      } else {

        this.setState({ IsUpdateview: 1 });

      }
      if (previousGridViewState.view_name.length > 35) {
        this.setState({ currentViewName: this.state.currentViewName.substring(0, 35) + "..." });
      } else {
        this.setState({ currentViewName: this.state.currentViewName });
      }
    }
    catch (error) {
      console.log(error);
    }

  }

  //create coldef for ag-grid
  generateDefColumns = (objData) => {
    try {
      const colData = objData;//await apiCall('gridViewStructure').then(res => { return res });// Get Column Structure data from API
      const uniqueAttCat = [];// Unique Attribute Category
      var childOfHeader = [];// Header child
      var categoryChild = [];// Category Child
      let coldef = []; // Column Definition
      let attributeCategory = []; // Final Column with header
      var headerid, headername, headerDataType, attributeCategoryName, fileldName,
        attributeCategoryId, Isfilter;
      const map = new Map();
      for (const item of colData) {
        if (!map.has(item.attribute_category_id)) {
          map.set(item.attribute_category_id, true);    // set any value to Map
          uniqueAttCat.push({
            AttributeCategoryID: item.attribute_category_id,
            AttributeCategory: item.attribute_category
          });
        }
      }
      var agfilter = "agSetColumnFilter"
      for (var j = 0; j < uniqueAttCat.length; j++) {
        childOfHeader = [];
        attributeCategory = [];
        var filterColDatavalues = colData.filter(item => item.attribute_category_id == uniqueAttCat[j].AttributeCategoryID)
        childOfHeader = filterColDatavalues
        for (var l = 0; l < childOfHeader.length; l++) {
          categoryChild = childOfHeader[l];
          headerid = categoryChild["id"];
          attributeCategoryName = categoryChild["attribute_category"];
          attributeCategoryId = categoryChild["attribute_category_id"];
          headername = categoryChild["attribute_display_name"];
          fileldName = categoryChild["attribute_name"];
          headerDataType = categoryChild["data_type"];
          Isfilter = categoryChild["is_filter"] == 'true' ? true : false;
          if (headerDataType == "Date") {
            agfilter = "agDateColumnFilter";
          } else if (headerDataType == "Amount" || headerDataType == "Numeric") {
            agfilter = "agNumberColumnFilter";
          } else {
            agfilter = "agSetColumnFilter"
          }
          if (attributeCategoryName == "Measures") {
            attributeCategory.push({ headerName: headername, id: headerid, children: this.bindThirdLevel() })

          } else {
            if (headerDataType == "Date") {

              attributeCategory.push({
                colId: headername,
                headerDataType: headerDataType,
                headerName: headername,
                field: fileldName,
                suppressFilter: Isfilter,
                enableRowGroup: true,
                //cellClass: 'ag-grid-cellClass',
                cellStyle: function (params) {
                  if (params.column.aggFunc == 'Count' && typeof params.value == 'object') {
                    return { textAlign: "right" };
                  } else {
                    return { textAlign: "center" };
                  }
                },
                allowedAggFuncs: ['min', 'max', 'count'],
                //, comparator: this.dateComparator
                filter: agfilter,
                filterParams: {
                  filterOptions: [
                    "equals",
                    "greaterThan",
                    "lessThan",
                    "notEqual",
                    "inRange",
                    {
                      displayKey: "BlankDate",
                      displayName: "Blank Date",
                      suppressAndOrCondition: true,
                      hideFilterInput: true,
                      test: function (filterValue, cellValue) {
                        if (cellValue == null || cellValue == "")
                          return true;
                      }
                    },

                  ],

                  comparator: function (filterLocalDateAtMidnight, cellValue) {

                    if (cellValue == null) return -1;
                    var dateParts = cellValue.split("/");

                    var cellDate = new Date(Number(dateParts[2]), Number(dateParts[0] - 1), Number(dateParts[1]));

                    if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
                      return 0
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                      return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                      return 1;
                    }
                  },
                  browserDatePicker: true
                }

              })
            }
            else if (headerDataType == "Amount") {

              attributeCategory.push({
                colId: headername,
                headerDataType: headerDataType,
                headerName: headername,
                field: fileldName,
                suppressFilter: Isfilter,
                filter: agfilter,
                enableRowGroup: false,
                // cellClass: 'ag-grid-cellNumber',
                cellStyle: { textAlign: "right" },
                allowedAggFuncs: ['sum', 'min', 'max', 'count', 'avg'],
                //, valueFormatter: this.amountValueFormatter
                comparator: function (number1, number2) {
                  if (number1 != null) {
                    if (typeof number1 == "object") {
                      number1 = number1.val;
                    }

                  }
                  if (number2 != null) {
                    if (typeof number2 == "object") {
                      number2 = number2.val;
                    }
                  }

                  if (number1 === null && number2 === null) {
                    return 0;
                  }
                  if (number1 === null) {
                    return -1;
                  }
                  if (number2 === null) {
                    return 1;
                  }
                  return number1 - number2;
                },
                filterParams: {

                  filterOptions: [
                    {
                      displayKey: "equals",
                      displayName: "Equals",
                      test: function (filterValue, cellValue) {
                        if (filterValue == cellValue)
                          return true;
                      }
                    },
                    "notEqual",
                    'lessThan',
                    "lessThanOrEqual",
                    "greaterThan",
                    "greaterThanOrEqual",
                    "inRange"
                  ]
                  ,
                }


              })

            }
            else if (headerDataType == "decimal") {

              attributeCategory.push({
                colId: headername,
                headerDataType: headerDataType,
                headerName: headername,
                field: fileldName,
                suppressFilter: Isfilter,
                filter: agfilter,
                enableRowGroup: false,
                cellClass: 'ag-grid-cellNumber',
                cellStyle: { textAlign: "right" },
                allowedAggFuncs: ['sum', 'min', 'max', 'count', 'avg']
                //, valueFormatter: this.percentValueFormatter
                , comparator: function (number1, number2) {
                  if (number1 != null) {
                    if (typeof number1 == "object") {
                      number1 = number1.val;
                    }
                  }
                  if (number2 != null) {
                    if (typeof number2 == "object") {
                      number2 = number2.val;
                    }
                  }

                  if (number1 === null && number2 === null) {
                    return 0;
                  }
                  if (number1 === null) {
                    return -1;
                  }
                  if (number2 === null) {
                    return 1;
                  }
                  return number1 - number2;
                },
                filterParams: {

                  filterOptions: [
                    {
                      displayKey: "equals",
                      displayName: "Equals",
                      test: function (filterValue, cellValue) {
                        if (filterValue == cellValue)
                          return true;
                      }
                    },
                    "notEqual",
                    'lessThan',
                    "lessThanOrEqual",
                    "greaterThan",
                    "greaterThanOrEqual",
                    "inRange"
                  ]
                  ,
                }
              })

            }
            else if (headerDataType == "Id" || headerDataType == "Key" || headerDataType == "int") {

              attributeCategory.push({
                colId: headername,
                headerDataType: headerDataType,
                headerName: headername,
                field: fileldName,
                suppressFilter: Isfilter,
                filter: agfilter,
                enableRowGroup: true,
                // cellClass: 'ag-grid-cellClass',
                allowedAggFuncs: ['count'],
                //cellStyle: { textAlign: "right" },
                // , valueFormatter: this.valueFormatter
                comparator: function (number1, number2) {
                  if (number1 != null) {
                    if (typeof number1 == "object") {
                      number1 = number1.val;
                    }
                  }
                  if (number2 != null) {
                    if (typeof number2 == "object") {
                      number2 = number2.val;
                    }
                  }
                  if (number1 === null && number2 === null) {
                    return 0;
                  }
                  if (number1 === null) {
                    return -1;
                  }
                  if (number2 === null) {
                    return 1;
                  }
                  return number1 - number2;
                }
              })
            } else
              attributeCategory.push({
                colId: headername,
                headerDataType: headerDataType,
                headerName: headername,
                field: fileldName,
                suppressFilter: Isfilter,
                filter: agfilter,
                enableRowGroup: true,
                //cellClass: 'ag-grid-cellClass',
                allowedAggFuncs: ['count'],
              })

          }
        }
        coldef.push({ headerName: attributeCategoryName, id: attributeCategoryId, children: attributeCategory })
      }
      return coldef;
    }
    catch (error) {
      console.log(error);
    }
  }
  bindThirdLevel() {
    let attributeCategory = [];
    var list = ["2017 Actuals", "2018 Actuals", "2018 Actuals YTD",
      "2019 Actuals (Daily YTD)", "2019 SLE", "2019 Actuals (Monthly YTD)",
      "2019 SLE Plan (YTG)", "Frozen SLE", "Frozen Actuals (YTD)", "Frozen SLE Plan (YTG)"]
    list.map(x => attributeCategory.push({
      colId: x,
      headerDataType: "Amount",
      headerName: x,
      field: x,
      //suppressFilter: Isfilter,
      filter: "agNumberColumnFilter",
      enableRowGroup: false,
      // cellClass: 'ag-grid-cellNumber',
      cellStyle: { textAlign: "right" },
      allowedAggFuncs: ['sum', 'min', 'max', 'count', 'avg'],
      //, valueFormatter: this.amountValueFormatter
      comparator: function (number1, number2) {
        if (number1 != null) {
          if (typeof number1 == "object") {
            number1 = number1.val;
          }

        }
        if (number2 != null) {
          if (typeof number2 == "object") {
            number2 = number2.val;
          }
        }

        if (number1 === null && number2 === null) {
          return 0;
        }
        if (number1 === null) {
          return -1;
        }
        if (number2 === null) {
          return 1;
        }
        return number1 - number2;
      },
      filterParams: {

        filterOptions: [
          {
            displayKey: "equals",
            displayName: "Equals",
            test: function (filterValue, cellValue) {
              if (filterValue == cellValue)
                return true;
            }
          },
          "notEqual",
          'lessThan',
          "lessThanOrEqual",
          "greaterThan",
          "greaterThanOrEqual",
          "inRange"
        ]
        ,
      }


    }))
    return attributeCategory;


  }
  async defColumns(colData) { // Get and generate the Ag-grid column structure
    //debugger;
    return this.generateDefColumns(colData);
  }

  //insert expand/collpase icon in right panel
  addToggleOption() {
    try {

      $('.ag-pivot-mode-panel').each(function () {
        $(this).insertAfter($('.ag-column-drop-values'));
      })

      $('.ag-column-drop-pivot').each(function () {// ag-column-drop-values
        $(this).insertAfter($(this).parent().find('.ag-column-select-panel'));
      })
      $('#colGroupToggle').each(function () {
        $(this).insertAfter($('.ag-column-select-panel'));
      })

      $('#rowGroupToggle').each(function () {
        $(this).insertAfter($('.ag-column-drop-pivot')[1]);
      })

      $('#valueToggle').each(function () {
        $(this).insertAfter($('.ag-column-drop-row-group')[1]);
      })

    }
    catch (error) {
      console.log(error);
    }
  }

  //handle expand/ collapse on values 
  valueToggle = () => {
    try {
      let x = $('#spnvalueToggle')
      $('.ag-column-panel > .ag-column-drop-values').toggle();
      if (x[0].className.indexOf('ag-icon-tree-closed') > 0) {
        $('#spnvalueToggle').addClass('ag-icon-tree-open')
        $('#spnvalueToggle').removeClass('ag-icon-tree-closed')
        $('#valueToggle').removeClass('border-bottom')
      } else {
        $('#spnvalueToggle').removeClass('ag-icon-tree-open')
        $('#spnvalueToggle').addClass('ag-icon-tree-closed')
        $('#valueToggle').addClass('border-bottom')
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  //handle expand/ collapse on row groups 
  rowGroupToggle = () => {
    try {
      let x = $('#spnrowGroupToggle')
      $('.ag-column-panel > .ag-column-drop-row-group').toggle();
      if (x[0].className.indexOf('ag-icon-tree-closed') > 0) {
        $('#spnrowGroupToggle').addClass('ag-icon-tree-open')
        $('#spnrowGroupToggle').removeClass('ag-icon-tree-closed')
        $('#rowGroupToggle').removeClass('border-bottom')
      } else {
        $('#spnrowGroupToggle').removeClass('ag-icon-tree-open')
        $('#spnrowGroupToggle').addClass('ag-icon-tree-closed')
        $('#rowGroupToggle').addClass('border-bottom')

      }
    }
    catch (error) {
      console.log(error);
    }
  }

  //handle expand/ collapse on column labels 
  colGroupToggle = () => {
    try {
      let x = $('#spncolGroupToggle')
      $('.ag-column-panel > .ag-column-drop-pivot').toggle();
      if (x[0].className.indexOf('ag-icon-tree-closed') > 0) {
        $('#spncolGroupToggle').addClass('ag-icon-tree-open')
        $('#spncolGroupToggle').removeClass('ag-icon-tree-closed')
        $('#colGroupToggle').removeClass('border-bottom')
      } else {
        $('#spncolGroupToggle').removeClass('ag-icon-tree-open')
        $('#spncolGroupToggle').addClass('ag-icon-tree-closed')
        $('#colGroupToggle').addClass('border-bottom')

      }
    }
    catch (error) {
      console.log(error);
    }
  }

  //create private / system list
  createViewList = () => {
    try {
      privateViewList = [];
      systemViewList = [];
      for (var i = 0; i < this.state.reportStateList.length; i++) {
        if (this.state.reportStateList[i].is_public == true && this.state.reportStateList[i].id == this.state.referenceView.id) {
          systemViewList.push(this.state.reportStateList[i])
        }
        else if (this.state.reportStateList[i].is_public == false && this.state.reportStateList[i].view_id == this.state.referenceView.view_id) {
          privateViewList.push(this.state.reportStateList[i])
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  //filter private / system list on check box selection
  filterViewList = () => {
    try {
      this.state.filteredViewList = [];
      if (this.state.systemViewType == true) {
        if (systemViewList.length > 0) {
          this.state.filteredViewList.push({ viewType: 'System', viewList: systemViewList })
        }
      }
      if (this.state.privateViewType == true) {
        if (privateViewList.length > 0) {
          this.state.filteredViewList.push({ viewType: 'Private', viewList: privateViewList })
        }
      }
      this.state.viewList = this.state.filteredViewList;
    }
    catch (error) {
      console.log(error);
    }
  }

  //apply seach on view list
  applySearch = (e) => {
    try {
      this.setState({ search: e.target.value });
      if (this.state.search == "") {
        this.setState({ filteredViewList: this.state.viewList })
        return;
      }
      this.state.viewList.forEach(element => element.viewList.forEach(element1 => element1.view_name.indexOf(this.state.search) >= 0))
      this.state.filteredViewList = this.state.viewList.map((i) => {
        return {
          viewType: i.viewType,
          viewList: i.viewList.filter((x) => x.view_name.indexOf(this.state.search) >= 0)
        }
      })
      this.setState({ filteredViewList: this.state.filteredViewList })
    }
    catch (error) {
      console.log(error);
    }
  }


  //handle event on ok selection of confirm popup
  async handleOk() {
    try {
      this.setState({
        visible: false,
      });
      if (this.state.IsUpdated == true) {
        this.updateState(true)
      } else {
        await this.props.deleteGridViewState(this.state.deleteStateID);
        if (this.state.deleteStateID == this.state.selectedStateID) {
          this.setState({ currentState: this.state.reportStateList.filter(x => x.view_id == this.state.selectedViewId && x.is_public == true)[0] })
          this.restoreState(this.state.currentState);
        }
        if (this.props.isDelete.result == 'success') {
          this.snackbar.success(this.state.deletedViewName + " deleted");
        }
        this.setState({
          deletedViewName: '',
        });
        await this.props.getGridViewState(false);
        await this.createViewList();
        await this.filterViewList();
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  //handle event on cancel selection of confirm popup
  handleClose = () => {
    this.setState({
      visible: false,
    });
  };

  async saveState() {
    try {
      await this.setState({ IsUpdated: true, IsDeleted: false, selectedStateID: 0 });
      await this.getCurrentGridViewState(this.state.viewName, false);
      await this.props.addGridViewState(this.state.inputGridViewstate[0]);
      this.getCurrentFilterState();
      if (this.props.isSave.result != '0') {
        this.snackbar.success(this.state.viewName + " saved");
        this.setState({ selectedStateID: this.props.isSave.result, currentViewName: this.state.viewName, viewName: '' });
        await this.props.getGridViewState(false);
        await this.createViewList();
        await this.filterViewList();
      } else {
        this.setState({ confirmMsg: 'A view named ' + '"' + this.state.viewName + '"' + ' already exists. Replace?', visible: true });
      }
    }
    catch (error) {
      console.log(error);
    }
  }


  async updateState(isResave) {
    try {
      await this.setState({ IsUpdated: true, IsDeleted: false, selectedStateID: this.state.currentState.id });
      if (isResave == 'true') {
        this.setState({ confirmMsg: 'Replace saved list view ' + '"' + this.state.currentViewName + '"' + '?', visible: true });
        return;
      }
      await this.getCurrentGridViewState(this.state.currentViewName, this.state.currentState.is_public);
      await this.props.addGridViewState(this.state.inputGridViewstate[0]);
      this.getCurrentFilterState();
      if (this.props.isSave.result != '0') {
        this.setState({ viewName: '', selectedStateID: this.props.isSave.result });
        this.snackbar.success(this.state.currentViewName + " saved");
      }

      if (this.state.currentViewName.length > 35) {
        this.setState({ IsUpdateview: 0, currentViewName: this.state.currentViewName.substring(0, 35) + "..." });
      } else {
        this.setState({ IsUpdateview: 0, currentViewName: this.state.currentViewName });
      }
      await this.props.getGridViewState(false);
    }
    catch (error) {
      console.log(error);
    }
  }

  deleteConfirm(event) {
    this.setState({ deletedViewName: event.view_name, confirmMsg: "Are you sure you want to delete " + '"' + event.view_name + '"' + "?", IsUpdated: false, IsDeleted: true, visible: true, deleteStateID: event.id });
  }

  getCurrentGridViewState(viewName, isPublic) {
    try {
      const is_pivot_mode = gridOptions.columnApi.isPivotMode();
      const col_state = gridOptions.columnApi.getColumnState();
      const group_state = gridOptions.columnApi.getColumnGroupState();
      const sort_state = gridOptions.api.getSortModel();
      const filter_state = gridOptions.api.getFilterModel();

      this.state.inputGridViewstate = []
      this.state.inputGridViewstate.push(
        {
          id: this.state.selectedStateID,
          view_id: this.state.selectedViewId,
          view_name: viewName,
          col_state: JSON.stringify(col_state),
          group_state: JSON.stringify(group_state),
          sort_state: JSON.stringify(sort_state),
          filter_state: JSON.stringify(filter_state),
          is_pivot_mode: is_pivot_mode,
          is_default: true,
          is_deleted: false,
          level_type: parseInt(this.state.selectedLevel),
          reporting_period: parseInt(this.state.selectedReportingPeriod),
          is_public: isPublic
        }

      )
      localStorage.setItem('previousGridViewState', JSON.stringify(this.state.inputGridViewstate[0]));
      this.setPreviousFilteredColGroupState(this.state.inputGridViewstate[0])
    }
    catch (error) {
      console.log(error);
    }
  }

  onPrivateViewChange = (e) => {
    this.setState({ privateViewType: !this.state.privateViewType });
    this.filterViewList();
  }

  onSystemViewChange = (e) => {
    this.setState({ systemViewType: !this.state.systemViewType });
    this.filterViewList();
  }

  renderList = (child) => {
    try {
      return child.map((view, index) => {
        return (<tr key={index} className="saved-list-view-row"><td className="saved-list-view-option"><a onClick={() => this.restoreState(view)} className={view.id == this.state.selectedStateID ? 'selectedView' : null} >{view.view_name}</a></td><td> </td><td className="saved-list-view-actions"><span id="save" style={{ display: view.id == this.state.selectedStateID && this.state.IsUpdateview == 0 ? '' : "none", marginRight: "7px" }} className="fa fa-save tag-icon-xs m-r-sm disabled"></span><a onClick={() => this.updateState(false, view)} tooltip="Update View" id="update" className="fa fa-save tag-icon-xs" style={{ display: view.id == this.state.selectedStateID && this.state.IsUpdateview == 1 ? '' : "none", cursor: "pointer", marginRight: "7px" }}></a><a style={{ display: view.user_id == '0' ? 'none' : "", cursor: "pointer" }} onClick={() => this.deleteConfirm(view)} tooltip="Delete View" className="fa fa-trash tag-icon-xs" ></a></td></tr>)
      })
    }
    catch (error) {
      console.log(error);
    }
  }

  //render report type
  renderType() {
    try {
      return this.state.filteredViewList.map((type, index) => {
        return (<tr key={index}><td><table><tbody><tr key={'typetr' + index}><td className="dv-padding view-type-group-label">{type.viewType}</td></tr><tr key={'tr' + index}><td style={{ paddingLeft: "25px" }}><table><tbody>{this.renderList(type.viewList)}</tbody></table></td></tr></tbody></table></td></tr>)
      })
    }
    catch (error) {
      console.log(error);
    }
  }

  //handle apply button event
  async applyFilter() {
    try {
      await this.setState({ showLoader: true });
      await this.props.getGridViewStructure(this.state.selectedViewId, this.state.selectedLevel);
      await this.setState({ currentState: this.props.gridviewstate.filter(x => x.id == this.state.selectedStateID)[0] });
      await this.setGridState();
      getParamList = [];
      getParamList.push({ level: this.state.selectedLevel, reportingperiod: this.state.selectedReportingPeriod })
      await this.props.getGridViewData(getParamList[0]);
      await this.fakeData();
      await this.setState({ showLoader: false });
    }
    catch (error) {
      console.log(error);
    }
  }
  async fakeData() {
    var obj1 = {
      'a': 'aa',
      'b': 'bb',
      'c': 'cc'
    },
      obj2 = {
        '2017 Actuals': 895,
        '2018 Actuals': 785,
        '2018 Actuals YTD': 786,
        '2019 Actuals (Daily YTD)': 333,
        '2019 SLE': 783,
        '2019 Actuals (Monthly YTD)': 6742,
        '2019 SLE Plan (YTG)': 897,
        'Frozen SLE': 234,
        'Frozen Actuals (YTD)': 564,
        'Frozen SLE Plan (YTG)': 678
      };
    var fakerowdata = [];
    fakerowdata = this.state.rowData;
    for (var i = 0; i < fakerowdata.length; i++) {
      for (var key in obj2) {
        fakerowdata[i][key] = Math.floor(Math.random()*(999-100+1)+100)
        //fakerowdata[i][key]= obj2[key]
      }
    }
    await this.setState({ rowData: fakerowdata });
  }
  //set filter parameter i.e timeperiod, reporting period
  async setFilterState() {
    await this.setState({ selectedLevel: this.state.currentState.level_type, selectedReportingPeriod: this.state.currentState.reporting_period });
  }

  //restore the state to ag-grid
  async asyncrestoreState(e, stateId, viewId) {
    try {
      await this.setState({ listOpen: false, rowData: [], currentState: this.props.gridviewstate.filter(x => x.id == stateId)[0], selectedStateID: stateId, selectedViewId: viewId, currentViewName: this.state.reportStateList.filter(x => x.id == stateId)[0].view_name });
      await this.setFilterState();
      await this.getCurrentFilterState();
      localStorage.setItem('previousGridViewState', JSON.stringify(this.state.currentState));
      await this.setPreviousFilteredColGroupState(this.state.currentState)
      await this.props.getGridViewStructure(viewId, this.state.currentState.level_type ? this.state.currentState.level_type : 3);
      await this.setGridState();
    }
    catch (error) {
      console.log(error);
    }
  }

  restoreState = (e) => {
    this.asyncrestoreState(e, e.id, e.view_id);//lambda function was not allowing aync call
  }

  //set  ag-grid state
  setGridState() {
    try {
      var data = this.state.currentState;
      localStorage.setItem('previousGridViewState', JSON.stringify(data));
      gridOptions.columnApi.setColumnState((JSON.parse(data.col_state)));
      gridOptions.columnApi.setColumnGroupState(JSON.parse(data.group_state));
      gridOptions.api.setSortModel(JSON.parse(data.sort_state));
      gridOptions.api.setFilterModel(JSON.parse(data.filter_state));
      gridOptions.columnApi.setPivotMode(data.is_pivot_mode)
    }
    catch (error) {
      console.log(error);
    }
  }

  //bind timeperiod
  bindLevel() {
    return levelOptions.map(
      option => <MenuItem value={option.key}>{option.value}</MenuItem>
    );
  }

  //bind reporting period
  bindReportingPeriod() {
    var years = ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];
    return years.map(
      option => <MenuItem value={option}>{option}</MenuItem>
    );
  }

  //handle event on change timeperiod
  handleLevelChange = (e) => {
    this.setState({
      selectedLevel: e.target.value,
      IsUpdateview: 1
    });
  }

  //handle event on change reporting period
  handleReportingPeriodChange = (e) => {
    this.setState({
      selectedReportingPeriod: e.target.value,
      IsUpdateview: 1
    });
  }

  //hide saved view list on click other than view list
  handleClickAway() {
    this.setState({
      listOpen: false
    })
  }

  //toggle view list
  toggleList() {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen
    }))
  }

  //handle event on input viewname
  handleInputViewName(e) {
    this.setState({ viewName: e.target.value });
  }

  activeTab() {
    if (document.getElementsByClassName('ant-menu-item-selected')[0] != undefined) {
      document.getElementsByClassName('ant-menu-item-selected')[0].classList.remove('ant-menu-item-selected')
    }
    if (document.getElementsByClassName('ant-menu-submenu-vertical')[0] != undefined) {
      document.getElementsByClassName('ant-menu-submenu-vertical')[0].classList.add('ant-menu-item-selected')
    }

  }

  render() {
    //  alert(this.props.path);
    this.activeTab();
    return (
      <ReportViewWrapper>
        <CustomizedSnackbar ref={el => this.snackbar = el} />
        <div className="updateProgress" style={{ display: this.state.showLoader == true ? '' : "none" }}  >
          <img className="imgUpdateProgress" title="Loading ..." src={loader} alt="Loading ..."  ></img>
        </div>
        <div className="box ag-theme-balham" >
          <div className="gridcontainer row header" layout-xs="column" layout="row">
            <div id="filtercontainer" className="filtercontainer ui-inputtext">
              <div className="card">
                <div className="card-header" id="headingOne">
                  <div className="grid-filter">
                    <div style={{ display: "flex" }}>
                      <div style={{ float: "right", display: 'flex' }}>
                        <span className="filter-label">Report/ Bookmark:</span>
                        <ClickAwayListener onClickAway={() => this.handleClickAway()}>
                          <div id="ChoosedView" className="dv-level">
                            <div id="dvChoosedView" type="text"
                              className={this.state.IsUpdateview == 0 ? "dvChoosedView ember-power-select-trigger saved-list-view-trigger" : "saved-list-view-changed dvChoosedView ember-power-select-trigger saved-list-view-trigger"}
                              onClick={() => this.toggleList()}>
                              <span id="spChoosedView"
                                className="ember-power-select-selected-item">{this.state.currentViewName}</span>
                              <span style={{ lineHeight: "24px", marginLeft: "1.3em" }}
                                className="fa fa-caret-down fa-lg pull-right"></span>
                            </div>
                            {this.state.listOpen && <div style={{ left: "0" }} id="savedview"
                              className="savedview dropdown-menu saved-list-view-dropdown ember-power-select-dropdown">
                              <div style={{ float: "left" }}>
                                <div className="dv-padding">
                                  <input value={this.state.viewName}
                                    onChange={this.handleInputViewName.bind(this)}
                                    type="text" placeholder="Save current view as..." maxLength="60"
                                    id="ember8811"
                                    className="txtview form-control ember-power-select-search-input ember-text-field ember-view" />
                                  <button disabled={!(this.state.viewName != undefined && this.state.viewName.length > 0)} onClick={() => this.saveState()} style={{ height: "34px", marginLeft: "10px" }} className="btn btn-primary" >
                                    <i className="fa fa-save"></i> Add</button>
                                </div>
                                <table>
                                  <tbody>
                                    <tr className="view-type">
                                      <td colSpan="2" style={{ paddingRight: "15px" }}>
                                        <span
                                          tooltip="Views you have created. Only you may select and edit the View."
                                        >Private</span>
                                        <input checked={this.state.privateViewType} onChange={this.onPrivateViewChange} type="checkbox"
                                        />
                                        <span
                                          tooltip="Views you have created and made Public. Only you may select and edit the View."
                                        >System</span>
                                        <input checked={this.state.systemViewType} onChange={this.onSystemViewChange} type="checkbox"
                                        />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="dv-padding">
                                        <input style={{ float: "left" }}
                                          onChange={this.applySearch}
                                          value={this.state.search}
                                          type="text" placeholder="Search..."
                                          maxLength="60" id="ember8811"
                                          className="txtview form-control ember-power-select-search-input ember-text-field ember-view" />
                                        <span style={{ float: "left" }}
                                          tooltip="Search for a View by its full or partial name."

                                          className="help-tipHeader my-viewtip"></span>
                                      </td>
                                    </tr>
                                    {this.renderType()}
                                  </tbody></table>
                              </div>
                            </div>}
                          </div>
                        </ClickAwayListener>
                        <span className="filter-label">Time Period:</span>
                        <div className="dv-level" >
                          <Select disableUnderline={true} value={this.state.selectedLevel} onChange={this.handleLevelChange.bind(this)}>
                            <MenuItem value="" disabled>
                              Choose Time Period
                                </MenuItem>
                            {this.bindLevel()}
                          </Select>
                        </div>
                        <span className="filter-label">Current Year:</span>
                        <div className="dv-level" >
                          <Select disableUnderline={true} value={this.state.selectedReportingPeriod} onChange={this.handleReportingPeriodChange.bind(this)}>
                            <MenuItem value="" disabled>
                              Choose Current Year
                                </MenuItem>
                            {this.bindReportingPeriod()}
                          </Select>
                        </div>
                      </div>
                      <div style={{ marginLeft: "15px" }}>
                        <button
                          onClick={() => this.applyFilter()}
                          //tooltip="Click apply to update the available data based on Type, Date, and Period selections."
                          id="btnapply"
                          type="button"
                          className="btn btn-primary px-4 button-round-corners button-width"
                        >Apply/ Refresh  </button>

                        <div style={{ display: "none" }}>
                          <div id="valueToggle">
                            <span id="spnvalueToggle" className="ag-icon ag-icon-tree-open toggle" onClick={this.valueToggle} ></span>
                            <span className="ag-icon ag-icon-aggregation ag-column-drop-icon spnag-column-drop-icon"></span>
                            <span className="ag-column-drop-title" >Values</span>
                          </div>

                          <div id="rowGroupToggle">
                            <span id="spnrowGroupToggle" className="ag-icon ag-icon-tree-open toggle" onClick={this.rowGroupToggle} ></span>
                            <span className="ag-icon ag-icon-group ag-column-drop-icon spnag-column-drop-icon"></span>
                            <span className="ag-column-drop-title" >Row Groups</span>
                          </div>

                          <div id="colGroupToggle" className="colGroupToggle" >
                            <span id="spncolGroupToggle" className="ag-icon ag-icon-tree-open toggle" onClick={this.colGroupToggle} ></span>
                            <span className="ag-icon ag-icon-pivot ag-column-drop-icon spnag-column-drop-icon"></span>
                            <span className="ag-column-drop-title" >Column Labels</span>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div></div>
              </div>
            </div>
          </div >
          <AgGridReact
            columnDefs={this.state.columnDefs}
            rowData={this.state.rowData}
            gridOptions={gridOptions}
            onDisplayedColumnsChanged={this.isChangedGridState.bind(this)}
          >
          </AgGridReact>
          <Modal title={this.state.title} visible={this.state.visible} onOk={() => this.handleOk()} onCancel={this.handleClose}>
            <p>{this.state.confirmMsg}</p>
          </Modal>
        </div>
      </ReportViewWrapper>
    )

  }
}

const mapStateToProps = state => {
  return {
    gridviewstructure: state.GridView.gridviewstructure,
    gridviewstate: state.GridView.gridviewstate,
    gridviewdata: state.GridView.gridviewdata,
    user: state.GridView.user,
    isSave: state.GridView.isSave,
    isDelete: state.GridView.isDelete
  }
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({
    addGridViewState: actions.AddGridViewStateAction,
    deleteGridViewState: actions.DeleteGridViewStateAction,
    getGridViewStructure: actions.GetGridViewStructureAction,
    getGridViewState: actions.GetGridViewStateAction,
    getGridViewData: actions.GetGridViewDataAction,
    // getUserInfo: actions.GetUserInfoAction
  }, dispatch);
};
export default connect(mapStateToProps, mapDispatchToProps)(ReportView)