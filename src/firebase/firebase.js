import React, {Component} from 'react';
import * as firebase from 'firebase';
import 'firebase/messaging';
import { notification } from 'antd';

const openNotification = (placement, body, title) => {
  notification.info({
    message: title,
    description: body,
    duration: 10000,
    placement,
  });
};

let firebaseConfig = null;
if (process.env.REACT_APP_IS_APP_ENGINE === "true") {
    firebaseConfig = {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOM,
        databaseURL: process.env.REACT_APP_FIREBASE_DB_URL,
        projectId: process.env.REACT_APP_FIREBASE_PROJ_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MSG_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID
    };
} else {
    firebaseConfig = {
        apiKey: "AIzaSyC59SUHJNpdaJSdYMpzXZJnVlX_efSfrJI",
        authDomain: "cp-cdo-develop-atlas-b80a.firebaseapp.com",
        databaseURL: "https://cp-cdo-develop-atlas-b80a.firebaseio.com",
        projectId: "cp-cdo-develop-atlas-b80a",
        storageBucket: "cp-cdo-develop-atlas-b80a.appspot.com",
        messagingSenderId: "582590414146",
        appId: "1:582590414146:web:86b60d233b920a36dfdcdb"
    };
}

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    console.log('Notification permission granted.');
    return messaging.getToken().then(function (token)
    {
        console.log(token, 'firebase token generated here');
        localStorage.setItem('fcmToken', token);
    })
  } else {
    console.log('Unable to get permission to notify.');
  }
});

navigator.serviceWorker.addEventListener("message", (message) => {
    console.log(message);
    const title = message.data.firebaseMessagingData.notification.title;
    const body = message.data.firebaseMessagingData.notification.body;
    console.log(title, body, 'onMessage');
    openNotification('topRight', body, title)
});

messaging.onMessage((payload) => {
    console.log('Message received. ', payload);
});

const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

export { firebase, googleAuthProvider };