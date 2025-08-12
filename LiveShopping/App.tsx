import React from 'react';
import SplashScreen from "./src/splash/index";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from "./src/screens/Auth/SignInScreen";
import SignUpScreen from "./src/screens/Auth/SignUpScreen";
import { ThemeProvider } from './src/hooks/ThemeContext';

const Stack = createNativeStackNavigator();

const ExamplePage = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Splash" component={SplashScreen} options={{headerShown: false}}/>
          <Stack.Screen name="signin" component={SignInScreen} options={{headerShown: false}}/>
          <Stack.Screen name="signup" component={SignUpScreen} options={{headerShown: false}}/>
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default ExamplePage;