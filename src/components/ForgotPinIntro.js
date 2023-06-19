import { StyleSheet, Text, View, Modal, TouchableOpacity } from "react-native";
import React from "react";
import { color } from "../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
import RNButton from "react-native-button-sample";
import Entypo from "react-native-vector-icons/Entypo";
import CommonStyle from "../theme/CommonStyle";
const ForgotPinIntro = ({ onPress, isVisible, MainColor, strings }) => {
  const orientation = UseOrientation();
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
        style={{ ...CommonStyle.modalBackground, backgroundColor: "" }}
      >
        <View
          style={{
            width: orientation.isPortrait
              ? orientation.width / 2
              : orientation.height / 1.8,
            height: orientation.isPortrait
              ? orientation.width / 2
              : orientation.height / 1.8,
            borderRadius: RFValue(10),
            justifyContent: "center",
            backgroundColor: "white",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Entypo name="info" color={MainColor} size={RFValue(18)} />
            <Text
              style={{
                ...styles.headerText,
                maxWidth: orientation.isPortrait ? "80%" : "78%",
                marginTop: orientation.isPortrait ? RFValue(16) : RFValue(14),
              }}
            >
              {strings.forgot_pin_log}&nbsp;
              <Text style={{ color: color.boulder }}>{strings.reset_pin}</Text>
              &nbsp;{strings.adminpin_device}
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
                marginTop: orientation.isPortrait ? RFValue(16) : RFValue(14),
              }}
              btnTextStyle={{
                ...styles.btnText,
                color: MainColor ? MainColor : color.royal_blue,
              }}
              onPress={onPress}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ForgotPinIntro;

const styles = StyleSheet.create({
  headerText: {
    fontSize: RFValue(13),
    textAlign: "center",
    color: color.cod_gray,
    fontWeight: "400",
    letterSpacing: 0.6,
    fontFamily: "SFProText-Regular",
  },
  btnText: {
    fontSize: RFValue(12),
    fontWeight: "700",
    fontFamily: "SFProText-Regular",
    letterSpacing: 0.6,
    color: color.white,
  },
  backgroundModal: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    width: "100%",
  },
});
