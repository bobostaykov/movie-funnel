import React from 'react';
import {StyleSheet} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';

import CustomSplashScreen from 'screens/CustomSplashScreen.js';
import HomeScreen from 'screens/HomeScreen.js';
import ResultsScreen from 'screens/ResultsScreen.js';

const App = () => {

  const Stack = createStackNavigator();

  const createStack = () => (
     <Stack.Navigator screenOptions={{headerShown: false}}>
       <Stack.Screen name='CustomSplashScreen' component={CustomSplashScreen}/>
       <Stack.Screen name='HomeScreen' component={HomeScreen}/>
       <Stack.Screen name='ResultsScreen' component={ResultsScreen}/>
     </Stack.Navigator>
  );

  return (
     <NavigationContainer>
       {createStack()}
     </NavigationContainer>
  );
}

const styles = StyleSheet.create({

});

export default App;
