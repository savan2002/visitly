import { StyleSheet, Text, View, Modal, TouchableOpacity } from "react-native";
import React from "react";
import { color } from "../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation } from "@react-navigation/native";
import strings from "../resources/localization";
import RNButton from "react-native-button-sample";
import Octicons from "react-native-vector-icons/Octicons";
import CommonStyle from "../theme/CommonStyle";
const ErrorModal = ({ onPress, errText, isVisible, btnColor, strings }) => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  return (
    <Modal
      animationType={"fade"}
      transparent={true}
      visible={isVisible}
      onRequestClose={onPress}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={onPress}
        style={CommonStyle.modalBackground}
      >
        <View
          style={{
            width: orientation.isPortrait
              ? orientation.width / 2
              : orientation.height / 1.8,
            backgroundColor: "white",
            height: orientation.isPortrait
              ? orientation.width / 2
              : orientation.height / 1.8,
            borderRadius: RFValue(10),
            justifyContent: "center",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Octicons
              name={"alert"}
              color={color.red}
              size={RFValue(30)}
              style={{
                marginTop: orientation.isPortrait ? RFValue(30) : RFValue(24),
              }}
            />

            <Text
              style={{
                ...styles.errMsgText,
                maxWidth: orientation.isPortrait ? "80%" : "78%",
                marginTop: orientation.isPortrait ? RFValue(30) : RFValue(24),
              }}
            >
              {errText}
            </Text>

            <RNButton
              buttonTitle={strings.close}
              buttonStyle={{
                ...CommonStyle.button,
                backgroundColor: "",
                width: orientation.isPortrait
                  ? orientation.width / 5
                  : orientation.height / 5,
                height: orientation.isPortrait
                  ? orientation.width / 14
                  : orientation.height / 14,
                marginTop: orientation.isPortrait ? RFValue(30) : RFValue(24),
              }}
              btnTextStyle={{
                ...styles.btnText,
                color: btnColor ? btnColor : color.royal_blue,
              }}
              onPress={onPress}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ErrorModal;

const styles = StyleSheet.create({
  btnText: {
    fontSize: RFValue(12),
    fontWeight: "700",
    fontFamily: "SFProText-Regular",
    letterSpacing: 0.6,
    color: color.white,
  },
  errMsgText: {
    fontSize: RFValue(12),
    fontWeight: "400",
    fontFamily: "SFProText-Regular",
    color: color.cod_gray,
    textAlign: "center",
  },
});
