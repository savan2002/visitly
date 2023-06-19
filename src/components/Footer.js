import { StyleSheet, Text, View, } from "react-native";
import React from "react";
import strings from "../resources/localization";
import { color } from "../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import CommonStyle from "../theme/CommonStyle";
import VisitlyIcon from "../assets/svg/visitly.svg";
const Footer = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          ...CommonStyle.text3,
          color: color.tundora,
          marginRight:RFValue(5)
        }}
      >
        {strings.powered_by}
      </Text>
      <VisitlyIcon height={RFValue(18)} width={RFValue(50)} />
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({});
