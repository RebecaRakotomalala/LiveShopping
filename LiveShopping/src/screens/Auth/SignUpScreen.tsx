import React from 'react';
import {  Text, StyleSheet, ScrollView } from 'react-native';
import InputField from '../../components/InputField';
import InputAutocomplete from '../../components/InputSelect';
import PrimaryButton from '../../components/PrimaryButton';
import { useTheme } from '../../hooks/ThemeContext';

export default function SignUpScreen({navigation}: any) {
  const { colors } = useTheme();
  return (
    <ScrollView
          contentContainerStyle={[
            styles.container,
            { backgroundColor: colors.surface },
          ]}
        >
            <Text style={[styles.title, { color: colors.text }]}>
              Sign <Text style={{ color: colors.primary }}>Up</Text>
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Create your Account
            </Text>
            <InputField
              placeholder="username"
              placeholderTextColor={colors.placeholder}
            />
            <InputField
              placeholder="username"
              placeholderTextColor={colors.placeholder}
            />
            <InputField
              placeholder="username"
              placeholderTextColor={colors.placeholder}
            />
            <InputField
              placeholder="username"
              placeholderTextColor={colors.placeholder}
            />
            <InputAutocomplete
              options={[
                { label: 'Madagascar', value: 'mg' },
                { label: 'France', value: 'fr' },
                { label: 'Germany', value: 'de' },
              ]}
              onSelect={(value) => console.log('Selected:', value)}
            />
            <InputField
              placeholder="Password"
              secureTextEntry
              placeholderTextColor={colors.placeholder}
            />
            <InputField
              placeholder="Password"
              secureTextEntry
              placeholderTextColor={colors.placeholder}
            />
            <PrimaryButton title="Sign in" onPress={() => {}} />
            <Text style={styles.linkText}>
              Already have an account ?{' '}
              <Text
                style={styles.linkAccent}
                onPress={() => navigation.navigate('signin')}
              >
                Sign up here
              </Text>
            </Text>
        </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 0,
    padding: 24,
  },
  formContainer: {
    marginTop: '25%',
    padding: 24,
    width: "100%",
    height: 800,
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
    marginTop: 50,
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
