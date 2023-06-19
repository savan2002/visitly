import { StyleSheet } from "react-native";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";

export default styles = StyleSheet.create({
  modalContainer: {
    justifyContent: "space-evenly",
    alignItems: "center",
    borderRadius: RFValue(5),
    backgroundColor: color.white,
  },
  btn2: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: color.white,
  },
});
