import React, {Component, Profiler} from 'react';
import {connect} from 'react-redux';
import { get, isEmpty, isArray, mapValues } from 'lodash';
import moment from 'moment';
import LayoutContentWrapper from '../../../components/utility/layoutWrapper';
import * as actions from '../../../redux/events/actions'
import EventDetailHeaderSelection from '../../EventDetailsHeader/EventDetailsHeaderSelection';
import EventDetailsContentSelection from '../../EventDetailsContentSelection/EventDetailsContentSelection';
import CustomizedSnackbar from '../../../components/CustomizedSnackbar';
import PublishedButton from '../../../components/publishButton/PublishedButton';
import {logProfile} from "../../../profiler/profiler";

class PromoEventDetailsContainer extends Component {

    constructor(props) {
        super(props);
        // TODO: investigate the right way to integrate with promoEvent
        if (!this.props.currentEvent) {
            this.props.getCurrentEvent(this.props.match.params.id);
        }
    }

    handleSave = async () => {
        const newDetails = !isEmpty(this.props.pendingDetailChanges);
        const newGrids = !isEmpty(this.props.pendingGridChanges);
        if (!newDetails && !newGrids) return;

        const id = get(this.props, 'currentEvent.id');
        if (id === undefined) throw new Error("Current Event doesn't have an ID");

        const gridPayload = newGrids
            ? { figures: this.props.pendingGridChanges }
            : {};

        const detailsPayload = newDetails
            ? mapValues(this.props.pendingDetailChanges, (v, k) => {
                if (v instanceof moment) return v.format('YYYY-MM-DD');
                return v;
              })
            : {};

        this.props.updateTPEvent({
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

    }

    render() {
        return (
            <LayoutContentWrapper className='filteredContent2'>
                <Profiler id={window.location.pathname} onRender={logProfile}>
                    <PublishedButton handleSaveCB={this.handleSave} changeReady={!this.props.changePending}/>
                    <EventDetailHeaderSelection/>
                    <EventDetailsContentSelection/>
                </Profiler>
                <CustomizedSnackbar ref={el => this.snackbar = el}/>
            </LayoutContentWrapper>
        )
    }
}

const mapStateToProps = state => {
    return {
        eventPending: state.Event.getEventPending,
        currentEvent: state.Event.currentEvent,
        changePending: state.Event.pendingChange,
        pendingGridChanges: state.Event.changedEntries,
        pendingDetailChanges: state.Event.pendingEventChanges,
        tpConditions: state.Event.tpConditions,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        getCurrentEvent: (eventId) => dispatch(actions.getCurrentEvent(eventId)),
        updateTPEvent: (event) => dispatch(actions.updateTPEvent(event)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(PromoEventDetailsContainer);