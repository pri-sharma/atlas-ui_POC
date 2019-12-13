import React, {Component, Profiler} from 'react';
import LayoutContentWrapper from '../../components/utility/layoutWrapper';
import {connect} from 'react-redux';
import * as actions from '../../redux/events/actions'
import FiltersContainer from '../Filters/FiltersContainer';
import EventContainerGrid from '../EventContainerGrid';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import StatusCellRenderer from '../../components/CellRenderers/StatusCellRenderer';
import LinkCellRenderer from '../../components/CellRenderers/LinkCellRenderer';
import {CircularProgress} from '@material-ui/core';
import PublishedButton from "../../components/publishButton/PublishedButton";
import {logProfile} from "../../profiler/profiler";
import CustomizedSnackbar from '../../components/CustomizedSnackbar';


class PromoEventContainer extends Component {

    constructor(props) {
        super(props);
        this.props.getEvents('TP', this.props.customer);
        this.props.getEventSelectionOptionsAction('TP', this.props.customer);
        this.props.getStatuses('TP');
        this.props.getConditions('TP');

        this.frameworkComponents = {
            statusCellRenderer: StatusCellRenderer,
            linkCellRenderer: LinkCellRenderer
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.customer !== this.props.customer) {
            this.props.getEvents('TP', this.props.customer);
            this.props.getEventSelectionOptionsAction('TP', this.props.customer);
        }
    }

    defineColumnDefs() {
        return [
            {
                headerCheckboxSelection: true,
                checkboxSelection: true,
                suppressMenu: true,
                width: 65,
            },
            {
                headerName: 'STATUS',
                field: 'status',
                valueGetter: function (params) {
                    return params.data.status.description;
                },
                valueFormatter: function (params) {
                    return params.value;
                },
                cellRendererFramework: this.frameworkComponents.statusCellRenderer,
                cellRendererParams: {eventStatuses: this.props.eventStatuses},
                editable: false,
                filterValueGetter: this.statusFilterGetter,
                filter: true,
                menuTabs: ['filterMenuTab'],
                icons: {menu: '<i class="material-icons">filter_list</i>'}
            },
            {
                headerName: 'EVENT ID',
                cellRendererFramework: this.frameworkComponents.linkCellRenderer,
                filter: true,
                filterValueGetter: this.eventIdFilter,
                menuTabs: ['filterMenuTab'],
                icons: {menu: '<i class="material-icons">filter_list</i>'}
            },
            {
                headerName: 'REFERENCE ID',
                filter: true,
                valueGetter: this.referenceId,
                menuTabs: ['filterMenuTab'],
                icons: {menu: '<i class="material-icons">filter_list</i>'}
            },
            {
                headerName: 'DESCRIPTION',
                field: 'description',
                filter: true,
                menuTabs: ['filterMenuTab'],
                icons: {menu: '<i class="material-icons">filter_list</i>'}
            },
            {
                headerName: 'PRICING DATES',
                valueGetter: function (event) {
                    let start = moment(event.data.pricing_start).format('MMMM D YYYY');
                    let end = moment(event.data.pricing_end).format('MMMM D YYYY');
                    return `${start} - ${end}`;
                },
                filter: true,
                menuTabs: ['filterMenuTab'],
                icons: {menu: '<i class="material-icons">filter_list</i>'}
            },
            {
                headerName: 'IN-STORE DATES',
                valueGetter: function (event) {
                    let start = moment(event.data.sellout_start).format('MMMM D YYYY');
                    let end = moment(event.data.sellout_end).format('MMMM D YYYY');
                    return `${start} - ${end}`;
                },
                filter: true,
                menuTabs: ['filterMenuTab'],
                icons: {menu: '<i class="material-icons">filter_list</i>'}
            },
            {
                headerName: 'SHIPPING DATES',
                valueGetter: function (event) {
                    let start = moment(event.data.ship_start).format('MMMM D YYYY');
                    let end = moment(event.data.ship_end).format('MMMM D YYYY');
                    return `${start} - ${end}`;
                },
                filter: true,
                menuTabs: ['filterMenuTab'],
                icons: {menu: '<i class="material-icons">filter_list</i>'}
            },
            {
                headerName: 'CONDITION TYPES',
                valueGetter: this.conditionTypesGetter,
                filter: true,
                menuTabs: ['filterMenuTab'],
                icons: {menu: '<i class="material-icons">filter_list</i>'}
            },
        ];
    }

    handleDelete = (event) => {
        this.props.deleteTPEvent(event.id)
    };

    conditionTypesGetter = (params) => {
        let conditionTypes = "";
        let oi = false;
        let vr = false;
        let fx = false;
        if(params.data.eventcondition_set){
            params.data.eventcondition_set.forEach( cond => {
                let rebatePricing = cond.condition.rebate_pricing;
                switch (rebatePricing){
                    case "OI":
                        oi = true;
                        break;
                    case "VR":
                        vr = true;
                        break;
                    case "FX":
                        fx = true;
                        break;
                }
                if (oi && vr && fx){
                    conditionTypes = "OI - VR - FX"
                } else if (oi && vr && !fx){
                    conditionTypes = "OI - VR"
                } else if (oi && !vr && fx){
                    conditionTypes = "OI - FX"
                } else if (!oi && vr && fx){
                    conditionTypes = "VR - FX"
                } else if (oi && !vr && !fx){
                    conditionTypes = "OI"
                } else if (!oi && vr && !fx){
                    conditionTypes = "VR"
                } else if (oi && !vr && fx){
                    conditionTypes = "FX"
                }
            })
        }
        return conditionTypes
    };

    eventIdFilter = (params) => {
        return params.data.external_id
    };

    referenceId = (params) => {
        return params.data.reference_id
    };

    statusFilterGetter = (params) => {
        return params.data.status.description;
    };

    handleSave = () => {
    const promises_array = [];
    this.props.pendingStatusChanges.forEach((change) => {
        promises_array.push(this.props.updateTPEvent(change))
        // this.props.updateTPEvent(change);
    });
    Promise.all(promises_array).then(
        (changed) => { // resolve
            this.snackbar.success('Changes saved');
        },
        (err) => { // reject
            this.snackbar.error(`Error saving changes: ${err}`);
        }
    );
    // this.props.getEvents('TP', this.props.customer);
};

    render() {
        if (!this.props.eventStatuses) {
            return (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh'}}>
                    <CircularProgress/>
                </div>
            );
        } else {
            return (
                <LayoutContentWrapper className='filteredContent'>
                    <Profiler id={window.location.pathname} onRender={logProfile}>
                        <PublishedButton handleSaveCB={this.handleSave} changeReady={!this.props.changePending}/>
                        <FiltersContainer/>
                        <Paper className='filteredContainerGrid'>
                            <EventContainerGrid frameworkComponents={this.frameworkComponents}
                                                columnDefs={this.defineColumnDefs()}
                                                data={this.props.tpevents}
                                                eventType={'TP'}/>
                        </Paper>
                    </Profiler>
                     <CustomizedSnackbar ref={el => this.snackbar = el}/>
                </LayoutContentWrapper>
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        tpevents: state.Event.tpevents,
        event: state.Event.currentEvent,
        changePending: state.Event.pendingStatusChange,
        customer: state.PlannableCustomers.selectedCustomer,
        user: state.Auth.email,
        eventStatuses: state.Event.tpStatuses,
        pendingStatusChanges: state.Event.pendingStatusChanges,
        tpConditions: state.Event.tpConditions,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        getEvents: (event_type, customer_id) => dispatch(actions.getEvents('TP', customer_id)),
        getEventSelectionOptionsAction: (event_type, customer_id) => dispatch(actions.getEventSelectionOptionsAction('TP', customer_id)),
        deleteTPEvent: (event_id) => dispatch(actions.deleteEvent(event_id, 'TP')),
        getCurrentEvent: (eventId) => dispatch(actions.getCurrentEvent(eventId)),
        getStatuses: (eventType) => dispatch(actions.getStatuses(eventType)),
        updateTPEvent: (event) => dispatch(actions.updateTPEvent(event)),
        getConditions: (eventType) => dispatch(actions.getConditions(eventType)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(PromoEventContainer);