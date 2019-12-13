import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import appActions from '../../redux/app/actions';
import { Layout } from 'antd';
import options from './options';
import SiderWrapper from './sidebar.style';
import Menu from '../../components/uielements/menu';
import Scrollbars from '../../components/utility/customScrollBar';
import LabeledLogoIcon from '../../components/labeledIcon/LabeledLogoIcon';
import LabeledIcon from '../../components/labeledIcon/LabeledIcon';
import * as actions from '../../redux/reporting/actions';
import '../ag_grid_style.css';

const { Sider } = Layout;
const { SubMenu } = Menu;
const {
    changeOpenKeys,
    changeCurrent
} = appActions;

class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.onOpenChange = this.onOpenChange.bind(this);
        this.clearClick = this.clearClick.bind(this);
        this.state = {
            reportStateList: []
        }

    }

    async componentDidMount() {
        await this.props.getUserInfo();
        await this.props.getGridViewState(false);
    }

    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.user != this.props.user) {
            this.setState({ userID: nextProps.user.user_id });
            localStorage.setItem('UserID', nextProps.user.user_id);
        }
        if (nextProps.gridviewstate != this.props.gridviewstate) {
            this.setState({ reportStateList: nextProps.gridviewstate });
        }
    }

    handleClick(e) {
        if (e.key === 'admin') {
            window.location.href = process.env.REACT_APP_API_URL + '/admin';  // Lol we'll do it live
        }
        this.props.changeCurrent([e.key]);
    }

    clearClick() {
        this.props.changeCurrent([null]);
    }

    onOpenChange(newOpenKeys) {
        const { app, changeOpenKeys } = this.props;
        const latestOpenKey = newOpenKeys.find(
            key => !(app.openKeys.indexOf(key) > -1)
        );
        const latestCloseKey = app.openKeys.find(
            key => !(newOpenKeys.indexOf(key) > -1)
        );
        let nextOpenKeys = [];
        if (latestOpenKey) {
            nextOpenKeys = this.getAncestorKeys(latestOpenKey).concat(latestOpenKey);
        }
        if (latestCloseKey) {
            nextOpenKeys = this.getAncestorKeys(latestCloseKey);
        }
        changeOpenKeys(nextOpenKeys);
    }

    getAncestorKeys = key => {
        const map = {
            sub3: ['sub2']
        };
        return map[key] || [];
    };

    getReportingMenuItem(option) {
        return (<Menu.Item id= {'reporting' + option.singleOption.view_id} key={'reporting' + option.singleOption.view_id}>
            <Link to={{
                pathname: `/reporting/view`,
                state: {
                    id: option.singleOption.id,
                    viewid: option.singleOption.view_id
                }
            }}></Link>
            {option.singleOption.view_name}</Menu.Item>);
    }
    getMenuItem = ({ singleOption }) => {
        const { currentTab } = this.props.app;
        const { key, label, icon } = singleOption;
        if (key != "reporting") {
            return (
                <Menu.Item key={key} id={'menuitem_' + key}  className='customClass'>
                    <Link
                        to={(currentTab && key === 'baseline_volume_planning') ? `/${this.props.app.currentTab}` : key === 'admin' ? '' : `/${key}`}>
                    </Link>
                    <LabeledIcon icon={icon} label={label} />
                </Menu.Item>
            );
        }
        else {
            return (<SubMenu className='customClass' id={'reporting'}
                key={'reporting'}
                title={
                    <div>
                        <Link to={{
                            pathname: `/reporting/list`,
                        }}>  <LabeledIcon icon={icon} label={label} /></Link>

                    </div>
                } >

                {this.props.gridviewstate.filter(x => x.user_id == 0).map(singleOption =>
                    this.getReportingMenuItem({ singleOption })
                )}

            </SubMenu>)
        }
    };
    render() {
        const { app } = this.props;

        return (
            <SiderWrapper>
                <Sider className='customSiderBar' width='72' id='sidebar_menus'
                       /*breakpoint='lg' collapsedWidth='0'*/ mode='dark'>
                    <Scrollbars>
                        <LabeledLogoIcon clearClickCB={this.clearClick} />
                        <Menu onClick={this.handleClick}
                            theme='dark'
                            className='customAntMenu'
                            selectedKeys={app.current}
                            onOpenChange={this.onOpenChange}>
                            {options.map(singleOption =>
                                this.getMenuItem({ singleOption })
                            )}
                        </Menu>
                    </Scrollbars>
                </Sider>
            </SiderWrapper>
        );
    }
}

export default connect(
    state => ({
        app: state.App,
        height: state.App.height,
        user: state.GridView.user,
        gridviewstate: state.GridView.gridviewstate
    }),
    { changeOpenKeys, changeCurrent, getGridViewState: actions.GetGridViewStateAction, getUserInfo: actions.GetUserInfoAction }
)(Sidebar);