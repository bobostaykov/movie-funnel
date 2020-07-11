/**
 * Component representing the structure of a main button
 * with an option to adjust the style
 */

import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';

const MainButton = ({onPress, text, style}) => {
   return (
      <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
         <Text style={styles.buttonText}>{text}</Text>
      </TouchableOpacity>
   );
};

const styles = StyleSheet.create({
   button: {
      alignItems: 'center',
      backgroundColor: 'orange',
      borderWidth: 2,
      borderColor: 'grey',
      borderRadius: 10,
      paddingVertical: 10,
   },

   buttonText: {
      fontWeight: 'bold'
   },
});

export default MainButton;
