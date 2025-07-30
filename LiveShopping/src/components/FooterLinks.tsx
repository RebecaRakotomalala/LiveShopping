import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface FooterLinksProps {
  onSignUp?: () => void;
  onForgot?: () => void;
}

export default function FooterLinks({ onSignUp, onForgot }: FooterLinksProps) {
  return (
    <View>
      <Text style={styles.linkText}>
        Need an account?{' '}
        <Text style={styles.linkAccent} onPress={onSignUp}>
          Sign up here
        </Text>
      </Text>
      <TouchableOpacity onPress={onForgot}>
        <Text style={styles.forgot}>Forgot your password ?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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