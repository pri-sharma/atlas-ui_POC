importScripts('https://www.gstatic.com/firebasejs/7.5.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.5.0/firebase-messaging.js');

firebase.initializeApp({
    messagingSenderId: "582590414146",
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {

     console.log(payload);
     console.log('[firebase-messaging-sw.js] Received background message ', payload);
     // Customize notification here
      const notificationTitle = payload.data.title;
      const notificationOptions = {
        body: payload.data.body,
        icon: '/atlas_logo_full_color_icon.ico'
      };

      return self.registration.showNotification(notificationTitle,
        notificationOptions);
});