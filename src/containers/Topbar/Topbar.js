import React, { Component } from 'react';
import { Redirect } from 'react-router'
import { connect } from 'react-redux';
import { Layout, notification } from 'antd';
import appActions from '../../redux/app/actions';
import * as bvpActions from '../../redux/bvp/actions';
import TopbarUser from './topbarUser';
import PlannableCustomerSelect from '../../components/Forms/Components/PlannableCustomerSelect';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import RestoreIcon from '@material-ui/icons/Restore';
import Badge from '@material-ui/core/Badge';
import moment from 'moment';
import 'react-dates/initialize';
import HeaderWrapper from './topbar.style';
import 'react-dates/lib/css/_datepicker.css';
import './react_dates_overrides.css';

const { Header } = Layout;

class Topbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            focusInput: null,
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            startDayOfWeek: null,
            notification_count: 0,
        };
        this.startDate = this.props.startDate;
        this.endDate = this.props.endDate;
        this.initTab();
    }

    componentDidMount() {
        navigator.serviceWorker.addEventListener("message", (message) => {
            this.showNotification();
        });
    }

    initTab = () => {
        const tabIds = ['baseline_volume_planning', 'bspevent', 'promoevent'];
        const url = this.props.url.replace(/\//g, '');
        tabIds.forEach(id => {
            if (url.startsWith(id)) {
                this.props.setTab(id);
            }
        });
    };

    handleTabChange = (event, tabId) => {
        this.props.setTab(tabId);
        this.setState({
            redirect: true
        });
    };

    showNotification = () => {
        this.setState(state=>({notification_count: state.notification_count+1}))
    };

    onDatesChange = ({ startDate, endDate }) => {
        this.startDate = startDate;
        this.endDate = endDate;
        this.setState({ startDate, endDate });
    };

    onDatesClose = () => {
        this.props.setSelectedDates(this.startDate, this.endDate);
    };

    getStartDay = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days.indexOf(this.props.customerStartDay);
    };

    onFocusChange = (focusedInput) => {
        this.setState({ focusedInput });

        const startDayInt = this.getStartDay();
        if (this.state.startDayOfWeek !== startDayInt) {
            this.setState({ startDayOfWeek: startDayInt });
        }
    };

    isInvalidDate = (date) => {
        const currYear = new Date().getFullYear();
        const lastYearStart = moment(new Date(currYear - 1, 0, 1));
        const nextYearEnd = moment(new Date(currYear + 2, 0, 1));
        return !(date.isAfter(lastYearStart) && date.isBefore(nextYearEnd));
    };

    render() {
        const url = this.props.url.replace(/\//g, '');
        if (this.state.redirect && url !== this.props.currentTab) {
            return <Redirect to={`/${this.props.currentTab}`} />
        }

        return ( // TODO: have global enums for links
            <HeaderWrapper>
                <Header
                    className='customHeaderBar' id='topbar_header'>
                         <Box>
                            
                    {(url.indexOf('reporting') !=0 ) ?

                            < PlannableCustomerSelect />
                       : null}
                        </Box>
                    <Box>
                        {(url === 'baseline_volume_planning' || url.startsWith('bspevent') || url.startsWith('promoevent'))
                            && !!(this.props.selectedCustomer) ?
                            <Tabs value={this.props.currentTab || 'baseline_volume_planning'}
                                onChange={this.handleTabChange}
                                indicatorColor='primary'
                                variant='fullWidth'>
                                {this.props.planningConfig.BVP ?
                                    <Tab id='tab_bvp' className='customHeaderText customTabs' label='Baseline Volume'
                                        value={'baseline_volume_planning'} /> : null}
                                {this.props.planningConfig.BSP ?
                                    <Tab id='tab_bspevent' className='customHeaderText customTabs' label='Base Spends'
                                        value={'bspevent'} /> : null}
                                {this.props.planningConfig.TP ?
                                    <Tab id='tab_promoevent' className='customHeaderText customTabs' label='Trade Promotion'
                                        value={'promoevent'} /> : null}
                            </Tabs>
                            : null}

                    </Box>
                    <Box>
                        <IconButton id='btn_copy' className='customHeaderText' aria-label='mass copy'>
                            <FileCopyOutlinedIcon />
                        </IconButton>
                        <IconButton id='btn_restore' className='customHeaderText' aria-label='restore'>
                            <RestoreIcon />
                        </IconButton>
                        <Badge overlap={"circle"} badgeContent={this.state.notification_count} color="secondary">
                            <IconButton id='btn_notify' className='customHeaderText' aria-label='notification'>
                                <NotificationsNoneIcon />
                            </IconButton>
                        </Badge>
                        <TopbarUser />
                    </Box>
                </Header>
            </HeaderWrapper>
        );
    }
}

const mapStateToProps = state => {
    return {
        currentTab: state.App.currentTab,
        collapsed: state.App.collapsed,
        openDrawer: state.App.openDrawer,
        startDate: state.Bvp.startDate,
        endDate: state.Bvp.endDate,
        customerStartDay: state.PlannableCustomers.customerStartDay,
        selectedCustomer: state.PlannableCustomers.selectedCustomer,
        planningConfig: state.PlannableCustomers.planningConfig,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setTab: (tabId) => dispatch(appActions.setTab(tabId)),
        setSelectedDates: (startDate, endDate) => dispatch(bvpActions.setSelectedDatesAction(startDate, endDate)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Topbar);