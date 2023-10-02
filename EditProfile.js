import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { get, ref, update, set } from "firebase/database";
import { auth, db } from "./firebase";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { StyleSheet } from 'react-native';

const EditProfile = ({ navigation }) => {
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");

  useEffect(() => {
    const userId = auth.currentUser.uid;
    const userRef = ref(db, `users/${userId}`);

    console.log(auth.currentUser.uid);

    get(userRef).then((snapshot) => {
      const userData = snapshot.val();
      setName(userData.name);
      console.log(userData.height);
      setHeight(userData.height);
    });
  }, []);

  const handleSave = () => {
    const userId = auth.currentUser.uid;
    const userRef = ref(db, `users/${userId}`);

    update(userRef, {
      name: name,
      height: height,
    }).then(() => {
      console.log("Profile updated successfully!");
      navigation.navigate("MainPage");
    }).catch((error) => {
      console.error("Error updating profile:", error);
    });
  };

  return (
    <KeyboardAwareScrollView
      resetScrollToCoords={{ x: 0, y: 0 }}
      contentContainerStyle={styles.container}
      scrollEnabled
    >
      <View style={styles.inputContainer}>
        <Text>Name</Text>
        <TextInput
          value={name}
          onChangeText={(text) => setName(text)}
          style={styles.input}
        />

        <Text>Height</Text>
        <TextInput
          value={height}
          onChangeText={(text) => setHeight(text)}
          style={styles.input}
        />
      </View>

      <TouchableOpacity onPress={handleSave} style={styles.button}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
};

export default EditProfile;

  
