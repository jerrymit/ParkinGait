/// IMPORTS ///
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View,Switch, Vibration} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { initializeApp, firebase } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get, push,child } from "firebase/database";
import { auth , db} from "./firebase";
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useNavigation } from "@react-navigation/native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword,createUserWithEmailAndPassword  } from "firebase/auth";
import {
  KeyboardAvoidingView,
  TextInput,
  Image,
  Dimensions,
} from "react-native";
import MultiSwitch from 'react-native-multiple-switch'
import Slider from '@react-native-community/slider';

/// DEFINING CONSTANTS ///
let ScreenHeight = Dimensions.get("window").height;
const ACCELEROMETER_TIMING = 100; // ms
const ACCELEROMETER_HZ = 1000 / ACCELEROMETER_TIMING;
const USER_HEIGHT = 1.778 // m
const METERS_TO_INCHES = 39.3701 // constant, no units
let gaitConstant, DETECTION_THRESHOLD, goalStep, placement;
const DISTANCE_THRESHOLD = 3; // represents distance between "steps" to filter out noise

// for smoothing the accelerometer data
const movingAverage = (data, windowSize) => {
    let result = [];
    for (let i = 0; i < data.length - windowSize + 1; i++) {
        let currentWindow = data.slice(i, i + windowSize);
        let windowAvg = currentWindow.reduce((a, b) => a + b) / windowSize;
        result.push(windowAvg);
    }
    return result;
};


const MainPage = ({ navigation }) => {
  if (auth.currentUser==null){
    navigation.navigate("LogIn");
  }else{
  }
  const calibrationRef = ref(db, 'users/'+(auth.currentUser.email).replaceAll(".","~")+'/Calibration');
    // the replace all is important as React Native/Firebase doesn't like the dots in emails
  get(calibrationRef).then((snapshot) => {
    // Extract the data from the snapshot of Firebase
    const calibrationData = snapshot.val();
    gaitConstant = calibrationData.gaitConstant;
    DETECTION_THRESHOLD = calibrationData.Threshold;
    placement = calibrationData.Placement;
    setGoalStep(parseFloat(calibrationData.GoalStep));
  })

  /// DEFINFING STATE CONSTANTS (more robust than regulat consts) ///
  const [isWalking, setIsWalking] = useState(false);
  const [accelerometerData, setAccelerometerData] = useState([]);
  const [stepLength, setStepLength] = useState(0);
  const [stepLengthFirebase, setStepLengthFirebase] = useState([]);
  const [peakTimes, setPeakTimes] = useState([]);
  const [waitingFor1stValue, setWaitingFor1stValue] = useState(false);
  const [waitingFor2ndValue, setWaitingFor2ndValue] = useState(false);
  const [waitingFor3rdValue, setWaitingFor3rdValue] = useState(false); // not sure this is needed anymore
  const [sound1, setSound1] = useState();
  const [sound2, setSound2] = useState();
  const [goalStep, setGoalStep] = useState(0);
  const vib_choices = ['Over Step Goal', 'Under Step Goal'];
  const [vibrateOption, setVibrationOption] = useState(vib_choices[0]);
  const items = ['Vibrate Phone', 'Vibrate Wristband', 'No Vibrations'];
  const [vibrateValue, setVibrateValue] = useState(items[0]);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => {setIsEnabled(previousState => !previousState); }
  const [range, setRange] = useState(30);
  const [lastPeakSign, setLastPeakSign] = useState(-1); // -1 for positive, 1 for negative
  const [lastPeakIndex, setLastPeakIndex] = useState(0);
  const [isFirstPeakPositive, setIsFirstPeakPositive] = useState(false); // also not needed most likely
  
  // Extracting the Accemerometer Data needed //
  //const xData = accelerometerData.map(data => parseFloat(data.x.toFixed(4)));
  //const yData = accelerometerData.map(data => parseFloat(data.y.toFixed(4)));

  // x, y, z data after smoothing
  const windowSize = 5;
  const xDataRaw = accelerometerData.map(data => data.x.toFixed(4));
  const yDataRaw = accelerometerData.map(data => parseFloat(data.y.toFixed(4)));
  const zDataRaw = accelerometerData.map(data => parseFloat(data.z.toFixed(4)));
  
  const xData = movingAverage(xDataRaw, windowSize);
  const yData = movingAverage(yDataRaw, windowSize);
  const zData = movingAverage(zDataRaw, windowSize);

  const yDataNext = (yData.length > 0) ? yData[yData.length-1] : 0;
  const yDataCurr = (yData.length > 0) ? yData[yData.length-2] : 0;
  const yDataPrev = (yData.length > 1) ? yData[yData.length-3] : 0;
  
  // note that the "Curr" is really the prev reading since we cannot predict the future 
  //const zData = accelerometerData.map(data => parseFloat(data.z.toFixed(4)));
  //const zDataNext = (zData.length > 0) ? zData[zData.length-1] : 0;
  const zDataCurr = (zData.length > 0) ? zData[zData.length-1] : 0;
  const zDataPrev = (zData.length > 1) ? zData[zData.length-2] : 0;
  const DataTime = (zData.length > 0) ? (zData.length/ACCELEROMETER_HZ) : 0;




  // Refs for extracting data from Firebase //
  const postListRef = ref(db, 'users/'+(auth.currentUser.email).replaceAll(".","~")+'/StepLength/');
  const newPostRef = push(postListRef);

  /// STEP DETECTION / STEP LENGTH ESTIMATE METHOD ///

  // For when the phone is in a pocket or on the front (ie the FACE of the front faces where the person is going) //
  if (placement == "In Pocket/In Front") {
    // finds times when average is passed //
    if (waitingFor1stValue && ((zDataCurr < DETECTION_THRESHOLD && zDataPrev > DETECTION_THRESHOLD) || (zDataCurr > DETECTION_THRESHOLD && zDataPrev < DETECTION_THRESHOLD))){
      if (lastPeakIndex === -1 || zData.length - lastPeakIndex > DISTANCE_THRESHOLD) {
        // for some reason this lastPeakSign is needed despite it seeming redundant with the "waitingforXvalue" consts //
        if(lastPeakSign == -1){
          if (peakTimes.length == 0) {
            setPeakTimes([...peakTimes, DataTime]);
          }
          else {
            setPeakTimes((prevData) => [...prevData, DataTime]);
          }
          setLastPeakIndex(zData.length);
          setLastPeakSign(1);
          setIsFirstPeakPositive(true);
          setWaitingFor1stValue(false);
          setWaitingFor2ndValue(true);
        }
      }
    } 

    if (waitingFor2ndValue && ((zDataCurr < DETECTION_THRESHOLD && zDataPrev > DETECTION_THRESHOLD) || (zDataCurr > DETECTION_THRESHOLD && zDataPrev < DETECTION_THRESHOLD))){
      if (zData.length - lastPeakIndex > DISTANCE_THRESHOLD) {
        if (lastPeakSign == 1) {
          setPeakTimes((prevData) => [...prevData, DataTime]);
          setLastPeakIndex(zData.length);
          setLastPeakSign(-1);
          setWaitingFor2ndValue(false);
          setWaitingFor1stValue(true);
        }
      }
    }

    // If two steps detected, estimate step length //
    if (peakTimes.length == 2){
      console.log(peakTimes);
      // for whatever reason it's necessary to create each peak
      const peak2 = peakTimes[peakTimes.length - 1];
      const peak1 = peakTimes[peakTimes.length - peakTimes.length];
      const peakBetweenTime = peak2 - peak1;
      const stepLengthest = peakBetweenTime * gaitConstant * METERS_TO_INCHES;
          
      setStepLength(stepLengthest);
      setStepLengthFirebase((prevStep) => [...prevStep, stepLengthest]);
      sec = Date.now();
      set(newPostRef, {
        [sec]:stepLengthest // may want to change this to the StepLengthFirebase value for better UI on the Firebase end
      });
      console.log("STEP");
      console.log(stepLengthest);

      // Figures out when the phone should vibrate/make a sound //
      if (vibrateOption == vib_choices[0]){
        if (vibrateValue == items[0]){
          if (stepLengthest > goalStep){
            Vibration.vibrate(50);
            playSound2();
          }
        }
      }
      if (vibrateOption == vib_choices[1]){
        if (vibrateValue == items[0]){
          if (stepLengthest < goalStep){
            Vibration.vibrate(50);
            playSound1();
          }
        }
      }

      setWaitingFor1stValue(true);
      // sets PeakTimes to the last value, ie last step //
      setPeakTimes([peakTimes[peakTimes.length - 1]]);
    }

    // Getting sounds //
    async function playSound1() {
      const { sound1 } = await Audio.Sound.createAsync( require('./beep2.mp3'), { shouldPlay: true }
      );
      setSound1(sound1);
      sound1.playAsync();
    }
  
    async function playSound2() {
      const { sound2 } = await Audio.Sound.createAsync( require('./beep3.mp3'), { shouldPlay: true }
      );
      setSound2(sound2);
      sound2.playAsync();
    }
  }

  // For when the phone is in a thigh holder or on the side (ie the FACE of the front faces perpendicular of where the person is facing) //
  if (placement == "In Waist/On Side"){
    // finds peaks //
      // code works in a similar way as to the front facing detection besides just locating the steps //
    if (waitingFor1stValue && yDataCurr > DETECTION_THRESHOLD && yDataCurr > yDataPrev && yDataCurr < yDataNext){
      if (lastPeakIndex === -1 || yData.length - lastPeakIndex > DISTANCE_THRESHOLD) {
        if(lastPeakSign == -1){
          if (peakTimes.length == 0) {
            setPeakTimes([...peakTimes, DataTime]);
          }
          else {
            setPeakTimes((prevData) => [...prevData, DataTime]);
          }
          setLastPeakIndex(yData.length);
          setLastPeakSign(1);
          setWaitingFor1stValue(false);
          setWaitingFor2ndValue(true);
        }
      }
    }

    if (waitingFor2ndValue && yDataCurr >  DETECTION_THRESHOLD && yDataCurr > yDataPrev && yDataCurr < yDataNext){
      if (yData.length - lastPeakIndex > DISTANCE_THRESHOLD) {
        if (lastPeakSign == 1) {
          setPeakTimes((prevData) => [...prevData, DataTime]);
          setLastPeakIndex(yData.length);
          setWaitingFor1stValue(true);
          setWaitingFor2ndValue(false);
          setLastPeakSign(-1);
        }
      }
    }

    if (peakTimes.length == 2){
      console.log(peakTimes);
      const peak2 = peakTimes[peakTimes.length - 1];
      const peak1 = peakTimes[peakTimes.length - peakTimes.length];
      const peakBetweenTime = peak2 - peak1;
      const stepLengthest = peakBetweenTime * gaitConstant * METERS_TO_INCHES;
          
      setStepLength(stepLengthest);
      setStepLengthFirebase((prevStep) => [...prevStep, stepLengthest]);
      sec = Date.now();
      set(newPostRef, {
        [sec]:stepLengthest
      });
      console.log("STEP");
      console.log(stepLengthest);

      if (vibrateOption == vib_choices[0]){
        if (vibrateValue == items[0]){
          if (stepLengthest > goalStep){
            Vibration.vibrate(50);
            playSound2();
          }
        }
      }
      if (vibrateOption == vib_choices[1]){
        if (vibrateValue == items[0]){
          if (stepLengthest < goalStep){
            Vibration.vibrate(50);
            playSound1();
          }
        }
      }

      setWaitingFor1stValue(true);
      setPeakTimes([peakTimes[peakTimes.length - 1]]);
    }

    async function playSound1() {
      const { sound1 } = await Audio.Sound.createAsync( require('./beep2.mp3'), { shouldPlay: true }
      );
      setSound1(sound1);
      sound1.playAsync();
    }
  
    async function playSound2() {
      const { sound2 } = await Audio.Sound.createAsync( require('./beep3.mp3'), { shouldPlay: true }
      );
      setSound2(sound2);
      sound2.playAsync();
    }
  }

  const handleToggleWalking = () => {
    // code resets values based on where the patient is walking or not //
    if (!isWalking) {
      setAccelerometerData([]);
      setPeakTimes([]);
      setStepLength(0);
      setWaitingFor1stValue(false);
      setTimeout(() => {
        setIsWalking(true);
        setWaitingFor1stValue(true);
        setWaitingFor2ndValue(false);
        setWaitingFor3rdValue(false);
        setIsFirstPeakPositive(false);
        setLastPeakSign(-1);
        setLastPeakIndex(-1);
        Vibration.vibrate(100);
      }, 3000);
    } else {
      setIsWalking(false);
      setWaitingFor1stValue(false);
      setWaitingFor2ndValue(false);
      setWaitingFor3rdValue(false);
      setIsFirstPeakPositive(false);
      setLastPeakSign(1);
      setLastPeakIndex(-1);
    }
  };

  useEffect(() => {
    let subscription;
    // Metronome //
    const timer = setInterval(() => {      
      if (isEnabled){
        playSound1();
      }   
    }, 60.0/range*1000)

    // If walking, get data from accelerometer //
    if (isWalking) {
      subscription = Accelerometer.addListener((accelerometerData) => {
        setAccelerometerData((prevData) => [...prevData, accelerometerData]);
      });
      Accelerometer.setUpdateInterval(ACCELEROMETER_TIMING);
    } else {
      subscription?.remove();
    }
    return () => {
      subscription?.remove();
      clearInterval(timer);
    }
  }, [isWalking, isEnabled, range]);

  // Code not used but can be added as a button easily to display the accelerometer data to manually check accuracy //
  /*const handleLogData = () => {
    console.log(xData);
    console.log(yData);
    console.log(xData);
  }*/

  /// NAVIGATION FUNCTIONS ///
//   const moveToRegister = () => {
//     navigation.navigate("Register");
//   }
  const moveToRegister = () => {
    navigation.navigate("EditProfile");
  }
  const moveToForgetPassword = () => {
    navigation.navigate("ForgetPassword");
  }
  const moveToDashboard = () => {
    navigation.navigate("Dashboard");
  }
  const moveToCalibration = () => {
    navigation.navigate("Calibration");
  }

  /// CREATING THE MAIN PAGE AND STYLES ///

  return (
    <View style={styles.container}>
      <Text style={{ color: '#000000' , fontSize : 35, paddingTop: ScreenHeight * 0.02}}> Gait Tracker Home Page </Text>
      <TouchableOpacity style={styles.button} onPress={handleToggleWalking}>
        <Text style={styles.buttonTextBig}>{isWalking ? 'Stop Walking' : 'Start Walking'}</Text>
      </TouchableOpacity>
      <Text style={{fontSize: 20, paddingTop: ScreenHeight * 0.02}}>Step Length Estimate: {stepLength.toFixed(2)} inches</Text>
      <Text style={{ color: '#808080' , fontSize : 16, padding: ScreenHeight * 0.005}}>Goal Step Length: {goalStep} inches </Text>

      <Text style={{fontSize:30, paddingTop: ScreenHeight * 0.05, paddingBottom:ScreenHeight * 0.02}}>Start Metronome</Text>
      <Switch
        trackColor={{false: '#767577', true: '#81b0ff'}}
        thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }], paddingTop: 0 }}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
      <Text style={{ color: '#000000' , fontSize : 20, padding: ScreenHeight * 0.01}}> {Math.floor(range)} Steps per Minute </Text>
      <Slider
        style={{width: 200, height: 40, paddingBottom: ScreenHeight * 0.05, paddingTop: 0}}
        minimumValue={30}
        maximumValue={120}
        minimumTrackTintColor="#81b0ff"
        maximumTrackTintColor="#000000"
        onValueChange={(value)=>setRange(value)}
      />
<Text style={{ color: '#000000' , fontSize : 20, paddingTop: ScreenHeight * 0.02, }}>Vibrate If... </Text>
      <MultiSwitch
            items={vib_choices}
            value={vibrateOption}
            onChange={(val1) => setVibrationOption(val1)}
          />

<Text style={{ color: '#000000' , fontSize : 20, paddingTop: ScreenHeight * 0.05}}>Vibration Mode</Text>
      <MultiSwitch
            style={{paddingTop:ScreenHeight * 0.005}}
            items={items}
            value={vibrateValue}
            onChange={(val) => setVibrateValue(val)}
          />

    <View style={{ flexDirection:"row", paddingTop: ScreenHeight * 0.05 }}>   
      <TouchableOpacity style={styles.button2} onPress={moveToRegister}>
        <Text style={styles.buttonText}>{'Change User Information'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button2} onPress={moveToDashboard}>
        <Text style={styles.buttonText}>{'Go to Dashboard'}</Text>
      </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button2} onPress={moveToCalibration}>
        <Text style={styles.buttonText}>{'Recalibrate'}</Text>
      </TouchableOpacity>


      <Text style={{ color: '#808080' , fontSize : 15, marginTop:ScreenHeight * 0.05}}>User ID: {auth.currentUser.email} </Text>
    </View>
  );
};

export default MainPage;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  buttonBig: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: ScreenHeight * 0.01,
    borderRadius: 5,
    margin: 10,
    alignItems: 'flex-start'
  },
  button2: {
    backgroundColor: '#4CAF50',
    padding: ScreenHeight * 0.01,
    borderRadius: 5,
    margin: 10,
    alignItems: 'flex-start'
  },  
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonTextBig: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20
  },
  text: {
    margin: 1,
  },
});
