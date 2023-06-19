import { StyleSheet, Text, View, Pressable } from "react-native";
import React, { useState } from "react";
import QRCodeScanner from "react-native-qrcode-scanner";
import { BlurView } from "@react-native-community/blur";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "react-native-vector-icons/AntDesign";
import { RFValue } from "react-native-responsive-fontsize";
import { color } from "../theme/colors";
import RNButton from "react-native-button-sample";
import ScannerFrame from "../assets/svg/scan.svg";
import WarningIcon from "../assets/svg/warning.svg";
const QrScannerModal = ({
  result,
  primaryColor,
  secondaryColor,
  setResult,
  closeModal,
  errFlag,
  warningText,
  reOpenCamera,
  strings,
}) => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const [viewRef, setViewRef] = useState(null);
  const [blurType, setBlurType] = useState("dark");
  const [errModal, setErrModal] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  var regexpEmail = new RegExp(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  const onSuccess = (e) => {
    if (e.data) {
      if (e.data.indexOf("PREREG") >= 0) {
        setResult(e.data);
      } else if (e.data && regexpEmail.test(e.data?.trim())) {
        setResult(e.data);
      } else {
        setResult(e.data);
      }
    }
  };
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignSelf: "center",
        alignItems: "center",
      }}
    >
      <BlurView
        viewRef={viewRef}
        style={{
          height: "100%",
          width: orientation.width,
          alignItems: "center",
        }}
        blurRadius={0}
        blurType={blurType}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: orientation.isPortrait ? RFValue(60) : RFValue(40),
            width: "90%",
          }}
        >
          <AntDesign name="" color={color.white} size={RFValue(16)} />
          <AntDesign name="" color={color.white} size={RFValue(16)} />
          <Pressable onPress={closeModal}>
            <AntDesign name="close" color={color.white} size={RFValue(20)} />
          </Pressable>
        </View>
        <Text
          style={{
            ...styles.scnnerHeaderTxt,
            marginTop: orientation.isPortrait ? RFValue(40) : RFValue(20),
          }}
        >
          {strings.scan_QRCode}
        </Text>
        <Text
          style={{
            ...styles.scnnerSubtxt,
            marginTop: orientation.isPortrait ? RFValue(30) : RFValue(20),
          }}
        >
          {strings.qr_scnner}
        </Text>
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: orientation.isPortrait
                ? orientation.height / 2
                : orientation.height / 1.8,
              height: orientation.isPortrait
                ? orientation.height / 2.2
                : orientation.height / 2.2,
              marginTop: orientation.isPortrait ? RFValue(26) : RFValue(18),
              alignItems: "center",
            }}
          >
            {errFlag ? (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: orientation.isPortrait
                    ? orientation.height / 2
                    : orientation.height / 1.8,
                  height: orientation.isPortrait
                    ? orientation.height / 2.2
                    : orientation.height / 2.2,
                  borderRadius: orientation.isPortrait
                    ? RFValue(30)
                    : RFValue(20),
                  borderStyle: "dashed",
                  borderWidth: 2,
                  borderColor: color.white,
                }}
              >
                <WarningIcon
                  height={RFValue(20)}
                  width={RFValue(20)}
                  style={{ color: color.lightRed }}
                />
                <Text
                  style={{
                    ...CommonStyle.text3,
                    fontSize: RFValue(13),
                    textAlign: "center",
                    color: "#FCBDA8",
                    maxWidth: "80%",
                    marginTop: RFValue(12),
                  }}
                >
                  {warningText}
                </Text>
                <View
                  style={{
                    flexDirection: orientation.isPortrait ? "column" : "row",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                    marginTop: orientation.isPortrait
                      ? RFValue(30)
                      : RFValue(20),
                  }}
                >
                  <RNButton
                    buttonTitle={strings.retry}
                    buttonStyle={{
                      ...CommonStyle.button,
                      backgroundColor: secondaryColor,
                      width: orientation.isPortrait
                        ? orientation.width / 4
                        : orientation.height / 4.5,
                      height: orientation.isPortrait
                        ? orientation.width / 14
                        : orientation.height / 14,
                    }}
                    btnTextStyle={{
                      ...CommonStyle.btnText2,
                      color: primaryColor,
                    }}
                    onPress={reOpenCamera}
                  />
                  <RNButton
                    buttonTitle={strings.manual}
                    buttonStyle={{
                      ...CommonStyle.button,
                      backgroundColor: "",
                      borderColor: secondaryColor,
                      borderWidth: 1,
                      width: orientation.isPortrait
                        ? orientation.width / 4
                        : orientation.height / 4.5,
                      height: orientation.isPortrait
                        ? orientation.width / 14
                        : orientation.height / 14,
                      marginTop: orientation.isPortrait ? RFValue(20) : 0,
                      marginLeft: orientation.isPortrait ? 0 : RFValue(12),
                    }}
                    btnTextStyle={{
                      ...CommonStyle.btnText2,
                      color: primaryColor,
                    }}
                    onPress={closeModal}
                  />
                </View>
              </View>
            ) : (
              <QRCodeScanner
                onRead={onSuccess}
                fadeIn={false}
                showMarker={true}
                reactivate={true}
                cameraType={"front"}
                markerStyle={{
                  width: orientation.isPortrait
                    ? orientation.width / 2.6
                    : orientation.height / 2.8,
                  height: orientation.isPortrait
                    ? orientation.width / 2.6
                    : orientation.height / 2.8,
                }}
                customMarker={
                  <ScannerFrame
                    width={
                      orientation.isPortrait
                        ? orientation.width / 2.6
                        : orientation.height / 2.8
                    }
                    height={
                      orientation.isPortrait
                        ? orientation.width / 2.6
                        : orientation.height / 2.8
                    }
                  />
                }
                ref={(node) => {
                  scanner = node;
                }}
                cameraStyle={{
                  width: orientation.isPortrait
                    ? orientation.height / 2.05
                    : orientation.height / 1.85,
                  height: orientation.isPortrait
                    ? orientation.height / 2.25
                    : orientation.height / 2.25,
                  borderRadius: orientation.isPortrait
                    ? RFValue(30)
                    : RFValue(20),
                  overflow: "hidden",
                }}
                containerStyle={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: orientation.isPortrait
                    ? orientation.height / 2
                    : orientation.height / 1.8,
                  height: orientation.isPortrait
                    ? orientation.height / 2.2
                    : orientation.height / 2.2,
                  borderRadius: orientation.isPortrait
                    ? RFValue(30)
                    : RFValue(20),
                  borderStyle: "dashed",
                  borderWidth: 2,
                  borderColor: color.white,
                }}
              />
            )}
          </View>
        </View>
      </BlurView>
    </View>
  );
};

export default QrScannerModal;

const styles = StyleSheet.create({
  scnnerHeaderTxt: {
    fontSize: RFValue(14),
    textAlign: "center",
    color: color.white,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  scnnerSubtxt: {
    fontSize: RFValue(14),
    textAlign: "center",
    color: color.white,
    fontWeight: "400",
  },
  cameraContainer: {
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: color.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
