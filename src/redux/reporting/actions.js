/*
 * File Name: actions.js
 * Create By: MediaAgility
 */

/*
 * Variable declarations
 */
const base_url = "http://127.0.0.1:8002"
const userID = localStorage.getItem('UserID'); //Get the current UserID from local storage

 //Set the Bearer Token for authentication in the local storage of the browser.
 const authHeaders = () => ({
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('idToken')
    }
});

/*
 * Define actions for each function.
 */
const actions = {
    // Actions for getting AgGrid Reporting Structure
    GET_GRIDVIEW_STRUCTURE: 'GET_GRIDVIEW_STRUCTURE',
    GET_GRIDVIEW_STRUCTURE_SUCCESS: 'GET_GRIDVIEW_STRUCTURE_SUCCESS',
    GET_GRIDVIEW_STRUCTURE_ERROR: 'GET_GRIDVIEW_STRUCTURE_ERROR',

    // Actions for getting AgGrid Reporting State
    GET_GRIDVIEW_STATE: 'GET_GRIDVIEW_STATE',
    GET_GRIDVIEW_STATE_SUCCESS: 'GET_GRIDVIEW_STATE_SUCCESS',
    GET_GRIDVIEW_STATE_ERROR: 'GET_GRIDVIEW_DATA_ERROR',

    // Actions for getting AgGrid Reporting Data from BQ
    GET_GRIDVIEW_DATA: 'GET_GRIDVIEW_DATA',
    GET_GRIDVIEW_DATA_SUCCESS: 'GET_GRIDVIEW_DATA_SUCCESS',
    GET_GRIDVIEW_DATA_ERROR: 'GET_GRIDVIEW_DATA_ERROR',

    // Actions for getting current logged in user detail
    GET_USER: 'GET_USER',
    GET_USER_SUCCESS: 'GET_USER_SUCCESS',
    GET_USER_ERROR: 'GET_USER_ERROR',

    // Actions to save AgGrid Reporting State
    ADD_GRIDVIEW_STATE: 'ADD_GRIDVIEW_STATE',
    ADD_GRIDVIEW_STATE_SUCCESS: 'ADD_GRIDVIEW_STATE_SUCCESS',
    ADD_GRIDVIEW_STATE_ERROR: 'ADD_GRIDVIEW_STATE_ERROR',

    // Actions to delete AgGrid Reporting State
    DELETE_GRIDVIEW_STATE: 'DELETE_GRIDVIEW_STATE',
    DELETE_GRIDVIEW_STATE_SUCCESS: 'DELETE_GRIDVIEW_STATE_SUCCESS',
    DELETE_GRIDVIEW_STATE_ERROR: 'DELETE_GRIDVIEW_STATE_ERROR',

    getGridViewStructureSuccess: (structure) => {
        return {
            type: actions.GET_GRIDVIEW_STRUCTURE_SUCCESS,
            payload: structure
        }
    },
    getGridViewStructureError: (error) => {
        return {
            type: actions.GET_GRIDVIEW_STRUCTURE_ERROR,
            error: error
        }
    },
    getGridViewDataSuccess: (data) => {
        return {
            type: actions.GET_GRIDVIEW_DATA_SUCCESS,
            payload: data
        }
    },
    getGridViewDataError: (error) => {
        return {
            type: actions.GET_GRIDVIEW_DATA_ERROR,
            error: error
        }
    },
    getGridViewStateSuccess: (state) => {
        return {
            type: actions.GET_GRIDVIEW_STATE_SUCCESS,
            payload: state
        }
    },
    getGridViewStateError: (error) => {
        return {
            type: actions.GET_GRIDVIEW_STATE_ERROR,
            error: error
        }
    },
    getUserSuccess: (user) => {
        return {
            type: actions.GET_USER_SUCCESS,
            payload: user
        }
    },
    getUserError: (error) => {
        return {
            type: actions.GET_USER_ERROR,
            error: error
        }
    },
    addGridViewStateSuccess: (user) => {
        return {
            type: actions.ADD_GRIDVIEW_STATE_SUCCESS,
            payload: user
        }
    },
    addGridViewStateError: (error) => {
        return {
            type: actions.ADD_GRIDVIEW_STATE_ERROR,
            error: error
        }
    },
    deleteGridViewStateSuccess: (user) => {
        return {
            type: actions.DELETE_GRIDVIEW_STATE_SUCCESS,
            payload: user
        }
    },
    deleteGridViewStateError: (error) => {
        return {
            type: actions.DELETE_GRIDVIEW_STATE_ERROR,
            error: error
        }
    }

};

// Call AgGrid Reporting "fetch_structure" API for creating the tool panel as per report in AgGrid 
export const GetGridViewStructureAction = (id, level) => {
    return dispatch => {
        return fetch(`${base_url}/api/v1/get_grid_structure/fetch_structure/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: JSON.stringify({
                view_id: id,
                level_type: level
            })
        })
            .then(r => {
                return r.json()
            })
            .then(res => {
                if (res.error) {
                    throw (res.error);
                }
                dispatch(actions.getGridViewStructureSuccess(res));
                return res;
            })
            .catch(error => {
                dispatch(actions.getGridViewStructureError(error));
            })
    }

};

// Call AgGrid Reporting "fetch_state" API for showing the saved reports in AgGrid 
export const GetGridViewStateAction = (isSystem) => {
    return dispatch => {
        return fetch(`${base_url}/api/v1/get_grid_state/fetch_state/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: JSON.stringify({
                user_id: isSystem == true? 0: userID
            })
        })
            .then(r => {
                return r.json()
            })
            .then(res => {
                if (res.error) {
                    throw (res.error);
                }
                dispatch(actions.getGridViewStateSuccess(res));
                return res;
            })
            .catch(error => {
                dispatch(actions.getGridViewStateError(error));
            })
    }

};

// Call AgGrid Reporting "fetch_bq_report" API for getting the data from BQ in AgGrid
export const GetGridViewDataAction = (param) => {
    return dispatch => {
        return fetch(`${base_url}/api/v1/get_report_data_bq/fetch_bq_report/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: JSON.stringify({
                user_id: 'rita_ng@colpal.com',//userID,//'rita_ng@colpal.com', //"kevin_gordon@colpal.com",
                level_type: param.level,
                reporting_period: param.reportingperiod
            })
        })
            .then(r => {
                return r.json()
            })
            .then(res => {
                if (res.error) {
                    throw (res.error);
                }
                dispatch(actions.getGridViewDataSuccess(res));
                return res;
            })
            .catch(error => {
                dispatch(actions.getGridViewDataError(error));
            })
    }

};

// Call AgGrid Reporting "fetch_user_detail" API for getting the user details in AgGrid
export const GetUserInfoAction = () => {
    return dispatch => {
        fetch(`${base_url}/api/v1/userinfo/fetch_user_detail/`, authHeaders())
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    throw (res.error);
                }
                dispatch(actions.getUserSuccess(res));
                return res;
            })
            .catch(error => {
                dispatch(actions.getUserError(error));
            })
    }
};

// Call AgGrid Reporting "save_state" API to save views/reports in AgGrid
export const AddGridViewStateAction = (event) => {
    return dispatch => {
        return fetch(`${base_url}/api/v1/get_grid_state/save_state/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: JSON.stringify({
                id: event.id,
                user_id: userID,
                view_id: event.view_id,
                view_name: event.view_name,
                col_state: event.col_state,
                group_state: event.group_state,
                sort_state: event.sort_state,
                filter_state: event.filter_state,
                level_type: event.level_type,
                reporting_period: event.reporting_period,
                is_pivot_mode: event.is_pivot_mode,
                is_default: event.is_default,
                is_deleted: event.is_deleted,
                is_public: event.is_public

            })
        })
            .then(r => {
                return r.json()
            })
            .then(res => {
                if (res.error) {
                    throw (res.error);
                }
                dispatch(actions.addGridViewStateSuccess(res));
                return res;
            })
            .catch(error => {
                dispatch(actions.addGridViewStateError(error));
            })
    }
};

// Call AgGrid Reporting "delete_state" API to delete views/reports in AgGrid
export const DeleteGridViewStateAction = (id) => {
    return dispatch => {
        return fetch(`${base_url}/api/v1/get_grid_state/delete_state/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: JSON.stringify({
                user_id: "kevin_gordon@colpal.com",
                id: id
            })
        })
            .then(r => {
                return r.json()
            })
            .then(res => {
                if (res.error) {
                    throw (res.error);
                }
                dispatch(actions.deleteGridViewStateSuccess(res));
                return res;
            })
            .catch(error => {
                dispatch(actions.deleteGridViewStateError(error));
            })
    }

};

export default actions;
