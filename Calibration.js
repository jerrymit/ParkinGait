/*
THE FOLLOWING CODE IS FOR CALIBRATING A USER'S GAIT CONSTANT AND DETECTION THRESHOLD

***PLEASE NOTE: CALIBRATION CURRENTLY NEEDS TO OCCUR BY WALKING FIVE (5) METERS***
        This can be changed in future / added manually by the user using some textbox

The comments below ought to give a good enough explaination for what is happening but if
not, the following is a summary:

- First, the user will need to enter in their "Step Length Goal" and choose whether they
    are putting their phone in their pocket or on their side using the switch buttons
- The user will then press the "Start Collecting" button
- After THREE seconds, the phone will vibrate, indicating that the user can begin walking
- The user will then walk 5 meters, press "Stop Collecting" and then hit Calibrate

Step Detection Algorithm
A. Phone in Pocket
  - the algorithm uses z-axis data (ie the axis perpendicular to the phone face) 
  - it first finds the mean of the data (minus 1 second)
  - then it finds all the times the data crossed the mean, indicating a step was taken
  - the DISTANCE_THRESHOLD ensures noise is filtered out in case the data is a bit messy
      around the average point
  - the times at which these steps are detected are saved
  - the algorithm then takes these timestamps and finds the average between them
  - it then finds the average step distance by dividing the 5 meters by the number of steps detected
  - the gaitConstant is then found by taking this average step length and dividing it by the average step time
  - both the gaitConstant and the mean of the data (DETECTION_THRESHOLD) are stored in Firebase

B. Phone on Side
  - the algorithm uses y-axis data (ie the axis perpendicular to the long edge of the phone) 
  - it first finds half of the mean of the positive data (minus 1 second)
  - then it finds all the times peaks occuring over the mean, indicating a step was taken
  - the DISTANCE_THRESHOLD ensures noise is filtered out in case the data is a bit messy
      around the peak point
  - the times at which these steps are detected are saved
  - the algorithm then takes these timestamps and finds the average between them
  - it then finds the average step distance by dividing the 5 meters by the number of steps detected
  - the gaitConstant is then found by taking this average step length and dividing it by the average step time
  - both the gaitConstant and the mean of the data (DETECTION_THRESHOLD) are stored in Firebase
*/


/// IMPORTS ///
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, TextInput, View, Keyboard, Vibration, Dimensions } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { initializeApp, firebase } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get, push } from "firebase/database";
import { auth, db } from "./firebase";
import MultiSwitch from 'react-native-multiple-switch'
import { useNavigation } from "@react-navigation/native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

/// FIREBASE CONFIGURATIONS ///
const firebaseConfig = {
    apiKey: "AIzaSyDZN7DF3BPdseBoCP2l6A3Yjbc0ECb0pMk",
    authDomain: "parkingait.firebaseapp.com",
    databaseURL: "https://parkingait-default-rtdb.firebaseio.com",
    projectId: "parkingait",
    storageBucket: "parkingait.appspot.com",
    messagingSenderId: "987453531886",
    appId: "1:987453531886:web:d641b174467546f31fb5ff",
    measurementId: "G-1C4E694RZQ"
  };
  const app = initializeApp(firebaseConfig);
  // Initialize Realtime Database and get a reference to the service
  const database = getDatabase(app);
  
  // Constants for the detection method //
  const ACCELEROMETER_TIMING = 100; // ms
    // note that this could be changed, but not sure there is reason to atm //
  const ACCELEROMETER_HZ = 1000 / ACCELEROMETER_TIMING;
  const DISTANCE_TRAVELED = 5;
  const DISTANCE_THRESHOLD = 3;
  const USER_HEIGHT = 1.778 // m
  const METERS_TO_INCHES = 39.3701 // constant, no units
  let ScreenHeight = Dimensions.get("window").height;
  
  const Calibration = ({ navigation }) => {
    if (auth.currentUser==null){
      navigation.navigate("LogIn");
    }else{
    }
    const RegisterRef = ref(db, 'users/'+(auth.currentUser.email).replaceAll(".","~"));
    get(RegisterRef).then((snapshot) => {
      // Extract the data from the snapshot
      const RegisterData = snapshot.val();
      setGoalStep(RegisterData.height * 0.414); // this is a recommended step length goal; 0.414 comes from the literature
    });

    // Setting State Constants which are more robust //
    const [isCollecting, setIsCollecting] = useState(false);
    const [accelerometerData, setAccelerometerData] = useState([]);
    const [goalStep, setGoalStep] = useState(0);
    const [newGoalStep, setNewGoalStep] = useState(0);

    // for feedback
    const [feedbackData, setFeedbackData] = useState({ steps: 0, strideLength: 0, gaitConstant: 0 });
    const [showFeedback, setShowFeedback] = useState(false);


    // Determining location of the phone //
    const loc_plac = ['In Pocket/In Front', 'In Waist/On Side'];
    const [locationPlacement, setLocationPlacement] = useState(loc_plac[0]);
    
    const handleToggleCollecting = () => {
      // Resets values based on whether the patient is calibrating or not //
      if (!isCollecting) {
        setAccelerometerData([]);
        setTimeout(() => {
          setIsCollecting(true);
          Vibration.vibrate(100);
        }, 3000);
      } else {
        setIsCollecting(false);
      }
    };
  
    useEffect(() => {
      let subscription;
      if (isCollecting) {
        // If collecting, get acceleromter data
        subscription = Accelerometer.addListener((accelerometerData) => {
          setAccelerometerData((prevData) => [...prevData, accelerometerData]);
        });
        Accelerometer.setUpdateInterval(ACCELEROMETER_TIMING); //this is where the interval can be changed manually
      } else {
        subscription?.remove();
      }
      return () => subscription?.remove();
    }, [isCollecting]);
  
    const handleLogData = () => {
      // handleLogData == Calibrate
      // extract the x, y, and z values from the accelerometer data
      const xData = accelerometerData.map(data => data.x.toFixed(4));
      const yData = accelerometerData.map(data => parseFloat(data.y.toFixed(4)));
      const zData = accelerometerData.map(data => parseFloat(data.z.toFixed(4)));
      const magnitudeData = accelerometerData.map(data => Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z));
        // not currenlty used

      // Can be uncommented if one wants to print the data //
      /*console.log("X data: " + xData);
      console.log("Y data: " + yData);
      console.log("Z data: " + zData);
      console.log("Mag data: " + magnitudeData);*/

      // For when the phone is in a pocket or on the front (ie the FACE of the front faces where the person is going) //
      if (locationPlacement == loc_plac[0]){
        // this is needed to turn the data into an array and then find the mean, other methods don't seem to work
        const average = array => array.slice(0, array.length - 10).reduce((a, b) => a + b, 0) / (array.length - 10);
          // I take off about a second from the data as it takes roughly that long (maybe even a bit longer) for someone
          //    to take their phone out of their pocket and turn off the collecting of data
        const mean = average(zData);

        const steps = [];

        for (let z = 0, index = 0; z < zData.length-10; z++) {
          if (z - index > DISTANCE_THRESHOLD && ((zData[z] < mean && zData[z-1] > mean) || (zData[z-1] < mean && zData[z] > mean))) {
            // if the time stamps are far enough apart AND the data is crossing the mean line... //
            //step//
            steps.push((z+(z-1))/2);
            index = z;
          }
        }

        const times = [];
        for (let i = 1; i < steps.length; i++) {
          let diff = steps[i] - steps[i-1];
          times.push(diff/10); // divide by 10 to get seconds
        }

        const av_time = times.reduce((a, b) => a + b, 0) / times.length;
        const av_step_length = DISTANCE_TRAVELED / steps.length;
        const av_step_length_in = av_step_length * METERS_TO_INCHES;
        console.log(av_step_length_in);

        const gaitConstant = av_step_length / av_time;
        console.log(gaitConstant);
        
        // Send relavant data to Firebase //
        set(ref(database, 'users/'+(auth.currentUser.email).replaceAll(".","~")+'/Calibration'), {
          gaitConstant: gaitConstant,
          Threshold: mean,
          GoalStep: newGoalStep,
          Placement: locationPlacement,
        });

        setFeedbackData({
            steps: steps.length,
            strideLength: av_step_length,
            gaitConstant: gaitConstant
        });
        
        setShowFeedback(true);
        

        // Navigate to Main Page //
        console.log("MOVING TO MAINPAGE");
        navigation.navigate("MainPage");
      }

      // For when the phone is in a thigh holder or on the side (ie the FACE of the front faces perpendicular of where the person is facing) //
      if (locationPlacement == loc_plac[1]){
        // Find only the positive values in the yData //
        const positiveYs = yData.filter((value) => value > 0);
        const average = array => array.slice(0, array.length - 10).reduce((a, b) => a + b, 0) / (array.length - 10);
        const mean_half = average(positiveYs) / 2;

        const steps = [];
        for (let y = 0, index = 0; y < yData.length-10; y++) {
          if (y - index > DISTANCE_THRESHOLD && yData[y] > mean_half && yData[y] > yData[y-1] && yData[y] < yData[y+1]) {
            steps.push(y);
            index = y;
          }
        }

        const times = [];
        for (let i = 1; i < steps.length; i++) {
          let diff = steps[i] - steps[i-1];
          times.push(diff/10);
        }

        const av_time = times.reduce((a, b) => a + b, 0) / times.length;
        const av_step_length = DISTANCE_TRAVELED / steps.length;
        const av_step_length_in = av_step_length * METERS_TO_INCHES;
        console.log(av_step_length_in);

        const gaitConstant = av_step_length / av_time;
        console.log(gaitConstant);
    
        set(ref(database, 'users/'+(auth.currentUser.email).replaceAll(".","~")+'/Calibration'), {
          gaitConstant: gaitConstant,
          Threshold: mean_half,
          GoalStep: newGoalStep,
          Placement: locationPlacement,
        });


        console.log("MOVING TO MAINPAGE");
        navigation.navigate("MainPage");
      }
    }

    let feedbackUI;
    if (showFeedback) {
    feedbackUI = (
        <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>Steps Detected: {feedbackData.steps}</Text>
            <Text style={styles.feedbackText}>Stride Length: {feedbackData.strideLength.toFixed(2)} meters</Text>
            <Text style={styles.feedbackText}>Gait Constant: {feedbackData.gaitConstant.toFixed(2)}</Text>
            <Text style={styles.feedbackText}>Does this seem accurate?</Text>
            <View style={styles.feedbackButtons}>
                <TouchableOpacity style={styles.feedbackButton} onPress={() => setShowFeedback(false)}>
                    <Text style={styles.buttonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.feedbackButton} onPress={() => {
                    setShowFeedback(false);
                    setIsCollecting(false);
                    setAccelerometerData([]);
                }}>
                    <Text style={styles.buttonText}>No, recalibrate</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}


    return (
      <View style={styles.container}>
          <Text style={styles.titleText}> Calibration </Text>
          <Text style={styles.text}>Recommended Step Length: {goalStep.toFixed(0)} inches</Text>
          <View style={styles.inputContainer}>
          <View style={styles.rowContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Step Length Goal (inches)"
                      keyboardType="numeric"
                      maxLength={3}
                      returnKeyType={ 'done' }
                      onChangeText={newText => setNewGoalStep(newText)}
                    />
            </View>
          </View>
          <Text style={{ color: '#000000' , fontSize : 20, paddingTop: ScreenHeight * 0.04, }}>Phone Location </Text>
          <MultiSwitch
            items={loc_plac}
            value={locationPlacement}
            onChange={(val1) => setLocationPlacement(val1)}
          />
          <Text numberOfLines={5}></Text>
          <TouchableOpacity style={styles.button} onPress={handleToggleCollecting}>
            <Text style={styles.buttonText}>{isCollecting ? 'Stop Collecting' : 'Start Collecting'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLogData}>
            <Text style={styles.buttonText}>Calibrate</Text>
          </TouchableOpacity>
          
      </View>
    );
};

export default Calibration;
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      // backgroundColor: "#222831",
      backgroundColor: "#ffffff",
      borderWidth: 2,
      height: ScreenHeight,
    },
    formContainer: {
      flex: 1,
      backgroundColor: "#ffffff",
      marginTop: ScreenHeight * 0.08,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0,
    }, 
    input: {
      backgroundColor: "white",
      borderWidth: 3,
      paddingHorizontal: 15,
      paddingVertical: 5,
      borderRadius: 10,
      marginTop: 5,
    },
    rowContainer: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    inputContainer: {
      width: "90%",
      backgroundColor: "#ffffff",
      marginTop: 20,
      alignItems: "stretch",
      borderWidth: 0,
    },
    buttonContainer: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
      paddingHorizontal: 50,
    },
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#4CAF50',
      padding: 10,
      borderRadius: 5,
      margin: 10,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    text: {
      color: '#000',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 16,
    },
    titleText: {
      color: "#30475E",
      fontWeight: "600",
      fontSize: 24,
      marginBottom: 15,
    },
  });
