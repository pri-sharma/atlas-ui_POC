import React, {Component, Fragment} from 'react';
import * as actions from '../../redux/events/actions';
import {connect} from 'react-redux';
import LabeledActionIcon from '../labeledIcon/LabeledActionIcon';
import PencilIcon from '../../images/Pencil.svg';
import Calendar from '../../images/createEventCalendar.png';
import {Styled} from './createEvent.style';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';
import {DatePicker, Input, Select} from 'antd';
import Chip from '@material-ui/core/Chip';
import Close from '@material-ui/core/SvgIcon/SvgIcon';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';

const {RangePicker} = DatePicker;
const {Option} = Select;

class CreateEvent extends Component {

    constructor(props) {
        super(props);
        const dateFormat = 'YYYY/MM/DD';
        const getMomentYear = moment().year();

        this.props.getTactics();
        this.handleAttachments = this.handleAttachmentsAdd.bind(this, 'attachments', 'files');
        this.subHeader = this.props.eventType === 'TP' ? 'Trade Promotion' : 'Base Spends';
        this.startDate = moment(getMomentYear + '/01/01' , dateFormat);
        this.endDate = moment(getMomentYear + '/12/31' , dateFormat);
        this.isTP = this.props.eventType === 'TP';
        this.state = {
            isOpen: false,
            customer: this.props.customer ? this.props.customer : this.props.plannableCustomers.length === 1 ? this.props.plannableCustomers[0] : '',
            sellout_start: moment(),
            sellout_end: moment(),
            pricing_start: moment(),
            pricing_end: moment(),
            ship_start: moment(),
            ship_end: moment(),
            tactics: [],
            description: '',
            status: 'DRAFT',
            attachments: [], // TODO: handle file upload on server
        }
    }

    onOpen = () => {
        this.setState({isOpen: true});
    };

    onCreate = () => {
        if (this.isTP) {
            this.props.createTPEvent(this.state);
        } else {
            this.props.createBSPEvent(this.state);
        }
    };

    onCancel = () => {
        this.setState({
            isOpen: false
        })
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

    handleDateRangeChange = (dateRange, dateRangeString, state_value) => {
        if (dateRangeString[0].length !== 0 && dateRangeString[1].length !== 0) {
            if (state_value === 'pricing') {
                this.setState({
                    pricing_start: dateRange[0],
                    pricing_end: dateRange[1],
                });
            } else if (state_value === 'sellout') {
                this.setState({
                    sellout_start: dateRange[0],
                    sellout_end: dateRange[1]
                });
            } else if (state_value === 'shipping') {
                this.setState({
                    ship_start: dateRange[0],
                    ship_end: dateRange[1]
                });
            }
        }
    };

    handleChange = (value, state_value) => {
        this.setState({
            [state_value]: value
        });
    };

    render() {
        const dateFormat2 = 'MMMM D YYYY';
        return (
            <Fragment>
                <LabeledActionIcon id='tp_new_event' icon={'add'} action='Create Event' actionCB={this.onOpen}/>
                <Styled.CustomModal
                    width={1030}
                    visible={this.state.isOpen}
                    closable={false}
                    footer={null}>
                    <Styled.DevidedContent>
                        <div className={'content-card-left'}>
                            <img src={Calendar} style={{marginTop: 150}}/>
                        </div>
                        <div className={'content-card-right'}>
                            <Styled.TitleHeader>
                                <img src={PencilIcon} height={'38px'} width={'38px'} style={{marginTop: 8}}/>
                                <Typography className='title-text'>Create New Event</Typography>
                                <Styled.TitleSubheader>
                                    <Typography className={'subtitle-text'}>{this.subHeader}</Typography>
                                </Styled.TitleSubheader>
                            </Styled.TitleHeader>
                            <Styled.ModalInputs>
                                <Styled.InputLabel variant={'subtitle2'}>Description</Styled.InputLabel>
                                <Input
                                    className={'pickers'}
                                    id={'description'}
                                    placeholder={'Enter Description'}
                                    size={'large'}
                                    onChange={(e) => this.handleChange(e.target.value, 'description')}
                                />

                                {this.isTP ?
                                    <Fragment>
                                        <Styled.InputLabel variant={'subtitle2'}>Shipping Dates</Styled.InputLabel>
                                        <RangePicker
                                            defaultValue={[this.startDate, this.endDate]}
                                            className={'pickers'}
                                            format={dateFormat2}
                                            size={'large'}
                                            onChange={(dateRange, dateRangeString) => this.handleDateRangeChange(dateRange, dateRangeString, 'shipping')}
                                            allowClear={false}
                                            separator={'-'}
                                        />
                                    </Fragment>
                                    : null}

                                <Styled.InputLabel variant={'subtitle2'}>Pricing Dates</Styled.InputLabel>
                                <RangePicker
                                    defaultValue={[this.startDate, this.endDate]}
                                    className={'pickers'}
                                    format={dateFormat2}
                                    size={'large'}
                                    onChange={(dateRange, dateRangeString) => this.handleDateRangeChange(dateRange, dateRangeString, 'pricing')}
                                    allowClear={false}
                                    separator={'-'}
                                />
                                {this.isTP ?
                                    <Fragment>
                                        <Styled.InputLabel variant={'subtitle2'}>In-Store Dates</Styled.InputLabel>
                                        <RangePicker
                                            defaultValue={[this.startDate, this.endDate]}
                                            className={'pickers'}
                                            format={dateFormat2}
                                            size={'large'}
                                            onChange={(dateRange, dateRangeString) => this.handleDateRangeChange(dateRange, dateRangeString, 'sellout')}
                                            allowClear={false}
                                            separator={'-'}
                                        />


                                        <Styled.InputLabel variant={'subtitle2'}>Tactics</Styled.InputLabel>
                                        <Select
                                            className={'pickers'}
                                            mode={'multiple'}
                                            size={'large'}
                                            placeholder={'Select Tactics'}
                                            onChange={(tactics) => this.handleChange(tactics, 'tactics')}>
                                            {this.props.tactics.map(tactic => (
                                                <Option key={tactic.id} value={tactic.id}>
                                                    {tactic.name}: {tactic.description}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Fragment>
                                    : null}
                                <span>
                                        {this.state.attachments.map(value => (
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
                                    <IconButton className={'attachment'} color='primary' component='span'>
                                        <AddIcon className='attach-action-icon' fontSize='small'/>
                                        <Typography className='attach-action-text' variant={'subtitle2'}>ADD
                                            ATTACHMENT</Typography>
                                    </IconButton>
                                </label>
                            </Styled.ModalInputs>
                            <Styled.ModalButtons>
                                <Styled.CancelButton onClick={this.onCancel}>Cancel</Styled.CancelButton>
                                <Styled.CreateButton variant='contained' onClick={this.onCreate}
                                                     color='primary'>Create</Styled.CreateButton>
                            </Styled.ModalButtons>
                        </div>
                    </Styled.DevidedContent>
                </Styled.CustomModal>
            </Fragment>

        )
    }
}

const mapStateToProps = state => {
    return {
        customer: state.PlannableCustomers.selectedCustomer,
        currentEvent: state.Event.currentEvent,
        tactics: state.Event.tactics
    }
};

const mapDispatchToProps = dispatch => {
    return {
        createBSPEvent: (event) => dispatch(actions.createBSPEvent(event)),
        createTPEvent: (event) => dispatch(actions.createTPEvent(event)),
        getTactics: () => dispatch(actions.getTactics()),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateEvent);
