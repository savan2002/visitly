import { StyleSheet } from "react-native";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";

export default styles = StyleSheet.create({
  dropdown: {
    height: RFValue(30),
    borderRadius: RFValue(5),
    padding: RFValue(8),
    opacity: 0.5,
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  titleHeading: {
    fontSize: RFValue(12),
    fontFamily: "SFProText-Regular",
    marginTop: RFValue(5),
    marginBottom: RFValue(5),
  },
  input: {
    fontSize: RFValue(12),
    fontFamily: "SFProText-Regular",
    padding: RFValue(8),
    borderRadius: RFValue(5),
    opacity: 0.5,
    paddingTop: 14,
    paddingBottom: 14,
  },
  button: {
    backgroundColor: color.wild_blue,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(5),
  },
  button2: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(5),
  },
  buttonText: {
    fontFamily: "SFProText-Regular",
    fontSize: RFValue(12),
    textTransform: "uppercase",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  label: {
    position: "absolute",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  adminContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modalBtn: {
    width: "30%",
    height: RFValue(25),
    borderWidth: 1,
    borderRadius: RFValue(5),
    marginRight: "2%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  tabStyle: {
    borderColor: "#D52C43",
  },
  activeTabStyle: {
    backgroundColor: "#D52C43",
  },
  btn: {
    flex: 1,
    borderRightWidth: 0.25,
    borderLeftWidth: 0.25,
    borderColor: "#6B7280",
  },
  btnText: {
    textAlign: "center",
    paddingVertical: 16,
    fontSize: 14,
  },
});