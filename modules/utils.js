/**
 * File with global helper functions
 */

import {
   Alert,
   LayoutAnimation,
   Platform,
   ToastAndroid,
   UIManager
} from 'react-native';
import {ANIMATION_DURATION} from 'modules/constants.js';

export const platformAndroid = Platform.OS === 'android';
export const platformIOS = Platform.OS === 'ios';

/**
 * Platform specific way to present an info message to the user:
 * For Android - toast
 * For iOS - alert
 */
export const showToastAlert = (message, toastLength = ToastAndroid.SHORT) => {
   platformAndroid ?
      ToastAndroid.show(message, toastLength) :
      Alert.alert(message);
};

/**
 * LayoutAnimation automatically animates a transformation on screen
 */
let experimentalSet = false;
export const autoAnimate = (duration = ANIMATION_DURATION) => {
   // in order for LayoutAnimation to work on Android
   if (
      platformAndroid &&
      UIManager.setLayoutAnimationEnabledExperimental &&
      !experimentalSet
   ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
      experimentalSet = true;
   }

   LayoutAnimation.configureNext({...LayoutAnimation.Presets.easeInEaseOut, duration});
};
