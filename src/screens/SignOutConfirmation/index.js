import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CommonStyle from "../../theme/CommonStyle";
import CancleWithFooter from "../../components/CancleWithFooter";
import Entypo from "react-native-vector-icons/Entypo";
import moment from "moment";
import RNButton from "react-native-button-sample";
import styles from "./styles";
import UserInactivity from "react-native-user-inactivity";
import CancleConfirmationModal from "../../components/CancleConfirmationModal";
import { LightenColor } from "../../resources/LightenColor";
import Facescan from "../../assets/svg/facescan.svg";
import UserIcon from "../../assets/svg/user.svg";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
import crashlytics from "@react-native-firebase/crashlytics";
const SignOutConfirmation = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  const userObject = route?.params?.userObject;
  const visitorSignoutFields = route?.params?.visitorSignoutFields;
  const signoutVisitId = route?.params?.signoutVisitId;
  const [userName, setuserName] = useState(userObject?.fullName);
  var mainColor = orginfo ? orginfo.btnColor : "";
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  var now = moment().format("YYYY-MM-DDTHH:mm:ss");
  const logger = new LogglyTracker();
  const macAddress = DeviceInfo.getUniqueIdSync();

  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
    const date1 = moment(new Date()).format("YYYY-MM-DDTHH:mm:ss");
    const date2 = moment(userObject.checkinTime).format("YYYY-MM-DDTHH:mm:ss");
    const diff = Math.abs(new Date(date1) - new Date(date2));
    var totalMinutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalDuration = `${hours}:${minutes} hrs`;
    setDuration(totalDuration);
  }, []);

  var mainColor = orginfo ? orginfo.btnColor : "";
  var secondaryColor, thirdColor;
  secondaryColor = LightenColor(mainColor, 55);
  thirdColor = LightenColor(mainColor, 75);

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
    if (visitorSignoutFields.length > 0) {
      logger.push({
        method: "Visitor Sign out fields exist.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      logger.push({
        method: "User navigate to Visitor Sign Out Fields Screen.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      navigation.navigate("SignoutInfo", {
        strings: strings,
        visitorSignoutFields: visitorSignoutFields,
        orginfo: orginfo,
        signoutVisitId: signoutVisitId,
        userObject: userObject,
      });
    } else {
      logger.push({
        method: "Visitor Sign out fields not exist.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
      setLoading(true);
      const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
      fetch(url + "/visits/" + signoutVisitId, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + ACtoken,
        },
        body: JSON.stringify({
          checkoutTime: now,
        }),
      }).then((response) => {
        logger.push({
          method: "Visitor Sign out successfully.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log(
          "Visitor Sign out successfully"
        );
        logger.push({
          method: "User navigate to Visitor Sign Out Success Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        setLoading(false);
        navigation.navigate("SignoutSuccess", {
          strings: strings,
          orginfo: orginfo,
          userName: userName,
        });
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

          <View
            style={{
              alignItems: "center",
              justifyContent: orientation.isPortrait
                ? "center"
                : "space-evenly",
              flexDirection: orientation.isPortrait ? "column" : "row",
              marginTop: orientation.isPortrait
                ? orientation.width / 4
                : orientation.height / 8,
            }}
          >
            <View
              style={{
                height: orientation.isPortrait
                  ? orientation.width / 1.9
                  : orientation.height / 1.9,
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
                  <Text
                    style={{
                      ...CommonStyle.text3,
                      fontSize: RFValue(10),
                    }}
                  >
                    &nbsp;{strings.hello},&nbsp;{strings.welcome_back}!
                  </Text>
                </View>

                {userObject.visitPhotoURI ? (
                  <Image
                    source={{ uri: userObject.visitPhotoURI }}
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
                  {userObject.fullName}
                </Text>
                {userObject && userObject?.email ? (
                  <Text style={{ ...CommonStyle.text3, marginTop: RFValue(8) }}>
                    {callme(userObject?.email)}
                  </Text>
                ) : null}
                {userObject && userObject.hostName ? (
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
                      {userObject.hostName}
                    </Text>
                  </Text>
                ) : null}
                <Text
                  style={{
                    ...CommonStyle.text3,
                    marginTop: RFValue(8),
                  }}
                >
                  {strings.sign_on}&nbsp;
                  <Text
                    style={{
                      ...CommonStyle.text3,
                      color: color.spanishGray,
                    }}
                  >
                    {moment(userObject.checkinTime).format(
                      "hh:mma MMM DD, YYYY"
                    )}
                  </Text>
                </Text>
                <Text
                  style={{
                    ...CommonStyle.text3,
                    marginTop: RFValue(8),
                  }}
                >
                  {strings.duration}:&nbsp;
                  <Text
                    style={{
                      ...CommonStyle.text3,
                      color: color.spanishGray,
                    }}
                  >
                    {duration}
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

export default SignOutConfirmation;
