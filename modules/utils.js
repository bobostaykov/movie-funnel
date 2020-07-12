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
import {ANIMATION_DURATION, TMDB_MOVIE_PAGE_URL} from 'modules/constants.js';
import * as WebBrowser from 'expo-web-browser';
import i18n from 'i18n';

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

export const openMovieURL = async (id) => {
   WebBrowser.openBrowserAsync(TMDB_MOVIE_PAGE_URL + id)
      .then(result => {
         if (!result)
            // tell the user URL can't be opened
            showToastAlert(i18n.t('errors.movie_url'));
      })
      .catch(() => showToastAlert(i18n.t('errors.movie_url'), ToastAndroid.LONG));
};
