/**
 * Component representing the structure of a main button
 * with an option to adjust the style
 */

import {
  DEFAULT_BORDER_RADIUS,
  OPACITY_ON_PRESS,
  spacing,
} from "modules/constants.js";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MainButton = ({ onPress, text, icon, style, getWidth }) => (
  <TouchableOpacity
    activeOpacity={OPACITY_ON_PRESS}
    style={[styles.button, style]}
    onLayout={(event) => getWidth && getWidth(event.nativeEvent.layout.width)}
    onPress={onPress}
  >
    <View style={styles.innerContainer}>
      {text && <Text style={styles.buttonText}>{text}</Text>}
      {icon}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "orange",
    borderWidth: 2,
    borderColor: "grey",
    borderRadius: DEFAULT_BORDER_RADIUS,
    padding: spacing.paddingS,
  },

  innerContainer: {
    flexDirection: "row",
  },

  buttonText: {
    fontWeight: "bold",
  },
});

export default MainButton;
