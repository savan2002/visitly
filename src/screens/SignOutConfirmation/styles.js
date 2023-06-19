import { StyleSheet } from "react-native";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";

export default styles = StyleSheet.create({
  iconStyle: {
    height: RFValue(14),
    width: RFValue(14),
    marginRight: RFValue(3),
  },
  photoStyle: {
    borderRadius: RFValue(35),
    position: "absolute",
    marginTop: RFValue(50),
    borderWidth: RFValue(2),
    borderColor: color.white,
  },
  containerSmall: {
    borderTopLeftRadius: RFValue(8),
    borderTopRightRadius: RFValue(8),
    alignItems: "center",
    height: RFValue(85),
  },
  innerStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: RFValue(12),
  },
});
