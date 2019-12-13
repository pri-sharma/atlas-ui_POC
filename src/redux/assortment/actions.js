// const base_url = 'http://127.0.0.1:8080'; THIS WILL NOT WORK WHEN PUSHED TO THE CLOUD. YOU MUST USE REACT_APP_API_URL
const base_url = process.env.REACT_APP_API_URL;
const authHeaders = () => ({
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('idToken')
    }
});

const actions = {
    GET_ASSORTMENTS_PENDING: 'GET_ASSORTMENTS_PENDING',
    GET_ASSORTMENTS_SUCCESS: 'GET_ASSORTMENTS_SUCCESS',
    GET_ASSORTMENTS_ERROR: 'GET_ASSORTMENTS_ERROR',
    ADD_ASSORTMENT_SUCCESS: 'ADD_ASSORTMENT_SUCCESS',
    GET_ASSORTMENT_PRODUCT: 'GET_ASSORTMENT_PRODUCT',
    GET_ASSORTMENT_PRODUCT_PENDING: 'GET_ASSORTMENT_PRODUCT_PENDING',
    GET_ASSORTMENT_PRODUCT_ERROR: 'GET_ASSORTMENT_PRODUCT_ERROR',
    ADD_ASSORTMENT_PRODUCT: 'ADD_ASSORTMENT_PRODUCT',
    GET_ASSORTMENT_PRODUCT_TO_ADD: 'GET_ASSORTMENT_PRODUCT_TO_ADD',

    getAssortmentsPending: () => {
        return {
            type: actions.GET_ASSORTMENTS_PENDING
        }
    },
    getAssortmentsSuccess: (news) => {
        return {
            type: actions.GET_ASSORTMENTS_SUCCESS,
            payload: news
        }
    },
    getAssortmentsError: (error) => {
        return {
            type: actions.GET_ASSORTMENTS_ERROR,
            error: error
        }
    },
    addAssortment: (assortment) => {
        return {
            type: actions.ADD_ASSORTMENT_SUCCESS,
            payload: assortment
        }
    },
    getAssortmentProduct: (assortment_products) => {
        return {
            type: actions.GET_ASSORTMENT_PRODUCT,
            payload: assortment_products
        }
    },
    getAssortmentsProductPending: () => {
        return {
            type: actions.GET_ASSORTMENT_PRODUCT_PENDING
        }
    },
    getAssortmentsProductError: (error) => {
        return {
            type: actions.GET_ASSORTMENT_PRODUCT_ERROR,
            error: error
        }
    },
    addAssortmentProduct: (assortment) => {
        return {
            type: actions.ADD_ASSORTMENT_PRODUCT,
            payload: assortment
        }
    },
    getAssortmentProducttoAdd: (assortment_products) => {
        return {
            type: actions.GET_ASSORTMENT_PRODUCT_TO_ADD,
            payload: assortment_products
        }
    },
};

export const getAssortmentsAction = () => {
    return dispatch => {
        dispatch(actions.getAssortmentsPending());
        fetch(`${base_url}/api/v1/assortments/assortments_create/list_assortment_with_customers/`, authHeaders())
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    throw(res.error);
                }
                dispatch(actions.getAssortmentsSuccess(res));
                return res;
            })
            .catch(error => {
                dispatch(actions.getAssortmentsError(error));
            })
    }
};

export const addAssortmentsAction = (assortment) => {
    return dispatch => {
        return fetch(`${base_url}/api/v1/assortments/assortments_create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: JSON.stringify(assortment)
        })
            .then(res => res.json())
            .then(assortment => {
                if (assortment.error) {
                    return alert(assortment.error)
                }
                dispatch(actions.addAssortment(assortment))
            })
            .catch(err => console.error(err))
    }
};
export const getAssortmentProductAction = (assortment_id) => {
    return dispatch => {
        dispatch(actions.getAssortmentsProductPending());
        fetch(`${base_url}/api/v1/assortments/final_assortment_list/?id=${assortment_id}`, authHeaders())
            .then(res => res.json())
            .then(res => {
                dispatch(actions.getAssortmentProduct(res));
                return res;
            })
            .catch(error => {
                dispatch(actions.getAssortmentsProductError(error));
            })
    }
};

export const addAssortmentProductsAction = (assortment_product, id) => {
    return dispatch => {
        return fetch(`${base_url}/api/v1/assortments/assortments_create/${id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: JSON.stringify(assortment_product)
        })
            .then(res => res.json())
            .then(assortment => {
                if (assortment.error) {
                    return alert(assortment.error)
                }
                dispatch(actions.addAssortmentProduct(assortment))
            })
            .catch(err => console.error(err))
    }
};

export const getProductsNotInAssortmtentAction = (assortment_id) => {
    return dispatch => {
        dispatch(actions.getAssortmentsProductPending());
        fetch(`${base_url}/api/v1/assortments/assortment_products_list/?id=${assortment_id}`, authHeaders())
            .then(res => res.json())
            .then(res => {
                dispatch(actions.getAssortmentProducttoAdd(res));
                return res;
            })
            .catch(error => {
                dispatch(actions.getAssortmentsProductError(error));
            })
    }
};


export default actions;
