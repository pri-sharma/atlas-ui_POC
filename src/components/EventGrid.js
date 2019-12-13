import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import 'ag-grid-enterprise';
import {AgGridReact} from 'ag-grid-react';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import SearchIcon from '@material-ui/icons/Search';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import _ from 'lodash';
import moment from 'moment';
import currency from 'currency.js';
import CustomizedSnackbar from './CustomizedSnackbar';
import * as actions from '../redux/events/actions';
import {DecimalCellEditor, NumericCellEditor} from '../CellEditors';
import CustomHeader from './customGridHeader/CustomHeader';
import CustomLinksHeader from './customGridHeader/CustomLinksHeader';
import PricingLevelCellRenderer from './CellRenderers/PricingLevelCellRenderer';
import CustomizedTable from './customizedTable/CustomizedTable';
import ProductPicker from './productPicker/ProductPicker';
import SpendPicker from './spendPicker/SpendPicker';
import * as EventGridHelper from '../helpers/EventGridHelper';
import {Styled} from './AGGrid.style';
import {CircularProgress} from '@material-ui/core';

import mockPerm from './MockPermissions';

const SpendType = {
    FX: 'FX',
    OI: 'OI',
    VR: 'VR'
};

const TimeDim = {
    WEEK: 'w',
    MONTH: 'm',
    TOTAL: 'total'
};

const Rule = {
    SUM: 'sum',
    AVG: 'avg',
    CONST: 'const',
    PROPORTION: 'proportion',
};

const CellEditor = {
    decimalCellEditor: 'decimalCellEditor',
    numericCellEditor: 'numericCellEditor',
    textCellEditor: 'agTextCellEditor'
};

const VarType = {
    int: 'int',
    float: 'float',
};

class EventGrid extends Component {
    constructor(props) {
        super(props);
        this.productTree = [
            {id: 'category_id', value: 'CATEGORY', checked: true},
            {id: 'subcategory_id', value: 'SUBCATEGORY', checked: true},
            {id: 'subbrand_id', value: 'SUBBRAND', checked: true},
            {id: 'variant_id', value: 'VARIANT', checked: true}
        ];

        this.key = {};
        const currentEvent = this.props.currentEvent;
        this.eventProduct = currentEvent.eventproducts_set ? currentEvent.eventproducts_set[0] : {};
        this.eventConditions = currentEvent.eventcondition_set;
        this.spendConditions = currentEvent.type.technical_name === 'TP' ? this.props.tpConditions : this.props.bspConditions;
        this.headerName = currentEvent.planning_layout ? currentEvent.planning_layout : 'PPG/SKU';
        this.groupHeader = this.headerName === 'PPG/SKU' ? this.headerName : this.productTree.reduce((acc, col) => (col.checked) ? [...acc, col.value] : acc, []).join('/');

        // TODO: Are we assuming that this.props.planningConfig must be populated?
        this.planningConfig = currentEvent.type.technical_name === 'TP' ? this.props.planningConfig['TP'] : this.props.planningConfig['BSP'];
        this.changedEntries = this.props.changedEntries || {};
        this.conditionData = this.eventProduct ? this.eventProduct.condition_data ? this.eventProduct.condition_data : [] : [];
        this.conditionMapping = EventGridHelper.getConditionCodeToRebate(this.eventConditions);
        this.pricing_level = this.props.currentEvent.pricing_level;
        this.snackbar = null;
        this.api = null;
        this.columnApi = null;
        this.horizontalDisaggRule = 'sum';
        this.verticalDisaggRule = 'sum';
        this.horizontalAggRule = 'sum';
        this.verticalAggRule = 'sum';
        this.initialColumnDefs = null;
        // this.hasCustomFiltered = false;
        this.storedCustomColumns = this.retrieveStoredColumns();
        this.frameworkComponents = {
            customExpandComponent: CustomHeader,
            customLinkHeaderComponent: CustomLinksHeader,
            pricinglevelcellrenderer: PricingLevelCellRenderer
        };
        // this.progressBarHtml = ReactDOMServer.renderToString(<CircularProgress/>);

        this.state = {
            columnDefs: this.generateColumnDefs(currentEvent),
            totalData: this.createData(currentEvent),
        };

        this.onCellKeyPress = this.onCellKeyPress.bind(this);
        this.customColDefsApply = this.customColDefsApply.bind(this);
        this.customSpendsApply = this.customSpendsApply.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {

        if ((this.props !== nextProps || this.state !== nextState) && this.api) {
            this.headerName = nextProps.currentEvent.planning_layout === "" ? 'PPG/SKU' : nextProps.currentEvent.planning_layout;
            this.groupHeader = this.headerName === 'PPG/SKU' ? this.headerName : this.productTree.reduce((acc, col) => (col.checked) ? [...acc, col.value] : acc, []).join('/');
            this.eventProduct = nextProps.currentEvent.eventproducts_set ? nextProps.currentEvent.eventproducts_set[0] : {};
            this.conditionData = this.eventProduct ? this.eventProduct.condition_data ? this.eventProduct.condition_data : [] : [];
            this.eventConditions = nextProps.currentEvent.eventcondition_set;
            this.conditionMapping = EventGridHelper.getConditionCodeToRebate(this.eventConditions);

            // TODO - need to use setState or somehow remove shouldComponentUpdate completely
            this.state.columnDefs = this.generateColumnDefs(nextProps.currentEvent);
            const columns = this.getCurrentColumns();
            if (this.headerName === 'PPG/SKU') {
                this.customColDefsApply(columns, true);
            } else {
                this.applyPHCustomizeTable(columns);
            }
            this.api.setRowData(nextProps.currentEvent.eventproducts_set);
            this.columnApi.columnController.groupAutoColumns[0].colDef.headerName = this.headerName;
            if (!_.isEmpty(this.changedEntries) && !_.isEmpty(this.props.changedEntries)) {
                let changedKeys = Object.keys(this.changedEntries);
                this.api.forEachNode(node => {
                    if (!node.aggData && _.find(changedKeys, (key) => key === node.data.id.toString())) {
                        let data = node.data;
                        let changed = this.changedEntries[node.data.id];
                        let newData = _.merge(data, changed);
                        node.setData(newData)
                    }
                });

            }
            this.api.setPinnedTopRowData(this.createData(nextProps.currentEvent));

            if (!_.isEmpty(nextProps.changedEntries) || !_.isEmpty(nextProps.pendingEventChanges)) this.props.updateChangePending(true)
            return true;
        }
        return false;
    }

    /*
    Local Storage:
    atlasSettings = {tpDetailsGridColumns: [], tpLandingGridColumns: []};
    */
    retrieveStoredColumns() {
        let storedCustomColumns = {};
        let columnDefs = JSON.parse(localStorage.getItem('atlasSettings'));
        if (columnDefs) {
            storedCustomColumns = columnDefs;
        }
        return storedCustomColumns;
    }

    onGridReady = (params) => {
        params.api.setGroupHeaderHeight(0); // hide header columns
        this.columnApi = params.columnApi;
        this.api = params.api;

        if (this.storedCustomColumns.tpDetailsGridColumns) {
            this.customColDefsApply(this.storedCustomColumns.tpDetailsGridColumns, true);
        }
        this.api.setPinnedTopRowData(this.createData(this.props.currentEvent))
    };

    prodDescGetter = (params) => {
        if (params.node.isRowPinned()) {
            return 'Total';
        } else {
            let product = params.data.productnode;
            let sku = product['material_number'] ? product['material_number'].replace(/^0+/, '') : '';
            let desc = product['description_set'].length > 0 ? product['description_set'].find(d => d.language === 'EN').description : 'Description N/A';
            return `${sku} - ${desc}`;
        }
    };

    headerValueGetter = () => {
        return this.groupHeader
    };

    applyPHCustomizeTable = (columns) => {
        const unchecked = [];

        this.productTree = columns

        if (this.initialColumnDefs === null) {
            this.initialColumnDefs = [...this.state.columnDefs];
        }

        for (let custCol of columns) {
            if (!custCol.checked) {
                unchecked.push(custCol.value)
            }
        }
        this.groupHeader = columns.reduce((acc, col) => (col.checked) ? [...acc, col.value] : acc, []).join('/');

        let newCols = [];
        _.forEach(this.initialColumnDefs, function (column) {
            const uncheckedCol = _.find(unchecked, (col => col === column.headerName))
            if (!uncheckedCol) {
                newCols.push(column)
            }
        });

        this.api.setColumnDefs([]);
        this.api.setColumnDefs(newCols)
    };

    customColDefsApply(columns, skipStorage) {
        const unchecked = [];

        if (this.initialColumnDefs === null) {
            this.initialColumnDefs = [...this.state.columnDefs];
        }
        // add initial fixed columns to newGridColDefs (ag grid's structure)
        const fixColLength = EventGridHelper.getFixedColumns(this.frameworkComponents.pricinglevelcellrenderer)[this.headerName].length;
        const newGridColDefs = this.initialColumnDefs.slice(0, fixColLength);

        // add customized CHECKED columns (customized's structure) to newGridColDefs that is found in initialColDefs
        for (let custCol of columns) {
            if (!custCol.checked) {
                unchecked.push(custCol.value);
                continue;
            }
            const foundCol = this.initialColumnDefs.find(col => col.headerName === custCol.value);
            if (foundCol) {
                newGridColDefs.push(foundCol);
            }
        }

        // add remaining columns that exist in initialColDefs that is not already added and not in customized UNCHECKED
        this.initialColumnDefs.forEach(column => {
            const foundCol = newGridColDefs.find(col => col.headerName === column.headerName);
            const uncheckedCol = unchecked.find(col => col === column.headerName);
            if (!foundCol && !uncheckedCol) {
                newGridColDefs.push(column);
            }
        });

        this.api.setColumnDefs([]);
        this.api.setColumnDefs(newGridColDefs);

        /*
        Local Storage:
        atlasSettings = {tpDetailsGridColumns: [], tpLandingGridColumns: []};
        */
        if (!skipStorage) {
            this.storedCustomColumns.tpDetailsGridColumns = columns;
            let newCustomColumns = JSON.stringify(this.storedCustomColumns);
            localStorage.setItem('atlasSettings', newCustomColumns);
        }
    };

    getCurrentColumns() {
        let initialCustomizedCols = [];
        // customized's structure
        const storedColumns = this.storedCustomColumns.tpDetailsGridColumns;
        // ag-grid's structure
        const currentColumns = this.customizableColumns;

        if (storedColumns) {
            // check that all columns that are in props.storedColumns are in props.column
            storedColumns.forEach(col => {
                const found = currentColumns.find(curr => curr.id === col.id);
                if (found) {
                    initialCustomizedCols.push(col);
                }
            });

            if (initialCustomizedCols.length === currentColumns.length) {
                // return if currentColumns are same length as the initial columns
                return initialCustomizedCols;
            } else {
                // find all columns in props.columns that are not in props.storedColumns
                // add those extra columns to props.storedColumns and set to checked field to true
                currentColumns.forEach(col => {
                    const found = storedColumns.find(stored => stored.id === col.id);
                    if (!found) {
                        initialCustomizedCols.push({
                            id: col.id,
                            checked: true,
                            value: col.display_name
                        });
                    }
                });
            }
        } else {
            initialCustomizedCols = currentColumns.reduce((acc, key) => [...acc, {
                id: key.id,
                checked: true,
                value: key.display_name
            }], []);
        }
        return initialCustomizedCols;
    }

    getKeyInfo = (jsonKeyFigure) => {
        let dataKey = jsonKeyFigure;
        let configKey = jsonKeyFigure;
        let isConditionData = false;
        if (jsonKeyFigure.startsWith(this.key.condition_data)) {
            const conditionCode = jsonKeyFigure.split('.')[1];
            const conditionType = this.conditionMapping[conditionCode];
            dataKey = conditionCode;
            configKey = conditionType;
            isConditionData = true;
        }
        return {
            dataKey: dataKey,
            configKey: configKey,
            isConditionData: isConditionData,
        };
    };

    customSpendsApply(spends) {
        const event = {
            id: this.props.currentEvent.id,
            conditions: _.chain(spends)
                .reduce((acc, spend) => (spend.checked) ? [...acc, spend.id + ''] : acc, [])
                .value()
        };
        this.props.updateTPEvent(event);
    }

    getCurrentSpends() {
        // const addSpend = this.props.isEditable('add_spend') || false;
        // const deleteSpend = this.props.isEditable('delete_spend') || false;
        const addSpend = true;
        const deleteSpend = true;
        this.disableSpends = !(addSpend || deleteSpend);
        if (this.spendConditions) {
            const spendGroups = _.chain(this.spendConditions)
                .map(spend => {
                    let spendChecked = false;
                    let spendDisabled = !addSpend;
                    const createTimeSpendObj = this.eventConditions.find(({condition}) => spend.code === condition.code);
                    if (createTimeSpendObj) {
                        spendChecked = true;
                        // spendDisabled = true;
                    }

                    return {
                        id: spend.code,
                        checked: spendChecked,
                        disabled: spendDisabled,
                        deleted: !deleteSpend,
                        type: spend.rebate_pricing,
                        value: spend.spend_description
                    };
                })
                .groupBy(spend => spend.type)
                .value();

            return spendGroups;
        } else {
            return {};
        }
    }

    generateColumnDefs = (currentEvent) => {
        this.key.condition_data = 'condition_data';
        Object.keys(this.planningConfig).forEach(key => {
            this.key[key] = key; //key is total_volume so it maps total_volume: total_volume
        });

        let columnDefs = EventGridHelper.getFixedColumns(this.frameworkComponents.pricinglevelcellrenderer)[this.headerName];
        // const columnDefs = this.columnDefsOptions[this.headerName];

        if (this.planningConfig === undefined) { //ASSUMPTION: If no config for this event type exists, it doesn't show any key figures
            return columnDefs;
        }
        // get ordered columns to group them
        this.customizableColumns = EventGridHelper.getDisplayOrderColumns(this.planningConfig, this.eventConditions);

        const editableByDate = !(moment().isAfter(moment(currentEvent.end_date)));
        const total_volume = this.eventProduct ? this.eventProduct.total_volume ? this.eventProduct.total_volume : {} : {};
        const keyColumns = Object.keys(total_volume).filter(key => key[0] === 'y');
        const monthKeys = keyColumns.filter(key => key.length === 8);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const weekKeys = keyColumns.filter(key => key.length === 11);

        let dynamicDefs = [];
        for (let i = 0; i < this.customizableColumns.length; i++) {  // group columns
            const configData = this.planningConfig[this.customizableColumns[i].type];
            if (configData === undefined) { //ASSUMPTION: If the key figure isn't in config, don't display it
                continue;
            }
            dynamicDefs.push(EventGridHelper.getExpandableColumnGroup(this.planningConfig, this.customizableColumns[i], {
                editableByDate,
                total_volume,
                keyColumns,
                monthKeys,
                months,
                weekKeys
            }));
        }

        this.initialColumnDefs = [...columnDefs, ...dynamicDefs];
        return [...columnDefs, ...dynamicDefs];
    };

    getStartDayAdjustment = (year, startDay) => {
        const firstDayofYear = new Date(year, 0, 1).getDay();
        const days = {
            'Monday': 0,
            'Tuesday': 1,
            'Wednesday': 2,
            'Thursday': 3,
            'Friday': 4,
            'Saturday': 5,
            'Sunday': 6
        };
        let idx = days[startDay];

        if (idx < firstDayofYear) {
            return (0 - idx);
        }
        return (7 - idx);
    };

    // manually modify aggData when and aggregated cell is changed
    onCellKeyPress = (params) => {
        const field = params.column.colId;
        const aggData = params.node.aggData;
        const value = params.event.target.value;
        if (aggData) {
            if (isNaN(value)) {
                if (params.colDef.cellEditor === CellEditor.decimalCellEditor) {
                    aggData[field] = currency(params.value).value;
                } else {
                    aggData[field] = parseInt(params.value)
                }
            } else if (value === '') {
                if (params.colDef.cellEditor === CellEditor.decimalCellEditor) {
                    aggData[field] = currency(0).value;
                } else {
                    aggData[field] = 0
                }
            } else if (value !== null) {
                if (params.colDef.cellEditor === CellEditor.decimalCellEditor) {
                    aggData[field] = currency(value).value;
                } else {
                    aggData[field] = parseInt(value);
                }
            }
        }
    };

    timeDimensionSwitch = (timeDimension, node, monthColumn, parentColumn, newData) => {
        const timeDim = {
            WEEK: 'w',
            MONTH: 'm',
            TOTAL: 'total'
        };

        switch (timeDimension) {
            case timeDim.WEEK:
                this.aggregateChildrenSwitch(node, monthColumn);
                this.aggregateChildrenSwitch(node, parentColumn);
                break;
            case timeDim.MONTH:
                this.disaggregateMonthSwitch(node, monthColumn, newData);
                this.aggregateChildrenSwitch(node, parentColumn);
                break;
            case timeDim.TOTAL:
                this.disaggregateTotalSwitch(node, parentColumn, newData);
                break;
            default:
                throw 'Error aggregating'
        }
    };

    totalUpliftCalculation = (node, jsonKeyFigure) => {
        if (this.changedEntries[node.data.id]) {
            Object.keys(_.get(this.changedEntries, `${node.data.id}`, {}))
                .forEach(columnkey => {
                    const changedEntriesId = this.changedEntries[node.data.id];
                    if (jsonKeyFigure === this.key.total_volume && columnkey === this.key.total_volume) {
                        let total_volume = changedEntriesId[this.key.total_volume];
                        Object.keys(_.get(changedEntriesId, `${this.key.total_volume}`, {}))
                            .forEach(key => {
                                const oldValue = node.data.uplift_volume[key];
                                const newValue = total_volume[key] - node.data.baseline_volume[key];
                                node.data.uplift_volume[key] = newValue;
                                this.trackChange(node, key, newValue, oldValue, this.key.uplift_volume);
                            })
                    } else if (jsonKeyFigure === this.key.uplift_volume && columnkey === this.key.uplift_volume) {
                        let uplift_volume = changedEntriesId[this.key.uplift_volume];
                        Object.keys(_.get(changedEntriesId, `${this.key.uplift_volume}`, {}))
                            .forEach(key => {
                                const oldValue = node.data.total_volume[key];
                                const newValue = node.data.baseline_volume[key] + uplift_volume[key];
                                node.data.total_volume[key] = newValue;
                                this.trackChange(node, key, newValue, oldValue, this.key.total_volume);
                            })
                    }
                })
        }
    };

    getJsonData = (node, isConditionData) => {
        let jsonData;
        if (isConditionData) { // gets the correct data dict based on if it's a condition or not
            jsonData = node.data[this.key.condition_data];
        } else {
            jsonData = node.data;
        }
        return jsonData;
    };

    aggregateChildrenSwitch = (node, parentColumn) => {
        switch (this.horizontalAggRule) {
            case Rule.SUM:
                this.sumAggregateChildren(node, parentColumn);
                break;
            case Rule.AVG:
                this.avgAggregateChildren(node, parentColumn);
                break;
            default:
                throw new Error('Horizontal Aggregation rule missing in config');
        }
    };

    sumAggregateChildren = (node, parentColumn) => {
        let aggregateSum = 0;
        const allChildCols = parentColumn.getChildren().map(child => child.hasOwnProperty('children') ? child.getLeafColumns()[0] : child);
        const parentKey = allChildCols[0].getColDef().jsonProps.key;
        const childCols = allChildCols.slice(1);
        const jsonKeyFigure = (parentKey !== 'total') ? parentColumn.parent.groupId : parentColumn.groupId;

        const keyInfo = this.getKeyInfo(jsonKeyFigure);
        const configKey = keyInfo.configKey;
        const jsonDataKey = keyInfo.dataKey;
        const configData = this.planningConfig[configKey];
        const varType = configData['kf_var_type'];

        const jsonData = this.getJsonData(node, keyInfo.isConditionData);

        const oldValue = jsonData[jsonDataKey][parentKey];

        childCols.forEach(col => {
            const childColKey = col.getColDef().jsonProps.key;
            if (varType === VarType.int) {
                aggregateSum += jsonData[jsonDataKey][childColKey];
            } else { // decimal
                aggregateSum = currency(aggregateSum).add(jsonData[jsonDataKey][childColKey]);
            }
        });

        if (varType === VarType.float) { // decimal
            aggregateSum = aggregateSum.value;
        }
        jsonData[jsonDataKey][parentKey] = aggregateSum;

        this.trackChange(node, parentKey, aggregateSum, oldValue, jsonKeyFigure);

    };

    avgAggregateChildren = (node, parentColumn) => {
        let aggregateSum = 0;
        const allChildCols = parentColumn.getChildren().map(child => child.hasOwnProperty('children') ? child.getLeafColumns()[0] : child);
        const parentKey = allChildCols[0].getColDef().jsonProps.key;
        const childCols = allChildCols.slice(1);
        const jsonKeyFigure = (parentKey !== 'total') ? parentColumn.parent.groupId : parentColumn.groupId;

        const keyInfo = this.getKeyInfo(jsonKeyFigure);
        const configKey = keyInfo.configKey;
        const jsonDataKey = keyInfo.dataKey;
        const configData = this.planningConfig[configKey];
        const varType = configData['kf_var_type'];

        const jsonData = this.getJsonData(node, keyInfo.isConditionData);

        const oldValue = jsonData[jsonDataKey][parentKey];

        childCols.forEach(col => {
            const childColKey = col.getColDef().jsonProps.key;
            aggregateSum += jsonData[jsonDataKey][childColKey];
        });

        if (varType === VarType.int) {
            aggregateSum = Math.floor(aggregateSum / childCols.length); //TODO can avg be done on an int type?
        } else { // decimal
            aggregateSum = currency(aggregateSum).divide(childCols.length).value;
        }
        jsonData[jsonDataKey][parentKey] = aggregateSum;

        this.trackChange(node, parentKey, aggregateSum, oldValue, jsonKeyFigure);

    };

    disaggregateMonthSwitch = (node, monthCol, monthVal) => {
        switch (this.horizontalDisaggRule) {
            case Rule.PROPORTION:
                this.sumpropDisaggregateMonth(node, monthCol, monthVal, Rule.PROPORTION);
                break;
            case Rule.SUM:
                this.sumpropDisaggregateMonth(node, monthCol, monthVal, Rule.SUM);
                break;
            case Rule.CONST:
                this.constDisaggregateMonth(node, monthCol, monthVal);
                break;
            default:
                throw new Error('Horizontal Aggregation rule missing in config');
        }
    };

    getNumDaysInMonth = (monthProps) => {
        let numDaysInMonth;
        const currentEvent = this.props.currentEvent;
        const startYear = moment(currentEvent.start_date).year();
        const endYear = moment(currentEvent.end_date).year();
        if (monthProps.month === moment(currentEvent.start_date).month() + 1) {
            if (startYear == endYear && monthProps.month === moment(currentEvent.end_date).month() + 1) {
                numDaysInMonth = moment(currentEvent.end_date).get('date') - moment(currentEvent.start_date).get('date') + 1;
            } else {
                numDaysInMonth = moment(currentEvent.start_date).daysInMonth() - moment(currentEvent.start_date).get('date') + 1;
            }
        } else if (monthProps.month === moment(currentEvent.end_date).month() + 1) {
            numDaysInMonth = moment(currentEvent.end_date).get('date');
        } else {
            const moment_string = monthProps.month.toString().padStart(2, '0') + monthProps.year.toString();
            numDaysInMonth = moment(moment_string, 'MMYYYY').daysInMonth();
        }
        return numDaysInMonth;
    };

    getMonthCalculationVars = (monthProps) => {
        const currentEvent = this.props.currentEvent;
        let dateEndDay = parseInt(currentEvent.end_date.substring(8));
        let dateEndMonth = parseInt(currentEvent.end_date.substring(5, 7));
        let dateStartDay = parseInt(currentEvent.start_date.substring(8));
        let dateStartMonth = parseInt(currentEvent.start_date.substring(5, 7));

        const year = monthProps.year;
        const custStartDay = this.getStartDayAdjustment(year, this.props.customerStartDay);
        const month = monthProps.month - 1; // month number being edited (starting at 0)
        const dayOffset = new Date(monthProps.year, 0, 0).getDay() + custStartDay;
        const timestamp = new Date().setFullYear(year, 0, 1);
        const yearFirstDay = Math.floor(timestamp / 86400000); // UTC first day of year

        const day = (dateStartMonth - 1 === month) ? dateStartDay : 1;
        const monthEndDay = (monthProps.month === dateEndMonth) ? dateEndDay : 0;
        const monthStart = Math.ceil((new Date(year, month, day).getTime()) / 86400000); // UTC month start
        const monthCalculation = (monthEndDay === 0) ? month + 1 : month;
        const monthEnd = Math.ceil((new Date(year, monthCalculation, monthEndDay).getTime()) / 86400000); // UTC month end

        const startDay = monthStart - yearFirstDay; // start of month day of year
        const endDay = monthEnd - yearFirstDay;
        const daysRemainingInMonth = endDay - startDay + 1; // total days in month

        return {
            startDay: startDay,
            endDay: endDay,
            dayOffset: dayOffset,
            daysRemainingInMonth: daysRemainingInMonth,
        }
    };

    getNumDaysInWeek = (monthVars, i, length) => {
        // calculate split week values
        const daysRemainingInMonth = monthVars.daysRemainingInMonth;
        let numDays = 7;
        if (i === 0) { // start week
            const numDaysInYearUntilStartDayOfMonth = monthVars.startDay + monthVars.dayOffset - 1; // Note: startDay is current day when it's current month and year
            const numDaysInWeekUntilStartDayOfMonth = numDaysInYearUntilStartDayOfMonth % 7;
            const numDaysRemainingInStartWeekOfMonth = 7 - numDaysInWeekUntilStartDayOfMonth;
            numDays = (daysRemainingInMonth < numDaysRemainingInStartWeekOfMonth) ? daysRemainingInMonth : numDaysRemainingInStartWeekOfMonth; // days in start week
        } else if (i === length - 1) { // end week
            const numDaysInYearUntilEndDayOfMonth = monthVars.endDay + monthVars.dayOffset;
            const numDaysInWeekUntilEndDayOfMonth = numDaysInYearUntilEndDayOfMonth % 7;
            numDays = daysRemainingInMonth < numDaysInWeekUntilEndDayOfMonth ? daysRemainingInMonth : numDaysInWeekUntilEndDayOfMonth; // days in end week
        }

        numDays = (numDays === 0) ? 7 : numDays;

        return numDays;
    };

    getReferenceKeyFigureInfo = (configData, node, rule, allChildCols) => {
        const proportion = rule === Rule.PROPORTION;
        const totalProps = allChildCols[0].getColDef().jsonProps;
        const refKfg = configData.ref_kf;
        let refTotal = 0;
        let refJsonData = {};

        if (proportion) { // if the vertical disagg rule is proportional, get the total agg value of the reference kfg
            if (refKfg in this.key) { // If refKfg is null, it won't exist in this.key
                refJsonData = node.data[refKfg];
                refTotal = refJsonData[totalProps.key]; //todo what if the reference is a condition?
            } else {
                //TODO what happens if the key figure you are referencing isn't in you config for this grid?
                //If it isn't there, it just disaggregates normally for now
                //TODO what if the key figure you are referencing is in the config but doesn't have any data? ex: gross price
            }
        }

        return {
            data: refJsonData,
            whole: refTotal, // either the total of the event or the total month value
        }
    };

    sumpropDisaggregateMonth = (node, monthCol, newMonthVal, rule) => {
        const allChildCols = monthCol.children.map(c => c.hasOwnProperty('children') ? c.getLeafColumns()[0] : c); // get all immediate child columns of group column (e.g quarter total, month1, month2, month3)
        const monthProps = allChildCols[0].getColDef().jsonProps;
        const childCols = allChildCols.slice(1); // child columns only without parent total column
        const jsonKeyFigure = monthCol.parent.groupId;
        const monthVars = this.getMonthCalculationVars(monthProps);

        const keyInfo = this.getKeyInfo(jsonKeyFigure);
        const configKey = keyInfo.configKey;
        const jsonDataKey = keyInfo.dataKey;
        const configData = this.planningConfig[configKey];
        const varType = configData['kf_var_type'];
        const ref = this.getReferenceKeyFigureInfo(configData, node, rule, allChildCols);

        const jsonData = this.getJsonData(node, keyInfo.isConditionData);

        let proportionWhole;
        if (ref.whole === 0 || rule === Rule.SUM) {  // even distribution due to rule being sum or since ref total is 0
            proportionWhole = this.getNumDaysInMonth(monthProps);
        } else { // proportional distribution
            proportionWhole = ref.whole;
        }

        let totalRem = 0;
        let weeksSum = 0;
        for (let i = 0; i < childCols.length; i++) {
            const childProps = childCols[i].getColDef().jsonProps;
            const childKey = childProps.key; // jsonfield key (ex m1w1)
            const proportionPart = (ref.whole === 0 || rule === Rule.SUM) ? this.getNumDaysInWeek(monthVars, i, childCols.length) : ref.data[childKey];
            const distVal = (proportionPart / proportionWhole) * newMonthVal;
            let weekValue;

            if (varType === VarType.int) {
                const childBase = ((distVal % 1) > .5) ? Math.ceil(distVal) : Math.floor(distVal);
                totalRem += distVal - childBase; // this will be a decimal, sums the differences of the floor/ceil
                weekValue = (i === childCols.length - 1) ? childBase + Math.round(totalRem) : childBase;
            } else { // decimal
                const childBase = currency(distVal).value;
                weeksSum += childBase; // will be a sum of the total to two decimal places
                weekValue = (i === childCols.length - 1) ? currency(childBase + (newMonthVal - weeksSum)).value : childBase;
            }

            const oldVal = jsonData[jsonDataKey][childKey];
            jsonData[jsonDataKey][childKey] = weekValue;
            this.trackChange(node, childKey, weekValue, oldVal, jsonKeyFigure);
        }

    };

    constDisaggregateMonth = (node, monthCol, monthVal) => {

        const allChildCols = monthCol.children.map(c => c.hasOwnProperty('children') ? c.getLeafColumns()[0] : c); // get all immediate child columns of group column (e.g quarter total, month1, month2, month3)
        const childCols = allChildCols.slice(1); // child columns only without parent total column
        const jsonKeyFigure = monthCol.parent.groupId;

        const keyInfo = this.getKeyInfo(jsonKeyFigure);
        const configKey = keyInfo.configKey;
        const jsonDataKey = keyInfo.dataKey;
        const configData = this.planningConfig[configKey];
        const varType = configData['kf_var_type'];

        const jsonData = this.getJsonData(node, keyInfo.isConditionData);

        for (let i = 0; i < childCols.length; i++) {
            const childKey = childCols[i].getColDef().jsonProps.key; // jsonfield key (ex m1w1)
            const oldVal = jsonData[jsonDataKey][childKey];
            let weekVal = monthVal;
            if (varType === VarType.float) { // decimal
                weekVal = currency(monthVal).value;
            }

            jsonData[jsonDataKey][childKey] = weekVal;

            this.trackChange(node, childKey, weekVal, oldVal, jsonKeyFigure);
        }

    };

    disaggregateTotalSwitch = (node, parentColumn, newValue) => {
        switch (this.horizontalDisaggRule) {
            case Rule.PROPORTION:
                this.sumpropDisaggregateTotal(node, parentColumn, newValue, Rule.PROPORTION);
                break;
            case Rule.SUM:
                this.sumpropDisaggregateTotal(node, parentColumn, newValue, Rule.SUM);
                break;
            case Rule.CONST:
                this.constDisaggregateTotal(node, parentColumn, newValue);
                break;
            default:
                throw new Error('Horizontal Aggregation rule missing in config');
        }
    };

    // TODO: if you try to enter total and it's less than the inactive months combined, total = inactive months, everything else = 0
    sumpropDisaggregateTotal = (node, parentColumn, newTotalValue, rule) => {
        const allChildCols = parentColumn.children.map(c => c.hasOwnProperty('children') ? c.getLeafColumns()[0] : c); // get all immediate child columns of group column (e.g quarter total, month1, month2, month3)
        const childCols = allChildCols.slice(1); // child columns only without parent total column
        const jsonKeyFigure = parentColumn.groupId;
        const keyInfo = this.getKeyInfo(jsonKeyFigure);
        const configKey = keyInfo.configKey;
        const jsonDataKey = keyInfo.dataKey;
        const configData = this.planningConfig[configKey];
        const varType = configData['kf_var_type'];
        const ref = this.getReferenceKeyFigureInfo(configData, node, rule, allChildCols);

        const jsonData = this.getJsonData(node, keyInfo.isConditionData);

        let proportionWhole;
        if (ref.whole === 0 || rule === Rule.SUM) {  // even distribution due to rule being sum or since ref total is 0
            const totalNumDaysInPromo = moment(this.props.currentEvent.end_date).diff(moment(this.props.currentEvent.start_date), 'days') + 1; // gets number of days in promo, including start day
            proportionWhole = totalNumDaysInPromo;
        } else { // proportional distribution
            proportionWhole = ref.whole;
        }

        let totalRem = 0;
        let monthsSum = 0;
        for (let i = 0; i < childCols.length; i++) {
            const childProps = childCols[i].getColDef().jsonProps;
            const childKey = childProps.key; // jsonfield key (ex m1w1)
            const proportionPart = (ref.whole === 0 || rule === Rule.SUM) ? this.getNumDaysInMonth(childProps) : ref.data[childKey];
            const distVal = (proportionPart / proportionWhole) * newTotalValue;
            let monthVal;

            if (varType === VarType.int) {
                const childBase = ((distVal % 1) > .5) ? Math.ceil(distVal) : Math.floor(distVal);
                totalRem += distVal - childBase; // this will be a decimal, sums the differences of the floor/ceil
                monthVal = (i === childCols.length - 1) ? childBase + Math.round(totalRem) : childBase;
            } else {  // decimal
                const childBase = currency(distVal).value;
                monthsSum += childBase;
                monthVal = (i === childCols.length - 1) ? currency(childBase + (newTotalValue - monthsSum)).value : childBase;
            }

            const oldVal = jsonData[jsonDataKey][childKey];
            jsonData[jsonDataKey][childKey] = monthVal;
            this.trackChange(node, childKey, monthVal, oldVal, jsonKeyFigure);
            this.sumpropDisaggregateMonth(node, childCols[i].parent, monthVal, rule);
        }

    };

    constDisaggregateTotal = (node, parentColumn, newValue) => {
        const allChildCols = parentColumn.children.map(c => c.hasOwnProperty('children') ? c.getLeafColumns()[0] : c); // get all immediate child columns of group column (e.g quarter total, month1, month2, month3)
        const childCols = allChildCols.slice(1); // child columns only without parent total column\
        const jsonKeyFigure = parentColumn.groupId;
        const keyInfo = this.getKeyInfo(jsonKeyFigure);
        const configKey = keyInfo.configKey;
        const jsonDataKey = keyInfo.dataKey;
        const configData = this.planningConfig[configKey];
        const varType = configData['kf_var_type'];

        const jsonData = this.getJsonData(node, keyInfo.isConditionData);

        for (let i = 0; i < childCols.length; i++) {
            const childKey = childCols[i].getColDef().jsonProps.key; // jsonfield key (ex m1w1)
            const oldVal = jsonData[jsonDataKey][childKey];
            let monthVal = newValue;
            if (varType === VarType.float) { // decimal
                monthVal = currency(newValue).value;
            }

            jsonData[jsonDataKey][childKey] = monthVal;

            this.trackChange(node, childKey, monthVal, oldVal, jsonKeyFigure);
            this.constDisaggregateMonth(node, childCols[i].parent, monthVal);
        }
    };

    /**
     * Disaggregates vertically for rule type sum and proportion.
     * If it's sum, it disaggregates evenly. If it's proportional, it checks the total value of the reference kfg and if
     * that isn't 0, it will disaggregate proportionally to the values in the referenced kfg
     * @param node
     * @param params
     * @param timeDimension
     * @param newValue
     * @param oldValue
     * @param rule Either SUM or PROPORTION
     */
    sumpropDisaggregateVerticallyToSku = (node, paramsDict, timeDimension, newValue, oldValue, rule) => {
        const proportion = rule === Rule.PROPORTION;
        const keyInfo = this.getKeyInfo(paramsDict.jsonKeyFigure);
        const configKey = keyInfo.configKey;
        const jsonDataKey = keyInfo.dataKey;
        const configData = this.planningConfig[configKey];
        const refKfg = configData.ref_kf;
        const varType = configData['kf_var_type'];
        let refTotal = 0;

        if (proportion) { // if the vertical disagg rule is proportional, get the total agg value of the reference kfg
            if (refKfg in this.key) { // If refKfg is null, it won't exist in this.key
                refTotal = node.aggData[`${refKfg}.${paramsDict.key}`];
            } else {
                //TODO what happens if the key figure you are referencing isn't in you config for this grid?
                //If it isn't there, it just disaggregates normally for now
                //TODO what if the key figure you are referencing is in the config but doesn't have any data? ex: gross price
            }
        }
        let total = 0;
        let remainder = 0;
        let sum = 0;
        let newSkuData = 0;
        const numSkus = node.allLeafChildren.length;
        if (refTotal === 0) { // even distribution since ref total is 0
            newSkuData = currency(newValue).divide(numSkus).value; // decimal
            if (varType === VarType.int) {
                newSkuData = Math.floor(newSkuData); // int
                sum = newSkuData * numSkus;
                remainder = newValue - sum; // remainder will always be >= to 0 since we are using Math.floor
            } else { // decimal
                sum = currency(newSkuData).multiply(numSkus).value;
                remainder = currency(sum).subtract(newValue).value;
            }
        }

        node.allLeafChildren.forEach((child, index) => {
            const childData = this.getJsonData(child, keyInfo.isConditionData);

            let finalSkuValue;
            const oldSkuData = childData[jsonDataKey][paramsDict.key];
            if (refTotal === 0 || rule === Rule.SUM) { // even distribution due to rule being sum or since ref total is 0
                if (varType === VarType.int) {
                    finalSkuValue = remainder > 0 ? newSkuData + 1 : newSkuData;
                    remainder -= 1;
                } else { // decimal
                    index === numSkus - 1 ? finalSkuValue = currency(newSkuData).subtract(remainder).value : finalSkuValue = newSkuData;
                }

                childData[jsonDataKey][paramsDict.key] = finalSkuValue;
                this.timeDimensionSwitch(timeDimension, child, paramsDict.monthColumn, paramsDict.parentColumn, finalSkuValue);
                this.trackChange(child, paramsDict.key, finalSkuValue, oldSkuData, paramsDict.jsonKeyFigure);
                this.totalUpliftCalculation(child, paramsDict.jsonKeyFigure);
            } else { // proportional distribution
                const refValue = childData[refKfg][paramsDict.key];
                finalSkuValue = currency(refValue).divide(refTotal).multiply(newValue).value; // decimal
                if (varType === VarType.int) {
                    finalSkuValue = Math.round(finalSkuValue); // int
                }
                total += finalSkuValue; // can be int or decimal based on varType

                if (index === node.allLeafChildren.length - 1) {
                    finalSkuValue += (newValue - total); //adds the remainder to the last sku
                }

                childData[jsonDataKey][paramsDict.key] = finalSkuValue;
                this.timeDimensionSwitch(timeDimension, child, paramsDict.monthColumn, paramsDict.parentColumn, finalSkuValue);
                this.trackChange(child, paramsDict.key, finalSkuValue, oldSkuData, paramsDict.jsonKeyFigure);
                this.totalUpliftCalculation(child, paramsDict.jsonKeyFigure);
            }
        });
    };

    constDisaggregateVerticallyToSku = (node, paramsDict, timeDimension, newValue, oldValue) => {
        const keyInfo = this.getKeyInfo(paramsDict.jsonKeyFigure);
        const configKey = keyInfo.configKey;
        const jsonDataKey = keyInfo.dataKey;
        const configData = this.planningConfig[configKey];
        const varType = configData['kf_var_type'];

        node.allLeafChildren.forEach((child, index) => {
            // if (this.isFXAmount(conditionDescription) && this.checkGrossSalesExist()) {
            const childData = this.getJsonData(child, keyInfo.isConditionData);

            if (varType === VarType.int) { // if it's an int, follow regular time dimension switch
                const oldData = childData[jsonDataKey][paramsDict.key];
                childData[jsonDataKey][paramsDict.key] = newValue;
                this.timeDimensionSwitch(timeDimension, child, paramsDict.monthColumn, paramsDict.parentColumn, newValue);
                this.trackChange(child, paramsDict.key, newValue, oldData, paramsDict.jsonKeyFigure);
            } else {
                if (keyInfo.isConditionData && (keyInfo.configKey === SpendType.OI || keyInfo.configKey === SpendType.VR)) { // follow OI/VR time dimension switch logic
                    this.OIVRCopyOrAsterisk(child, jsonDataKey, paramsDict.monthColumn, newValue, timeDimension);
                    this.OIVRTimeDimensionSwitch(timeDimension, child, paramsDict.monthColumn, paramsDict.parentColumn, newValue, jsonDataKey, paramsDict.key);
                    this.trackChange(child, paramsDict.key, newValue, oldValue, paramsDict.jsonKeyFigure)
                } else { // the var type is a float and it's not an OI/VR spend so set newValue as a decimal using currency
                    const oldData = childData[jsonDataKey][paramsDict.key];
                    childData[jsonDataKey][paramsDict.key] = currency(newValue).value;
                    this.timeDimensionSwitch(timeDimension, child, paramsDict.monthColumn, paramsDict.parentColumn, newValue);
                    this.trackChange(child, paramsDict.key, newValue, oldData, paramsDict.jsonKeyFigure);
                }
            }
        })
    };

    extractParams = (params) => {
        const key = params.column.getColDef().jsonProps.key;
        const monthColumn = params.column.parent;
        const parentColumn = monthColumn.parent;
        const jsonKeyFigure = parentColumn.groupId;
        const description = params.column.getColDef().jsonProps.description;

        return {
            key: key,
            monthColumn: monthColumn,
            parentColumn: parentColumn,
            jsonKeyFigure: jsonKeyFigure,
            description: description,
        }
    };

    onGridCellChange = (params) => {
        const node = params.node;
        const oldValue = params.oldValue;
        let newValue = params.newValue;
        const paramsDict = this.extractParams(params);
        const keyInfo = this.getKeyInfo(paramsDict.jsonKeyFigure);
        const configKey = keyInfo.configKey;
        const conditionKey = keyInfo.dataKey;
        const conditionDescription = params.column.getColDef().jsonProps.description;

        const kfgConfig = this.planningConfig[configKey];
        this.horizontalDisaggRule = kfgConfig.horizontal_disagg;
        this.verticalDisaggRule = kfgConfig.vertical_disagg;
        this.horizontalAggRule = kfgConfig.horizontal_agg;
        // this.verticalAggRule = kfgConfig.vertical_agg;
        // if the newValue is NaN, replace newValue with the oldValue
        if (isNaN(newValue)) {
            newValue = oldValue;

            if (keyInfo.isConditionData) {
                // replace the data/aggData in node with the oldValue instead of the NaN that it has since the newValue gets set into it before it comes into onGridCellChange
                if (!node.aggData) {
                    node.data[this.key.condition_data][paramsDict.jsonKeyFigure.split('.')[1]][paramsDict.key] = oldValue;
                } else {
                    node.aggData[paramsDict.jsonKeyFigure + "." + paramsDict.key] = oldValue;
                }
            } else {
                if (!node.aggData) {
                    node.data[paramsDict.jsonKeyFigure][paramsDict.key] = oldValue;
                } else {
                    node.aggData[paramsDict.jsonKeyFigure + "." + paramsDict.key] = oldValue;
                }
            }
            // if it's NaN and we're just replacing with the oldValue, don't go into disaggregation logic
            params.api.refreshCells(); // need to refresh the cells after changing node, otherwise the changes won't reflect in the browser and the NaN value will be visible
            return;

        }

        let timeDimension;
        if (params.colDef.field.match(/y\d{4}m\d{2}w\d{2}$/g)) {
            timeDimension = TimeDim.WEEK;
        } else if (params.colDef.field.match(/y\d{4}m\d{2}$/g)) {
            timeDimension = TimeDim.MONTH;
        } else if (params.colDef.field.match(/total$/g)) {
            timeDimension = TimeDim.TOTAL;
        }

        if (node.hasOwnProperty('allLeafChildren')) { //higher level vertically with product dimension
            //vertical disagg
            switch (this.verticalDisaggRule) {
                case Rule.PROPORTION: //TODO add this as a rule in backend
                    this.sumpropDisaggregateVerticallyToSku(node, paramsDict, timeDimension, newValue, oldValue, Rule.PROPORTION);
                    break;
                case Rule.SUM:
                    this.sumpropDisaggregateVerticallyToSku(node, paramsDict, timeDimension, newValue, oldValue, Rule.SUM);
                    break;
                case Rule.CONST:
                    this.constDisaggregateVerticallyToSku(node, paramsDict, timeDimension, newValue, oldValue);
                    break;
                default:
                    throw new Error('Vertical Disaggregation rule missing in config');
            }
        } else { //  sku level
            // horizontal time dimension switch
            if (keyInfo.isConditionData && !this.isFXAmount(conditionDescription)) {
                this.OIVRCopyOrAsterisk(node, conditionKey, paramsDict.monthColumn, newValue, timeDimension);
                this.OIVRTimeDimensionSwitch(timeDimension, node, paramsDict.monthColumn, paramsDict.parentColumn, newValue, conditionKey, paramsDict.key, oldValue);
                this.trackChange(node, paramsDict.key, newValue, oldValue, paramsDict.jsonKeyFigure)
            } else {
                this.timeDimensionSwitch(timeDimension, node, paramsDict.monthColumn, paramsDict.parentColumn, newValue);
                this.trackChange(node, paramsDict.key, newValue, oldValue, paramsDict.jsonKeyFigure);
                this.totalUpliftCalculation(node, paramsDict.jsonKeyFigure);
            }
        }

        params.api.refreshCells();
        params.api.refreshClientSideRowModel('aggregate');
        params.api.setPinnedTopRowData(this.createData(this.props.currentEvent));

    };

    OIVRCopyOrAsterisk = (node, conditionKey, monthColumn, newValue, timeDimension) => {
        const jsonKeyFigure = `condition_data.${conditionKey}`;
        if (timeDimension === TimeDim.MONTH) {
            if (node.data.condition_data[conditionKey].total !== newValue) {
                const oldTotalVal = node.data.condition_data[conditionKey].total;
                node.data.condition_data[conditionKey].total = '*';
                this.trackChange(node, 'total', '*', oldTotalVal, jsonKeyFigure);
            }
        } else if (timeDimension === TimeDim.WEEK) {
            let monthKey = monthColumn.groupId.split('_')[0];

            let weekKeys = Object.keys(node.data.condition_data[conditionKey]).filter(key => key.includes(monthKey) && key !== monthKey);
            let weekValues = Object.values(_.pick(node.data.condition_data[conditionKey], weekKeys));
            const oldMonthVal = node.data.condition_data[conditionKey][monthKey];
            node.data.condition_data[conditionKey][monthKey] = weekKeys.length > 1 && !weekValues.every(value => value === newValue) ? '*' : newValue;
            const newMonthVal = node.data.condition_data[conditionKey][monthKey];
            this.trackChange(node, monthKey, newMonthVal, oldMonthVal, jsonKeyFigure);

            let monthKeys = Object.keys(node.data.condition_data[conditionKey]).filter(key => key.includes(TimeDim.MONTH) && !key.includes(TimeDim.WEEK));
            let monthValues = Object.values(_.pick(node.data.condition_data[conditionKey], monthKeys));
            const oldTotalVal = node.data.condition_data[conditionKey].total;
            node.data.condition_data[conditionKey].total = monthKeys.length > 1 && !monthValues.every(value => value === newValue) ? '*' : monthValues[0];
            const newTotalVal = node.data.condition_data[conditionKey].total;
            this.trackChange(node, 'total', newTotalVal, oldTotalVal, jsonKeyFigure);
        }
    };

    OIVRTimeDimensionSwitch = (timeDimension, node, monthColumn, parentColumn, newValue, conditionKey = null, weekKey = null, oldValue = null) => {
        const timeDim = {
            WEEK: 'w',
            MONTH: 'm',
            TOTAL: 'total'
        };

        switch (timeDimension) {
            case timeDim.WEEK:
                node.data.condition_data[conditionKey][weekKey] = newValue;
                break;
            case timeDim.MONTH:
                this.OIVRDisaggregateMonth(node, monthColumn, newValue);
                break;
            case timeDim.TOTAL:
                this.OIVRDisaggregateTotal(node, parentColumn, newValue, oldValue);
                break;
            default:
                throw 'Error disaggregating'
        }
    };

    onSearch = (event) => {
        if (event.type === 'click' || event.keyCode === 13) {
            this.api.setQuickFilter(document.getElementById('bvp_search_input').value);
        }
    };

    isFXAmount = (spend) => {
        return spend.includes('FX');
    };

    checkGrossSalesExist = () => { //TODO: expand once we have Gross Sales values
        return true;
    };

    filterValueGetter = (params) => {
        const data = [];
        const mat = params.data.productnode.material_number;
        data.push(params.data.productnode.ppg);
        data.push(mat.substring(12, 18));
        return data;
    };

    OIVRDisaggregateMonth = (node, monthColumn, newValue) => {
        const allChildCols = monthColumn.children.map(c => c.hasOwnProperty('children') ? c.getLeafColumns()[0] : c); // get all immediate child columns of group column (e.g quarter total, month1, month2, month3)
        const childCols = allChildCols.slice(1); // child columns only without parent total column
        const jsonKeyFigure = monthColumn.parent.groupId;
        const jsonData = node.data[jsonKeyFigure.split('.')[0]]; // row data under specified kpi
        const conditionKey = jsonKeyFigure.split('.')[1];
        const monthKey = monthColumn.groupId.split('_')[0];
        jsonData[conditionKey][monthKey] = newValue;

        for (let i = 0; i < childCols.length; i++) {
            const childKey = childCols[i].getColDef().jsonProps.key; // jsonfield key (ex m1w1)
            const oldVal = jsonData[conditionKey][childKey];

            const weekValue = newValue;
            jsonData[conditionKey][childKey] = weekValue;

            this.trackChange(node, childKey, weekValue, oldVal, jsonKeyFigure);
        }
    };

    OIVRDisaggregateTotal = (node, parentColumn, newValue, oldValue) => {
        const allChildCols = parentColumn.children.map(c => c.hasOwnProperty('children') ? c.getLeafColumns()[0] : c); // get all immediate child columns of group column (e.g quarter total, month1, month2, month3)
        const jsonKeyFigure = parentColumn.groupId;
        const jsonData = node.data[jsonKeyFigure.split('.')[0]]; // row data
        const conditionKey = jsonKeyFigure.split('.')[1];

        for (let i = 0; i < allChildCols.length; i++) {
            const childKey = allChildCols[i].getColDef().jsonProps.key;
            const monthVal = newValue;
            jsonData[conditionKey][childKey] = monthVal;

            this.trackChange(node, childKey, newValue, oldValue, jsonKeyFigure);
            this.OIVRDisaggregateMonth(node, allChildCols[i].parent, monthVal);
        }

    };

    trackChange = (node, jsonKey, newVal, oldVal, jsonKeyFigure) => {
        if (node.isRowPinned()) return;
        let changeObj;
        const keyFigure = jsonKeyFigure.split('.')[1] !== undefined ? jsonKeyFigure.split('.')[0] : jsonKeyFigure;

        if (oldVal !== newVal) {
            if (!this.state.changePending) {
                this.setState({changePending: true});
            }
            if (keyFigure !== this.key.condition_data) {
                if (this.changedEntries.hasOwnProperty(node.data.id)) {
                    if (this.changedEntries[node.data.id][keyFigure]) {
                        changeObj = this.changedEntries[node.data.id][keyFigure];
                    } else {
                        changeObj = {};
                        this.changedEntries[node.data.id][keyFigure] = changeObj;
                    }

                } else {
                    changeObj = {};
                    this.changedEntries[node.data.id] = {};
                    this.changedEntries[node.data.id][keyFigure] = changeObj;
                }
            } else {
                let conditionKey = jsonKeyFigure.split('.')[1];
                if (this.changedEntries.hasOwnProperty(node.data.id)) {
                    if (this.changedEntries[node.data.id][keyFigure]) {
                        if (this.changedEntries[node.data.id][keyFigure][conditionKey]) {
                            changeObj = this.changedEntries[node.data.id][keyFigure][conditionKey];
                        } else {
                            changeObj = {};
                            this.changedEntries[node.data.id][keyFigure][conditionKey] = changeObj;
                        }
                    } else {
                        changeObj = {};
                        this.changedEntries[node.data.id][keyFigure] = {};
                        this.changedEntries[node.data.id][keyFigure][conditionKey] = changeObj;
                    }

                } else {
                    changeObj = {};
                    this.changedEntries[node.data.id] = {};
                    this.changedEntries[node.data.id][keyFigure] = {};
                    this.changedEntries[node.data.id][keyFigure][conditionKey] = changeObj;
                }
            }

            changeObj[jsonKey] = newVal;
            this.props.storeChangedEntries(this.changedEntries)
        }
    };

    onDeleteProd = (prod_id) => {
        this.props.deleteEventProduct(prod_id, this.props.currentEvent.type.technical_name);
    };

    onPPChange = (ppProds) => {
        const event = {
            id: this.props.currentEvent.id,
            products: ppProds.map(product => product.id.toString()),
        };
        this.props.updateTPEvent(event);
    };

    // initialize total total row data
    getInitializedTotalRowData = (products, conditionCodes) => {
        // creates the data dict that will store all the total total row data
        let data = {}; // Note: the order of the code below matters, the condition codes must be made after the condition_data key and dict are created
        // creates dicts for all the key figures including condition_data
        data[this.key.total_volume] = {};
        data[this.key.uplift_volume] = {};
        data[this.key.baseline_volume] = {};
        data[this.key.actuals_volume] = {};
        data[this.key.gross_price] = {};
        data[this.key.condition_data] = {};
        conditionCodes.forEach(conditionCode => { // once the condition_data key has been created above, adds dicts for each condition code
            data[this.key.condition_data][`${conditionCode}`] = {}
        });

        // initializes total data dict with 0 for all the time keys
        Object.keys(data).forEach(keyFigure => {
            if (keyFigure === this.key.condition_data) {
                Object.keys(_.get(data, `${keyFigure}`, {}))
                    .forEach(conditionCode => {
                        if (products.length !== 0) {
                            Object.keys(_.get(products[0], `${this.key.condition_data}.${conditionCode}`, {}))
                                .forEach(timeKey => data[keyFigure][conditionCode][timeKey] = 0)
                        }
                    });
            } else {
                if (products.length !== 0) {
                    Object.keys(_.get(products[0], `${keyFigure}`, {}))
                        .forEach(timeKey => data[keyFigure][timeKey] = 0)
                }
            }
        });

        return data;
    };

    createData = (currentEvent) => {
        const products = currentEvent.eventproducts_set;
        const conditionCodes = Object.keys(this.conditionData);
        const data = this.getInitializedTotalRowData(products, conditionCodes);

        if (!!this.api) { // This checks if the row nodes have been generated or not
            let previousNode = {};
            this.api.forEachLeafNode((node, i) => { // uses the row nodes to calculate the total data
                this.calculateTotalRow(previousNode, node.data, data, conditionCodes);
                previousNode = node.data;
            })
        } else {
            let previousNode = {};
            for (let i = 0; i < products.length; i++) { // uses the products to calculate the total data
                this.calculateTotalRow(previousNode, products[i], data, conditionCodes);
                previousNode = products[i];
            }
        }

        return [data];
    };

    calculateTotalRow = (previousProduct, product, data, conditionCodes) => {
        Object.keys(_.get(product, `${this.key.total_volume}`, {}))
            .forEach(timeKey => data[this.key.total_volume][timeKey] += product[this.key.total_volume][timeKey]);

        Object.keys(_.get(product, `${this.key.baseline_volume}`, {}))
            .forEach(timeKey => data[this.key.baseline_volume][timeKey] += product[this.key.baseline_volume][timeKey]);

        Object.keys(_.get(product, `${this.key.uplift_volume}`, {}))
            .forEach(timeKey => data[this.key.uplift_volume][timeKey] += product[this.key.uplift_volume][timeKey]);

        Object.keys(_.get(product, `${this.key.actuals_volume}`, {}))
            .forEach(timeKey => data[this.key.actuals_volume][timeKey] += product[this.key.actuals_volume][timeKey]);

        Object.keys(_.get(product, `${this.key.gross_price}`, {}))
            .forEach(timeKey => {
                let equal = _.isEmpty(previousProduct) ? true : (_.isEqual(data[this.key.gross_price][timeKey], product.gross_price[timeKey]));

                if (!equal) {
                    data[this.key.gross_price][timeKey] = '*';
                } else {
                    data[this.key.gross_price][timeKey] = product[this.key.gross_price][timeKey]
                }
            });

        conditionCodes.forEach(conditionCode => {
            let conditionRebate = this.conditionMapping[conditionCode] || [];
            Object.keys(_.get(product, `${this.key.condition_data}.${conditionCode}`, {}))
                .forEach(timeKey => {
                    let equal = _.isEmpty(previousProduct) ? true : (_.isEqual(data[this.key.condition_data][`${conditionCode}`][timeKey], product.condition_data[conditionCode][timeKey]));

                    if (!conditionRebate.includes(SpendType.FX) && !equal) {
                        data[this.key.condition_data][`${conditionCode}`][timeKey] = '*';
                    } else if (conditionRebate.includes(SpendType.FX)) {
                        data[this.key.condition_data][`${conditionCode}`][timeKey] += product[this.key.condition_data][conditionCode][timeKey];
                    } else {
                        data[this.key.condition_data][`${conditionCode}`][timeKey] = product[this.key.condition_data][conditionCode][timeKey];
                    }
                });
        });
    };

    render() {
        if (this.props.eventPending) {
            return (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh'}}>
                    <CircularProgress/>
                </div>
            );
        } else {
            return (
                <Styled.AGGridContent className='ag-theme-material'>
                    <Grid container>
                        <Grid item xs={6}>
                            <Grid container justify={'flex-start'}>
                                <Input id='tp_detail_search_input' onKeyUp={this.onSearch} endAdornment={
                                    <InputAdornment position={'end'}>
                                        <IconButton onClick={this.onSearch}>
                                            <SearchIcon fontSize={'small'} style={{paddingRight: 3}}/>
                                        </IconButton>
                                    </InputAdornment>
                                }/>
                                <Grid item>
                                    <ProductPicker id='tp_detail_product_picker' onPPChange={this.onPPChange}
                                                   deleteProd={this.onDeleteProd}/>
                                </Grid>
                                <Grid item>
                                    <SpendPicker id='tp_detail_spend_picker' spends={this.getCurrentSpends()}
                                                 disableApply={this.disableSpends}
                                                 customSpendsCB={this.customSpendsApply}/>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={6}>
                            <Grid container justify={'flex-end'}>
                                <Grid item>
                                    <CustomizedTable id='tp_detail_customize_table' applyPH={this.applyPHCustomizeTable}
                                                     phTable={this.headerName !== 'PPG/SKU'}
                                                     columns={_.startsWith(this.headerName, 'PPG') ? this.getCurrentColumns() : this.productTree}
                                                     customColDefsCB={this.customColDefsApply}/>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <AgGridReact
                        reactNext={true}
                        columnDefs={this.state.columnDefs}
                        pinnedTopRowData={this.state.totalData}
                        rowData={this.props.currentEvent.eventproducts_set}
                        onGridReady={this.onGridReady}
                        isExternalFilterPresent={this.externalFilterPresent}
                        doesExternalFilterPass={this.nodeVisibleExternalFilter}
                        rowSelection={'multiple'}
                        suppressHorizontalScroll={false}
                        singleClickEdit={true}
                        enableGroupEdit={true}
                        onCellValueChanged={this.onGridCellChange}
                        onCellKeyPress={this.onCellKeyPress}
                        suppressColumnVirtualisation={true}
                        getRowHeight={function (params) {
                            return (!_.startsWith(this.autoGroupColumnDef.headerName, 'PPG') && !params.node.isRowPinned() && !params.node.aggData ? 0 : 30)
                        }}
                        components={{
                            numericCellEditor: NumericCellEditor,
                            decimalCellEditor: DecimalCellEditor,
                            textCellEditor: 'agTextCellEditor'
                        }}
                        defaultColDef={{
                            cellStyle: {lineHeight: '25px'},
                            resizable: true,
                        }}
                        defaultColGroupDef={{
                            resizable: true,
                        }}
                        autoGroupColumnDef={{
                            headerName: this.groupHeader,
                            headerComponent: 'customLinkHeaderComponent',
                            cellRenderer: 'agGroupCellRenderer',
                            valueGetter: this.prodDescGetter,
                            filterValueGetter: this.filterValueGetter,
                            headerValueGetter: this.headerValueGetter,
                            colId: 'autocolgroup',
                            cellRendererParams: {
                                padding: 15,
                                suppressCount: true
                            },
                            field: 'productnode.material_number',
                            icons: {menu: '<i class="material-icons">filter_list</i>'},
                            filter: true,
                            menuTabs: ['filterMenuTab'],
                        }}
                        suppressAggFuncInHeader={true}
                        aggregateOnlyChangedColumns={true}
                        frameworkComponents={this.frameworkComponents}
                    />
                    <CustomizedSnackbar ref={el => this.snackbar = el}/>
                </Styled.AGGridContent>
            )
        }
    }
}

const mapStateToProps = (state) => {
    return {
        changedEntries: state.Event.changedEntries,
        currentEvent: state.Event.currentEvent,
        eventPending: state.Event.getEventPending,
        planningConfig: state.PlannableCustomers.planningConfig,
        customerStartDay: state.PlannableCustomers.customerStartDay,
        tpConditions: state.Event.tpConditions,
        bspConditions: state.Event.bspConditions,
        pendingChange: state.Event.pendingChange
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateChangePending: (bool) => dispatch(actions.updateChangePending(bool)),
        getCurrentEvent: (event) => dispatch(actions.getCurrentEvent(event)),
        storeChangedEntries: (changedEntries) => dispatch(actions.storeGridChanges(changedEntries)),
        updateTPEvent: (event) => dispatch(actions.updateTPEvent(event)),
        deleteEventProduct: (event_prod_id, event_type) => dispatch(actions.deleteEventProduct(event_prod_id, event_type))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(EventGrid)
