/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, TextInput, Button } from 'react-native';

export default function inputComponent() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <TextInput placeholder="Nom d'utilisateur" style={{ marginBottom: 12, borderWidth: 1, padding: 10 }} />
      <TextInput placeholder="Mot de passe" secureTextEntry style={{ marginBottom: 12, borderWidth: 1, padding: 10 }} />
      <Button title="Se connecter" onPress={() => {}} />
    </View>
  );
}
