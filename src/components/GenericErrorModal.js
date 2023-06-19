import { StyleSheet, Text, View, Modal, Image, Linking } from "react-native";
import React from "react";
import UseOrientation from "react-native-fast-orientation";
import { color } from "../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import CommonStyle from "../theme/CommonStyle";
import RNButton from "react-native-button-sample";

const GenericErrorModal = ({
  isVisible,
  onPress,
  iconSource,
  title,
  subText,
  primaryColor,
  isLinking,
  secondaryColor,
  strings,
}) => {
  const orientation = UseOrientation();
  return (
    <Modal animationType={"fade"} transparent={true} visible={isVisible}>
      <View style={CommonStyle.modalBackground}>
        <View
          style={{
            width: orientation.isPortrait
              ? orientation.width / 1.8
              : orientation.height / 1.8,
            backgroundColor: color.white,
            height: orientation.isPortrait
              ? orientation.width / 1.5
              : orientation.height / 1.6,
            borderRadius: RFValue(10),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {iconSource}
          <Text
            style={{
              ...CommonStyle.btnText1,
              textAlign: "center",
              marginTop: orientation.isPortrait ? RFValue(12) : RFValue(8),
            }}
          >
            {title}
          </Text>
          {isLinking ? (
            <Text
              style={{
                ...CommonStyle.text3,
                textAlign: "center",
                letterSpacing: 0.6,
                marginTop: orientation.isPortrait ? RFValue(12) : RFValue(8),
                maxWidth: orientation.isPortrait ? "75%" : "70%",
              }}
            >
              {strings.bill_text1}&nbsp;
              <Text
                style={{ color: color.boulder }}
                onPress={() =>
                  Linking.openURL("https://app.visitly.io/visitly/login")
                }
              >
                {strings.visitly_url}
              </Text>
              &nbsp;{strings.bill_text2}
            </Text>
          ) : (
            <Text
              style={{
                ...CommonStyle.text3,
                textAlign: "center",
                letterSpacing: 0.6,
                marginTop: orientation.isPortrait ? RFValue(12) : RFValue(8),
                maxWidth: orientation.isPortrait ? "75%" : "70%",
              }}
            >
              {subText}
            </Text>
          )}
          <RNButton
            buttonTitle={strings.refresh}
            buttonStyle={{
              ...CommonStyle.button,
              backgroundColor: color.white,
              width: orientation.isPortrait
                ? orientation.width / 4
                : orientation.height / 4,
              height: orientation.isPortrait
                ? orientation.width / 14
                : orientation.height / 14,
              marginTop: orientation.isPortrait ? RFValue(20) : RFValue(10),
              borderColor: secondaryColor,
              borderWidth: 1,
            }}
            btnTextStyle={{ ...CommonStyle.btnText2, color: primaryColor }}
            onPress={onPress}
          />
        </View>
      </View>
    </Modal>
  );
};

export default GenericErrorModal;

const styles = StyleSheet.create({});
