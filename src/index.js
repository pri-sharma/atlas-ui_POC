import React from 'react';
import ReactDOM from 'react-dom';
import DashApp from './dashApp';
import * as serviceWorker from './serviceWorker';
import 'antd/dist/antd.css';
import {store} from './redux/store';
import {firebase, googleAuthProvider} from './firebase/firebase';
import {login, logout} from './redux/auth/actions';
import {saveFirebaseToken} from './redux/userSettings/actions';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-theme-bootstrap.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import {LicenseManager} from 'ag-grid-enterprise';
import '@material-ui/icons';
import * as plannableCustomerActions from "./redux/plannableCustomers/actions";

LicenseManager.setLicenseKey(process.env.REACT_APP_AGGRID_KEY);

let isRendered = false;
const renderApp = () => {
    if (!isRendered) {
        ReactDOM.render(<DashApp/>, document.getElementById('root'));
        isRendered = true;
    }
};

/**
 * Generate token for auth user (force refresh) and store in localstorage/redux
 * @param user
 */
const generateAndStoreToken = user => {
    user.getIdToken(true).then((idToken) => {
        localStorage.setItem('idToken', idToken);
        store.dispatch(login(user.uid, user.email, user.photoURL, idToken));
        store.dispatch(saveFirebaseToken({"token": localStorage.getItem('fcmToken')}));
        store.dispatch(plannableCustomerActions.getPlannableCustomersAction(user.email));
    });
};

let interval;
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        generateAndStoreToken(user);
        clearInterval(interval); // clear existing interval if exists
        interval = setInterval(() => generateAndStoreToken(user), 1000 * 60 * 45); // set interval to refresh token before it expires
    } else {
        firebase.auth().signInWithRedirect(googleAuthProvider).then();
    }
    renderApp();
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.register();
