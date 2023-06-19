import { Text, View, Image, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import CommonStyle from "../../theme/CommonStyle";
import CancleWithFooter from "../../components/CancleWithFooter";
import Entypo from "react-native-vector-icons/Entypo";
import moment from "moment";
import RNButton from "react-native-button-sample";
import styles from "./styles";
import UserInactivity from "react-native-user-inactivity";
import { LightenColor } from "../../resources/LightenColor";
import CancleConfirmationModal from "../../components/CancleConfirmationModal";
import Facescan from "../../assets/svg/facescan.svg";
import UserIcon from "../../assets/svg/user.svg";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
const RevisitConfirmation = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  const picture = route?.params?.picture ? route?.params?.picture : "";
  const fullname = route?.params?.faceIdInfo
    ? route?.params?.faceIdInfo.fullName
    : "";
  const email = route?.params?.faceIdInfo
    ? route?.params?.faceIdInfo.email
    : "";
  const host = route?.params?.faceIdInfo ? route?.params?.faceIdInfo.host : "";
  const companyName = route?.params?.faceIdInfo
    ? route?.params?.faceIdInfo.companyName
    : "";
  const phone = route?.params?.faceIdInfo
    ? route?.params?.faceIdInfo.phone
    : "";
  const hostId = route?.params?.faceIdInfo
    ? route?.params?.faceIdInfo.hostId
    : "";
  const preRegisterVisitId = route?.params?.preRegisterVisitId
    ? route?.params?.preRegisterVisitId
    : "";
  const visitCustomFields =
    route?.params?.faceIdInfo &&
    route?.params?.faceIdInfo?.visitCustomFields?.length
      ? route?.params?.faceIdInfo.visitCustomFields
      : "";
  const purpose = route?.params?.purpose;
  const checkinTime = route?.params?.checkinTime;
  const isPrerigster = route?.params?.isPrerigster;
  var mainColor = orginfo ? orginfo.btnColor : "";
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  var now = moment().format("YYYY-MM-DDTHH:mm:ss");
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  var mainColor = orginfo ? orginfo.btnColor : "";
  var secondaryColor, thirdColor;
  secondaryColor = LightenColor(mainColor, 55);
  thirdColor = LightenColor(mainColor, 75);
  const logger = new LogglyTracker();
  const macAddress = DeviceInfo.getUniqueIdSync();

  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
  }, []);

  function callme(input) {
    var a = input?.split("@");
    var b = a[0];
    var newstr = "";
    for (var i in b) {
      if (i > 1 && i < b.length - 1) newstr += "*";
      else newstr += b[i];
    }
    return newstr + "@" + a[1];
  }

  const confirmsubmit = async () => {
    logger.push({
      method: "User clicked yes button for next screen.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
    });
    if (isPrerigster) {
      logger.push({
        method: "User navigate to Visitor Fields Screen.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      navigation.navigate("Info", {
        strings: strings,
        purpose: purpose,
        orginfo: orginfo,
        picture: picture,
        faceId: picture,
        preRegisterVisitId: preRegisterVisitId,
        qrNotFound: true,
        faceIdInfo: {
          fullName: fullname,
          email: email,
          companyName: companyName,
          phone: phone,
          host: host,
          hostId: hostId,
          visitCustomFields: visitCustomFields ? visitCustomFields : [],
        },
      });
    } else {
      if (orginfo.visitorType.length == 1) {
        logger.push({
          method: "User navigate to Visitor Fields Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        navigation.navigate("Info", {
          strings: strings,
          purpose: purpose,
          orginfo: orginfo,
          picture: picture,
          faceId: picture,
          preRegisterVisitId: preRegisterVisitId,
          qrNotFound: true,
          faceIdInfo: {
            fullName: fullname,
            email: email,
            companyName: companyName,
            phone: phone,
            host: host,
            hostId: hostId,
            visitCustomFields: visitCustomFields ? visitCustomFields : [],
          },
        });
      } else {
        logger.push({
          method: "User navigate to Visitor Type Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        navigation.navigate("VisitorType", {
          strings: strings,
          purpose: "",
          orginfo: orginfo,
          picture: picture,
          faceId: picture,
          preRegisterVisitId: preRegisterVisitId,
          qrNotFound: true,
          faceIdInfo: {
            fullName: fullname,
            email: email,
            companyName: companyName,
            phone: phone,
            host: host,
            hostId: hostId,
            visitCustomFields: visitCustomFields ? visitCustomFields : [],
          },
        });
      }
    }
  };

  return (
    <UserInactivity
      timeForInactivity={timer}
      isActive={true}
      checkInterval={5000}
      onAction={() => navigation.navigate("Home")}
    >
      <View style={CommonStyle.mainScreen}>
        <View style={{ flex: 1 }}>
          <View style={CommonStyle.headerContainer}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={{
                ...CommonStyle.btnBoxBackground,
                ...CommonStyle.shadow,
              }}
            >
              <Entypo
                name="chevron-left"
                size={RFValue(18)}
                color={orginfo ? orginfo.btnColor : ""}
              />
            </Pressable>
          </View>

          <View style={{ alignItems: "center" }}>
            {isPrerigster ? (
              <Text
                style={{
                  ...CommonStyle.text2,
                  textAlign: "center",
                  marginTop: orientation.isPortrait ? RFValue(30) : RFValue(20),
                  maxWidth: orientation.isPortrait ? "60%" : "100%",
                }}
              >
                {strings.preregister_details}
              </Text>
            ) : null}
          </View>

          <View
            style={
              isPrerigster
                ? {
                    alignItems: "center",
                    justifyContent: orientation.isPortrait
                      ? "center"
                      : "space-evenly",
                    flexDirection: orientation.isPortrait ? "column" : "row",
                    marginTop: orientation.isPortrait
                      ? orientation.width / 6
                      : orientation.height / 10,
                  }
                : {
                    alignItems: "center",
                    justifyContent: orientation.isPortrait
                      ? "center"
                      : "space-evenly",
                    flexDirection: orientation.isPortrait ? "column" : "row",
                    marginTop: orientation.isPortrait
                      ? orientation.width / 4
                      : orientation.height / 8,
                  }
            }
          >
            <View
              style={{
                height: orientation.isPortrait
                  ? orientation.width / 2.1
                  : orientation.height / 2.1,
                width: orientation.isPortrait
                  ? orientation.height / 3
                  : orientation.width / 3,
                borderRadius: RFValue(8),
                backgroundColor: color.white,
                ...CommonStyle.shadow,
              }}
            >
              <View
                style={{
                  backgroundColor: thirdColor,
                  ...styles.containerSmall,
                }}
              >
                <View style={styles.innerStyle}>
                  <Facescan
                    style={{ color: orginfo.btnColor }}
                    height={RFValue(14)}
                    width={RFValue(14)}
                  />
                  {isPrerigster ? (
                    <Text
                      style={{
                        ...CommonStyle.text3,
                        fontSize: RFValue(10),
                      }}
                    >
                      &nbsp;{strings.hello},&nbsp;{strings.welcome}!
                    </Text>
                  ) : (
                    <Text
                      style={{
                        ...CommonStyle.text3,
                        fontSize: RFValue(10),
                      }}
                    >
                      &nbsp;{strings.hello},&nbsp;{strings.welcome_back}!
                    </Text>
                  )}
                </View>

                {picture ? (
                  <Image
                    source={{ uri: picture }}
                    style={{
                      ...styles.photoStyle,
                      height: RFValue(70),
                      width: RFValue(70),
                    }}
                  />
                ) : (
                  <UserIcon
                    height={RFValue(68)}
                    width={RFValue(68)}
                    style={{
                      ...styles.photoStyle,
                      borderRadius: RFValue(33),
                    }}
                  />
                )}
              </View>
              <View style={{ alignItems: "center", marginTop: RFValue(45) }}>
                <Text style={{ ...CommonStyle.btnText1, letterSpacing: 0 }}>
                  {fullname}
                </Text>
                {route?.params?.faceIdInfo?.email ? (
                  <Text style={{ ...CommonStyle.text3, marginTop: RFValue(8) }}>
                    {callme(route?.params?.faceIdInfo?.email)}
                  </Text>
                ) : null}
                {host ? (
                  <Text
                    style={{
                      ...CommonStyle.text3,
                      letterSpacing: 0,
                      marginTop: RFValue(8),
                    }}
                  >
                    {strings.host}
                    <Text
                      style={{
                        ...CommonStyle.text3,
                        color: color.spanishGray,
                        letterSpacing: 0,
                      }}
                    >
                      {host}
                    </Text>
                  </Text>
                ) : null}
                <Text
                  style={{
                    ...CommonStyle.text3,
                    marginTop: RFValue(8),
                  }}
                >
                  {isPrerigster
                    ? `${strings.schedule_date}`
                    : `${strings.last_visit}`}
                  &nbsp;
                  <Text
                    style={{
                      ...CommonStyle.text3,
                      color: color.spanishGray,
                    }}
                  >
                    {moment(checkinTime).format("hh:mma MMM DD, YYYY")}
                  </Text>
                </Text>
              </View>
            </View>
            <View>
              <RNButton
                buttonTitle={strings.its_me}
                buttonStyle={{
                  ...CommonStyle.button,
                  backgroundColor: orginfo ? orginfo.btnColor : "",
                  width: orientation.isPortrait
                    ? orientation.width / 4
                    : orientation.height / 4,
                  height: orientation.isPortrait
                    ? orientation.width / 14
                    : orientation.height / 14,
                  marginTop: orientation.isPortrait ? RFValue(30) : RFValue(20),
                }}
                btnTextStyle={{ ...CommonStyle.btnText2, color: color.white }}
                onPress={() => confirmsubmit()}
              />
              <RNButton
                buttonTitle={strings.not_you}
                buttonStyle={{
                  ...CommonStyle.button,
                  backgroundColor: "",
                  width: orientation.isPortrait
                    ? orientation.width / 4
                    : orientation.height / 4,
                  height: orientation.isPortrait
                    ? orientation.width / 14
                    : orientation.height / 14,
                  marginTop: orientation.isPortrait ? RFValue(20) : RFValue(10),
                }}
                btnTextStyle={{
                  ...CommonStyle.btnText2,
                  color: orginfo ? orginfo.btnColor : "",
                }}
                onPress={() => navigation.goBack()}
              />
            </View>
          </View>
        </View>
        <CancleWithFooter
          strings={strings}
          onCancle={() => setShowCancle(true)}
          BGColor={color.white}
        />
        <CancleConfirmationModal
          strings={strings}
          isVisible={showCancle}
          primaryColor={orginfo.btnColor}
          secondaryColor={secondaryColor}
          onClose={() => setShowCancle(false)}
        />
      </View>
    </UserInactivity>
  );
};

export default RevisitConfirmation;
