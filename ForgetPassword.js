import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';

let ScreenHeight = Dimensions.get("window").height;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleResetPassword = () => {
    if (!isEmailValid(email)) {
      setIsValidEmail(false);
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert("Password Reset Email Sent", "Please check your email to reset your password.");
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to send password reset email. Please try again.");
        console.error("Password reset error:", error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>To reset you password, enter your email again and a link to reset your password will be sent.</Text>
      <TextInput
        style={[styles.input, !isValidEmail && styles.invalidInput]}
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setIsValidEmail(true);
        }}
      />
      {!isValidEmail && <Text style={styles.errorText}>Invalid email format</Text>}

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
      },
      text: {
        marginBottom: 8
      },
      input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
      },
      invalidInput: {
        borderColor: 'red',
      },
      errorText: {
        color: 'red',
        marginBottom: 10,
      },
      button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
      },
      buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
      },
});

export default ForgotPassword;