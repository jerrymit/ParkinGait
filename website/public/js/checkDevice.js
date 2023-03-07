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

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log(user);
  } else {
    // No user is signed in.
  }
});
/*var submitRecommendation = function () {

  // Get input values from each of the form elements
  var user = firebase.auth().currentUser;
  var database = firebase.database();
  var userID = user.uid;
  var userRef = database.ref('users/'+userID);
  var link = $("#deviceID").val();
  // Push a new recommendation to the database using those values
  console.log(link);
  console.log(userID);
  userRef.set({
    [link]: true
  });
};*/
$(window).on('load',function () {

  // Find the HTML element with the id recommendationForm, and when the submit
  // event is triggered on that element, call submitRecommendation.
  $("#deviceForm").submit(function(event){
    event.preventDefault();
    var user = firebase.auth().currentUser;
    var database = firebase.database();
    var userID = user.uid;
    var userRef = database.ref('users/'+userID);
    var link = $("#deviceID").val();
    // Push a new recommendation to the database using those values
    console.log(link);
    console.log(userID);
    userRef.set({
      device: link
    });
  });
});
function signout(){
  firebase.auth().signOut().then(function() {
  window.location.href="index.html"
  }).catch(function(error) {
    // An error happened.
  });
}
/*function getDevice(){
  var newDeviceID = document.getElementById("deviceID").value;
  console.log(newDeviceID);
  var user = firebase.auth().currentUser;
  var database = firebase.database();
  var userID = user.uid;
  var userRef = database.ref('users/'+userID);
  console.log(userID)
  userRef.set({
    [newDeviceID]: true
  },function(error){
    if (error){
      console.log("wet");

    }
    else{
      console.log("good");
      //window.location.href = "data"
    }
  });
  console.log("added");


}
*/
