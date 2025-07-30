import React from 'react';
import { View, Text, StyleSheet, ScrollView , TouchableOpacity } from 'react-native';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';

export default function SignInScreen({navigation}: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>
          Sign <Text style={styles.titleAccent}>In</Text>
        </Text>
        <Text style={styles.subtitle}>Login to your Account</Text>
        <InputField placeholder="username" />
        <InputField placeholder="Password" secureTextEntry />
        <PrimaryButton title="Sign in" onPress={() => {}} />
        <Text style={styles.linkText}>
          Need an account?{' '}
          <Text style={styles.linkAccent} onPress={navigation.navigate('signup')}>
            Sign up here
          </Text>
        </Text>
        <TouchableOpacity onPress={navigation.navigate('signup')}>
          <Text style={styles.forgot}>Forgot your password ?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#567af4",
    paddingBottom: 0,
  },
  formContainer: {
    marginTop: '45%',
    padding: 24,
    backgroundColor: "#fafafa",
    width: "100%",
    height: 710,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,

    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    marginTop: 50,
    marginBottom: 50,
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleAccent: {
    color: '#4968f4',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  linkText: {
    marginTop: 60,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  linkAccent: {
    color: '#4968f4',
    fontWeight: 'bold',
  },
  forgot: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
});
