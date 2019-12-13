import React, {Component} from 'react';
import {connect} from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import LayoutContentWrapper from '../../../components/utility/layoutWrapper';
import * as actions from '../../../redux/events/actions';
import * as plannableCustomerActions from '../../../redux/plannableCustomers/actions';
import CustomizedSnackbar from '../../../components/CustomizedSnackbar'
import _ from 'lodash';
import EventDetailsContentSelection from '../../EventDetailsContentSelection/EventDetailsContentSelection';
import * as salesorgActions from '../../../redux/salesorg/actions';
import EventDetailHeaderSelection from '../../EventDetailsHeader/EventDetailsHeaderSelection';
import PublishedButton from '../../../components/publishButton/PublishedButton'
import moment from 'moment'

class BSPEventDetailsContainer extends Component {
    constructor(props) {
        super(props);

        // TODO - what is this and how is this used?
        this.state = {
            planning_basis: 'Product Hierarchy',
        };
    }

    componentDidMount() {
        this.props.getCurrentEvent(this.props.match.params.id) // get current event from url event id
            .then(event => {
                    const customer = event.eventcustomers_set[0].customer.id;
                    this.props.setSelectedCustomer(customer);
                    this.props.setSelectedSalesOrg(customer);
    });
        this.props.getBSPStatuses();
    }

    handleSave = async () => {
        const newDetails = !_.isEmpty(this.props.pendingDetailChanges);
        const newGrids = !_.isEmpty(this.props.pendingGridChanges);
        if (!newDetails && !newGrids) return;

        const id = _.get(this.props, 'currentEvent.id');
        if (id === undefined) throw new Error("Current Event doesn't have an ID");

        const gridPayload = newGrids
            ? { figures: this.props.pendingGridChanges }
            : {};

        const detailsPayload = newDetails
            ? _.mapValues(this.props.pendingDetailChanges, (v, k) => {
                if (v instanceof moment) return v.format('Y-M-D');
                if (k === 'tactics' && _.isArray(v)) {
                  return v.map(t => t.id && t.id.toString());
                }
                return v;
              })
            : {};

         this.props.updateBSPEvent({
          ...detailsPayload,
          ...gridPayload,
          id,
        }).then(
            (changed) => { // resolve
                this.snackbar.success('Changes saved');
            },
            (err) => { // reject
                this.snackbar.error(`Error saving changes: ${err}`);
            }
        );
    };

    /**
     * Verify event and planning config are loaded
     * @returns {boolean}
     */
    isDependentPropsLoaded = () => {
        return !(_.isNil(this.props.currentEvent) || _.isEmpty(this.props.planningConfig) || _.isNil(this.props.bspStatuses));
    };

    render() {
        if (!this.isDependentPropsLoaded()) { // current event was not yet fetched TODO check if request is done
            return (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh'}}>
                    <CircularProgress/>
                </div>
            )
        } else {
            return (
                <LayoutContentWrapper className={'filteredContent2'}>
                    <PublishedButton handleSaveCB={this.handleSave} changeReady={!this.props.changePending}/>
                    <EventDetailHeaderSelection />
                    <EventDetailsContentSelection />
                    <CustomizedSnackbar ref={el => this.snackbar = el}/>
                </LayoutContentWrapper>
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        eventPending: state.Event.getEventPending,
        pendingGridChanges: state.Event.changedEntries,
        pendingDetailChanges: state.Event.pendingEventChanges,
        changePending: state.Event.pendingChange,
        currentEvent: state.Event.currentEvent,
        customer: state.PlannableCustomers.selectedCustomer,
        planningConfig: state.PlannableCustomers.planningConfig,
        bspStatuses: state.Event.bspStatuses,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setSelectedCustomer: (customer) => dispatch(plannableCustomerActions.setSelectedCustomerAction(customer)),
        setSelectedSalesOrg: (customer_id) => dispatch(salesorgActions.setSelectedSalesOrg(customer_id)),
        createBSPEvent: (event) => dispatch(actions.createBSPEvent(event)),
        updateBSPEvent: (event, event_id) => dispatch(actions.updateBSPEvent(event, event_id)),
        getCurrentEvent: (event) => dispatch(actions.getCurrentEvent(event)),
        getBSPStatuses: () => dispatch(actions.getStatuses('BSP')),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(BSPEventDetailsContainer)