import { Text, View, Modal, TouchableOpacity, Image } from "react-native";
import React from "react";
import { color } from "../theme/colors";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation } from "@react-navigation/native";
import { RFValue } from "react-native-responsive-fontsize";
import CommonStyle from "../theme/CommonStyle";
import RNButton from "react-native-button-sample";
import WarningIcon from "../assets/svg/warning.svg";
const CancleConfirmationModal = ({
  onClose,
  isVisible,
  primaryColor,
  secondaryColor,
  strings,
}) => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  return (
    <Modal
      animationType={"fade"}
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={onClose}
        style={CommonStyle.modalBackground}
      >
        <View
          style={{
            width: orientation.isPortrait
              ? orientation.height / 3
              : orientation.height / 2.2,
            height: orientation.isPortrait
              ? orientation.height / 3
              : orientation.height / 2.2,
            justifyContent: "space-evenly",
            alignItems: "center",
            marginTop: orientation.isPortrait ? RFValue(60) : 20,
            borderRadius: RFValue(5),
            ...CommonStyle.shadow,
            backgroundColor: color.white,
          }}
        >
          <WarningIcon
            height={RFValue(18)}
            width={RFValue(18)}
            style={{ color: color.darkRed }}
          />
          <Text
            style={{
              ...CommonStyle.text3,
              fontSize: RFValue(13),
              textAlign: "center",
              color: color.bright_gray,
            }}
          >
            {strings.for_cancle}&nbsp;{strings.progress}
          </Text>
          <RNButton
            buttonTitle={strings.no}
            buttonStyle={{
              ...CommonStyle.button,
              backgroundColor: secondaryColor,
              width: orientation.isPortrait
                ? orientation.width / 5
                : orientation.height / 5,
              height: orientation.isPortrait
                ? orientation.width / 14
                : orientation.height / 14,
            }}
            btnTextStyle={{
              ...CommonStyle.btnText2,
              color: primaryColor,
            }}
            onPress={onClose}
          />
          <RNButton
            buttonTitle={strings.yes}
            buttonStyle={{
              ...CommonStyle.button,
              backgroundColor: "",
              borderColor: secondaryColor,
              borderWidth: 1,
              width: orientation.isPortrait
                ? orientation.width / 5
                : orientation.height / 5,
              height: orientation.isPortrait
                ? orientation.width / 14
                : orientation.height / 14,
            }}
            btnTextStyle={{
              ...CommonStyle.btnText2,
              color: primaryColor,
            }}
            onPress={() => navigation.navigate("Home")}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CancleConfirmationModal;
