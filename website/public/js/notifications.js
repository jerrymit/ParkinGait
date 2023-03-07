
var provider = new firebase.auth.GoogleAuthProvider();
// Initialize Firebase
var config = {
  apiKey: "AIzaSyB7GImj_BP6Ba7Uo5hobfFDvyMVJodnUCQ",
  authDomain: "posturenotifications.firebaseapp.com",
  databaseURL: "https://posturenotifications.firebaseio.com",
  projectId: "posturenotifications",
  storageBucket: "posturenotifications.appspot.com",
  messagingSenderId: "923180751319"
};
firebase.initializeApp(config);
Notification.requestPermission(function(status) {
    console.log('Notification permission status:', status);
});
/*if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js')
  .then(function(registration) {
    console.log('Registration successful, scope is:', registration.scope);
  })
  .catch(function(error) {
    console.log('Service worker registration failed, error:', error);
  });
}
const messaging = firebase.messaging();
messaging.usePublicVapidKey("BAorOegm1hEZX9fj8SokV0EpsfFWVpPu5RZNSN5sYaA7FBtQDQ2VzbK0-SWVVtXaLxzcm0ox2FcWhTWj-1hfRM4");
/*messaging.requestPermission().then(function() {
  console.log('Notification permission granted.');
  // TODO(developer): Retrieve an Instance ID token for use with FCM.
  // ...
}).catch(function(err) {
  console.log('Unable to get permission to notify.', err);
});

*/
function permissionNotifications() {
  try {
    messaging.requestPermission();
    var token;
    messaging.getToken().then(function(currentToken) {
  if (currentToken) {
    token = currentToken;
  } else {
    // Show permission request.
    console.log('No Instance ID token available. Request permission to generate one.');
  }
}).catch(function(err) {
  console.log('An error occurred while retrieving token. ', err);
});
    var user = firebase.auth().currentUser;
    var database = firebase.database();
    var userID = user.uid;
    var userRef = database.ref('users/'+userID);
    var deviceID;

    userRef.once("value")
    .then(function(snapshot) {

      deviceID = snapshot.val().device;
      var tokenRef = database.ref('devices/'+deviceID+'/tokens/'+userID);
      tokenRef.set({
        tokenID:token,
        on:"true"
      });
    });
  } catch (error) {
    console.error(error);
  }
}


/*
function displayNotification() {
  if (!("Notification" in window)) {
    alert("This browser does not support system notifications");
  }
  if (Notification.permission == 'granted') {

    var notification = new Notification("ErgoFix", {
        body: "Lean Left",
        icon: "images/icons/icon-google.png"
    });
  }
}
*/
