import actions from './actions';
import uniqBy from 'lodash/uniqBy';

const initialState = {
    tpevents: [],
    bspevents: [],
    tactics: [],
    eventSelectionOptions: [],
    tpSelectedOptions: {
        category: [],
        subcategory: [],
        subbrand: [],
        ppg: [],
        sku: [],
    },
    bspSelectedOptions: {
        category: [],
        subcategory: [],
        subbrand: [],
        ppg: [],
        sku: [],
    },
    applyTPSelections: false,
    applyBSPSelections: false,
    getEventPending: null,
    getEventError: false,
    currentEvent: null,
    pendingChange: false,
    pendingDetailChanges: {},
    filteredProducts: [],
    patterns: [],
};


const getBSPEvents = (prevState, action) => ({
    ...prevState,
    bspevents: action.payload || initialState.bspevents,
    createBSPSuccess: false
});

const addBSPEvent = (prevState, action) => ({
    ...prevState, bspevents: [...prevState.bspevents, action.payload], currentEvent: action.payload,
    createBSPSuccess: true
});

const updateBSPEvent = (prevState, action) => {
    let newArray = [...prevState.bspevents].map(e => {
        if (e.id === action.payload.id) {
            return (e = action.payload)
        } else {
            return e
        }
    });
    return {...prevState, bspevents: newArray, currentEvent: action.payload, pendingChange: false, pendingEventChanges: {}, getEventPending: false, pendingStatusChange: false, pendingStatusChanges: []}
};

const deleteBSPEvent = (prevState, action) => {
    let newArray = [...prevState.bspevents].filter(e => {
        if (e.id !== action.payload) {
            return e;
        }
    });

    return {...prevState, bspevents: newArray}
};

const deleteBSProd = (prevState, action) => {
    let newCurrentEvent = prevState.currentEvent;
    newCurrentEvent.eventproducts_set = newCurrentEvent.eventproducts_set.filter(prod => {
        if (prod.id !== action.payload) {
            return prod
        }
    });
    return {...prevState, currentEvent: newCurrentEvent}
};

const getTPEvents = (prevState, action) => {
    return {...prevState, tpevents: action.payload || initialState.tpevents, createTPSuccess: false}
};

const addTPEvent = (prevState, action) => {

    return {...prevState, tpevents: [...prevState.tpevents, action.payload], currentEvent: action.payload,
        createTPSuccess: true}
};

const updateTPEvent = (prevState, action) => {
    let newArray = [...prevState.tpevents].map(e => {
        if(e.id === action.payload.id){
            return (e = action.payload)
        } else {
            return e
        }
    });
    // return {...prevState, tpevents: newArray, pendingChange: false, pendingEventChanges: {}, getEventPending: false, pendingStatusChange: false, pendingStatusChanges: []}

     return {...prevState, tpevents: newArray, currentEvent: action.payload, pendingChange: false, pendingEventChanges: {}, getEventPending: false, pendingStatusChange: false, pendingStatusChanges: []}
};

const deleteTPEvent = (prevState, action) => {
    let newArray = [...prevState.tpevents].filter(e => {
        if (e.id !== action.payload) {
            return e;
        }
    });

    return {...prevState, tpevents: newArray}
};
const deleteTPProd = (prevState, action) => {
    let newCurrentEvent = prevState.currentEvent;
    newCurrentEvent.eventproducts_set = newCurrentEvent.eventproducts_set.filter(prod => {
        if (prod.id !== action.payload) {
            return prod
        }
    });
    return {...prevState, currentEvent: newCurrentEvent}
};

const getPlannableProducts = (prevState, action) => {
    return {...prevState, plannableProducts: action.payload, filteredProducts: action.payload, pendingProductsGet: false}
};

const getFilteredProducts = (prevState, action) => {
    let filteredProducts = [];
    prevState.plannableProducts.forEach(product => {
        Object.keys(action.payload).forEach(key => {
            action.payload[key].forEach(id => {
                if (product[`${key}`]) {
                    if (key === 'ppg') {
                        if (id === product[`${key}`].toString()) {
                            filteredProducts.push(product)
                        }
                    }
                    else if (id === product[`${key}`].id.toString()) {
                        filteredProducts.push(product)
                    }
                }else if (id === product['material_number'].toString()){
                        filteredProducts.push(product)
                }
            })
        })
    });
    let uniqueFilteredProducts = uniqBy(filteredProducts, 'id');
    return {...prevState, filteredProducts: uniqueFilteredProducts}
};

const getProductsError = (prevState, action) => {
    return {...prevState, plannableProducts: [], pendingProductsGet: false, getProductsError: action.payload,}
};

const getTactics = (prevState, action) => {
    return {...prevState, tactics: action.payload || initialState.tactics}
};

const changeCurrentEvent = (prevState, action) => {
    let e = prevState.currentEvent;
    Object.keys(action.payload).forEach(id => {
        let currentProduct = e.eventproducts_set.find(product => product.id === parseInt(id));
        for(let k in action.payload[id]){
            currentProduct.total_volume[k] = action.payload[id][k]
        }
    });

    return {...prevState, currentEvent: e, pendingGridChanges: {}, getEventPending: false} //TODO: decide after backend
};

const setEvent = (prevState, action) => {
    return {...prevState, currentEvent: action.payload, getEventPending: false}
};

const setSelectedCustomer = (prevState, action) => {
    return {...prevState, selectedPlannableCustomer: action.payload}
};

const getTPConditions = (prevState, action) => {
    return {...prevState, tpConditions: action.payload}
};

const getBSPConditions = (prevState, action) => ({...prevState, bspConditions: action.payload});

const getTPStatuses = (prevState, action) => {
    return {...prevState, tpStatuses: action.payload}
};

const getBSPStatuses = (prevState, action) => {
    return {...prevState, bspStatuses: action.payload};
};

const createTPFailed = (prevState, action) => {
    return {...prevState, createTPSuccess: false}
};

const createBSPFailed = (prevState) => ({...prevState, createBSPSuccess: false});

const getEventSelectionOptions = (prevState, action) => {
    return {...prevState, eventSelectionOptions: action.payload || initialState.eventSelectionOptions}
};

const getEventPending = (prevState) => {
    return {...prevState, getEventPending: true}
};

const getEventError = (prevState, action) => {
    return {...prevState, getEventError: action.payload, getEventPending: false}
};

const setTPSelectedOptions = (prevState, action) => {
    const filtered = Object.values(prevState.bspSelectedOptions).every(value => value.length === 0);
    return {...prevState, tpSelectedOptions: action.payload, applyTPSelections: true, applyBSPSelections: !filtered}
};

const setBSPSelectedOptions = (prevState, action) => {
    const filtered = Object.values(prevState.tpSelectedOptions).every(value => value.length === 0);
    return {...prevState, bspSelectedOptions: action.payload, applyBSPSelections: true, applyTPSelections: !filtered}
};

const storeChangedEntries = (prevState, action) => {
    return {...prevState, changedEntries: action.payload, pendingChange: true}
};

const pendingEventChanges = (prevState, action) => {
    let mostUpdated = {};
    Object.assign(mostUpdated, prevState.pendingEventChanges);
    Object.assign(mostUpdated, action.payload);
    return {...prevState, pendingEventChanges: mostUpdated, pendingChange: true}
};

const pendingStatusChanges = (prevState, action) => {
    let mostUpdated = [];
    if(prevState.pendingStatusChanges){
        mostUpdated = prevState.pendingStatusChanges.concat(action.payload);
    } else{
        mostUpdated.push(action.payload);
    }
    return {...prevState, pendingStatusChanges: mostUpdated, pendingStatusChange: true}
};

const copyTPEvents = (prevState, action) => {
    return {...prevState, tpevents: [...prevState.tpevents.concat(action.payload)],
        getEventPending: false, createTPSuccess: true}
};

const copyBSPEvents = (prevState, action) => ({
    ...prevState, bspevents: [...prevState.bspevents.concat(action.payload)],
    getEventPending: false, createBSPSuccess: true
});

const copySingleEvent = (prevState, action) => {
    return {...prevState, tpevents: [...prevState.bspevents.concat(action.payload)], currentEvent: action.payload,
        createTPSuccess: true}
};

const getPatterns = (prevState, action) => {
    return {...prevState,pending: false,patterns: action.payload}
}

const addPatterns = (prevState, action) => {
    return {...prevState,patterns: action.payload}
}

const updatePatterns = (prevState, action) => {
    return {...prevState,patterns: action.payload}
}

const reducer = (prevState = initialState, action) => {
    switch (action.type) {
        case actions.GET_BSP_EVENTS:
            return getBSPEvents(prevState, action);
        case actions.ADD_BSP_EVENT:
            return addBSPEvent(prevState, action);
        case actions.UPDATE_BSP_EVENT:
            return updateBSPEvent(prevState, action);
        case actions.DELETE_BSP_EVENT:
            return deleteBSPEvent(prevState, action);
        case actions.DELETE_BSP_PROD:
            return deleteBSProd(prevState, action);
        case actions.GET_TP_EVENTS:
            return getTPEvents(prevState, action);
        case actions.ADD_TP_EVENT:
            return addTPEvent(prevState, action);
        case actions.UPDATE_TP_EVENT:
            return updateTPEvent(prevState, action);
        case actions.DELETE_TP_EVENT:
            return deleteTPEvent(prevState, action);
        case actions.DELETE_TP_PROD:
            return deleteTPProd(prevState, action);
        case actions.GET_PLANNABLE_PRODUCTS_ERROR:
            return getProductsError(prevState, action);
        case actions.GET_PLANNABLE_PRODUCTS:
            return getPlannableProducts(prevState, action);
        case actions.GET_PLANNABLE_PRODUCTS_PENDING:
            return {...prevState, pendingProductsGet: true};
        case actions.GET_FILTERED_PRODUCTS:
            return getFilteredProducts(prevState, action);
        case actions.GET_TACTICS:
            return getTactics(prevState, action);
        case actions.CHANGE_CURRENT_EVENT:
            return changeCurrentEvent(prevState, action);
        case actions.SET_CURRENT_EVENT:
            return setEvent(prevState, action);
        case actions.SET_SELECTED_CUSTOMER:
            return setSelectedCustomer(prevState, action);
        case actions.GET_TP_CONDITIONS:
            return getTPConditions(prevState, action);
        case actions.GET_BSP_CONDITIONS:
            return getBSPConditions(prevState, action);
        case actions.GET_TP_STATUSES:
            return getTPStatuses(prevState, action);
        case actions.GET_BSP_STATUSES:
            return getBSPStatuses(prevState, action);
        case actions.CREATE_TP_FAILED:
            return createTPFailed(prevState, action);
        case actions.RESET_CREATE_TP_SUCCESS:
            return {...prevState, createTPSuccess: false};
        case actions.CREATE_BSP_FAILED:
            return createBSPFailed(prevState, action);
        case actions.RESET_CREATE_BSP_SUCCESS:
            return {...prevState, createBSPSuccess: false};
        case actions.GET_EVENT_SELECTION_OPTIONS:
            return getEventSelectionOptions(prevState, action);
        case actions.GET_EVENT_PENDING:
            return getEventPending(prevState);
        case actions.GET_EVENT_ERROR:
            return getEventError(prevState, action);
        case actions.SET_TP_SELECTED_OPTIONS:
            return setTPSelectedOptions(prevState, action);
        case actions.SET_BSP_SELECTED_OPTIONS:
            return setBSPSelectedOptions(prevState, action);
        case actions.STORE_GRID_CHANGES:
            return storeChangedEntries(prevState, action);
        case actions.UPDATE_EVENT_CHANGES:
            return pendingEventChanges(prevState, action);
        case actions.UPDATE_STATUS_CHANGES:
            return pendingStatusChanges(prevState, action);
        case actions.SAVE_EVENT_GRID_CHANGES_SUCCESS:
            return {...prevState, pendingChange: false, changedEntries: {}};
        case actions.COPIED_TP_EVENTS:
            return copyTPEvents(prevState, action);
        case actions.COPIED_BSP_EVENTS:
            return copyBSPEvents(prevState, action);
        case actions.COPY_SINGLE_EVENT:
            return copySingleEvent(prevState, action);
        case actions.GET_BUYING_PATTERNS:
            return getPatterns(prevState, action);
        case actions.ADD_BUYING_PATTERNS:
            return addPatterns(prevState, action);
        case actions.UPDATE_BUYING_PATTERNS:
            return updatePatterns(prevState, action);
        case actions.UPDATE_CHANGE_PENDING:
            return {...prevState, pendingChange: action.payload};
        default:
            return prevState;
    }
};

export default reducer;