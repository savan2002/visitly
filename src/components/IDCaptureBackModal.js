import { StyleSheet, Text, View, Modal, Pressable, Image } from "react-native";
import React, { useState } from "react";
import { BlurView } from "@react-native-community/blur";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "react-native-vector-icons/AntDesign";
import { RFValue } from "react-native-responsive-fontsize";
import { color } from "../theme/colors";
import { RNCamera } from "react-native-camera";
import CommonStyle from "../theme/CommonStyle";
const IDCaptureBackModal = ({
  result,
  setResult,
  closeModal,
  btnTextColor,
  title,
  strings,
  onDone,
}) => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const [viewRef, setViewRef] = useState(null);
  const [blurType, setBlurType] = useState("dark");
  var timeing = 5;
  const [second, setSecond] = useState(timeing);
  const [retakePicture, setReTakePicture] = useState(true);
  const [picture, setPicture] = useState("");

  const takepicture = async () => {
    if (this.camera) {
      const options = {
        base64: true,
        width: 500,
        mirrorImage: true,
      };
      await this.camera.takePictureAsync(options).then((data) => {
        setResult(data.base64);
        setPicture(data.base64);
        setReTakePicture(false);
      });
    }
  };

  const cameraLoad = () => {
    var timerId = setInterval(() => {
      timeing = timeing - 1;
      setSecond(timeing);
      clearInterval();
      if (timeing == 1) {
        clearInterval(timerId);
        takepicture();
      }
    }, 1000);
  };

  const retakeMyPicture = () => {
    timeing = 5;
    setSecond(timeing);
    setReTakePicture(true);
    setPicture("");
    cameraLoad();
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
          {title}
        </Text>
        <Text
          style={{
            ...styles.scnnerSubtxt,
            marginTop: orientation.isPortrait ? RFValue(30) : RFValue(20),
          }}
        >
          {strings.idCapture_text}
        </Text>
        <View style={{ alignItems: "center" }}>
          {retakePicture ? (
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
                justifyContent: "center",
                borderStyle: "dashed",
                borderWidth: 2,
                borderRadius: orientation.isPortrait
                  ? RFValue(30)
                  : RFValue(20),
                borderColor: color.white,
              }}
            >
              <RNCamera
                ref={(ref) => {
                  this.camera = ref;
                }}
                captureAudio={false}
                style={{
                  width: orientation.isPortrait
                    ? orientation.height / 2.05
                    : orientation.height / 1.85,
                  height: orientation.isPortrait
                    ? orientation.height / 2.25
                    : orientation.height / 2.25,
                  borderRadius: orientation.isPortrait
                    ? RFValue(26)
                    : RFValue(20),
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                type={"front"}
                onCameraReady={cameraLoad}
              >
                {picture.length == 0 ? (
                  <Text
                    style={{
                      color: color.white,
                      fontSize: RFValue(30),
                      fontWeight: "300",
                      fontFamily: "SFProText-Regular",
                    }}
                  >
                    {second}
                  </Text>
                ) : null}
                {picture && picture.length != 0 ? (
                  <Image
                    source={{ uri: "data:image/png;base64," + picture }}
                    style={{
                      width: orientation.isPortrait
                        ? orientation.height / 2.05
                        : orientation.height / 1.85,
                      height: orientation.isPortrait
                        ? orientation.height / 2.25
                        : orientation.height / 2.25,
                      borderRadius: orientation.isPortrait
                        ? RFValue(26)
                        : RFValue(20),
                    }}
                  />
                ) : null}
              </RNCamera>
            </View>
          ) : (
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
                justifyContent: "center",
                borderStyle: "dashed",
                borderWidth: 2,
                borderRadius: orientation.isPortrait
                  ? RFValue(30)
                  : RFValue(20),
                borderColor: color.white,
              }}
            >
              <RNCamera
                ref={(ref) => {
                  this.camera = ref;
                }}
                captureAudio={false}
                style={{
                  width: orientation.isPortrait
                    ? orientation.height / 2.05
                    : orientation.height / 1.85,
                  height: orientation.isPortrait
                    ? orientation.height / 2.25
                    : orientation.height / 2.25,
                  borderRadius: orientation.isPortrait
                    ? RFValue(26)
                    : RFValue(20),
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                type={"front"}
                onCameraReady={cameraLoad}
              >
                {picture.length == 0 ? (
                  <Text
                    style={{
                      color: color.white,
                      fontSize: RFValue(30),
                      fontWeight: "300",
                      fontFamily: "SFProText-Regular",
                    }}
                  >
                    {second}
                  </Text>
                ) : null}
                {picture && picture.length != 0 ? (
                  <Image
                    source={{ uri: "data:image/png;base64," + picture }}
                    style={{
                      width: orientation.isPortrait
                        ? orientation.height / 2.05
                        : orientation.height / 1.85,
                      height: orientation.isPortrait
                        ? orientation.height / 2.25
                        : orientation.height / 2.25,
                      borderRadius: orientation.isPortrait
                        ? RFValue(26)
                        : RFValue(20),
                    }}
                  />
                ) : null}
              </RNCamera>
            </View>
          )}
          {picture && picture.length != 0 ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: orientation.isPortrait ? RFValue(20) : RFValue(20),
              }}
            >
              <Pressable
                onPress={() => retakeMyPicture()}
                style={{
                  ...CommonStyle.button,
                  width: orientation.isPortrait
                    ? orientation.width / 3.4
                    : orientation.height / 4,
                  height: orientation.isPortrait
                    ? orientation.width * 0.1
                    : orientation.height * 0.08,
                  backgroundColor: "",
                }}
              >
                <Text style={{ ...CommonStyle.btnText2, color: color.white }}>
                  {strings.retakePhoto}
                </Text>
              </Pressable>
              <Pressable
                onPress={onDone}
                style={{
                  ...CommonStyle.button,
                  width: orientation.isPortrait
                    ? orientation.width / 3.4
                    : orientation.height / 4,
                  height: orientation.isPortrait
                    ? orientation.width * 0.1
                    : orientation.height * 0.08,
                  backgroundColor: color.white,
                }}
              >
                <Text style={{ ...CommonStyle.btnText2, color: btnTextColor }}>
                  {strings.done}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </BlurView>
    </View>
  );
};

export default IDCaptureBackModal;

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
});
