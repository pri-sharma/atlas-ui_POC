import actions from './actions';

const initState = {
    assortments: [],
    assortment_products: [],
    pending: false,
    error: null,
    products_to_add: []
};

const reducer = (state = initState, action) => {
    switch (action.type) {
        case actions.GET_ASSORTMENTS_PENDING:
            return {
                ...state,
                pending: false
            };
        case actions.GET_ASSORTMENTS_SUCCESS:
            return {
                ...state,
                pending: false,
                assortments: action.payload
            };
        case actions.GET_ASSORTMENTS_ERROR:
            return {
                ...state,
                pending: false,
                error: action.error
            };
        case actions.ADD_ASSORTMENT_SUCCESS:
            return {
                ...state,
                pending:false,
                assortments: [action.payload, ...state.assortments],
            };
        case actions.GET_ASSORTMENT_PRODUCT_PENDING:
            return {
                ...state,
                pending: false
            };
        case actions.GET_ASSORTMENT_PRODUCT_ERROR:
            return {
                ...state,
                pending: false,
                error: action.error
            };
        case actions.GET_ASSORTMENT_PRODUCT:
            return {
                ...state,
                pending: false,
                assortment_products: action.payload,
            };
        case actions.ADD_ASSORTMENT_PRODUCT:
            return {
                ...state,
                pending: false,
                assortment_products: action.payload,
            };
        case actions.GET_ASSORTMENT_PRODUCT_TO_ADD:
            return {
                ...state,
                pending: false,
                products_to_add: action.payload,
            };

        default:
            return state;
    }
};

export default reducer;