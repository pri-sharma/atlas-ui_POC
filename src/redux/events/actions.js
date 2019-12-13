import _, { isEmpty, isPlainObject } from 'lodash';
import moment from "../plannableCustomers/actions";
import { push } from 'react-router-redux'

const url = process.env.REACT_APP_API_URL;
const authHeaders = () => ({
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('idToken')
    }
});

const actions = {
    GET_BSP_EVENTS: 'GET_BSP_EVENTS',
    ADD_BSP_EVENT: 'ADD_BSP_EVENT',
    UPDATE_BSP_EVENT: 'UPDATE_BSP_EVENT',
    DELETE_BSP_EVENT: 'DELETE_BSP_EVENT',
    DELETE_BSP_PROD: 'DELETE_BSP_PROD',
    GET_TP_EVENTS: 'GET_TP_EVENTS',
    ADD_TP_EVENT: 'ADD_TP_EVENT',
    UPDATE_TP_EVENT: 'UPDATE_TP_EVENT',
    DELETE_TP_EVENT: 'DELETE_TP_EVENT',
    DELETE_TP_PROD: 'DELETE_TP_PROD',
    GET_PLANNABLE_PRODUCTS_ERROR: 'GET_PLANNABLE_PRODUCTS_ERROR',
    GET_PLANNABLE_PRODUCTS: 'GET_PLANNABLE_PRODUCTS',
    GET_PLANNABLE_PRODUCTS_PENDING: 'GET_PLANNABLE_PRODUCTS_PENDING',
    GET_FILTERED_PRODUCTS: 'GET_FILTERED_PRODUCTS',
    GET_TACTICS: 'GET_TACTICS',
    CHANGE_CURRENT_EVENT: 'CHANGE_CURRENT_EVENT',
    SET_CURRENT_EVENT: 'SET_CURRENT_EVENT',
    SET_SELECTED_CUSTOMER: 'SET_SELECTED_CUSTOMER',
    GET_TP_CONDITIONS: 'GET_TP_CONDITIONS',
    GET_BSP_CONDITIONS: 'GET_BSP_CONDITIONS',
    GET_TP_STATUSES: 'GET_TP_STATUSES',
    GET_BSP_STATUSES: 'GET_BSP_STATUSES',
    CREATE_TP_FAILED: 'CREATE_TP_FAILED',
    CREATE_BSP_FAILED: 'CREATE_BSP_FAILED',
    RESET_CREATE_TP_SUCCESS: 'RESET_CREATE_TP_SUCCESS',
    RESET_CREATE_BSP_SUCCESS: 'RESET_CREATE_BSP_SUCCESS',
    GET_EVENT_SELECTION_OPTIONS: 'GET_EVENT_SELECTION_OPTIONS',
    GET_EVENT_PENDING: 'GET_EVENT_PENDING',
    GET_EVENT_ERROR: 'GET_EVENT_ERROR',
    SET_TP_SELECTED_OPTIONS: 'SET_TP_SELECTED_OPTIONS',
    SET_BSP_SELECTED_OPTIONS: 'SET_BSP_SELECTED_OPTIONS',
    STORE_GRID_CHANGES: 'STORE_GRID_CHANGES',
    UPDATE_EVENT_CHANGES: 'UPDATE_EVENT_CHANGES',
    UPDATE_STATUS_CHANGES: 'UPDATE_STATUS_CHANGES',
    SAVE_EVENT_GRID_CHANGES_SUCCESS: 'SAVE_EVENT_GRID_CHANGES_SUCCESS',
    GET_EVENTS_SELECTED_COPY: 'GET_EVENTS_SELECTED_COPY',
    COPIED_TP_EVENTS: 'COPIED_TP_EVENTS',
    COPIED_BSP_EVENTS: 'COPIED_BSP_EVENTS',
    COPY_SINGLE_EVENT: 'COPY_SINGLE_EVENT',
    GET_BUYING_PATTERNS: 'GET_BUYING_PATTERNS',
    ADD_BUYING_PATTERNS: 'ADD_BUYING_PATTERNS',
    UPDATE_BUYING_PATTERNS: 'UPDATE_BUYING_PATTERNS',
    UPDATE_CHANGE_PENDING: 'UPDATE_CHANGE_PENDING',

    createTPEventFailure: (message) => ({
        type: actions.CREATE_TP_FAILED,
        payload: message
    }),
    resetTPEventSuccess: () => {
        return {
            type: actions.RESET_CREATE_TP_SUCCESS,
        }
    },
    createBSPEventFailure: (message) => ({
        type: actions.CREATE_BSP_FAILED,
        payload: message
    }),
    resetBSPEventSuccess: () => ({
        type: actions.RESET_CREATE_BSP_SUCCESS
    }),
    getBSEvents: (events) => ({
        type: actions.GET_BSP_EVENTS,
        payload: events
    }),
    addBSEvent: (event) => ({
        type: actions.ADD_BSP_EVENT,
        payload: event
    }),
    updateBSEvent: (event) => ({
        type: actions.UPDATE_BSP_EVENT,
        payload: event
    }),
    deleteBSEvent: (event_id) => ({
        type: actions.DELETE_BSP_EVENT,
        payload: event_id
    }),
    deleteBSProd: (products) => ({
        type: actions.DELETE_BSP_PROD,
        payload: products
    }),
    getTPEvents: (events) => {
        return {
            type: actions.GET_TP_EVENTS,
            payload: events
        }
    },
    addTPEvent: (event) => {
        return {
            type: actions.ADD_TP_EVENT,
            payload: event
        }
    },
    patchTPEvent: (event) => {
        return {
            type: actions.UPDATE_TP_EVENT,
            payload: event
        }
    },
    deleteTPEvent: (event_id) => {
        return {
            type: actions.DELETE_TP_EVENT,
            payload: event_id
        }
    },
    deleteTPProd: (products) => {
        return {
            type: actions.DELETE_TP_PROD,
            payload: products
        }
    },
    getProductsSuccess: (products) => {
        return {
            type: actions.GET_PLANNABLE_PRODUCTS,
            payload: products
        }
    },
    getProductsError: (error) => {
        return {
            type: actions.GET_PLANNABLE_PRODUCTS_ERROR,
            payload: error
        }
    },
    getProductsPending: () => {
        return {
            type: actions.GET_PLANNABLE_PRODUCTS_PENDING,
        }
    },
    getFilteredProducts: (selected_products) => {
        return {
            type: actions.GET_FILTERED_PRODUCTS,
            payload: selected_products
        }
    },
    getEventTactics: (tactics) => {
        return {
            type: actions.GET_TACTICS,
            payload: tactics
        }
    },
    getTPConditions: (conditions) => {
        return {
            type: actions.GET_TP_CONDITIONS,
            payload: conditions
        }
    },
    getBSPConditions: conditions => ({
        type: actions.GET_BSP_CONDITIONS,
        payload: conditions
    }),
    getTPStatuses: (statuses) => {
        return {
            type: actions.GET_TP_STATUSES,
            payload: statuses
        }
    },
    getBSPStatuses: statuses => ({
        type: actions.GET_BSP_STATUSES,
        payload: statuses
    }),
    getEventSelectionOptions: (options) => {
        return {
            type: actions.GET_EVENT_SELECTION_OPTIONS,
            payload: options,
        }
    },
    getEventPending: () => {
        return {
            type: actions.GET_EVENT_PENDING,
        }
    },
    getEventError: (err) => {
        return {
            type: actions.GET_EVENT_ERROR,
            payload: err
        }
    },
    setTPSelectedOptions: filters => {
        return {
            type: actions.SET_TP_SELECTED_OPTIONS,
            payload: filters
        }
    },
    setBSPSelectedOptions: filters => ({
            type: actions.SET_BSP_SELECTED_OPTIONS,
            payload: filters
        }),
    setCurrentEvent: (event) => {
        return {
            type: actions.SET_CURRENT_EVENT,
            payload: event
        }
    },
    storeGridChanges: (changedEntries) => {
        return {
            type: actions.STORE_GRID_CHANGES,
            payload: changedEntries
        }
    },
    updateEventChanges: (changes) => {
        return {
            type: actions.UPDATE_EVENT_CHANGES,
            payload: changes
        }
    },
    updateStatusChanges: (changes) => {
        return {
            type: actions.UPDATE_STATUS_CHANGES,
            payload: changes
        }
    },

    saveEventGridChangesSuccess: () => ({
        type: actions.SAVE_EVENT_GRID_CHANGES_SUCCESS,
    }),

    copyTPEvents: (events) => {
        return {
            type: actions.COPIED_TP_EVENTS,
            payload: events
        }
    },
    copyBSPEvents: (events) => ({
        type: actions.COPIED_BSP_EVENTS,
        payload: events
    }),
    copySingleEvent: (event) => {
        return {
            type: 'COPY_SINGLE_EVENT',
            payload: event
        }
    },
    getBuyingPatterns: (patterns) => {
        return {
            type: actions.GET_BUYING_PATTERNS,
            payload: patterns
        }
    },
    addBuyingPatterns: (patterns) => {
        return {
            type: actions.ADD_BUYING_PATTERNS,
            payload: patterns
        }
    },
    updateBuyingPatterns: (patterns) => {
        return {
            type: actions.UPDATE_BUYING_PATTERNS,
            payload: patterns
        }
    },
    updateChangePending: (bool) => {
        return {
            type: actions.UPDATE_CHANGE_PENDING,
            payload: bool
        }
    }
};

export const getEvents = (event_type, customer_id, filters = {}) => {
    let queryString = '';
    Object.keys(filters).forEach(key => {
        filters[key].forEach(value => {
            queryString += `&${key}=${value}`
        })
    });

    return dispatch => {
        event_type === 'TP' ? dispatch(actions.setTPSelectedOptions(filters)) : dispatch(actions.setBSPSelectedOptions(filters));
        return fetch(`${url}/api/v1/event/shallowevents/?type=${event_type}&customer=${customer_id}&limit=1000${queryString}`, authHeaders()) //TODO: whats the filter?
            .then(r => r.json())
            .then(events => {
                if (event_type === 'BSP') {
                    return dispatch(actions.getBSEvents(events.results))
                } else {
                    return dispatch(actions.getTPEvents(events.results))
                }
            })
            .catch(err => console.log(err))
    }
};

export const getEventSelectionOptionsAction = (event_type, customer_id) => {
    return dispatch => {
        if (customer_id) {
            return fetch(`${url}/api/v1/event/geteventselectionoptions/?customer_id=${customer_id}&event_type=${event_type}`, authHeaders())
                .then(r => r.json())
                .then(options => dispatch(actions.getEventSelectionOptions(options)))
                .catch(err => console.log(err))
        }
    }
};

export const getBvpOptions = (customerId, startDate, endDate) => {
    return (dispatch) => {
        if (startDate && endDate) {
            return fetch(`${url}/api/v1/bvp/getbvpselectionoptions/?customer_id=${customerId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, authHeaders())
                .then(r => r.json())
                .then(options => dispatch(actions.getEventSelectionOptions(options)))
                .catch(err => console.log(err))
        }
    }
};

export const createBSPEvent = (event) => {
    let pricing_start = event.pricing_start.toISOString().split('T')[0];
    let pricing_end = event.pricing_end.toISOString().split('T')[0];
    let calyear = pricing_start.split('-')[0];

    return (dispatch, getState) => {
        let customer = getState().PlannableCustomers.selectedCustomer;
        fetch(`${url}/api/v1/event/events/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: JSON.stringify({
                customer: customer,
                pricing_start: pricing_start,
                pricing_end: pricing_end,
                type: 'BSP',
                description: event.description,
                calyear: calyear
            })
        })
            .then(r => r.json().then(event => {
                    if (r.status < 200 || r.status >= 300) {
                        dispatch(actions.createTPEventFailure(event))
                        throw(event);
                    } else {
                        const initialPath = window.location.pathname;
                        dispatch(actions.addBSEvent(event));
                        dispatch(push(`${initialPath}/details/${event.id}`));
                    }
                }
            ))
            .catch(err => console.log(err))
    }
};

export const deleteEvent = (event_id, event_type) => {
    return dispatch => {
        return fetch(`${url}/api/v1/event/events/${event_id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            }
        })
            .then(() => {
                if (event_type === 'BSP') {
                    return dispatch(actions.deleteBSEvent(event_id))
                } else {
                    return dispatch(actions.deleteTPEvent(event_id))
                }
            })
    }
};

export const createTPEvent = (event) => {
    let dates = {};
    ['sellout_start', 'sellout_end', 'pricing_start', 'pricing_end', 'ship_start', 'ship_end'].forEach(date => {
        dates[date] = event[date].toISOString().split('T')[0]
    });
    let calyear = dates['pricing_start'].split('-')[0];
    let tactics = event.tactics.toString();

    return (dispatch, getState) => {
        let customer = getState().PlannableCustomers.selectedCustomer;
        return fetch(`${url}/api/v1/event/events/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: JSON.stringify({
                customer: customer,
                calyear: calyear,
                pricing_start: dates['pricing_start'],
                pricing_end: dates['pricing_end'],
                sellout_start: dates['sellout_start'],
                sellout_end: dates['sellout_end'],
                ship_start: dates['ship_start'],
                ship_end: dates['ship_end'],
                type: 'TP',
                status: event.status,
                description: event.description,
                tactics: tactics,
            })
        })
            .then(r => r.json().then(event => {
                    if (r.status < 200 || r.status >= 300) {
                        dispatch(actions.createTPEventFailure(event));
                        throw(event);
                    } else {
                        const initialPath = window.location.pathname;
                        dispatch(actions.addTPEvent(event));
                        dispatch(push(`${initialPath}/details/${event.id}`));
                    }
                }
            ))
            .catch(err => console.log(err))
    }
};

export const deleteEventProduct = (event_prod_id, event_type) => { //TODO remove this and merge it with what happens with Ly's code
    return dispatch => {
        return fetch(`${url}/api/v1/event/eventproducts/${event_prod_id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            }
        })
            .then(() => {
                if (event_type === 'BSP') {
                    return dispatch(actions.deleteBSProd(event_prod_id))
                } else {
                    return dispatch(actions.deleteTPProd(event_prod_id))
                }
            })
            .catch(err => console.log(err))
    }
};

export const storeGridChanges = (changedEntries) => {
    return dispatch => dispatch(actions.storeGridChanges(changedEntries))
};

export const updateEventChanges = (changes) => {
    return dispatch => dispatch(actions.updateEventChanges(changes))
};

export const updateStatusChanges = (changes) => {
    return dispatch => dispatch(actions.updateStatusChanges(changes))
};

export const updateTPEvent = (event) => {
    return dispatch => {
        return new Promise((resolve, reject) => {
            fetch(`${url}/api/v1/event/events/${event.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('idToken')
                },
                body: JSON.stringify(event)
            })
                .then(r => r.json().then(body => {
                    if (r.status < 200 || r.status >= 300) {
                        throw(body);
                    } else {
                        if (event.figures) dispatch(actions.saveEventGridChangesSuccess());
                        if (!isEmpty(body)) dispatch(actions.patchTPEvent(body))
                        resolve()
                    }
                }))
                .catch(err => {
                    reject(err);
                    console.log(err)
                })
        });
    }
};


export const updateBSPEvent = (event) => {
    return dispatch => {
        return  new Promise((resolve, reject) => {
            fetch(`${url}/api/v1/event/events/${event.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('idToken')
                },
                body: JSON.stringify(event)
            })
                .then(r => r.json().then(body => {
                    if (r.status < 200 || r.status >= 300) {
                        throw(body);
                    } else {
                        if (event.figures) dispatch(actions.saveEventGridChangesSuccess());
                        if (!isEmpty(body)) dispatch(actions.updateBSEvent(body))
                        resolve()
                    }
                }))
                .catch(err => {
                    reject(err);
                    console.log(err)
                })
        });
    }
};

export const getPlannableProducts = (customer_id) => {
    return dispatch => {
        dispatch(actions.getProductsPending());
        return fetch(`${url}/api/v1/assortments/plannableproducts/?customer=${customer_id}`, authHeaders())
            .then(r => r.json())
            .then(products => dispatch(actions.getProductsSuccess(products)))
            .catch(err => dispatch(actions.getProductsError(err)))
    }
};

export const getFilteredProducts = (selections) => {
    return dispatch => dispatch(actions.getFilteredProducts(selections))
};


export const getTactics = () => {
    return dispatch => {
        return fetch(`${url}/api/v1/event/tactics/`, authHeaders())
            .then(r => r.json())
            .then(tactics => dispatch(actions.getEventTactics(tactics.results)))
            .catch(err => console.log(err))
    }
};

export const getConditions = eventType => (dispatch, getState) => {
    const salesorg = getState().SalesOrg.salesorg;
    if(salesorg) {
        return fetch(`${url}/api/v1/pricing/conditions/?source=${eventType}&sales_org=${salesorg}`, authHeaders())
            .then(r => r.json())
            .then(conditions => (eventType === 'TP') ? dispatch(actions.getTPConditions(conditions.results)) : dispatch(actions.getBSPConditions(conditions.results)))
            .catch(err => console.log(err))
    }
};

export const getStatuses = (eventType) => {
    return dispatch => {
        return fetch(`${url}/api/v1/core/planningeventstatus/?technical_name=${eventType}`, authHeaders())
            .then(r => r.json())
            .then(statuses => {
                if (eventType === 'TP') {
                    return dispatch(actions.getTPStatuses(statuses.results[0].statuses))
                } else{
                    return dispatch(actions.getBSPStatuses(statuses.results[0].statuses))
                }
            })
            .catch(err => console.log(err))
    }
};

export const getCurrentEvent = eventId => dispatch => {
    dispatch(actions.getEventPending());
    return fetch(`${url}/api/v1/event/events/?id=${eventId}`, authHeaders())
        .then(r => r.json())
        .then(event => {
            dispatch(actions.setCurrentEvent(event.results[0]));
            return event.results[0];
        })
        .catch(err => {
            dispatch(actions.getEventError(err));
            return err;
        });
};

export const resetCreateTPSuccess = () => {
    return dispatch => dispatch(actions.resetTPEventSuccess())
};

export const resetCreateBSPSuccess = () => dispatch => dispatch(actions.resetBSPEventSuccess());

export const copyEvent = (event_id, event_type, increment, level, copies) => {
    return dispatch => {
        dispatch(actions.getEventPending());
        return fetch(`${url}/api/v1/event/copy_event/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: JSON.stringify({
                id: event_id,
                type: event_type,
                increment: increment,
                level: level,
                copies: copies

            })
        })
            .then(r => r.json())
            .then(events => {
                if (event_type === 'BSP') {
                    return dispatch(actions.copyBSPEvents(events.results))
                } else {
                    return dispatch(actions.copyTPEvents(events.results))
                }
            })
            .catch(err => console.log(err))
    }
};

export const copySingleEvent = (event_id, increment, level) => {
    return dispatch => {
        dispatch(actions.getEventPending());
        return fetch(`${url}/api/v1/event/copy_event/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: JSON.stringify({
                id: event_id,
                increment: increment,
                level: level,
            })
        })
            .then(r => r.json()
                .then(event => {
                    if (r.status < 200 || r.status >= 300) {
                        dispatch(actions.createTPEventFailure(event))
                        throw(event);
                    } else {
                        dispatch(actions.setCurrentEvent(event.results))
                    }
                }))
            .catch(err => console.log(err))
    }
};

export const getBuyingPatterns = (eventId) => {
    return dispatch => {
        return fetch(`${url}/api/v1/event/buyingpatterns/?eventplan=${eventId}`, authHeaders())
            .then(r => r.json())
            .then(patterns => dispatch(actions.getBuyingPatterns(patterns.results[0])))
            .catch(err => console.log(err))
    }
};

export const addBuyingPatterns = (patterns) => {
    return dispatch => {
        return fetch(`${url}/api/v1/event/buying_patterns/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: JSON.stringify(patterns)
        })
            .then(res => res.json())
            .then(patterns => dispatch(actions.addBuyingPatterns(patterns.results[0])))
            .catch(err => console.error(err))
    }
};


export const updateBuyingPatterns = (patterns, event_id) => {
    return dispatch => {
        return fetch(`${url}/api/v1/event/buying_patterns/${event_id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: JSON.stringify(patterns)
        })
            .then(res => res.json())
            .then(patterns => dispatch(actions.updateBuyingPatterns(patterns.results[0])))
            .catch(err => console.error(err))
    }
};

/**
 * Get if event is past, current, or future from event dates
 * @param event
 * @returns {string|null}
 */
const getEventTime = event => {
    let eventTime = null;
    const startStr = _.get(event, 'start_date');
    const endStr = _.get(event, 'end_date');

    if (!(startStr && endStr)) {
        return null;
    }

    const currentDate = moment();
    const startDate = moment(startStr);
    const endDate = moment(endStr);

    switch (true) {
        case currentDate > startDate && currentDate > endDate:
            eventTime = 'PAST';
            break;
        case currentDate > startDate && currentDate < endDate:
            eventTime = 'CURRENT';
            break;
        case currentDate < startDate && currentDate < endDate:
            eventTime = 'FUTURE';
            break;
        default:
            break;
    }
    return eventTime;
};

export const updateChangePending = (bool) => {
    return dispatch => dispatch(actions.updateChangePending(bool))
}
/**
 * Check permission config for editability of components for a given event
 * @param event
 * @param compId
 * @param permConfig
 * @returns {boolean|*}
 */
export const isEventComponentEditable = (compId, event, permConfig) => {
    // const eventType = _.get(event, ['type', 'technical_name']);
    // const eventStatus = _.get(event, ['status', 'technical_name']);
    // const eventTime = getEventTime(event);
    //
    // if (!(eventType && eventStatus && eventTime && compId)) {
    //     return false;
    // }
    // return _.get(permConfig, [eventType, eventStatus, eventTime, compId], false);

    return true; //TODO REMOVE THIS, TEMPORARY UNTIL CONFIG IS CREATED IN MIGRATIONS
};

export default actions;