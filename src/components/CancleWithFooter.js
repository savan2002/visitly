import { View } from "react-native";
import React from "react";
import Footer from "./Footer";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation } from "@react-navigation/native";
import { color } from "../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import RNButton from "react-native-button-sample";
import CommonStyle from "../theme/CommonStyle";
const CancleWithFooter = ({ BGColor, onCancle, strings }) => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: RFValue(30),
        paddingBottom: orientation.isPortrait ? RFValue(18) : RFValue(14),
        paddingTop: orientation.isPortrait ? RFValue(16) : RFValue(14),
        width: "100%",
        backgroundColor: BGColor,
      }}
    >
      <RNButton
        buttonTitle={strings.cancel}
        buttonStyle={{
          ...CommonStyle.button,
          backgroundColor: "",
        }}
        btnTextStyle={{
          ...CommonStyle.btnText2,
          color: color.boulder,
        }}
        onPress={onCancle}
      />
      <Footer />
    </View>
  );
};

export default CancleWithFooter;
