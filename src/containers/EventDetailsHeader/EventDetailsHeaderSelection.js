import React, {Component} from 'react';
import {connect} from 'react-redux';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';
import EventDetailsCard from '../../components/eventDetailsCard/EventDetailsCard';
import * as actions from '../../redux/events/actions';
import EventBSPDetailsCard from '../../components/eventDetailsCard/EventBSPDetailsCard';
import _ from 'lodash'

class EventDetailsHeaderSelection extends Component {

    componentDidMount() {
        if(this.props.tactics.length === 0) {
            this.props.getTactics();
        }
        if(this.props.eventTPStatuses === undefined) {
            this.props.getStatuses('TP');
        }
        if(this.props.eventBSPStatuses === undefined) {
            this.props.getStatuses('BSP');
        }

    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if(!!nextProps.currentEvent) {
            return true;
        }
        return false;
    }

    render() {
        const {eventPending, currentEvent, tactics, eventTPStatuses, eventBSPStatuses} = this.props;
        if (eventPending) {
            return (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh'}}>
                    <CircularProgress/>
                </div>
            );
        } else {
            const isTP = _.get(currentEvent.type, 'technical_name', false) === 'TP';
            return (
                <Card>
                    {isTP ?
                        <EventDetailsCard currentEvent={currentEvent} tactics={tactics} eventStatuses={eventTPStatuses}/> :
                        <EventBSPDetailsCard currentEvent={currentEvent} eventStatuses={eventBSPStatuses}/>
                    }
                </Card>
            );
        }
    }
}

const mapStateToProps = state => {
    return {
        currentEvent: state.Event.currentEvent,
        eventPending: state.Event.getEventPending,
        tactics: state.Event.tactics,
        eventTPStatuses: state.Event.tpStatuses,
        eventBSPStatuses: state.Event.bspStatuses,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        getTactics: () => dispatch(actions.getTactics()),
        getStatuses: (eventType) => dispatch(actions.getStatuses(eventType)),
        updateEventChanges: (changes) => dispatch(actions.updateEventChanges(changes)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(EventDetailsHeaderSelection);