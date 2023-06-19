import {StyleSheet} from 'react-native';
import {color} from '../../theme/colors';
import {RFValue} from 'react-native-responsive-fontsize';

export default styles = StyleSheet.create({
  toopContainer:{
    alignItems: "center",
    backgroundColor: color.white,
    borderBottomLeftRadius: RFValue(10),
    borderBottomRightRadius: RFValue(10),
  },
  welcomeText: {
    fontSize: RFValue(18),
    fontWeight: "400",
    fontFamily: "SFProText-Regular",
    color: color.cod_gray,
    letterSpacing: 0.8,
  },
  welcomeSubText: {
    fontSize: RFValue(12),
    fontWeight: "400",
    fontFamily: "SFProText-Regular",
    color: color.boulder,
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

});