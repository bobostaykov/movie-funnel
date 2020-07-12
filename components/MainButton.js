/**
 * Component representing the structure of a main button
 * with an option to adjust the style
 */

import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {DEFAULT_BORDER_RADIUS, OPACITY_ON_PRESS} from '../modules/constants.js';

const MainButton = ({onPress, text, style}) => (
   <TouchableOpacity
      activeOpacity={OPACITY_ON_PRESS}
      style={[styles.button, style]}
      onPress={onPress}>
      <Text style={styles.buttonText}>{text}</Text>
   </TouchableOpacity>
);

const styles = StyleSheet.create({
   button: {
      alignItems: 'center',
      backgroundColor: 'orange',
      borderWidth: 2,
      borderColor: 'grey',
      borderRadius: DEFAULT_BORDER_RADIUS,
      paddingVertical: 10,
   },

   buttonText: {
      fontWeight: 'bold'
   },
});

export default MainButton;
