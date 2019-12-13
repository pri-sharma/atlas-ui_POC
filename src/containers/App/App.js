import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Layout} from 'antd';
import styled, {ThemeProvider} from 'styled-components';
import {ThemeProvider as MaterialThemeProvider} from '@material-ui/styles';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import AppRouter from './AppRouter';
import {themeConfig} from '../../settings';
import themes from '../../settings/themes';
import './global.css';
import {logout} from '../../redux/auth/actions';
import CustomizedDialog from '../../components/customizedDialog/CustomizedDialog';
import Customize from '../../images/Customize.svg';
import ReactTimeout from 'react-timeout';

const Box = styled.div`
  background-color: ${props => props.theme.palette.primary};
`;

export class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: themes[themeConfig.normal],
            isDialogOpen: false,
            secondsRemaining: 600,
        };
        this.showTheme = localStorage.getItem('atlasThemes');

        // set 2 hour timer for popup
        this.interval = null;
        this.props.setTimeout(this.showTimeoutWarning, 1000 * 60 * 55 * 2);
    }

    onSubmit = () => {
        this.props.clearInterval(this.interval);
        this.setState({isDialogOpen: false});
    };

    showTimeoutWarning = () => {
        this.props.clearInterval(this.interval);
        this.interval = this.props.setInterval(() => this.setState({secondsRemaining: this.state.secondsRemaining - 1}), 1000);
        this.setState({isDialogOpen: true});
    };

    changeTheme = theme => event => {
        switch (theme) {
            case 'light':
                this.setState({theme: themes[themeConfig.light]});
                break;
            case 'dark':
                this.setState({theme: themes[themeConfig.dark]});
                break;
            default:
                this.setState({theme: themes[themeConfig.normal]});
                break;
        }
    };

    handleExpire = () => {
        this.setState({isDialogOpen: false, secondsRemaining: 600});
        this.props.logout();
    };

    render() {
        const {url} = this.props.match;

        if (this.state.secondsRemaining <= 0) {
            this.handleExpire();
        }
        return (
            <MaterialThemeProvider theme={themes[themeConfig.material]}>
                <ThemeProvider theme={this.state.theme}>
                    {(this.showTheme) ? <Box>
                        Themes:
                        <button onClick={this.changeTheme('normal')}>Normal</button>
                        <button onClick={this.changeTheme('light')}>Light</button>
                        <button onClick={this.changeTheme('dark')}>Dark</button>
                    </Box> : null}
                    <Layout>
                        <Sidebar url={url}/>
                        <Layout>
                            <Topbar url={url}/>
                            <AppRouter url={url} isLoggedIn={this.props.isLoggedIn}/>
                        </Layout>
                    </Layout>
                    <CustomizedDialog onSubmit={this.onSubmit}
                                      submitText={'CONTINUE'}
                                      open={this.state.isDialogOpen}
                                      img={Customize}
                                      title={'Session Expiring'}>
                        <div style={{padding: '15px', textAlign: 'center'}}>
                            <p>
                                Your session will expire in
                                &nbsp;
                                <b>
                                    {Math.floor(this.state.secondsRemaining / 60).toString().padStart(2, '0')}:
                                    {(this.state.secondsRemaining % 60).toString().padStart(2, '0')}
                                </b>
                                <br></br>
                                Would you like to continue your session?
                            </p>
                        </div>
                    </CustomizedDialog>
                </ThemeProvider>
            </MaterialThemeProvider>
        );
    }
}

export const mapStateToProps = state => {
    return {
        auth: state.Auth,
        height: state.App.height
    }
};

export default ReactTimeout(connect(mapStateToProps, {logout})(App));
