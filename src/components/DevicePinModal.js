import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  Keyboard,
  Text,
  Modal,
  KeyboardAvoidingView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { color } from "../theme/colors";
import UseOrientation from "react-native-fast-orientation";
import ForgotPinIntro from "./ForgotPinIntro";
import strings from "../resources/localization";
import RNButton from "react-native-button-sample";
import CommonStyle from "../theme/CommonStyle";
const DevicePinModal = ({
  strings,
  showModal,
  closeModal,
  showForgotModal,
  primaryColor,
  pin,
  setPin,
  errText,
  setPinReady,
  closeforgotModal,
  forgotModal,
  handleNext,
  setErrText,
}) => {
  const orientation = UseOrientation();
  const MAX_PIN = 4;
  const textInputRef = useRef(null);
  const [inputIsFocused, setInputIsFocused] = useState(false);
  const pinDigitsArray = new Array(MAX_PIN).fill(0);
  const pinRef = useRef();
  const handleOnBlur = () => {
    setInputIsFocused(false);
  };
  useEffect(() => {
    setPinReady(pin.length === MAX_PIN);
    return () => setPinReady(false);
  }, [pin]);

  const handleOnPress = () => {
    setInputIsFocused(true);
    textInputRef?.current?.focus();
  };
  const securePassword = (value) => {
    return value && value?.replace(/./g, "\u25CF");
  };

  // const onHandle = useCallback(() => {
  //   if (pin.length == 4) {
  //     Keyboard.dismiss();
  //     handleNext();
  //   } else if (pin.length < 0) {
  //     setErrText(true);
  //   }
  // }, [pin.length]);

  const toPinDigitInput = (_value, index) => {
    const dd = pin[index];
    const emptyInputChar = " ";
    const digit = securePassword(dd) || emptyInputChar;
    return (
      <View
        key={index}
        style={{
          ...styles.pinInput,
          width: orientation.isPortrait ? "16%" : "13%",
          height: orientation.isPortrait
            ? orientation.width / 12
            : orientation.height / 13,
        }}
      >
        <Text style={styles.pinInputText}>{digit}</Text>
      </View>
    );
  };

  return (
    <Modal
      animationType={"fade"}
      transparent={true}
      visible={showModal}
      onRequestClose={closeModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={closeModal}
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
            <Text style={styles.deviceText}>{strings.device_pin}</Text>
            <View
              style={{
                alignItems: "center",
                marginTop: orientation.isPortrait ? RFValue(20) : RFValue(16),
              }}
            >
              <View
                style={{
                  width: orientation.isPortrait ? "100%" : "110%",
                }}
              >
                <View>
                  <Pressable
                    onPress={handleOnPress}
                    style={styles.pinInputsContainer}
                  >
                    {pinDigitsArray.map(toPinDigitInput)}
                  </Pressable>
                  <TextInput
                    ref={textInputRef}
                    value={pin}
                    onChangeText={setPin}
                    autoFocus={true}
                    onSubmitEditing={handleOnBlur}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    maxLength={MAX_PIN}
                    secureTextEntry={true}
                    style={styles.hiddenTextInput}
                  />
                </View>
              </View>
            </View>
            <View style={{ alignItems: "center" }}>
              <RNButton
                onPress={showForgotModal}
                buttonTitle={strings.forgot_pin}
                btnTextStyle={CommonStyle.forgotText}
                buttonStyle={{
                  marginTop: orientation.isPortrait ? RFValue(6) : RFValue(6),
                }}
              />
              <ForgotPinIntro
                strings={strings}
                isVisible={forgotModal}
                MainColor={primaryColor}
                onPress={closeforgotModal}
              />
              <RNButton
                buttonTitle={strings.submit}
                buttonStyle={{
                  ...CommonStyle.button,
                  backgroundColor: primaryColor,
                  width: orientation.isPortrait
                    ? orientation.width / 5
                    : orientation.height / 5,
                  height: orientation.isPortrait
                    ? orientation.width / 14
                    : orientation.height / 14,
                  marginTop: orientation.isPortrait ? RFValue(20) : RFValue(20),
                }}
                btnTextStyle={{ ...styles.btnText, color: color.white }}
                onPress={() => {
                  if (pin.length === 4) {
                    Keyboard.dismiss();
                    handleNext();
                  } else {
                    setErrText(true);
                  }
                }}
              />
              {errText ? (
                <Text
                  style={{
                    ...styles.errText,
                    color: color.red,
                    marginTop: orientation.isPortrait
                      ? RFValue(8)
                      : RFValue(12),
                  }}
                >
                  {strings.invalid_pin_try}
                </Text>
              ) : (
                <Text
                  style={{
                    ...styles.errText,
                    color: color.red,
                    marginTop: orientation.isPortrait
                      ? RFValue(8)
                      : RFValue(12),
                  }}
                >
                  {}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default DevicePinModal;

const styles = StyleSheet.create({
  pinInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  hiddenTextInput: {
    opacity: 0,
  },
  pinInputText: {
    fontSize: RFValue(14),
    fontWeight: "bold",
    textAlign: "center",
    color: color.black,
  },
  pinInput: {
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: color.white,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  deviceText: {
    fontSize: RFValue(13),
    textAlign: "center",
    color: color.cod_gray,
    fontWeight: "400",
    fontFamily: "SFProText-Regular",
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
});
