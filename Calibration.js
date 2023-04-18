import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { initializeApp, firebase } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set } from "firebase/database";
import { auth } from "./firebase";
import { useNavigation } from "@react-navigation/native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

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
  
  
  const ACCELEROMETER_TIMING = 100; // ms
  const ACCELEROMETER_HZ = 1000/ACCELEROMETER_TIMING;
  const WINDOW_SIZE = 5;
  const USER_HEIGHT = 1.778 // m
  const METERS_TO_INCHES = 39.3701 // constant, no units
  //ADD IN?
  const DISTANCE_TRAVELED = 5 // m
  //const STEP_SIZE = ??? // m
const Calibration = ({ navigation }) => {
    const [isCollecting, setIsCollecting] = useState(false);
    const [accelerometerData, setAccelerometerData] = useState([]);
    
    const handleToggleCollecting = () => {
      if (!isCollecting) {
        setAccelerometerData([]);
        setTimeout(() => {
          setIsCollecting(true);
        }, 2000);
      } else {
        setIsCollecting(false);
      }
    };
  
    useEffect(() => {
      let subscription;
      if (isCollecting) {
        subscription = Accelerometer.addListener((accelerometerData) => {
          setAccelerometerData((prevData) => [...prevData, accelerometerData]);
        });
        Accelerometer.setUpdateInterval(ACCELEROMETER_TIMING);
      } else {
        subscription?.remove();
      }
      return () => subscription?.remove();
    }, [isCollecting]);
  
    const handleLogData = () => {
      const xData = accelerometerData.map(data => data.x.toFixed(4));
      const yData = accelerometerData.map(data => data.y.toFixed(4)-1);
      //console.log(yData);
      const zData = accelerometerData.map(data => data.z.toFixed(4));
      const magnitudeData = accelerometerData.map(data => Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z));
  
      /*console.log("X data: " + xData);
      console.log("Y data: " + yData);
      console.log("Z data: " + zData);
      console.log("Mag data: " + magnitudeData);*/
      
      //const yfiltered = filterData(yData);
      
      /*function filterData(data) {
        const filteredData = data.filter(item => !isNaN(item));
        const windowSize = WINDOW_SIZE;
        const window = new Array(windowSize).fill(0);
        const filtered = [];
      
        for (let i = 0; i < filteredData.length; i++) {
          window.shift();
          window.push(parseFloat(filteredData[i]));
          if (i >= windowSize - 1) {
            const average = window.reduce((a, b) => a + b) / windowSize;
            filtered.push(parseFloat(average.toFixed(4)));
          }
        }
        return filtered;
      }*/
      
      //const DETECTION_THRESHOLD = 0.05; // gs
      const DETECTION_THRESHOLD = calculateMAD(yData);
      console.log(DETECTION_THRESHOLD);
  
      function calculateMAD(data) {
        const median = calculateMedian(data);
        const absoluteDeviations = data.map((x) => Math.abs(x - median));
        const mad = calculateMedian(absoluteDeviations);
        const mean = calculateMean(data);
        return mean;
      }
      
      function calculateMedian(data) {
        const sortedData = data.slice().sort((a, b) => a - b);
        const middle = Math.floor(sortedData.length / 2);
      
        if (sortedData.length % 2 === 0) {
          return (sortedData[middle - 1] + sortedData[middle]) / 2;
        }
      
        return sortedData[middle];
      }    
  
      function calculateMean(data){
        const absoluteValues = data.map(x => Math.abs(x));
        const sum = absoluteValues.reduce((accumulator, currentValue) => accumulator + currentValue);
        const mean = sum / data.length;
  
        return mean;
      }
  
      const gaitConstant = DISTANCE_TRAVELED / (yData.length / ACCELEROMETER_HZ);    
      //const gaitConstant1 = 0.45;
      console.log(gaitConstant);
  
      set(ref(database, 'users/'+auth.currentUser.uid+'/Calibration'), {
        gaitConstant: gaitConstant,
        Threshold: DETECTION_THRESHOLD,
      });
      console.log("MOVING TO MAINPAGE");
      navigation.navigate("MainPage");
    }

    return (
        <View style={styles.container}>
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
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
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
      margin: 10,
    },
  });
  