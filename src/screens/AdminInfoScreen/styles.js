import { StyleSheet } from "react-native";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import CommonStyle from "../../theme/CommonStyle";
export default styles = StyleSheet.create({
  backBtn: {
    backgroundColor: color.white,
    height: RFValue(30),
    width: RFValue(70),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: RFValue(5),
  },
  btnReload: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(8),height:RFValue(28),
  },
  mainLeftContainer: {
    alignItems: "center",
    flexDirection: "row",
    borderTopRightRadius: RFValue(5),
  },
  leftContainer: {
    flex: 1,
    shadowColor: color.black,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    borderTopRightRadius: RFValue(5),
    backgroundColor: color.white,
    marginTop: RFValue(20),
  },
  footerBtnView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: color.concrete,
  },
  iconView: {
    height: RFValue(18),
    width: RFValue(18),
    marginRight: RFValue(5),
  },
  topBtnStyle: {
    justifyContent: "center",
    paddingLeft: RFValue(12),
  },
  topBtnText: {
    fontFamily: "SFProText-Regular",
    color: "#0B0B0B",
    fontSize: RFValue(11),
  },
  btnReloadText: {
    fontFamily: "SFProText-Regular",
    fontSize: RFValue(8),
    marginLeft: RFValue(5),
    fontWeight: "400",
  },
  textStyle: {
    fontFamily: "SFProText-Regular",
    fontSize: RFValue(12),
    color: color.vampire_black,
    textTransform: "uppercase",
  },
  colorBox: {
    height: RFValue(14),
    width: RFValue(40),
    borderColor: "#707070",
    borderWidth: 0.8,
    marginLeft: RFValue(10),
    borderRadius: RFValue(3),
  },
  footerBtn: {
    backgroundColor: "#FFE8E8",
    borderWidth: 1,
    borderColor: "red",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(3),
    paddingTop: RFValue(10),
    paddingBottom: RFValue(10),
  },
  footerBtnTxt: {
    fontFamily: "SFProText-Regular",
    color: "#FF5252",
    fontSize: RFValue(10),
  },
  printerTitle: {
    fontFamily: "SFProText-Regular",
    color: color.shadow_blue,
    fontSize: RFValue(14),
    fontWeight: "400",
  },
  printerBtn: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(5),
    paddingTop: RFValue(10),
    paddingBottom: RFValue(10),
  },
  printerText: {
    fontFamily: "SFProText-Regular",
    color: color.white,
    fontSize: RFValue(12),
    textTransform: "uppercase",
  },
});
