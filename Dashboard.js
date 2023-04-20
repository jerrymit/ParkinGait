import { useNavigation } from "@react-navigation/core";
import React, { useEffect, useState } from "react";

const screenWidth = Dimensions.get("window").width;
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Button,
  Image,
} from "react-native";
import { auth, db } from "./firebase";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import { getDatabase, ref, set, get, push,child } from "firebase/database";
import MultiSwitch from 'react-native-multiple-switch'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword,createUserWithEmailAndPassword  } from "firebase/auth";

let goalStep;
// Initialize Realtime Database and get a reference to the service
const Dashboard = ({ navigation }) => {
  const items = ['Day', 'Month','Year']
  const [value, setValue] = useState(items[0])
  const [data, setData] = useState([1,2,3]);
  const [goodSteps, setGoodSteps] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [percentGood, setPercentGood] = useState(0);
  const [asymmetry, setAsymmetry] = useState(0);
  const userRef = ref(db, 'users/'+auth.currentUser.uid);
  const [pieData, setPieData] = useState({labels:["NA"], data:[0]});
  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false // optional
  };
  get(userRef).then((snapshot) => {
    // Extract the data from the snapshot
    const userData = snapshot.val();
    goalStep = userData.goalStep;
    //console.log(gaitConstant + " " + DETECTION_THRESHOLD);
  })

  useEffect(() => {

    const dataRef = ref(db, 'users/'+auth.currentUser.uid+'/StepLength');
    get(dataRef).then((snapshot) => {

      let d = [];
      fullData = snapshot.val();
      let values = Object.values(fullData);
      //numSteps = 0;
      setAsymmetry(0);
      setTotalSteps(values.length);
      good = 0;
      timeInterval = 0;
      switch(value){
        case "Day":
          timeInterval = 24;
          break;
        case "Month":
          timeInterval = 730;
          case "Year":
            timeInterval = 8760;

      }
      console.log(values);
      left = true;
      leftSum = 0;
      rightSum = 0;
      for (i in values){

        //setAsymmetry(10);
        //setAsymmetry(0);
        //console.log(asymmetry);
        for (j in values[i]){
          k = j;
          v = values[i][k];
          /*console.log("Y");
          console.log(k);
          console.log(v);*/
          
          console.log("v, diff");
          console.log(v);
          console.log(Date.now()-parseInt(k))
          if (Date.now()-parseInt(k)< timeInterval*1000*3600 && v < 700 ){
            d.push(v);
            
            if (v > goalStep){
             good+=1;
            }
            //yes = asymmetry
            //setAsymmetry(yes+2);
            //console.log("asym");
            //console.log(asymmetry);
            if (left){
              leftSum +=v;
              //setAsymmetry(asymmetry+v);
            }
            else{
              rightSum+=v
              //setAsymmetry(asymmetry-v);
            }
            left=!left
         }
        }

        setPercentGood(good/d.length);
        setTotalSteps(d.length);
        setAsymmetry(Math.abs((leftSum-rightSum)/(leftSum+rightSum)));
        /*console.log("YUH");
        console.log(parseInt(i)-Date.now());
        console.log(values[i]);
        console.log(parseInt(i));
        console.log(Date.now());
        console.log((Date.now()-parseInt(Object.keys(values)[i]))/1000/3600)
        */
      }
      console.log(d);
      if (d.length==0){
        setData([0]);
      }
      else{
        setData(d);
      }
      setPieData({
        labels:["Percent Time with Correct Step Length", "Percent Asymmetry"],
        data:[percentGood, asymmetry]
      })
      console.log(pieData);
      setGoodSteps(good);
      console.log(goodSteps);
      console.log(totalSteps);
      console.log(asymmetry);
      //data.push(4);
      //console.log(data);
      /*let lastValuesIndex = values.length - 1;
      values.map((item, index) => {
        d.push({ x: index, y: item.bpm });
      });
      setFbData(d);
      setSensorData(values[lastValuesIndex]);

      setIsLoading(false);*/
    });
  }, [value]);
  //console.log(data);
  /*useEffect(() => {
    if (sensorData) {
      setTempValue(sensorData.temp);
      setSpo2Value(sensorData.spo2);
      setBpmValue(sensorData.bpm);
    }
  }, [fbData, sensorData]);*/

  // const navigation = useNavigation();
  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => alert(error.message));
  };

  return (
    
    <View style={styles.container}>
      <MultiSwitch
      items={items}
      value={value}
      onChange={(val) => setValue(val)}
    />
    <Text style={{ color: '#000000' , fontSize : 10, padding: 10}}> </Text>
      <Text style={{ color: '#000000' , fontSize : 30, padding: 10}}>Step Length Graph</Text>
  
  <LineChart
    data={{

      datasets: [
        {
          data: data
        }
      ]
    }}
    width={Dimensions.get("window").width} // from react-native
    height={220}
    yAxisSuffix=" in"
    yAxisInterval={1} // optional, defaults to 1
    chartConfig={{
      backgroundColor: "#e26a00",
      backgroundGradientFrom: "#fb8c00",
      backgroundGradientTo: "#ffa726",
      decimalPlaces: 2, // optional, defaults to 2dp
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#ffa726"
      }
    }}
    bezier
    style={{
      marginVertical: 8,
      borderRadius: 16
    }}


  />


<Text style={{ color: '#000000' , fontSize : 10, padding: 10}}> </Text>
<Text style={{ color: '#000000' , fontSize : 30, padding: 10}}>Progress Bars</Text>
  <ProgressChart
  data={{
        labels:["Score: ", "Asymm:"],
        data:[percentGood, asymmetry],
      }}
  width={screenWidth}
  height={220}
  strokeWidth={16}
  radius={32}
  chartConfig={chartConfig}
  hideLegend={false}
/>
<Text>{Math.floor(asymmetry*100)}% Asymmetry</Text>
<Text>{Math.floor(percentGood*100)}% Time with Correct Step Length</Text>
        

      {/* <Text>Userx: {auth.currentUser?.email}</Text> */}

      {/* <TouchableOpacity onPress={handleSignOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#dedad2",
  },

  button: {
    backgroundColor: "#198fc2",
    width: "60%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  itemText: {
    color: "black",
    fontWeight: "700",
    fontSize: 16,
  },
  logo: {
    width: 58,
    height: 58,
  },

  sensorValuecontainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    width: "90%",
  },
  sensorDataContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#198fc2",
    width: "90%",
    borderWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 10,
  },
  button: {
    backgroundColor: "#0782F9",
    width: "60%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  sensorValueText: {
    color: "white",
    fontWeight: "700",
    fontSize: 28,
    paddingRight: 10,
  },
  sensorMeasurementUnitText: {
    color: "white",
    fontWeight: "400",
    fontSize: 18,
  },
  sensorMeasurementUnitTitle: {
    color: "#99EAF3",
    fontWeight: "700",
    fontSize: 22,
  },
  horizontalLine: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255 ,0.3)",
    alignSelf: "stretch",
    marginBottom: 15,
  },
});