import { StyleSheet } from "react-native";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";

export default styles = StyleSheet.create({
  titleText: {
    fontSize: RFValue(16),
    fontFamily: "SFProText-Regular",
    letterSpacing: 0.6,
    fontWeight: "400",
  },
  footerBtnTxt: {
    fontSize: RFValue(12),
    fontWeight: "700",
    fontFamily: "SFProText-Regular",
    color: color.boulder,
    letterSpacing: 0.6,
  },
});
