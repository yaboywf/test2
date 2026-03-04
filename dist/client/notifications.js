importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyAISfmXUtURhQg78JjB6duTTluS_yCfV10",
    authDomain: "bb21-portal.firebaseapp.com",
    projectId: "bb21-portal",
    messagingSenderId: "788369154043",
    appId: "1:788369154043:web:074c564964936c20b6f55e",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    const data = payload.data;

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        image: data.image
    });
});