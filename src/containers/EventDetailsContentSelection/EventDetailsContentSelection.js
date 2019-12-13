import React, {Component} from 'react';
import {connect} from 'react-redux';
import {CircularProgress, Paper} from '@material-ui/core';
import EventGrid from '../../components/EventGrid';
import * as plannableCustomerActions from '../../redux/plannableCustomers/actions';
import * as salesorgActions from '../../redux/salesorg/actions';
import * as eventActions from '../../redux/events/actions';
import _ from 'lodash';
import moment from 'moment';

class EventDetailsContentSelection extends Component {

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if(!nextProps.eventPending) {
            // TODO: Is this right place to set it? From what I understand,
            //  planning config must be set.
            if(Object.entries(nextProps.planningConfig).length === 0) {
                const customer = nextProps.currentEvent.eventcustomers_set[0].customer.id;
                nextProps.setSelectedCustomerAction(customer);
                nextProps.setSelectedSalesOrg(customer);
                nextProps.getPermissionConfigAction(customer, nextProps.user);
                return false;
            }
            if(!nextProps.tpConditions) {
                nextProps.getConditions('TP');
                return false;
            }
            return true;
        }
        return false;
    }

    /**
     * Check permission config for editability of components
     * @param compId
     * @returns {boolean|*}
     */
    isEditable = (compId) => {
        const event = this.props.currentEvent;
        const eventType = _.get(event, 'type.technical_name');
        const eventStatus = _.get(event, 'status.technical_name');
        const eventTime = this.getEventTime(event);
        if(!(eventType && eventStatus && eventTime && compId)) {
            return false;
        }
        return _.get(this.props.permissionConfig, `${eventType}.${eventStatus}.${eventTime}.${compId}`, false);
    };

    /**
     * Get if event is past, current, or future from event dates
     * @param event
     * @returns {string|null}
     */
    getEventTime = event => {
        let eventTime = null;
        const startStr = _.get(event, 'start_date');
        const endStr = _.get(event, 'end_date');

        if(!(startStr && endStr)) {
            return null;
        }

        const currentDate = moment();
        const startDate = moment(startStr);
        const endDate = moment(endStr);

        switch(true) {
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

    render() {
        if (this.props.eventPending) {
            return (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh'}}>
                    <CircularProgress/>
                </div>
            );
        } else {
            return (
                <Paper className='filteredGrid'>
                    <EventGrid isEditable={this.isEditable}/>
                </Paper>);
        }
    }
}

const mapStateToProps = state => {
    return {
        currentEvent: state.Event.currentEvent,
        eventPending: state.Event.getEventPending,
        planningConfig: state.PlannableCustomers.planningConfig,
        plannableCustomers: state.PlannableCustomers.plannableCustomers,
        selectedCustomer: state.PlannableCustomers.selectedCustomer,
        tpConditions: state.Event.tpConditions,
        permissionConfig: state.PlannableCustomers.permissionConfig,
        user: state.Auth.email,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        getPlannableCustomers: (user) => dispatch(plannableCustomerActions.getPlannableCustomersAction(user)),
        setSelectedCustomerAction: (customer) => dispatch(plannableCustomerActions.setSelectedCustomerAction(customer)),
        setSelectedSalesOrg: (customer_id) => dispatch(salesorgActions.setSelectedSalesOrg(customer_id)),
        getConditions: (eventType) => dispatch(eventActions.getConditions(eventType)),
        getPermissionConfigAction: (customer_id, username) => dispatch(plannableCustomerActions.getPermissionConfigAction(customer_id, username)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(EventDetailsContentSelection);