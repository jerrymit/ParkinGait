import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";/*
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import { Menu } from "./screens/Menu";
import Registro from "./screens/Registro";
import UserData from "./screens/UserData";*/
import MainPage from "./MainPage";
import LogIn from "./LogIn";
import Register from "./Register";
import Calibration from "./Calibration";
import Dashboard from "./Dashboard";
import EditProfile from "./EditProfile";
import ForgotPassword from "./ForgetPassword";


//import Dashboard from "./Dashboard";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          options={{ headerShown: false }}
          name="Login"
          component={LogIn}
        />

        <Stack.Screen name="Calibration" component={Calibration} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="ForgetPassword" component={ForgotPassword} />
        <Stack.Screen name="MainPage" component={MainPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});