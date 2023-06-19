import { StyleSheet } from "react-native";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";

export default styles = StyleSheet.create({
  docView: {
    borderWidth: 1,
    borderRadius: RFValue(5),
    borderColor: color.lightSilver,
    height: "auto",
  },
  pdfStyle: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  topShadow: {
    shadowColor: "gray",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: -3 },
    backgroundColor: color.white,
  },
  container: {
    flexDirection: "row",
    marginTop: "2%",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  btnBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
