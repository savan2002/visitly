import { Text, View, Pressable, Image, LogBox } from "react-native";
import React, { useState, useEffect } from "react";
import { RFValue } from "react-native-responsive-fontsize";
import Entypo from "react-native-vector-icons/Entypo";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import RNButton from "react-native-button-sample";
import Footer from "../../components/Footer";
import { RNCamera } from "react-native-camera";
import CommonStyle from "../../theme/CommonStyle";
import { color } from "../../theme/colors";
import styles from "./styles";
import UserInactivity from "react-native-user-inactivity";
import CancleConfirmationModal from "../../components/CancleConfirmationModal";
import { LightenColor } from "../../resources/LightenColor";
import DeviceInfo from "react-native-device-info";
import { LogglyTracker } from "react-native-loggly-jslogger";
LogBox.ignoreAllLogs();
const PictureScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const strings = route?.params?.strings;
  var timeing = 6;
  const [second, setSecond] = useState(strings.ready_photo);
  const [picture, setPicture] = useState();
  const [retakePicture, setReTakePicture] = useState(true);
  const [colorFlag, setColorFlag] = useState(false);
  const orginfo = route?.params?.orginfo;
  const fullname = route?.params?.fullname;
  const email = route?.params?.email;
  const phone = route?.params?.phone;
  const host = route?.params?.host;
  const companyName = route?.params?.companyName;
  const hostId = route?.params?.hostId;
  const params = route?.params?.params;
  const idFrontImageBase64String = route?.params?.idFrontImageBase64String;
  const idBackImageBase64String = route?.params?.idBackImageBase64String;
  const [purpose, setPurpose] = useState(
    route?.params?.purpose ? route?.params?.purpose : []
  );
  const purposeJson = route?.params?.purposeJson;
  const signature = route?.params?.signature;
  const skipSigningFlag = route?.params?.skipSigningFlag;
  const documentName = route?.params?.documentName;
  const fields = route?.params?.fields;
  const askDoc = route?.params?.askDoc;
  const visitCustomFields = route?.params?.visitCustomFields;
  const preRegisterVisitId = route?.params?.preRegisterVisitId
    ? route?.params?.preRegisterVisitId
    : "";
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  var mainColor = orginfo ? orginfo.btnColor : "";
  var secondaryColor, thirdColor;
  secondaryColor = LightenColor(mainColor, 55);
  thirdColor = LightenColor(mainColor, 75);
  const macAddress = DeviceInfo.getUniqueIdSync();
  const logger = new LogglyTracker();

  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
  }, []);
  
  const takepicture = async () => {
    logger.push({
      method:
        "Clicked visitor photo for visitor sign in after 5 second.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    if (this.camera) {
      const options = {
        base64: true,
        width: 500,
        mirrorImage: true,
      };
      await this.camera.takePictureAsync(options).then((data) => {
        setPicture(data.base64);
        setReTakePicture(false);
      });
    }
  };

  const cameraLoad = () => {
    var timerId = setInterval(() => {
      timeing = timeing - 1;
      clearInterval();
      if (timeing == 5) {
        handleClick();
        clearInterval(timerId);
      }
    }, 1000);
  };

  const handleClick = () => {
    var timerId = setInterval(() => {
      setColorFlag(true);
      setSecond(timeing);
      timeing = timeing - 1;
      clearInterval();
      if (timeing == 0) {
        setSecond(strings.click + "!");
        clearInterval(timerId);
        takepicture();
      }
    }, 1000);
  };

  const capturePicture = () => {
    timeing = 0;
    takepicture();
  };

  const retakeMyPicture = () => {
    timeing = 6;
    setColorFlag(false);
    setSecond(strings.ready_photo);
    setReTakePicture(true);
  };

  const handleNext = async () => {
    if (purposeJson.isIdCapturingEnabled) {
      logger.push({
        method: "User navigate to Id Type Screen.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      navigation.navigate("IDType", {
        strings: strings,
        fullname: fullname,
        email: email,
        purpose: purpose,
        host: host,
        phone: phone,
        purposeJson: purposeJson,
        hostId: hostId,
        skipSigningFlag: skipSigningFlag,
        documentName: documentName,
        orginfo: orginfo,
        companyName: companyName,
        preRegisterVisitId: preRegisterVisitId,
        fields: visitCustomFields,
        askDoc: askDoc,
        params: params,
        picture: picture,
        signature: signature,
      });
    } else {
      logger.push({
        method: "User navigate to Confirmation Screen.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      navigation.navigate("Confirmation", {
        strings: strings,
        fullname: fullname,
        email: email,
        purpose: purpose,
        host: host,
        phone: phone,
        purposeJson: purposeJson,
        hostId: hostId,
        skipSigningFlag: skipSigningFlag,
        documentName: documentName,
        orginfo: orginfo,
        companyName: companyName,
        preRegisterVisitId: preRegisterVisitId,
        fields: visitCustomFields,
        params: params,
        idFrontImageBase64String: idFrontImageBase64String,
        idBackImageBase64String: idBackImageBase64String,
        askDoc: askDoc,
        picture: picture,
        signature: signature,
      });
    }
  };

  return (
    <UserInactivity
      checkInterval={5000}
      timeForInactivity={timer}
      isActive={true}
      onAction={() => navigation.navigate("Home")}
    >
      <View style={CommonStyle.mainScreen}>
        <View style={CommonStyle.mainScreen}>
          <View style={CommonStyle.headerContainer}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ ...CommonStyle.btnBoxBackground, ...CommonStyle.shadow }}
            >
              <Entypo
                name="chevron-left"
                size={RFValue(18)}
                color={orginfo ? orginfo.btnColor : color.royal_blue}
              />
            </Pressable>
          </View>
          {retakePicture ? (
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  ...styles.titleText,
                  marginTop: orientation.isPortrait ? RFValue(40) : RFValue(20),
                  fontSize: colorFlag ? RFValue(20) : RFValue(16),
                  fontWeight: colorFlag ? "700" : "400",
                  color: colorFlag ? orginfo.btnColor : color.cod_gray,
                }}
              >
                {second}
              </Text>
              <View
                style={{
                  marginTop: colorFlag ? RFValue(25) : RFValue(30),
                  borderColor: orginfo.btnColor,
                  borderWidth: 2,
                  borderStyle: "dashed",
                  width: orientation.isPortrait
                    ? orientation.height / 1.99
                    : orientation.height / 1.99,
                  height: orientation.isPortrait
                    ? orientation.height / 1.99
                    : orientation.height / 1.99,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: orientation.isPortrait
                    ? orientation.height / 1.2 / 2
                    : orientation.height / 1.2 / 2,
                }}
              >
                <View
                  style={{
                    width: orientation.isPortrait
                      ? orientation.height / 2
                      : orientation.height / 2,
                    height: orientation.isPortrait
                      ? orientation.height / 2
                      : orientation.height / 2,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: orientation.isPortrait
                      ? orientation.height / 1.45 / 2
                      : orientation.height / 1.45 / 2,
                  }}
                >
                  <RNCamera
                    ref={(ref) => {
                      this.camera = ref;
                    }}
                    captureAudio={false}
                    style={{
                      width: orientation.isPortrait
                        ? orientation.height / 2
                        : orientation.height / 1.4,
                      height: orientation.isPortrait
                        ? orientation.height / 1.6
                        : orientation.width / 1.6,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    pictureSize="200"
                    type={"front"}
                    autoFocus={RNCamera.Constants.AutoFocus.on}
                    onCameraReady={cameraLoad}
                  />
                </View>
              </View>
              <RNButton
                buttonTitle={strings.click}
                buttonStyle={{
                  ...CommonStyle.button,
                  backgroundColor: orginfo ? orginfo.btnColor : "",
                  width: orientation.isPortrait
                    ? orientation.width / 3.4
                    : orientation.height / 3.4,
                  height: orientation.isPortrait
                    ? orientation.width * 0.1
                    : orientation.height * 0.08,
                  marginTop: orientation.isPortrait ? RFValue(40) : RFValue(20),
                }}
                btnTextStyle={{ ...CommonStyle.btnText2, color: color.white }}
                onPress={() => capturePicture()}
              />
            </View>
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  marginTop: orientation.isPortrait ? RFValue(40) : RFValue(20),
                  ...styles.titleText,
                  color: color.cod_gray,
                }}
              >
                {strings.great}!
              </Text>
              <View
                style={{
                  marginTop: orientation.isPortrait ? RFValue(40) : RFValue(20),
                  borderColor: orginfo ? orginfo.btnColor : "",
                  borderWidth: 2,
                  borderStyle: "dashed",
                  width: orientation.isPortrait
                    ? orientation.height / 2
                    : orientation.height / 2,
                  height: orientation.isPortrait
                    ? orientation.height / 2
                    : orientation.height / 2,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: orientation.isPortrait
                    ? orientation.height / 2 / 2
                    : orientation.height / 1.8 / 2,
                }}
              >
                <Image
                  source={{ uri: "data:image/png;base64," + picture }}
                  style={{
                    width: orientation.isPortrait
                      ? orientation.height / 2.01
                      : orientation.height / 2.01,
                    height: orientation.isPortrait
                      ? orientation.height / 2.01
                      : orientation.height / 2.01,
                    borderRadius: orientation.isPortrait
                      ? orientation.height / 2 / 2
                      : orientation.height / 1.8 / 2,
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: orientation.isPortrait ? RFValue(40) : RFValue(20),
                }}
              >
                <RNButton
                  buttonTitle={strings.retakePhoto}
                  buttonStyle={{
                    ...CommonStyle.button,
                    backgroundColor: "",
                    width: orientation.isPortrait
                      ? orientation.width / 3.4
                      : orientation.height / 3.4,
                    height: orientation.isPortrait
                      ? orientation.width * 0.1
                      : orientation.height * 0.08,
                  }}
                  btnTextStyle={{
                    ...CommonStyle.btnText2,
                    color: orginfo ? orginfo.btnColor : "",
                  }}
                  onPress={() => retakeMyPicture()}
                />
                <RNButton
                  buttonTitle={strings.setup_next}
                  buttonStyle={{
                    ...CommonStyle.button,
                    backgroundColor: orginfo ? orginfo.btnColor : "",
                    width: orientation.isPortrait
                      ? orientation.width / 3.4
                      : orientation.height / 3.4,
                    height: orientation.isPortrait
                      ? orientation.width * 0.1
                      : orientation.height * 0.08,
                  }}
                  btnTextStyle={{ ...CommonStyle.btnText2, color: color.white }}
                  onPress={() => handleNext()}
                />
              </View>
            </View>
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: RFValue(30),
            paddingBottom: orientation.isPortrait ? RFValue(18) : RFValue(10),
            paddingTop: orientation.isPortrait ? RFValue(16) : RFValue(10),
            width: "100%",
            backgroundColor: color.white,
          }}
        >
          <RNButton
            buttonTitle={strings.cancel}
            buttonStyle={{
              ...CommonStyle.button,
            }}
            btnTextStyle={{
              ...CommonStyle.btnText2,
              color: color.boulder,
            }}
            onPress={() => setShowCancle(true)}
          />
          <CancleConfirmationModal
            strings={strings}
            isVisible={showCancle}
            primaryColor={orginfo.btnColor}
            secondaryColor={secondaryColor}
            onClose={() => setShowCancle(false)}
          />
          <Footer />
        </View>
      </View>
    </UserInactivity>
  );
};

export default PictureScreen;
