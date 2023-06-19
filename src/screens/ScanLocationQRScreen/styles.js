import { StyleSheet } from "react-native";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";

export default styles = StyleSheet.create({
  container: {
    backgroundColor: color.white,
    borderBottomLeftRadius: RFValue(10),
    borderBottomRightRadius: RFValue(10),
    height: "auto",
  },
  cameraContainer: {
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: color.royal_blue,
    alignItems: "center",
    justifyContent: "center",
  },
});
