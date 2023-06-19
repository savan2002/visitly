import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
const CustomButton = ({ btnBGColor, btnText, btnTextColor, action, iconColor,borderColor }) => {
  const orientation = UseOrientation();
  return (
    <Pressable
      onPress={action}
      style={{
        backgroundColor: btnBGColor,
        width: orientation.isPortrait
          ? orientation.width / 1.4
          : orientation.height / 1.4,
          borderRadius:RFValue(8),
          borderColor:borderColor,
          padding:RFValue(12),
          borderWidth:RFValue(1),
          marginBottom:orientation.isPortrait ? RFValue(10) : RFValue(6)
      }}
    >
      <View style={{ ...styles.button }}>
        <Text style={{ ...styles.buttonText, color: btnTextColor }}>
          {btnText}
        </Text>
        <AntDesign name="arrowright" size={RFValue(12)} color={iconColor} />
      </View>
    </Pressable>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonText: {
    fontSize: RFValue(12),
    fontWeight: "600",
    fontFamily: "SFProText-Regular",
  },
});
