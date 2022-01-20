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
import Toast, {
  ErrorToast,
  InfoToast,
  SuccessToast,
} from "react-native-toast-message";
import { useTheme } from "react-native-elements";

const App = () => {
  const Stack = createStackNavigator();
  const { theme } = useTheme();

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

  const text2Style = { fontSize: 14, color: theme.colors.grey1 };

  const toastConfig = {
    info: (props) => <InfoToast {...props} text2Style={text2Style} />,
    success: (props) => <SuccessToast {...props} text2Style={text2Style} />,
    error: (props) => <ErrorToast {...props} text2Style={text2Style} />,
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {createStack()}
        <Toast position="bottom" type="info" config={toastConfig} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({});

export default App;
