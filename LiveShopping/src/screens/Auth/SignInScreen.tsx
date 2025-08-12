import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import { useTheme } from '../../hooks/ThemeContext';
import ThemeToggle from '../../components/Atom/inputTheme';

export default function SignInScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.primary },
      ]}
    >
      <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Sign <Text style={{ color: colors.primary }}>In</Text>
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Login to your Account
        </Text>
        <InputField
          placeholder="username"
          placeholderTextColor={colors.placeholder}
        />
        <InputField
          placeholder="Password"
          secureTextEntry
          placeholderTextColor={colors.placeholder}
        />
        <PrimaryButton title="Sign in" onPress={() => {}} />
          
        <Text style={{ color: colors.text }}>
          Current theme: {isDark ? 'Dark' : 'Light'}
        </Text>
        <ThemeToggle />
        <Text style={[styles.linkText, { color: colors.placeholder }]}>
          Need an account?{' '}
          <Text
            style={[styles.linkAccent,{ color: colors.textLink }]}
            onPress={() => navigation.navigate('signup')}
          >
            Sign up here
          </Text>
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('signup')}>
          <Text style={[styles.forgot,{ color: colors.textLink }]}>Forgot your password ?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  formContainer: {
    marginTop: '45%',
    padding: 24,
    width: '100%',
    height: 710,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,

    shadowColor: 'rgba(0, 0, 0, 0.25)',
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
  subtitle: {
    marginTop: 8,
    fontSize: 14,
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
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
  },
});
