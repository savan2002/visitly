import { StyleSheet, Text, View, Modal, TouchableOpacity } from "react-native";
import React from "react";
import { color } from "../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
import RNButton from "react-native-button-sample";
import Ionicons from "react-native-vector-icons/Ionicons";
import CommonStyle from "../theme/CommonStyle";

const LocationIntroModal = ({ onPress, isVisible, strings }) => {
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
              : orientation.height / 2,
            backgroundColor: "white",
            height: orientation.isPortrait
              ? orientation.width / 2.4
              : orientation.height / 2.4,
            borderRadius: RFValue(10),
            justifyContent: "center",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Ionicons
              name="ios-location-sharp"
              color={color.royal_blue}
              size={RFValue(18)}
            />
            <Text
              style={{
                ...styles.headerText,
                maxWidth: orientation.isPortrait ? "80%" : "78%",
                marginTop: orientation.isPortrait ? RFValue(16) : RFValue(14),
              }}
            >
              {strings.location_desc}&nbsp;
              <Text style={{ color: color.boulder }}>{strings.locations}</Text>
              .&nbsp;{strings.clicl_on}&nbsp;
              <Text style={{ color: color.boulder }}>{strings.key}&nbsp;</Text>
              {strings.location_desc2}
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
                color: color.royal_blue,
              }}
              onPress={onPress}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default LocationIntroModal;

const styles = StyleSheet.create({
  headerText: {
    fontSize: RFValue(13),
    textAlign: "center",
    color: color.cod_gray,
    fontWeight: "400",
    letterSpacing: 0.6,
  },
  btnText: {
    fontSize: RFValue(12),
    fontWeight: "700",
    fontFamily: "SFProText-Regular",
    letterSpacing: 0.6,
    color: color.white,
  },
});
