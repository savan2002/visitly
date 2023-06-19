import { StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import {color} from '../../theme/colors';
export default styles = StyleSheet.create({
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
  dropdown: {
    height: 50,
    borderRadius: RFValue(5),
    padding: RFValue(8),
    opacity: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  btnGroupContainer:{
    height: 50,
    backgroundColor: "#EEEEEE",
    opacity: 0.5,
    borderRadius: RFValue(5),
    marginLeft:-3
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  button: {
    backgroundColor: color.wild_blue,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(5),
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
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
});