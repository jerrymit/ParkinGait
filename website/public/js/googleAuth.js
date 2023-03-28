var provider = new firebase.auth.GoogleAuthProvider();
// Initialize Firebase
const config = {
  apiKey: "AIzaSyDZN7DF3BPdseBoCP2l6A3Yjbc0ECb0pMk",
  authDomain: "parkingait.firebaseapp.com",
  databaseURL: "https://parkingait-default-rtdb.firebaseio.com",
  projectId: "parkingait",
  storageBucket: "parkingait.appspot.com",
  messagingSenderId: "987453531886",
  appId: "1:987453531886:web:d641b174467546f31fb5ff",
  measurementId: "G-1C4E694RZQ"
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
    console.log(user);
    if (user){
      var database = firebase.database();
      var userID = user.uid;
      var userRef = database.ref('users');
      userRef.once("value")
      .then(function(snapshot) {

        var hasDevice = snapshot.child(userID).exists();
        console.log(hasDevice);
        if (hasDevice){
          window.location.href = 'newPatient.html';
        }
        else{
          window.location.href = 'newPatient.html'
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
