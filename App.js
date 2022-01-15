/**
 * Starting point of the app. Navigation is managed here.
 */

import React from "react";
import { StyleSheet } from "react-native";
import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import SearchScreen from "screens/SearchScreen.js";
import ResultsScreen from "screens/ResultsScreen.js";
import { SafeAreaProvider } from "react-native-safe-area-context/src/SafeAreaContext";

const App = () => {
  const Stack = createStackNavigator();

  const createStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/*<Stack.Screen name='CustomSplashScreen' component={CustomSplashScreen}/>*/}
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen
        name="ResultsScreen"
        component={ResultsScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
    </Stack.Navigator>
  );

  return (
    <SafeAreaProvider>
      <NavigationContainer>{createStack()}</NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({});

export default App;
