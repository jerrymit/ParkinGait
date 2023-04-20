import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View,Switch} from 'react-native';
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

const ACCELEROMETER_TIMING = 100; // ms
const ACCELEROMETER_HZ = 1000 / ACCELEROMETER_TIMING;
const USER_HEIGHT = 1.778 // m
const METERS_TO_INCHES = 39.3701 // constant, no units
//import { gaitConstant, DETECTION_THRESHOLD } from './Calibration.js';
let gaitConstant, DETECTION_THRESHOLD, goalStep;


//const gaitConstant = 1;
//const DETECTION_THRESHOLD = 0.05; //gs
const DISTANCE_THRESHOLD = 1; // represents distance between peaks/valleys to filter out noise


const MainPage = ({ navigation }) => {
  if (auth.currentUser==null){

    navigation.navigate("LogIn");
  }else{
  }
  const calibrationRef = ref(db, 'users/'+auth.currentUser.uid+'/Calibration');
  get(calibrationRef).then((snapshot) => {
    // Extract the data from the snapshot
    const calibrationData = snapshot.val();
    gaitConstant = calibrationData.gaitConstant;
    DETECTION_THRESHOLD = calibrationData.Threshold;
    //console.log(gaitConstant + " " + DETECTION_THRESHOLD);
  })

  const userRef = ref(db, 'users/'+auth.currentUser.uid);
  get(userRef).then((snapshot) => {
    // Extract the data from the snapshot
    const userData = snapshot.val();
    setGoalStep(userData.goalStep);
    //console.log(gaitConstant + " " + DETECTION_THRESHOLD);
  })
  //console.log(goalStep);
  const [isWalking, setIsWalking] = useState(false);
  const [accelerometerData, setAccelerometerData] = useState([]);
  const [stepLength, setStepLength] = useState(0);
  const [stepLengthFirebase, setStepLengthFirebase] = useState([]);
  const [peakTimes, setPeakTimes] = useState([]);
  const [waitingFor1stValue, setWaitingFor1stValue] = useState(false);
  const [waitingFor2ndValue, setWaitingFor2ndValue] = useState(false);
  const [waitingFor3rdValue, setWaitingFor3rdValue] = useState(false);
  const [sound, setSound] = useState();
  const [goalStep, setGoalStep] = useState(0);

  const items = ['Vibrate Phone', 'Vibrate Wristband', 'No Vibrations']
  const [vibrateValue, setVibrateValue] = useState(items[0])

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => {setIsEnabled(previousState => !previousState); }

  const [range, setRange] = useState(30);

  

  const [lastPeakSign, setLastPeakSign] = useState(-1); // -1 for positive, 1 for negative
  const [lastPeakIndex, setLastPeakIndex] = useState(0);
  const [isFirstPeakPositive, setIsFirstPeakPositive] = useState(false);

  const xData = accelerometerData.map(data => data.x.toFixed(4));
  const yData = accelerometerData.map(data => parseFloat(data.y.toFixed(4)) - 1);
  const yDataNext = (yData.length > 0) ? yData[yData.length-1] : 0;
  const yDataCurr = (yData.length > 1) ? yData[yData.length-2] : 0;
  const yDataPrev = (yData.length > 2) ? yData[yData.length-3] : 0;
  const DataTime = (yData.length > 0) ? (yData.length/ACCELEROMETER_HZ) : 0;
  const zData = accelerometerData.map(data => data.z.toFixed(4));

  const postListRef = ref(db, 'users/'+auth.currentUser.uid+'/StepLength/');
  const newPostRef = push(postListRef);
  //const magnitudeData = accelerometerData.map(data => Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z));

  if (isWalking){
    //console.log(stepLengthFirebase);
    /*set(ref(db, 'users/'+auth.currentUser.uid+'/StepLength/stepLength/'), {
      1: 2,
    });*/
    /*const postListRef = ref(db, 'users');
    const newPostRef = push(postListRef);
    set(newPostRef, {
        hello:"hello"
    });
    
    set(ref(db, 'users/'+userData.uid+"/"), {
      email: userData.email,
      name: userData.name,
      height: userData.height,
      goalStep: userData.goalStep
    });*/
    
  }

  


  if (waitingFor1stValue && yDataCurr > yDataPrev && yDataCurr > yDataNext && yDataCurr > DETECTION_THRESHOLD){
    if (!isFirstPeakPositive || lastPeakIndex === -1) {
      if(lastPeakSign == -1){
        if (peakTimes.length == 0) {
          setPeakTimes([...peakTimes, DataTime]);
        }
        else {
          setPeakTimes((prevData) => [...prevData, DataTime]);
        }
        //console.log(peakTimes);
        setLastPeakIndex(yData.length);
        setLastPeakSign(1);
        setIsFirstPeakPositive(true);
        setWaitingFor1stValue(false);
        setWaitingFor2ndValue(true);
        //setWaitingFor3rdValue(true);
      }
    }
  } 

  if (waitingFor2ndValue && yDataCurr < yDataPrev && yDataCurr < yDataNext && yDataCurr < -0.1) {
    if (isFirstPeakPositive && yData.length - lastPeakIndex >= DISTANCE_THRESHOLD) {
      if (lastPeakSign == 1) {
        setPeakTimes((prevData) => [...prevData, DataTime]);
        setLastPeakIndex(yData.length);
        setLastPeakSign(-1);
        setWaitingFor2ndValue(false);
        setWaitingFor3rdValue(true);
      }
    }
  }
 
  if (waitingFor3rdValue && yDataCurr > yDataPrev && yDataCurr > yDataNext && yDataCurr > DETECTION_THRESHOLD){
    if (yData.length - lastPeakIndex >= DISTANCE_THRESHOLD) {
      if(lastPeakSign == -1){
        setPeakTimes((prevData) => [...prevData, DataTime]);
        setLastPeakIndex(yData.length);
        setLastPeakSign(1);
        setWaitingFor3rdValue(false);

        /*const peak2 = peakTimes[peakTimes.length - 1];
        const peak1 = peakTimes[peakTimes.length - peakTimes.length];
        const peakBetweenTime = peak2 - peak1;
        //const gaitConstant = 0.45 * USER_HEIGHT + 0.15 * peakBetweenTime - 0.35;
        const gaitConstant = parseFloat((USER_HEIGHT * 0.45) / peakBetweenTime);
        const stepLengthest = USER_HEIGHT * gaitConstant * METERS_TO_INCHES;
        
        setStepLength(stepLengthest);
        setStepLengthFirebase((prevStep) => [...prevStep, stepLengthest]);
        console.log(stepLength);
        setPeakTimes([peakTimes[peakTimes.length - 1]]);*/
      }
    }
  } 

  if (peakTimes.length == 3){
    console.log(peakTimes);
    const peak2 = peakTimes[peakTimes.length - 1];
    const peak1 = peakTimes[peakTimes.length - peakTimes.length];
    const peakBetweenTime = peak2 - peak1;

    //const gaitConstant = 0.45 * USER_HEIGHT + 0.15 * peakBetweenTime - 0.35;
    //const gaitConstant = parseFloat((USER_HEIGHT * 0.45) / peakBetweenTime);
    const stepLengthest = peakBetweenTime * gaitConstant * METERS_TO_INCHES;
        
    setStepLength(stepLengthest);
    setStepLengthFirebase((prevStep) => [...prevStep, stepLengthest]);
    sec = Date.now();
    set(newPostRef, {
      [sec]:stepLengthest
    });
    console.log("STEP");
    console.log(stepLengthest);

    if (stepLengthest< 100){
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      )
    }
    else{
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setWaitingFor2ndValue(true);
    setIsFirstPeakPositive(true);

    setPeakTimes([peakTimes[peakTimes.length - 1]]);
  }

  const handleToggleWalking = () => {
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
      }, 2000);
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
  async function playSound() {
    //console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync( require('./beep.mp3'), { shouldPlay: true }
    );
    setSound(sound);

    //console.log('Playing Sound');
    sound.playAsync();
  }

  useEffect(() => {
    let subscription;
    const timer = setInterval(() => {
      //console.log(range);
      
      if (isEnabled){
        //Haptics.selectionAsync();
        //console.log("hey");
        /*Haptics.notificationAsync(
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        )*/
        playSound();
        //console.log('Loading Sound');
        //playSound();


      }   
    }, 60.0/range*1000)
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

  const handleLogData = () => {
    console.log(yData);
  }
  const moveToRegister = () => {
    navigation.navigate("Register");
  }
  const moveToDashboard = () => {
    navigation.navigate("Dashboard");
  }
  console.log(goalStep);

  return (
    <View style={styles.container}>
      <Text style={{ color: '#000000' , fontSize : 40, paddingTop: 40}}> Gait Tracker </Text>
      <Text style={{ color: '#000000' , fontSize : 40, padding: 0}}> Home Page </Text>
      <TouchableOpacity style={styles.button} onPress={handleToggleWalking}>
        <Text style={styles.buttonTextBig}>{isWalking ? 'Stop Walking' : 'Start Walking'}</Text>
      </TouchableOpacity>
      <Text style={{fontSize: 20, paddingTop: 30}}>Step Length Estimate: {stepLength.toFixed(2)} inches</Text>
      <Text style={{ color: '#808080' , fontSize : 15, padding: 10}}>Goal Step Length: {goalStep} inches </Text>

      <Text style={{fontSize:30, paddingTop: 50, paddingBottom:20}}>Start Metronome</Text>
      <Switch
        trackColor={{false: '#767577', true: '#81b0ff'}}
        thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }], paddingTop: 0 }}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
      <Text style={{ color: '#000000' , fontSize : 20, padding: 10}}> {Math.floor(range)} Steps per Minute </Text>
      <Slider
        style={{width: 200, height: 40, paddingBottom: 40, paddingTop: 0}}
        minimumValue={30}
        maximumValue={120}
        minimumTrackTintColor="#81b0ff"
        maximumTrackTintColor="#000000"
        onValueChange={(value)=>setRange(value)}
      />


<Text style={{ color: '#000000' , fontSize : 60, padding: 10}}> </Text>
      <MultiSwitch
            style={{paddingTop:50}}
            items={items}
            value={vibrateValue}
            onChange={(val) => setVibrateValue(val)}
          />

<View style={{ flexDirection:"row" }}>   
      <TouchableOpacity style={styles.button} onPress={moveToRegister}>
        <Text style={styles.buttonText}>{'Change User Information'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={moveToDashboard}>
        <Text style={styles.buttonText}>{'Go to Dashboard'}</Text>
      </TouchableOpacity>
      </View>
      <Text style={{ color: '#808080' , fontSize : 15, padding: 10}}>User ID: {auth.currentUser.uid} </Text>

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
    padding: 10,
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
    margin: 10,
  },
});