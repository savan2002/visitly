import { StyleSheet } from "react-native";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";

export default styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fixed: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
 scrollview: {
  backgroundColor: 'transparent',
 },
  dropdownContainer: {
    width: "60%",
    backgroundColor: color.white,
    height: "60%",
    borderRadius: RFValue(10),
  },
  text: {
    color: color.cod_gray,
    fontFamily: "SFProText-Regular",
    fontSize: RFValue(10),
  },
  dropdown: {
    height: RFValue(30),
    width: RFValue(85),
    borderRadius: RFValue(5),
    backgroundColor: color.white,
    alignItems: "center",
    paddingLeft: RFValue(5),
    paddingRight: RFValue(5),
  },
  dropdownView: {
    width: "100%",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: RFValue(12),
    fontWeight: "400",
    fontFamily: "SFProText-Regular",
  },
  qrContainer: {
    shadowOffset: { width: 0, height: 1 },
    shadowColor: "#00000",
    shadowOpacity: 0.2,
    shadowRadius: 1,
    backgroundColor: color.white,
    borderBottomLeftRadius: RFValue(16),
    borderBottomRightRadius: RFValue(16),
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingTop: RFValue(12),
    paddingBottom: RFValue(12),
  },
  btnText: {
    fontSize: RFValue(12),
    fontWeight: "700",
    fontFamily: "SFProText-Regular",
    letterSpacing: 0.6,
    color: color.white,
  },
  btn2Text: {
    fontSize: RFValue(12),
    fontWeight: "400",
    fontFamily: "SFProText-Regular",
  },
  qrView: {
    height: RFValue(60),
    width: RFValue(60),
    marginRight: RFValue(5),
    alignItems: "center",
    justifyContent: "center",
  },
  footerContainer: {
    alignItems: "center",
    backgroundColor: color.white,
    marginBottom: RFValue(20),
  },
  footerContainerImg: {
    alignItems: "center",
    marginBottom: RFValue(20),
  },
  footerBtnText: {
    fontSize: RFValue(14),
    fontWeight: "400",
    fontFamily: "SFProText-Regular",
  },
  dropdownBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: RFValue(16),
    borderBottomWidth: 1,
    borderColor: color.silver,
    width: "85%",
  },
});
