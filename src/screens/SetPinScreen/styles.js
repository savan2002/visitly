import { StyleSheet } from "react-native";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";

export default styles = StyleSheet.create({
  linkText: {
    fontFamily: "SFProText-Bold",
    color: color.royal_blue,
    textDecorationLine: "underline",
  },
  pinInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  hiddenTextInput: {
    opacity: 0,
  },
  pinInputText: {
    fontSize: RFValue(14),
    fontWeight: "bold",
    textAlign: "center",
    color: color.black,
  },
  pinInput: {
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: color.white,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    shadowOffset: { width: 0, height: 1 },
  },
});
