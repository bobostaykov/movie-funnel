/**
 * Starting point of the app. Navigation is managed here.
 */

import { NavigationContainer } from "@react-navigation/native";
import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import React from "react";
import { LogBox, StatusBar } from "react-native";

import { NativeBaseProvider } from "native-base";
import { SafeAreaProvider } from "react-native-safe-area-context/src/SafeAreaContext";
import Toast, {
  ErrorToast,
  InfoToast,
  SuccessToast,
} from "react-native-toast-message";
import ResultsScreen from "./screens/ResultsScreen";
import SearchScreen from "./screens/SearchScreen";

LogBox.ignoreLogs(["Failed to load http://image.tmdb.org"]);

StatusBar.setBarStyle("dark-content", true);

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

  const toastText2Style = { fontSize: 14, color: "#2e2e2e" };

  const toastConfig = {
    info: (props) => <InfoToast {...props} text2Style={toastText2Style} />,
    success: (props) => (
      <SuccessToast {...props} text2Style={toastText2Style} />
    ),
    error: (props) => <ErrorToast {...props} text2Style={toastText2Style} />,
  };

  return (
    <NativeBaseProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          {createStack()}
          <Toast position="bottom" type="info" config={toastConfig} />
        </NavigationContainer>
      </SafeAreaProvider>
    </NativeBaseProvider>
  );
};

export default App;
