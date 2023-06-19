import { StyleSheet } from "react-native";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import CommonStyle from "../../theme/CommonStyle";
export default styles = StyleSheet.create({
  docView: {
    borderWidth: 1,
    borderRadius: RFValue(5),
    borderColor: color.lightSilver,
    height: "auto",
  },
  bottomView: {
    width: "100%",
    flex: 0.4,
    backgroundColor: color.white,
    ...CommonStyle.shadow,
    shadowOpacity: 0.2,
    alignItems: "center",
    justifyContent: "space-around",
  },
  scrollviewStyle: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  signatureContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: color.lightSilver,
    borderRadius: RFValue(5),
  },
});
