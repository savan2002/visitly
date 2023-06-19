import { Text, View, Pressable, Image, LogBox, Modal } from "react-native";
import React, { useEffect, useState } from "react";
import { color } from "../../theme/colors";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import { RFValue } from "react-native-responsive-fontsize";
import Entypo from "react-native-vector-icons/Entypo";
import CommonStyle from "../../theme/CommonStyle";
import IDCaptureFrontModal from "../../components/IDCaptureFrontModal";
import IDCaptureBackModal from "../../components/IDCaptureBackModal";
import Ionicons from "react-native-vector-icons/Ionicons";
import RNButton from "react-native-button-sample";
import UserInactivity from "react-native-user-inactivity";
import CancleConfirmationModal from "../../components/CancleConfirmationModal";
import { LightenColor } from "../../resources/LightenColor";
import IdScanner from "../../assets/svg/idScanner.svg";
import Footer from "../../components/Footer";
import DeviceInfo from "react-native-device-info";
import { LogglyTracker } from "react-native-loggly-jslogger";
LogBox.ignoreAllLogs();
const IdCaptureScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  const purpose = route?.params?.purpose;
  const fullname = route?.params?.fullname;
  const email = route?.params?.email;
  const phone = route?.params?.phone;
  const host = route?.params?.host;
  const companyName = route?.params?.companyName;
  const purposeJson = route?.params?.purposeJson;
  const signature = route?.params?.signature;
  const skipSigningFlag = route?.params?.skipSigningFlag;
  const documentName = route?.params?.documentName;
  const hostId = route?.params?.hostId;
  const preRegisterVisitId = route?.params?.preRegisterVisitId;
  const fields = route?.params?.fields;
  const askDoc = route?.params?.askDoc;
  const params = route?.params?.params;
  const Idname = route?.params?.Idname;
  const IDType = route?.params?.IDType;
  const picture = route?.params?.picture;
  const frontOnly = route?.params?.frontOnly;
  const [showFrontModal, setShowFrontModal] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [frontPicture, setFrontPicture] = useState("");
  const [backPicture, setBackPicture] = useState("");
  const [showFrontImg, setShowFrontImg] = useState(false);
  const [showBackImg, setShowBackImg] = useState(false);
  const [showBlur, setShowBlur] = useState(true);
  const [buttonColor, setbuttonColor] = useState(false);
  const visitCustomFields = route?.params?.visitCustomFields;
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  var mainColor = orginfo ? orginfo.btnColor : "";
  var secondaryColor, thirdColor;
  secondaryColor = LightenColor(mainColor, 55);
  thirdColor = LightenColor(mainColor, 70);
  
  const macAddress = DeviceInfo.getUniqueIdSync();
  const logger = new LogglyTracker();

  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
  }, []);

  useEffect(() => {
    if (frontPicture) {
      setShowFrontImg(true);
    }
    if (frontOnly && frontPicture.length != 0) {
      setbuttonColor(true);
    }
  }, [frontPicture.length]);

  useEffect(() => {
    if (backPicture) {
      setShowBackImg(true);
    }
    if (frontPicture.length != 0 && backPicture.length != 0) {
      setbuttonColor(true);
    }
  }, [backPicture.length]);

  const handleClick = () => {
    logger.push({
      method:
        "User clicked Next button on Id capture screen.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    if (frontOnly && frontPicture.length == 0) {
      alert("please click front picture.");
    } else if (frontOnly && frontPicture.length != 0) {
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
        IDType: IDType,
        idFrontImageBase64String: frontPicture,
        idBackImageBase64String: backPicture,
        askDoc: askDoc,
        picture: picture,
        signature: signature,
      });
    } else if (frontPicture.length != 0 && backPicture.length != 0) {
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
        IDType: IDType,
        idFrontImageBase64String: frontPicture,
        idBackImageBase64String: backPicture,
        askDoc: askDoc,
        picture: picture,
        signature: signature,
      });
    } else {
      alert("Please click pictures.");
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
              style={{
                ...CommonStyle.btnBoxBackground,
                ...CommonStyle.shadow,
                backgroundColor: color.white,
              }}
            >
              <Entypo
                name="chevron-left"
                size={RFValue(18)}
                color={orginfo ? orginfo.btnColor : color.royal_blue}
                type="Entypo"
              />
            </Pressable>
          </View>

          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                ...CommonStyle.btnText2,
                fontSize: RFValue(13),
                color: color.tundora,
                marginTop: orientation.isPortrait ? RFValue(30) : RFValue(20),
                marginBottom: orientation.isPortrait
                  ? RFValue(20)
                  : RFValue(16),
              }}
            >
              {Idname}
            </Text>
            <Text
              style={{
                fontSize: RFValue(10),
                color: color.tundora,
                fontWeight: "400",
                fontFamily: "SFProText-Regular",
                marginBottom: orientation.isPortrait
                  ? RFValue(14)
                  : RFValue(20),
              }}
            >
              {strings.scan_doc}
            </Text>
          </View>

          <View
            style={{
              flexDirection: orientation.isPortrait ? "column" : "row",
              alignItems: "center",
              justifyContent: orientation.isPortrait ? "" : "space-evenly",
              marginTop: orientation.isPortrait ? RFValue(30) : RFValue(20),
            }}
          >
            <View
              style={{
                alignItems: "center",
                height: orientation.isPortrait
                  ? orientation.width / 3.4
                  : orientation.height / 3,
                width: orientation.isPortrait
                  ? orientation.width / 3.4
                  : orientation.height / 3,
                backgroundColor: color.white,
                ...CommonStyle.shadow,
                borderRadius: RFValue(8),
              }}
            >
              {showFrontImg ? (
                <Image
                  source={{ uri: "data:image/png;base64," + frontPicture }}
                  style={{
                    height: "70%",
                    width: "85%",
                    borderRadius: RFValue(5),
                    marginTop: RFValue(10),
                  }}
                />
              ) : (
                <Pressable
                  onPress={() => setShowFrontModal(true)}
                  style={{
                    height: "100%",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: RFValue(8),
                  }}
                >
                  <IdScanner
                    height={RFValue(40)}
                    width={RFValue(40)}
                    style={{ color: orginfo.btnColor }}
                  />
                </Pressable>
              )}
              {showFrontImg ? (
                <Pressable
                  onPress={() => setShowFrontModal(true)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: RFValue(10),
                  }}
                >
                  <Text
                    style={{
                      fontSize: RFValue(10),
                      color: orginfo.btnColor,
                      fontWeight: "400",
                      marginRight: RFValue(3),
                      fontFamily: "SFProText-Regular",
                    }}
                  >
                    {strings.retakePhoto}
                  </Text>
                  <Ionicons
                    name="ios-reload"
                    color={orginfo.btnColor}
                    size={RFValue(10)}
                    type="Ionicons"
                  />
                </Pressable>
              ) : (
                <Text
                  style={{
                    fontSize: RFValue(10),
                    color: color.cod_gray,
                    fontWeight: "400",
                    fontFamily: "SFProText-Regular",
                    marginTop: orientation.isPortrait
                      ? RFValue(12)
                      : RFValue(8),
                  }}
                >
                  {strings.front_side}
                </Text>
              )}
            </View>

            {!frontOnly ? (
              <View
                style={{
                  alignItems: "center",
                  height: orientation.isPortrait
                    ? orientation.width / 3.4
                    : orientation.height / 3,
                  width: orientation.isPortrait
                    ? orientation.width / 3.4
                    : orientation.height / 3,
                  backgroundColor: color.white,
                  ...CommonStyle.shadow,
                  borderRadius: RFValue(8),
                  marginTop: orientation.isPortrait ? RFValue(60) : 0,
                }}
              >
                {showBackImg ? (
                  <Image
                    source={{ uri: "data:image/png;base64," + backPicture }}
                    style={{
                      height: "70%",
                      width: "85%",
                      borderRadius: RFValue(5),
                      marginTop: RFValue(10),
                    }}
                  />
                ) : (
                  <Pressable
                    onPress={() => setShowBackModal(true)}
                    style={{
                      height: "100%",
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: RFValue(8),
                    }}
                  >
                    <IdScanner
                      height={RFValue(40)}
                      width={RFValue(40)}
                      style={{ color: orginfo.btnColor }}
                    />
                  </Pressable>
                )}
                {showBackImg ? (
                  <Pressable
                    onPress={() => setShowBackModal(true)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: RFValue(10),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: RFValue(10),
                        color: orginfo.btnColor,
                        fontWeight: "400",
                        marginRight: RFValue(3),
                        fontFamily: "SFProText-Regular",
                      }}
                    >
                      {strings.retakePhoto}
                    </Text>
                    <Ionicons
                      name="ios-reload"
                      color={orginfo.btnColor}
                      size={RFValue(10)}
                      type="Ionicons"
                    />
                  </Pressable>
                ) : (
                  <Text
                    style={{
                      fontSize: RFValue(10),
                      color: color.cod_gray,
                      fontWeight: "400",
                      fontFamily: "SFProText-Regular",
                      marginTop: orientation.isPortrait
                        ? RFValue(12)
                        : RFValue(8),
                    }}
                  >
                    {strings.back_side}
                  </Text>
                )}
              </View>
            ) : null}
            <Modal
              animationType={"fade"}
              transparent={true}
              visible={showFrontModal}
              onRequestClose={() => setShowFrontModal(false)}
            >
              {showBlur ? (
                <IDCaptureFrontModal
                  strings={strings}
                  result={frontPicture}
                  setResult={setFrontPicture}
                  btnTextColor={orginfo.btnColor}
                  title={strings.front_side}
                  onDone={() => {
                    setShowFrontModal(false);
                  }}
                  closeModal={() => setShowFrontModal(false)}
                />
              ) : null}
            </Modal>

            <Modal
              animationType={"fade"}
              transparent={true}
              visible={showBackModal}
              onRequestClose={() => setShowBackModal(false)}
            >
              {showBlur ? (
                <IDCaptureBackModal
                  strings={strings}
                  result={backPicture}
                  setResult={setBackPicture}
                  btnTextColor={orginfo.btnColor}
                  title={strings.back_side}
                  onDone={() => {
                    setShowBackModal(false);
                  }}
                  closeModal={() => setShowBackModal(false)}
                />
              ) : null}
            </Modal>
          </View>
        </View>

        <View
          style={{
            width: orientation.width,
            backgroundColor: color.white,
            ...CommonStyle.shadow,
            height: orientation.isPortrait ? "10%" : "15%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: RFValue(30),
          }}
        >
          <RNButton
            buttonTitle={strings.cancel}
            buttonStyle={{
              ...CommonStyle.button,
              alignItems: "",
              backgroundColor: "",
              width: orientation.isPortrait
                ? orientation.width / 4
                : orientation.height / 3.4,
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

          <RNButton
            buttonTitle={strings.setup_next}
            buttonStyle={{
              ...CommonStyle.button,
              backgroundColor: buttonColor ? orginfo.btnColor : color.silver,
              width: orientation.isPortrait
                ? orientation.width / 4
                : orientation.height / 3.4,
              height: orientation.isPortrait
                ? orientation.width * 0.08
                : orientation.height * 0.08,
            }}
            btnTextStyle={{ ...CommonStyle.btnText2, color: color.white }}
            onPress={() => handleClick()}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: orientation.isPortrait
                ? orientation.width / 4
                : orientation.height / 3.4,
            }}
          >
            <Footer />
          </View>
        </View>
      </View>
    </UserInactivity>
  );
};

export default IdCaptureScreen;
