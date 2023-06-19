import { StyleSheet } from "react-native";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";

export default styles = StyleSheet.create({
  btn2: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: color.white,
  },
  input: {
    fontSize: RFValue(12),
    textAlign: "center",
    fontFamily: "SFProText-Regular",
    padding: RFValue(8),
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: color.white,
    color: color.cod_gray,
  },
  inputContainer: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    borderBottomWidth: 1,
  },
});
