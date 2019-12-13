import moment from "moment";
import _ from 'lodash';

const base_url = process.env.REACT_APP_API_URL;
const authHeaders = () => ({
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('idToken')
    }
});

const actions = {
    SET_CUSTOMER: 'SET_CUSTOMER',
    GET_PLANNABLE_CUSTOMERS: 'GET_PLANNABLE_CUSTOMERS',
    GET_PLANNING_CONFIG: 'GET_PLANNING_CONFIG',
    GET_PERMISSION_CONFIG: 'GET_PERMISSION_CONFIG',

    setSelectedCustomer: (customer) => {
        return {
            type: actions.SET_CUSTOMER,
            payload: customer,
        }
    },
    getPlannableCustomers: (customers) => {
        return {
            type: actions.GET_PLANNABLE_CUSTOMERS,
            payload: customers
        }
    },
    getPlanningConfig: (customer) => {
        return {
            type: actions.GET_PLANNING_CONFIG,
            payload: customer,
        }
    },
    getPermissionConfig: customer_id => ({
        type: actions.GET_PERMISSION_CONFIG,
        payload: customer_id,
    }),
};

/**
 * Manually override the MomentJS start day of week
 * @param startDayStr
 */
const overrideMomentStartDayOfWeek = startDayStr => {
    const days = {'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6};
    moment.updateLocale('en', {
        week: {
            dow: _.get(days, startDayStr, 0)
        },
    });
};

export const setSelectedCustomerAction = (customer) => {
    return (dispatch, getState) => {
        dispatch(actions.setSelectedCustomer(customer));
        dispatch(getPlanningConfigAction(customer));

        const {customerStartDay} = getState().PlannableCustomers;
        overrideMomentStartDayOfWeek(customerStartDay);
    }
};

const getPlanningConfigAction = (customer) => {
    return dispatch => {
        fetch(`${base_url}/api/v1/core/getplanningconfig/?customer_id=${customer}`, authHeaders())
            .then(r => r.json())
            .then(config => dispatch(actions.getPlanningConfig(config)))
            .catch(err => console.log(err))
    }
};

export const getPlannableCustomersAction = (user) => {
    return dispatch => {
        fetch(`${base_url}/api/v1/tm/customersforuser/?user=${user}`, authHeaders())
            .then(r => r.json())
            .then(customers => dispatch(actions.getPlannableCustomers(customers.results)))
            .catch(err => console.log(err))
    }
};

export const getPermissionConfigAction = (customer_id, username) => {
    return dispatch => {
        fetch(`${base_url}/api/v1/core/getpermissionconfig/?customer_id=${customer_id}&username=${username}`, authHeaders())
            .then(r => r.json())
            .then(config => dispatch(actions.getPermissionConfig(config)))
            .catch(err => console.log(err))
    }
};

export default actions;

