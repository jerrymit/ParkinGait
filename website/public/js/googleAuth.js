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
var user = firebase.auth().currentUser;

/*firebase.auth().onAuthStateChanged(user => {
if(user) {
  var database = firebase.database();
  var userID = user.uid;
  var userRef = database.ref('users');
  userRef.once("value")
  .then(function(snapshot) {

    var hasDevice = snapshot.child(userID).exists();
    console.log(hasDevice);
    if (hasDevice){
      window.location.href = 'dashboard.html';
    }
    else{
      window.location.href = 'newDevice.html'
    }
    //var test = snapshot.hasChild("test"); // false
  });
}
});*/
function googleSignIn(){
  console.log("hello")
  //window.location.href = "newdevice"
  firebase.auth().onAuthStateChanged(user => {
    if (user){
      var database = firebase.database();
      var userID = user.uid;
      var userRef = database.ref('users');
      userRef.once("value")
      .then(function(snapshot) {

        var hasDevice = snapshot.child(userID).exists();
        console.log(hasDevice);
        if (hasDevice){
          window.location.href = 'dashboard.html';
        }
        else{
          window.location.href = 'newDevice.html'
        }
        //var test = snapshot.hasChild("test"); // false
      });
    }
    else{

    firebase.auth().signInWithRedirect(provider);
  }
});
/*firebase.auth().getRedirectResult().then(function(result) {
  if (result.credential) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // ...


  }
  // The signed-in user info.
  var user = result.user;
  console.log(user);
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;


  // ...
});*/

}
function signedin(){
  console.log("yo");
}
