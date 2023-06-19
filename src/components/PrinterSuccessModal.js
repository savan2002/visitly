import { Text, View, Modal, TouchableOpacity } from "react-native";
import React from "react";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
import strings from "../resources/localization";
import RNButton from "react-native-button-sample";
import Feather from "react-native-vector-icons/Feather";
import CommonStyle from "../theme/CommonStyle";

const PrinterSuccessModal = ({ onPress, isVisible, primaryColor, strings }) => {
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
            <Feather
              name={"check"}
              color={primaryColor}
              size={RFValue(18)}
              style={{
                marginTop: orientation.isPortrait ? RFValue(30) : RFValue(24),
              }}
            />

            <Text
              style={{
                ...CommonStyle.text2,
                fontSize: RFValue(13),
                textAlign: "center",
                maxWidth: orientation.isPortrait ? "80%" : "78%",
                marginTop: orientation.isPortrait ? RFValue(30) : RFValue(24),
              }}
            >
              {strings.success_change_printer}.
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
                ...CommonStyle.btnText2,
                color: primaryColor,
              }}
              onPress={onPress}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default PrinterSuccessModal;
