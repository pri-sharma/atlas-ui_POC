import sortBy from 'lodash/sortBy';
import currency from 'currency.js';

const NotConditionKeys = {
    total_volume: 'total_volume',
    uplift_volume: 'uplift_volume',
    baseline_volume: 'baseline_volume',
    gross_price: 'gross_price',
    actuals_volume: 'actuals_volume'
};

// TODO: has duplicate in EventGrid
const SpendType = {
    FX: 'FX',
    OI: 'OI',
    VR: 'VR'
};

// TODO: has duplicate in EventGrid
const CellEditor = {
    decimalCellEditor: 'decimalCellEditor',
    numericCellEditor: 'numericCellEditor',
    textCellEditor: 'agTextCellEditor'
};

// TODO: has duplicate in EventGrid
const VarType = {
    int: 'int',
    float: 'float',
    char: 'char'
};

const sum = (values) => {
    let sum = 0;

    values.forEach(x => {
        sum = currency(sum).add(x);
    });
    return sum.value;
};

const avg = (values) => {
    let sum = 0;
    values.forEach(x => {
        if (typeof x === 'string') {
            x = parseFloat(x)
        }
        sum = currency(sum).add(x);

    });
    if (values.length === 0) {
        return 0;
    }
    if (values.every(value => value === 'N/A')) {
        return 'N/A'
    }
    if (values.every(value => value === '*')) {
        return '*'
    }

    return values.every(value => value === values[0]) ? currency(sum).divide(values.length).value : '*';
};

export function getDisplayOrderColumns(planningConfig, eventConditions) {

    let displayOrderDict = Object.keys(planningConfig).map(key => {
        const record = planningConfig[key];
        record.col_id = key;
        return record;
    });
    displayOrderDict = sortBy(displayOrderDict, ['display_order', 'display_name']);

    let columnGroups = [];
    for (let i = 0; i < displayOrderDict.length; i++) {
        const keyFigures = displayOrderDict[i];
        const kfg = keyFigures.col_id;
        if (kfg in NotConditionKeys) {
            const columnCode = NotConditionKeys[kfg];
            const columnDisplayName = keyFigures.display_name;
            columnGroups.push({id: columnCode, display_name: columnDisplayName, type: columnCode});
        } else { //todo need to check for types other than spends and volumes such as gross price, will be coming soon
            let groupedSpends = groupSpendsByType(eventConditions);
            if (kfg in groupedSpends) {
                const spendArray = groupedSpends[kfg];
                columnGroups.push(...spendArray);
            }
        }
    }
    return columnGroups;
}

function groupSpendsByType(eventConditions) {
    const conditionTypeGroups = {};
    eventConditions.forEach(condition => {
        const columnCode = `condition_data.${condition.condition.code}`;
        const columnDisplayName = `${condition.condition.code}: ${condition.condition.description} - ${condition.condition.rebate_pricing}`;
        const conditionType = condition.condition.rebate_pricing;
        if (!(conditionType in conditionTypeGroups)) {
            conditionTypeGroups[conditionType] = [];
        }
        conditionTypeGroups[conditionType].push({id: columnCode, display_name: columnDisplayName, type: conditionType});

    });
    return conditionTypeGroups;
};

export function getConditionCodeToRebate(eventConditions) {
    let conditionMap = {};
    if (eventConditions) {
        eventConditions.forEach(condition => {
            conditionMap[condition.condition.code] = condition.condition.rebate_pricing;
        });
    }
    return conditionMap;
};

export function getCellEditor(value) {
    if (value.includes(NotConditionKeys.gross_price)) {
        return CellEditor.textCellEditor
    }
    if (value.includes(SpendType.FX) || value.includes(SpendType.VR) || value.includes(SpendType.OI)) {
        return CellEditor.decimalCellEditor;
    }
    return CellEditor.numericCellEditor;
};

export function getAggFunc(configData) {
    const verticalAggRule = configData['vertical_agg'];
    const varType = configData['kf_var_type'];

    if (varType === VarType.int) {
        if (verticalAggRule === 'sum') {
            return 'sum';
        }
        if (verticalAggRule === 'avg') {
            return 'avg';
        }
    }

    if (varType === VarType.float || varType === VarType.char) {
        if (verticalAggRule === 'sum') {
            return sum;
        }
        if (verticalAggRule === 'avg') {
            return avg;
        }
    }

    return 'sum';
};

export function getFixedColumns(pricingLevelCellRenderer) {
    return {
        'PPG/SKU': [
            {
                headerCheckboxSelection: true,
                checkboxSelection: true,
                suppressMenu: true,
                width: 68,
                pinned: 'left'
            },
            {
                headerName: 'PPG',
                field: 'productnode.ppg',
                valueFormatter: function (params) {
                    let ppg = params.value || '';
                    let desc = params.node.allLeafChildren[0].data.productnode.ppg_desc;
                    desc = (desc) ? desc : ''; // make empty string if null
                    return `${ppg} - ${desc}`;
                },
                hide: true,
                enableValue: true,
                enableRowGroup: true,
                rowGroup: true

            },
            {
                headerName: 'Pricing Level',
                editable: false,
                field: 'pricing_level',
                cellRendererFramework: pricingLevelCellRenderer,
                filter: true,
                menuTabs: ['filterMenuTab'],
                // rowSpan: function(params){  TODO figure out how to style and use this correctly
                //     let len =  params.node.rowGroupIndex === 0 ? 2 : 1;
                //     return len
                // },
                icons: {menu: '<i class="material-icons">filter_list</i>'},
            },
        ], '1PH': [

            {
                headerName: 'CATEGORY',
                field: 'productnode.category.description',
                colId: 'Category',
                editable: true,
                filter: true,
                enableRowGroup: true,
                rowGroup: true,
                rowGroupIndex: 0,
                menuTabs: ['filterMenuTab'],
                hide: true,
            },
            {
                headerName: 'SUBCATEGORY',
                field: 'productnode.subcategory.description',
                colId: 'Subcategory',
                filter: true,
                enableRowGroup: true,
                rowGroup: true,
                rowGroupIndex: 1,
                menuTabs: ['filterMenuTab'],
                hide: true,
            },
            {
                headerName: 'SUBBRAND',
                field: 'productnode.subbrand.description',
                colId: 'Subbrand',
                filter: true,
                enableRowGroup: true,
                rowGroup: true,
                rowGroupIndex: 2,
                menuTabs: ['filterMenuTab'],
                hide: true,
            },
            {
                headerName: 'VARIANT',
                field: 'productnode.variant.description',
                colId: 'Variant',
                filter: true,
                enableRowGroup: true,
                rowGroup: true,
                rowGroupIndex: 3,
                menuTabs: ['filterMenuTab'],
                hide: true,
            },
            {
                headerName: 'PRICING LEVEL',
                editable: false,
                field: 'pricing_level',
                cellRendererFramework: pricingLevelCellRenderer,
                filter: true,
                // rowSpan: function(params){
                //     if(!params.node.isRowPinned() && !params.node.aggData){
                //         return 5
                //     }
                //     return 1
                // },
                menuTabs: ['filterMenuTab'],
                icons: {menu: '<i class="material-icons">filter_list</i>'},
            },
        ]
    }
};

// set custom edit wrapper call
const setEditableWrapper = (kfEditable, dateEditable, configKey) => (params) => {
    let customEdit = true;
    // if pricing level selected is PPG, data cannot be edit from SKU
    if(!params.node.group && params.node.parent && params.node.parent.pricing_level === 'PPG' && (configKey === 'OI' || configKey === 'VR')) {
        customEdit = false;
    }
    return kfEditable && dateEditable && customEdit;
};

// check the columns whether editable based on Key Figures
function getEditable(value, kfPlanningConfig) {
    //TODO need to remove this baseline volume check later so that it's dependent completely on the planning config
    return kfPlanningConfig['is_editable'] && value !== NotConditionKeys.baseline_volume;
};

export function getExpandableColumnGroup(planningConfig, cusCols, props) {
    let currentKey = cusCols.display_name; // Displayed name 'Z123 Spend - FX'
    let currentValue = cusCols.id; // Code i.e. 'condition_data.Z123'
    const configKey = cusCols.type;
    const configData = planningConfig[configKey];

    let editable = getEditable(configKey, configData);
    let cellEditor = getCellEditor(configKey);
    let aggFunc = getAggFunc(configData);

    // map the Column
    const group = {
        headerName: `${currentKey}`,
        columnGroupShow: 'open',
        marryChildren: true,
        groupId: `${currentValue}`,
        children: [{
            headerName: `${currentKey}`,
            field: `${currentValue}.total`,
            cellEditor: cellEditor,
            editable: setEditableWrapper(props.editableByDate, editable, configKey),  //TODO: account for year differences,
            enableValue: true,
            aggFunc: aggFunc,
            headerComponent: 'customExpandComponent',
            jsonProps: {
                key: 'total',
                description: `${currentKey}`
            }
        }]
    };

    // map the month per column
    for (let j = 0; j < props.monthKeys.length; j++) {    //month columns
        let monthName = props.months[parseInt(props.monthKeys[j].substring(6)) - 1];

        const month = {
            headerName: `${currentKey}`,
            marryChildren: true,
            groupId: props.monthKeys[j],
            columnGroupShow: 'open',
            children: [{
                headerName: `${monthName} Total`,
                field: `${currentValue}.${props.monthKeys[j]}`,
                editable: setEditableWrapper(props.editableByDate, editable, configKey),
                cellEditor: cellEditor,
                aggFunc: aggFunc,
                enableValue: true,
                headerComponent: 'customExpandComponent',
                jsonProps: {
                    key: props.monthKeys[j],
                    year: parseInt(props.monthKeys[j].substring(1, 5)),
                    month: parseInt(props.monthKeys[j].substring(6)),
                    description: `${currentKey}`
                }
            }]
        };
        group.children.push(month);

        // map the week per month
        let monthWeeks = props.weekKeys.filter(key => key.substring(0, 8) === props.monthKeys[j]);
        for (let k = 0; k < monthWeeks.length; k++) {    //week columns
            let weekName = monthWeeks[k].substring(8);
            const week = {
                headerName: weekName,
                field: `${currentValue}.${monthWeeks[k]}`,
                columnGroupShow: 'open',
                cellEditor: cellEditor,
                aggFunc: aggFunc,
                enableValue: true,
                editable: setEditableWrapper(props.editableByDate, editable, configKey),
                jsonProps: {
                    key: monthWeeks[k],
                    year: parseInt(props.monthKeys[j].substring(1, 5)),
                    month: parseInt(props.monthKeys[j].substring(6)),
                    week: parseInt(monthWeeks[k].substring(9)),
                    description: `${currentKey}`
                }
            };
            month.children.push(week);
        }
    }
    return group;
};