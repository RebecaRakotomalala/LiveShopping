import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import MainTab from './MainTab';
import { useSelector } from 'react-redux';

export default function AppNavigator() {
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTab /> : <AuthStack />}
    </NavigationContainer>
  );
}
