import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Button,
  Dimensions,
} from "react-native";
import { getDatabase, ref, set,push, child, setValue } from "firebase/database";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword,createUserWithEmailAndPassword  } from "firebase/auth";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { auth, db } from "./firebase";


let ScreenHeight = Dimensions.get("window").height;
import { useForm, Controller } from "react-hook-form";
import DropDownPicker from "react-native-dropdown-picker";

const requiredMessage = "This field is required";
const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const Register = ({ navigation }) => {
  const [emailx, setEmailx] = useState("");
  const [passwordx, setPasswordx] = useState("");
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [goalStep, setGoalStep] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      height: "",
      email: "",
      password: "",
      passwordRepeat: "",
      goalStep: ""
    },
    // defaultValues: {
    //   name: "",
    //   gender: "",
    //   email: "",
    //   password: "",
    //   passwordRepeat: "",
    // },
  });

  const password = useRef({});
  password.current = watch("password", "");

  let addItem = (userData) => {

    /*dbUsers = ref(db,'users/' + userData.uid);
    dbUsersRef = push(dbUsers);
    console.log(userData.uid);
    set(dbUsersRef, {
      email: userData.email,
      name: userData.name,
      height: userData.height,
    })*/
    //console.log(userData);
    set(ref(db, 'users/'+(userData.email).replace(".","~")+"/"), {
      email: userData.email,
      name: userData.name,
      height: userData.height,
      goalStep: userData.goalStep
    });

  };
  const onSubmit = (data) => {

    handleSignUp(data.email, data.password, data.name, data.height, data.goalStep);
    console.log(data.goalStep);
    navigation.navigate("Calibration");
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
    
      if (user) {
        console.log("DID IT");
        // navigation.replace("Menu");

        //navigation.navigate("Calibration");
      }
      else{
        console.log("Didnt");
      }
    });

    return unsubscribe;
  }, []);

  const handleSignUp = (userEmail, userPassword, name, height, goalStep) => {
    //console.log("SIGN UP)");
    createUserWithEmailAndPassword(auth, userEmail, userPassword)
  .then((userCredential) => {
        // Signed in 
        
        // ...
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
        // ..
    });
    //const user = userCredential.user;
    //console.log(user);
    const userData = {
        email: userEmail,
        name: name,
        height: height,
        goalStep: goalStep,
        uid: auth.currentUser.uid
      };
      addItem(userData);
      
  };

  const handleLogin = () => {
    auth
      .signInWithEmailAndPassword(emailx, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log("Logged in with:", user.email);
      })
      .catch((error) => alert(error.message));
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        // contentContainerStyle={styles.container}
        // scrollEnabled={true}
        // enableAutomaticScroll={true}
        // enableOnAndroid={true}
      >
        <View style={styles.formContainer}>
          <Text style={styles.titleText}>Registration</Text>
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              rules={{
                required: {
                  value: true,
                  message: requiredMessage,
                },
                pattern: {
                  value: regex,
                  message: "It's not a valid email",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Email"
                />
              )}
              name="email"
            />
            {errors.email && (
              <Text style={styles.validationMsgText}>
                {errors.email.message}
              </Text>
            )}

            <View style={styles.rowContainer}>
              <View style={{ width: "48%" }}>
                <Controller
                  control={control}
                  rules={{
                    required: requiredMessage,
                    validate: (value) =>
                      value.length >6 || "Password is too short",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Password"
                      secureTextEntry
                    />
                  )}
                  name="password"
                />
                {errors.password && (
                  <Text style={styles.validationMsgText}>
                    {errors.password.message}
                  </Text>
                )}
              </View>

              <View style={{ width: "48%"}}>
                <Controller
                  control={control}
                  rules={{
                    required: requiredMessage,
                    validate: (value) =>
                      value === password.current || "Passwords does not match",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Confirm Password"
                      secureTextEntry
                    />
                  )}
                  name="passwordRepeat"
                />
                {errors.passwordRepeat && (
                  <Text style={styles.validationMsgText}>
                    {errors.passwordRepeat.message}
                  </Text>
                )}
              </View>
            </View>
            <Controller
              control={control}
              rules={{
                required: requiredMessage,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Name"
                />
              )}
              name="name"
            />
            {errors.name && (
              <Text style={styles.validationMsgText}>
                {errors.name.message}
              </Text>
            )}



            <View style={styles.rowContainer}>
              <View style={{ width: "48%" }}>
                <Controller
                  control={control}
                  rules={{
                    required: {
                      value: true,
                      message: requiredMessage,
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Height (inches)"
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  )}
                  name="height"
                />
                {errors.edad && (
                  <Text style={styles.validationMsgText}>
                    {errors.height.message}
                  </Text>
                )}
              </View>

              
            </View>
            <View style={styles.rowContainer}>
              <View style={{ width: "48%" }}>
                <Controller
                  control={control}
                  rules={{
                    required: {
                      value: true,
                      message: requiredMessage,
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Goal Step Length (inches)"
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  )}
                  name="goalStep"
                />
                {errors.edad && (
                  <Text style={styles.validationMsgText}>
                    {errors.height.message}
                  </Text>
                )}
              </View>

              
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                style={[styles.button]}
              >
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    // backgroundColor: "#222831",
    backgroundColor: "#dedad2",
    borderWidth: 2,
    height: ScreenHeight,
  },
  scrollContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#222831",
    minWidth: "80%",
    backgroundColor: "red",
  },
  inputContainer: {
    width: "90%",
    backgroundColor: "#dedad2",
    marginTop: 20,
    alignItems: "stretch",
    borderWidth: 0,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#dedad2",
    marginTop: ScreenHeight * 0.08,
    alignItems: "center",
    borderWidth: 0,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 50,
  },
  button: {
    backgroundColor: "#198fc2",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: ScreenHeight * 0.06,
  },
  buttonOutline: {
    backgroundColor: "#198fc2",
    marginTop: 5,
    borderColor: "#BBBBBB",
    borderWidth: 2,
    marginTop: ScreenHeight * 0.06,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
  buttonOutlineText: {
    color: "#DDDDDD",
    fontWeight: "700",
    fontSize: 18,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 15,
  },
  validationMsgText: {
    color: "#FA7D09",
    fontWeight: "400",
    fontSize: 15,
  },
  dropDownContainer: {
    // width: "100%",
    // height: 30,
    // borderWidth: 1,
  },
  rowContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  columnContainer: {
    width: "80%",
  },
  inputDp: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 5,
    minHeight: 39,
    height: "auto",
    borderWidth: 0,
  },
  titleText: {
    color: "#30475E",
    fontWeight: "600",
    fontSize: 24,
    marginBottom: 15,
  },
});