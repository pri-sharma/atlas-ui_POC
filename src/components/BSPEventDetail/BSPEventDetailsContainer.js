import React, {Component, Profiler} from 'react';
import {connect} from 'react-redux';
import LayoutContentWrapper from '../utility/layoutWrapper';
import ContentHolder from '../utility/contentHolder';
import {DatePicker} from 'antd/lib/index';
import * as actions from '../../redux/events/actions';
import * as plannableCustomerActions from '../../redux/plannableCustomers/actions';
import EventGrid from '../EventGrid';
import {FormControl, InputLabel, FormHelperText} from '@material-ui/core/index';
import CustomizedSnackbar from '../CustomizedSnackbar'
import EventDetailHeader from "../EventDetail/EventDetailHeader";
import Grid from "@material-ui/core/Grid/index";
import TextField from "@material-ui/core/TextField/index";
import moment from 'moment/moment';
import Button from "@material-ui/core/Button/index";
import AttachFileIcon from '@material-ui/icons/AttachFile';
import {Styled} from './BSPEventDetailsContainer.style';
import CircularProgress from "@material-ui/core/CircularProgress";
import _ from 'lodash';
import {logProfile} from "../../profiler/profiler";

class BSPEventDetailsContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            planning_basis: 'Product Hierarchy',
        };
    }

    componentDidMount() {
        this.props.getCurrentEvent(this.props.match.params.id) // get current event from url event id
            .then(event => this.props.setSelectedCustomer(event.eventcustomers_set[0].customer.id)); // get customer id

        this.props.getBSPStatuses();
    }

    handleSubmit = () => {
        if (this.state.customer === '') {
            this.snackbar.error('Please select a Customer');
        } else if (this.state.pricing_start >= this.state.pricing_end) {
            this.snackbar.error('Start date must be prior to the end date');
        } else {
            this.props.updateBSPEvent(this.state, this.state.id);
        }
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
                    <Profiler id={window.location.pathname} onRender={logProfile}>
                        <EventDetailHeader event={this.props.currentEvent}
                                           statuses={this.props.bspStatuses}
                                           backUrl={'/bspevent'}>
                            <Styled.DetailContent>
                                <Grid container justify={'flex-start'} alignItems={'center'}
                                      className={'bsp-detail-container'}>
                                    <Grid item className={'bsp-detail-item'}>
                                        <InputLabel className='bsp-label-text'>
                                            Description
                                        </InputLabel>
                                        <TextField className={'bsp-detail-input'}
                                                   value={this.props.currentEvent.description}
                                                   variant='outlined'
                                                   margin='dense'/>
                                    </Grid>
                                    <Grid item className={'bsp-detail-item'}>
                                        <InputLabel className='bsp-label-text'>
                                            Pricing Dates
                                        </InputLabel>
                                        <DatePicker.RangePicker className={'bsp-detail-input'}
                                                                defaultValue={[moment(this.props.currentEvent.pricing_start), moment(this.props.currentEvent.pricing_end)]}
                                                                format={'MMMM D YYYY'}
                                                                allowClear={false}
                                                                separator={'-'}
                                        />
                                    </Grid>
                                    <Grid item className={'bsp-detail-item'}>
                                        <Button color='primary' size={'small'} startIcon={<AttachFileIcon/>}>
                                            ATTACH FILES
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Styled.DetailContent>
                        </EventDetailHeader>
                        <ContentHolder>
                            {this.props.currentEvent.eventproducts_set.length !== 0 ?
                                <EventGrid event={this.props.currentEvent} planning_basis={this.state.planning_basis}/>
                                : null}
                        </ContentHolder>
                        <CustomizedSnackbar ref={el => this.snackbar = el}/>
                    </Profiler>
                </LayoutContentWrapper>
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        currentEvent: state.Event.currentEvent,
        customer: state.PlannableCustomers.selectedCustomer,
        planningConfig: state.PlannableCustomers.planningConfig,
        bspStatuses: state.Event.bspStatuses,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setSelectedCustomer: (customer) => dispatch(plannableCustomerActions.setSelectedCustomerAction(customer)),
        createBSPEvent: (event) => dispatch(actions.createBSPEvent(event)),
        updateBSPEvent: (event, event_id) => dispatch(actions.updateBSPEvent(event, event_id)),
        getCurrentEvent: (event) => dispatch(actions.getCurrentEvent(event)),
        getBSPStatuses: () => dispatch(actions.getStatuses('BSP')),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(BSPEventDetailsContainer)