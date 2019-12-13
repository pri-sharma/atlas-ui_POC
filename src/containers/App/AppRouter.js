import React, {Component} from 'react';
import {Redirect, Route} from 'react-router-dom';
import asyncComponent from '../../helpers/AsyncFunc';
import {connect} from 'react-redux';
import {Layout} from 'antd';
import {Styled} from './AppRouter.style';
const {Content} = Layout;

const RestrictedRoute = ({component: Component, isLoggedIn, store, ...rest}) => {
    if (!rest.isEnabled) {  // isEnabled function was defined
        rest.isEnabled = () => true;
    }
    return (
        <Route
            {...rest}
            render={props =>
                rest.isEnabled(store) ? (
                    isLoggedIn ? (
                       <Component {...props} isLoggedIn={isLoggedIn}/>
                    ) : (
                        <Redirect
                            to={{
                                pathname: '/signin',
                                state: {from: props.location}
                            }}
                        />
                    )
                ) : null
            }
        />
    );
};

// TODO Make the below restricted!
export const restrictedRoutes = [
    {
        path: '/',
        component: asyncComponent(() => import('../dashboard')),
    },
    {
        path: '/blankPage',
        component: asyncComponent(() => import('../blankPage')),
    },
    {
        path: '/authCheck',
        component: asyncComponent(() => import('../AuthCheck')),
    },
    {
        path: '/salesorg',
        component: asyncComponent(() => import('../SalesOrgContainer'))
    },
    {
        path: '/cpassignment',
        component: asyncComponent(() => import('../CPAssignmentContainer'))
    },
    {
        path: '/cuassignment',
        component: asyncComponent(() => import('../CustomerUserAssignmentContainer'))
    },
    {
        path: '/bspevent',
        component: asyncComponent(() => import('../BSPEvent/BSPEventContainer')),
        isEnabled: (store) => {
            return store.PlannableCustomers.planningConfig.BSP;
        }
    },
    {
        path: '/bspevent/details/:id',
        component: asyncComponent(() => import('../BSPEvent/detail/BSPEventDetailsContainer'))
    },
    {
        path: '/promoevent',
        component: asyncComponent(() => import('../PromoEvent/PromoEventContainer')),
        isEnabled: (store) => {
            return store.PlannableCustomers.planningConfig.TP;
        }
    },
    {
        path: '/promoevent/details/:id',
        component: asyncComponent(() => import('../PromoEvent/details/PromoEventDetailsContainer'))
    },
    {
        path: '/baseline_volume_planning',
        component: asyncComponent(() => import('../BaselineVolumePlanningContainer')),
        isEnabled: (store) => {
            return store.PlannableCustomers.planningConfig.BVP;
        }
    },
    {
        path: '/customergroup',
        component: asyncComponent(() => import('../CustomerGroup/CustomerGroupContainer'))
    },
    {
        path: '/performance/monitor',
        component: asyncComponent(() => import('../PerformanceMonitor/PerformanceMonitorDashboard'))
    },
    {
        path: '/user/settings',
        component: asyncComponent(() => import('../Settings'))
    },
    {
        path: '/assortment',
        component: asyncComponent(() => import('../Assortment'))
    },
    {
        path: '/split_ratios',
        component: asyncComponent(() => import('../SplitRatiosUpload'))
    },
    {
        path: '/direct_trade_assortment',
        component: asyncComponent(() => import('../DirectTradeAssortment'))
    },
    {
        path: '/reporting/list', //MA Changes
        component: asyncComponent(() => import('../Reporting/ReportList'))
    },
    {
        path: '/reporting/view', //MA Changes
        component: asyncComponent(() => import('../Reporting/ReportView'))
    },
    {
        path: '/reporting/view/:id',
        component: asyncComponent(() => import('../Reporting/ReportView'))
    },
];

export class AppRouter extends Component {

    render() {
        const {url, style, isLoggedIn, ...storeProps} = this.props;
        return (
            <Styled.ContentHolder>
                <Content className='customContent'>
                    {restrictedRoutes.map(singleRoute => {
                        const {component, ...otherProps} = singleRoute;
                        return (
                            <RestrictedRoute   // TODO make restricted - endless redirects
                                exact
                                key={singleRoute.path}
                                component={component}
                                path={url}
                                isLoggedIn={isLoggedIn}
                                store={storeProps}
                                {...otherProps}
                            />
                        );
                    })}
                </Content>
            </Styled.ContentHolder>
        );
    }

}

export default connect((state) => ({...state}))(AppRouter);
