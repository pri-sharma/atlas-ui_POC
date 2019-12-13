import React, {Component} from 'react';
import AttachFileIcon from '@material-ui/core/SvgIcon/SvgIcon';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import moment from 'moment';
import {connect} from 'react-redux';
import * as actions from '../../redux/events/actions';
import {DatePicker, Icon} from 'antd';
import EventDetailHeader from '../EventDetail/EventDetailHeader';
import {Styled} from './EventBSPDetailsCard.style';

const dateFormat2 = 'MMMM D YYYY';
const suffix = <Icon type='caret-down'/>;

class EventBSPDetailsCard extends Component {
    constructor(props) {
        super(props);
        const event = this.props.currentEvent;

        this.state = {
            id: event.id,
            description: event.description,
            pricing_start: moment(event.pricing_start),  // TODO: Change when model changes to sellin_start/sellin_end
            pricing_end: moment(event.pricing_end),
            status: event.status.technical_name,
            attachments: [],  // TODO: handle file upload on server
            pricing_input: null,
        };

        this.handleAttachments = this.handleAttachmentsAdd.bind(this, 'attachments', 'files');
        this.onDatesPricingChange = this.onDatesChange.bind(this, 'pricing_start', 'pricing_end');
    };

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (this.state !== nextState) {
            let importantThingsChanged = false;
            Object.keys(nextState).forEach(key => {
                if (!key.includes('input') && this.state[key] !== nextState[key]) {
                    importantThingsChanged = true
                }
            });
            if (importantThingsChanged) { // If only values that get stored are changed, then it will store in redux
                let importantChanges = {};
                for (let [key, value] of Object.entries(nextState)) {
                    if (!key.includes('input')) {
                        importantChanges[key] = value
                    }
                }
                this.props.updateEventChanges(importantChanges)
            }
            return true;
        } else if (this.props !== nextProps) {
            return true;
        }
        return false;
    };

    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    };

    handleAttachmentsAdd = (name, target, props) => {
        const targetValue = props.target && props.target[target];

        if (targetValue) {
            this.setState({[name]: [...this.state[name], targetValue[0]]});
        }
    };

    handleChipDelete = (name, chipToDelete) => () => {
        const newTarget = this.state[name].filter((value) => value.name !== chipToDelete);
        this.setState({[name]: newTarget});
    };

    onDatesChange = (start_label, end_label, dateRange) => {
        let end = moment(dateRange[1]);
        end = end.format('YYYY-MM-DD'); //TODO THIS IS TEMPORARY AS IT WILL CHANGE WITH UX CHANGES TO ANTD
        end = moment(end);

        let start = moment(dateRange[0]);
        start = start.format('YYYY-MM-DD');
        start = moment(start);

        this.setState({[start_label]: start, [end_label]: end});
    };

    render() {
        return (
            <EventDetailHeader event={this.props.currentEvent}
                               statuses={this.props.eventStatuses}
                               backUrl={'/bspevent'}>
                <Styled.DetailContent>
                    <Grid container justify={'flex-start'} alignItems={'center'} className={'bsp-detail-container'}>
                        <Grid item className={'bsp-detail-item'}>
                            <InputLabel className='bsp-label-text'>
                                Description
                            </InputLabel>
                            <TextField className={'bsp-detail-input'}
                                       value={this.state.description}
                                       variant='outlined'
                                       onChange={this.handleChange('description')}
                            />
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
                                                    onChange={this.onDatesPricingChange}
                            />
                        </Grid>
                        <Grid item className={'bsp-detail-item'}>
                            <input hidden onChange={this.handleAttachments} type='file'/>
                            <Button color='primary' size={'small'} startIcon={<AttachFileIcon/>}>
                                ATTACH FILES
                            </Button>
                        </Grid>
                    </Grid>
                </Styled.DetailContent>
            </EventDetailHeader>
        )
    }
}

const mapStateToProps = state => {
    return {
        eventStatuses: state.Event.bspStatuses,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        updateEventChanges: (changes) => dispatch(actions.updateEventChanges(changes)),
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(EventBSPDetailsCard)