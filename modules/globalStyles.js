import { LOADING_INDICATOR_DIAMETER } from "modules/constants.js";
import { Dimensions, StyleSheet } from "react-native";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export const globalStyles = StyleSheet.create({
  loadingIndicator: {
    position: "absolute",
    top: (windowHeight - LOADING_INDICATOR_DIAMETER) / 2,
    start: (windowWidth - LOADING_INDICATOR_DIAMETER) / 2,
    width: LOADING_INDICATOR_DIAMETER,
    height: LOADING_INDICATOR_DIAMETER,
  },
});
