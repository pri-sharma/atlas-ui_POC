import React, {Component, Fragment} from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Paper from '@material-ui/core/Paper';
import RootRef from '@material-ui/core/RootRef';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import Close from '@material-ui/icons/Close';
import moment from 'moment';
import {connect} from 'react-redux';
import * as actions from '../../redux/events/actions';
import {Styled} from './EventDetailsCard.style';
import {DatePicker, Icon, InputNumber as InputANTD} from 'antd';
import LabeledActionIcon from '../labeledIcon/LabeledActionIcon';
import EventDetailHeader from '../EventDetail/EventDetailHeader';
import CustomizedDialog from '../customizedDialog/CustomizedDialog';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';
import CopyIcon from '../../images/Copy.png';


import _ from 'lodash';

const dateFormat2 = 'MMMM D YYYY';
const suffix = <Icon type='caret-down'/>;

const levels = [{value: 'Day(s)'}, {value: 'Week(s)'}, {value: 'Month(s)'}, {value: 'Quarter(s)'},{value: 'Year(s)'}];

class EventDetailsCard extends Component {
    constructor(props) {
        super(props);
        const event = this.props.currentEvent;
        let tactics = event.eventtactics_set.map(tactic => tactic.tactic);

        this.state = {
            id: event.id,
            description: event.description,
            pricing_start: moment(event.pricing_start),  // TODO: Change when model changes to sellin_start/sellin_end
            pricing_end: moment(event.pricing_end),
            sellout_start: moment(event.sellout_start),
            sellout_end: moment(event.sellout_end),
            ship_start: moment(event.ship_start),
            ship_end: moment(event.ship_end),
            status: event.status.technical_name,
            tactics: tactics.map(tactic => tactic.id),
            attachments: [],  // TODO: handle file upload on server
            buttonIsDisabled: true,
            buying_patterns: [],
            patterns_revert: [],
            pattern_length: 0,
            final_patterns: {},
            isCustomizeOpen: false,
            isCopyOpen: false,
            increment: '0',
            level: 'Day(s)',
        };

        this.handleTactics = this.handleTacticsAdd.bind(this, 'tactics', 'value');
        this.handleAttachments = this.handleAttachmentsAdd.bind(this, 'attachments', 'files');
        this.onDatesPricingChange = this.onDatesChange.bind(this, 'pricing_start', 'pricing_end');
        this.onDatesSelloutChange = this.onDatesChange.bind(this, 'sellout_start', 'sellout_end');
        this.onDatesShipChange = this.onDatesChange.bind(this, 'ship_start', 'ship_end');
    };

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        let exclude = ['buying_patterns','patterns_revert','buttonIsDisabled','pattern_length','final_patterns','isCustomizeOpen'];
        if (this.state !== nextState) {
            let importantThingsChanged = false;
            Object.keys(nextState).forEach(key => {
                if (exclude.indexOf(key) < 0) {
                    if (!key.includes('input') && this.state[key] !== nextState[key]) {
                        importantThingsChanged = true
                    }
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

    handleTacticsAdd = (name, target, props) => {
        const targetValue = props.target && props.target[target];
        this.setState({[name]: targetValue});
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

    onOpen = (event) => {
        let obj = {}
        Object.values(this.state.buying_patterns).forEach(function (value) {
            obj[value.id] = value.value;
        });
        this.setState({isCustomizeOpen: true, buttonIsDisabled: true, final_patterns: obj});
    };

    onCancel = (event) => {
        this.revertDefaultValues();
        this.setState({isCustomizeOpen: false, buttonIsDisabled: true});
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        let bpData;
        if (this.state.pattern_length > 0) {
            bpData = await this.props.modifyBuyingPatterns(this.state, this.state.id);
        } else {
            bpData = await this.props.createBuyingPatterns(this.state);
        }
        this.setData(bpData);
        await this.setState({isCustomizeOpen: false});
        await this.props.getCurrentEvent(this.props.currentEvent.id); // get new event data from backend
    };

    handleProportion = (value, id, key) => {
        let total_prop = 0;
        if (isNaN(value)) {
            return false;
        } else if (value == '' || value == null) {
            this.state.final_patterns[id] = 0
        } else {
            this.state.final_patterns[id] = value
        }

        let index = this.state.buying_patterns.findIndex(key => key.id == id);
        const buying_patterns = [...this.state.buying_patterns];
        buying_patterns[index].value = value;
        this.setState({buying_patterns: buying_patterns});

        Object.values(this.state.final_patterns).forEach(function (value) {
            total_prop = total_prop + value
        });
        if (total_prop == 100) {
            this.setState({buttonIsDisabled: false});
        } else {
            this.setState({buttonIsDisabled: true});
        }
    };

    revertDefaultValues = (event) => {
        let patterns = [];
        Object.keys(this.state.patterns_revert).map(key => {
            patterns.push({'id': key, 'value': this.state.patterns_revert[key], 'key': key.replace('_', ' ')});
        });
        this.setState({isCustomizeOpen: true, buttonIsDisabled: true, buying_patterns: patterns});
    };

    setData = (val) => {
        let obj = {};
        Object.values(val.payload.buying_patterns).forEach(function (value) {
            obj[value.id] = value.value;
        });
        this.setState({buying_patterns: val.payload.buying_patterns, pattern_length: val.payload.count, patterns_revert: obj});
    };

    componentDidMount() {
        this.props.getPatterns(this.state.id).then(val => {
            this.setData(val);
        });
    }

    handleCopy = () => {
        this.props.copySingleEvent(this.state.id, this.state.increment, this.state.level,);
        this.setState({isCopyOpen: false,
                                  level: 'Day(s)',
                                 increment:'0',})
    };

    setCopyDialogOpen = (isOpen) => {
        this.setState({isCopyOpen: isOpen});

        if (!isOpen){
            this.setState({level: 'Day(s)', increment:'0'});

        }

    };

    toggle = () => {
        this.setState({
            disabled: !this.state.disabled,
        });
    };

    handleChangeEvent = (value, state_value) => {
        if (state_value === 'increment') {
            this.setState({
                [state_value]: value
            });
        }
    };

    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        this.props.getPatterns(this.state.id).then(val => {
            this.setData(val);
        });
    }

    render() {
        let externalId = this.props.currentEvent.external_id;
        let externalIdLength = externalId ? externalId.length * 12 : 120;
        return (
                        <Fragment>
            <CustomizedDialog open={this.state.isCopyOpen}
                                       title = {'Copy Event'}
                                       img = {CopyIcon}
                                       closeText={'CANCEL'}
                                       onClose={()=>this.setCopyDialogOpen(false)}
                                       onSubmit={this.handleCopy}
                                       submitText={'APPLY'}>
                                    <div>
                                        <div style={{margin: '1rem', width: '28rem', display: "flex"}}>
                                            <div style={{margin: '1rem', width: '8rem', display: "flex",  fontSize: 'large'}} >
                                                Shift Dates By
                                            </div>
                                            <div style={{margin: '1rem', width: '5rem', display: "flex"}}>
                                                <InputANTD defaultValue={this.state.increment} id={'increment'}
                                                           style={{ width: 60,}}
                                                           min={-52} max={52}
                                                           disabled={this.state.disabled}
                                                           onChange={(e) => this.handleChangeEvent(e, 'increment')}/>
                                            </div>
                                            <div style={{width: '10rem', display: "flex"}}>
                                                <TextField
                                                  id={'level'}
                                                  style={{ width: 100}}
                                                  select
                                                  // label="Select"
                                                  value={this.state.level}
                                                  onChange={event => {
                                                    const { value } =event.target;
                                                    this.setState({level: value});
                                                  }}
                                                  SelectProps={{
                                                    MenuProps: {
                                                      width: 100,
                                                    },
                                                  }}
                                                  margin="normal">
                                                  {levels.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                      {option.value}
                                                    </MenuItem>
                                                  ))}
                                                </TextField>
                                            </div>
                                        </div>
                                    </div>
                        </CustomizedDialog>
            <EventDetailHeader event={this.props.currentEvent}
                               statuses={this.props.eventStatuses}
                               backUrl={'/promoevent'}
                               setCopyDialogOpen={this.setCopyDialogOpen}>
                <Styled.CustomCard ext_len={externalIdLength}>
                <Grid className='content-two'>
                    <Grid item>
                        <InputLabel className='label-text'>Description</InputLabel>
                        <TextField className='description-input'
                                   value={this.state.description}
                                   onChange={this.handleChange('description')}
                                   variant='outlined'
                                   disabled={!actions.isEventComponentEditable('change_description', this.props.data, this.props.permissionConfig)}
                        />
                    </Grid>
                    <Grid item>
                        <InputLabel className='label-text'>Shipping Dates</InputLabel>
                        <DatePicker.RangePicker
                            defaultValue={[this.state.ship_start, this.state.ship_end]}
                            format={dateFormat2}
                            onChange={this.onDatesShipChange}
                            allowClear={false}
                            suffixIcon={suffix}
                            separator='-'
                            disabled={!actions.isEventComponentEditable('change_ship_dates', this.props.data, this.props.permissionConfig)}
                        />
                    </Grid>
                    <Grid item>
                        <InputLabel className='label-text'>Pricing Dates</InputLabel>
                        <DatePicker.RangePicker
                            defaultValue={[this.state.pricing_start, this.state.pricing_end]}
                            format={dateFormat2}
                            onChange={this.onDatesPricingChange}
                            allowClear={false}
                            suffixIcon={suffix}
                            separator='-'
                            disabled={!actions.isEventComponentEditable('change_pricing_dates', this.props.data, this.props.permissionConfig)}
                        />
                    </Grid>
                    <Grid item>
                        <InputLabel className='label-text'>In-Store Dates</InputLabel>
                        <DatePicker.RangePicker
                            defaultValue={[this.state.sellout_start, this.state.sellout_end]}
                            format={dateFormat2}
                            onChange={this.onDatesSelloutChange}
                            allowClear={false}
                            suffixIcon={suffix}
                            separator='-'
                            disabled={!actions.isEventComponentEditable('change_instore_dates', this.props.data, this.props.permissionConfig)}
                        />
                    </Grid>
                    <Grid item>
                        <InputLabel className='label-text'>Tactics</InputLabel>
                        <Select className='tactics-input'
                                multiple
                                margin='dense'
                                displayEmpty={true}
                                variant='outlined'
                                renderValue={selected => {
                                    if(selected.length === 1) {
                                        return <div
                                            className='tactics-text'>{this.props.tactics.find(tactic => selected[0] === tactic.id).name}</div>;
                                    } else if(selected.length > 1) {
                                        return selected.length + ' tactics selected';
                                    } else {
                                        return 'Select Tactics';
                                    }
                                }}
                                input={
                                    <OutlinedInput id='outlined-tactics'/>
                                }
                                value={this.state.tactics}
                                onChange={this.handleTactics}
                                MenuProps={MenuProps}>
                            {this.props.tactics.map(tactic => {
                                return (
                                    <MenuItem key={tactic.id} value={tactic.id}>
                                        <Checkbox color='primary'
                                                  checked={this.state.tactics.find(stateTactics => (stateTactics === tactic.id)) !== undefined}/>
                                        <strong>{tactic.name}</strong>: {tactic.description}
                                    </MenuItem>
                                )
                            })}
                        </Select>
                    </Grid>
                </Grid>
                <Grid className='content-three'>
                    <Grid item>
                        <InputLabel className='label-text'>Buying Pattern</InputLabel>
                        {this.state.buying_patterns.length > 0 && this.state.buying_patterns.length < 21 ?
                            <div style={{width: '50px'}}>
                                {this.state.pattern_length > 0 ?
                                    <LabeledActionIcon id='buying_patterns' icon={'edit'} action='Update'
                                                       actionCB={this.onOpen} style={{width: '35px'}}/>
                                    :
                                    <LabeledActionIcon id='buying_patterns' icon={'add'} action='Add'
                                                       actionCB={this.onOpen} style={{width: '35px'}}/>
                                }
                            </div>
                            :
                            <div style={{width: '50px'}} title={'Sorry you cannot add Buying Patterns!!!'}>
                                <LabeledActionIcon icon={'add'} action='Add' style={{width: '35px'}}/>
                            </div>
                        }
                        <CustomizedDialog open={this.state.isCustomizeOpen}
                                          img={null}>
                            {this.state.pattern_length > 0 ?
                                <LabeledActionIcon id='revert_to_default' icon={'loop'} action='Revert to Default'
                                                   actionCB={this.revertDefaultValues}/>
                                : null}
                            <div style={{margin: '2rem', width: '11rem'}}>
                                <Paper>
                                    <DragDropContext onDragEnd={this.onDragEnd}>
                                        <Droppable droppableId='droppable'>
                                            {(provided, snapshot) => (
                                                <RootRef rootRef={provided.innerRef}>
                                                    {
                                                        this.state.buying_patterns.map(value => (
                                                            <div style={{
                                                                margin: '0rem',
                                                                width: '10rem',
                                                                display: 'flex'
                                                            }}>
                                                                <div style={{
                                                                    margin: '0.5rem',
                                                                    width: '8rem',
                                                                    display: 'flex',
                                                                    fontSize: 'small'
                                                                }}>
                                                                    {value.key} :
                                                                </div>
                                                                <div style={{
                                                                    margin: '0.2rem',
                                                                    width: '5rem',
                                                                    display: 'flex'
                                                                }}>
                                                                    <InputANTD value={value.value}
                                                                               id={value.id}
                                                                               style={{width: 60}}
                                                                               maxLength='3'
                                                                               min={0} max={100}
                                                                               disabled={this.state.disabled}
                                                                               onChange={(e) => this.handleProportion(e, value.id, value.key)}/>
                                                                </div>
                                                                <div style={{
                                                                    margin: '0.5rem',
                                                                    width: '2rem',
                                                                    display: 'flex'
                                                                }}>
                                                                    %
                                                                </div>
                                                            </div>
                                                        ))
                                                    }

                                                </RootRef>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </Paper>
                            </div>
                            <div className={'MuiDialogActions-root sc-dnqmqq DtcxU MuiDialogActions-spacing'}>
                                <Button onClick={this.onCancel}
                                        className={'MuiButtonBase-root MuiButton-root sc-gZMcBi kDkpWL MuiButton-text'}>
                                    CANCEL
                                </Button>
                                <Button onClick={this.handleSubmit} disabled={this.state.buttonIsDisabled}
                                        className={'MuiButtonBase-root MuiButton-root sc-iwsKbI hPVYrA MuiButton-contained MuiButton-containedPrimary'}>
                                    APPLY
                                </Button>
                            </div>
                        </CustomizedDialog>

                        </Grid>
                        <Grid item>
                                <span>
                                    {
                                        this.state.attachments.map(value => (
                                            <Chip
                                                key={value.name}
                                                label={value.name}
                                                size='small'
                                                style={{
                                                    backgroundColor: 'rgba(147,213,241, 0.8)',
                                                    color: 'rgba(29,161,218, 0.8)'
                                                }}
                                                deleteIcon={<Close style={{color: 'rgba(29,161,218, 0.8)'}}/>}
                                                onDelete={this.handleChipDelete('attachments', value.name)}
                                            />
                                        ))
                                    }
                                </span>
                            <label id='attach_tp_detail'>
                                <input hidden onChange={this.handleAttachments} type='file'/>
                                <IconButton color='primary' component='span'>
                                    <AddIcon className='attach-action-icon' fontSize='small'/>
                                </IconButton>
                                <Typography className='attach-action-text'>Add Attachment</Typography>
                            </label>
                        </Grid>
                    </Grid>
                </Styled.CustomCard>
            </EventDetailHeader>
        </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        eventStatuses: state.Event.tpStatuses,
        permissionConfig: state.PlannableCustomers.permissionConfig,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        getCurrentEvent: (event) => dispatch(actions.getCurrentEvent(event)),
        updateEventChanges: (changes) => dispatch(actions.updateEventChanges(changes)),
        getPatterns: (eventId) => dispatch(actions.getBuyingPatterns(eventId)),
        createBuyingPatterns: (patterns) => dispatch(actions.addBuyingPatterns(patterns)),
        modifyBuyingPatterns: (patterns, event_id) => dispatch(actions.updateBuyingPatterns(patterns, event_id)),
        copySingleEvent: (event_id, increment, level) => dispatch(actions.copySingleEvent(event_id,  increment, level)),
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(EventDetailsCard)

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: 380,
        },
    },
};
