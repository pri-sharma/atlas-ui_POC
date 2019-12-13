import React, {Component, Fragment, Profiler} from 'react';
import {connect} from 'react-redux';
import LayoutContentWrapper from '../../components/utility/layoutWrapper';
import * as actions from '../../redux/events/actions';
import FiltersContainer from '../Filters/FiltersContainer';
import Paper from '@material-ui/core/Paper';
import {logProfile} from "../../profiler/profiler";
import PublishedButton from "../../components/publishButton/PublishedButton";
import EventContainerGrid from "../EventContainerGrid";
import moment from "moment";
import StatusCellRenderer from "../../components/CellRenderers/StatusCellRenderer";
import LinkCellRenderer from "../../components/CellRenderers/LinkCellRenderer";
import {CircularProgress} from "@material-ui/core";
import CustomizedSnackbar from "../../components/CustomizedSnackbar";

class BSPEventContainer extends Component {
    constructor(props) {
        super(props);
        this.props.getEvents('BSP', this.props.customer);
        this.props.getEventSelectionOptionsAction('BSP', this.props.customer);
        this.props.getStatuses('BSP');
        this.props.getConditions('BSP');

        this.frameworkComponents = {
            statusCellRenderer: StatusCellRenderer,
            linkCellRenderer: LinkCellRenderer
        };
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
                editable: true,
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
                headerName: 'CONDITION TYPES',
                valueGetter: this.conditionTypesGetter,
                filter: true,
                menuTabs: ['filterMenuTab'],
                icons: {menu: '<i class="material-icons">filter_list</i>'}
            },
        ];
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.customer !== this.props.customer) {
            this.props.getEvents('BSP', this.props.customer);
            this.props.getEventSelectionOptionsAction('BSP', this.props.customer);
        }
    }

    handleDelete = (event_id) => {
        this.props.deleteBSPEvent(event_id)
    };

    conditionTypesGetter = (params) => {
        let conditionTypes = "";
        let oi = false;
        let vr = false;
        let fx = false;
        if(params.data.eventcondition_set){
            params.data.eventcondition_set.forEach( cond => {
                let rebatePricing = cond.condition.rebate_pricing;
                switch (rebatePricing) {
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
                if (oi && vr && fx) {
                    conditionTypes = "OI - VR - FX"
                } else if (oi && vr && !fx) {
                    conditionTypes = "OI - VR"
                } else if (oi && !vr && fx) {
                    conditionTypes = "OI - FX"
                } else if (!oi && vr && fx) {
                    conditionTypes = "VR - FX"
                } else if (oi && !vr && !fx) {
                    conditionTypes = "OI"
                } else if (!oi && vr && !fx) {
                    conditionTypes = "VR"
                } else if (oi && !vr && fx) {
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
            promises_array.push(this.props.updateBSPEvent(change));
        });
        Promise.all(promises_array).then(
        (changed) => { // resolve
            this.snackbar.success('Changes saved');
        },
        (err) => { // reject
            this.snackbar.error(`Error saving changes: ${err}`);
        }
    );
        this.props.getEvents('BSP', this.props.customer)
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
                                                data={this.props.bspevents}
                                                eventType={'BSP'}/>
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
        bspevents: state.Event.bspevents,
        event: state.Event.currentEvent,
        customer: state.PlannableCustomers.selectedCustomer,
        user: state.Auth.email,
        eventStatuses: state.Event.bspStatuses,
        pendingStatusChanges: state.Event.pendingStatusChanges,
        changePending: state.Event.pendingStatusChange,
        bspConditions: state.Event.bspConditions,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        getEvents: (event_type, customer_id) => dispatch(actions.getEvents(event_type, customer_id)),
        updateBSPEvent: (event) => dispatch(actions.updateBSPEvent(event)),
        getEventSelectionOptionsAction: (event_type, customer_id) => dispatch(actions.getEventSelectionOptionsAction(event_type, customer_id)),
        deleteBSPEvent: (event_id) => dispatch(actions.deleteEvent(event_id)),
        getCurrentEvent: (eventId) => dispatch(actions.getCurrentEvent(eventId)),
        getStatuses: (eventType) => dispatch(actions.getStatuses(eventType)),
        getConditions: (eventType) => dispatch(actions.getConditions(eventType)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(BSPEventContainer)