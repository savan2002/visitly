import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Alert,
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
import styles from "./styles";
import Feather from "react-native-vector-icons/Feather";
import UserInactivity from "react-native-user-inactivity";
import CancleConfirmationModal from "../../components/CancleConfirmationModal";
import { LightenColor } from "../../resources/LightenColor";
import {
  postEmployeeSignInfo,
  patchEmployeeSignInfo,
} from "../../services/employee/employee.service";
import UserIcon from "../../assets/svg/user.svg";
import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
const EmployeeConfirmation = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  const userinfo = route?.params?.userinfo;
  const signinInfo = route?.params?.signinInfo;
  const visitorSignoutFields = route?.params?.visitorSignoutFields;
  const signoutVisitId = route?.params?.signoutVisitId;
  const isSignIn = route?.params?.isSignIn;
  var mainColor = orginfo ? orginfo.btnColor : "";
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  var now = moment().format("YYYY-MM-DDTHH:mm:ss");
  const signinDateTime = moment().format("YYYY-MM-DDTHH:mm:ss");
  const logger = new LogglyTracker();
  const macAddress = DeviceInfo.getUniqueIdSync();

  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
    const date1 = moment(new Date()).format("YYYY-MM-DDTHH:mm:ss");
    const date2 = moment(signinInfo?.createTime).format("YYYY-MM-DDTHH:mm:ss");
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

  const confirmSignin = async () => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "Employee clicked sign in button for sign in.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    crashlytics().log("Employee clicked sign in button for sign in.");
    const payload = {
      siteId: orginfo.siteId,
      checkinTime: signinDateTime,
      userId: userinfo.id,
      employeeSigninConfigId: orginfo.employeeSigninConfigModel.id,
      employeeSigninLogCustomFieldModels: [],
      checkinMethod: "DEVICE",
    };
    if (
      orginfo.employeeSigninConfigModel &&
      orginfo.employeeSigninConfigModel.fields &&
      orginfo.employeeSigninConfigModel.fields.length > 0
    ) {
      logger.push({
        method: "User navigate to Employee Sign In Fields Screen.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      navigation.navigate("EmployeeInfo", {
        strings: strings,
        orginfo: orginfo,
        userinfo: userinfo,
        isSignIn: isSignIn,
      });
    } else {
      await analytics().logEvent("employee_confirmation", {
        screen_name: "Employee Confirmation",
        api_url: `${url}/employeesignin`,
      });
      const response = await postEmployeeSignInfo(url, payload);
      logger.push({
        method: "Api call successful to employee sign in.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      crashlytics().log("Api call successful to employee sign in");
      if (response) {
        logger.push({
          method: "User navigate to Employee Sign In Success Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        navigation.navigate("EmployeeSuccess", {
          strings: strings,
          orginfo: orginfo,
          userinfo: userinfo,
          userName: `${userinfo.firstName} ${userinfo.lastName}`,
          allowSigninFlag: true,
          signInOut: false,
          isSignIn: isSignIn,
        });
      }
    }
  };

  // final employee signout api
  const confirmSignout = async () => {
    setLoading(true);
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "Employee clicked Sign out button for sign out.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    await analytics().logEvent("employee_sign_out", {
      screen_name: "Employee Confirmation",
      api_url: `${url}/employeesignin/$EMPID`,
    });
    const currentDateTime = moment().format("YYYY-MM-DDTHH:mm:ss");
    const payload = {
      checkoutTime: currentDateTime,
    };
    const response = await patchEmployeeSignInfo(url, payload, signinInfo.id);
    logger.push({
      method: "Api call successful to employee sign out.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    crashlytics().log("Api call successful to employee sign out");
    if (response) {
      logger.push({
        method: "User navigate to Employee Sign Out Success Screen.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      setLoading(false);
      navigation.navigate("EmployeeSuccess", {
        strings: strings,
        orginfo: orginfo,
        userinfo: userinfo,
        userName: `${userinfo.firstName} ${userinfo.lastName}`,
        allowSigninFlag: true,
        signInOut: true,
        isSignIn: isSignIn,
      });
    } else {
      setLoading(false);
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

          <View style={{ alignItems: "center" }}>
            {isSignIn ? (
              <Text
                style={{
                  ...CommonStyle.btnText1,
                  textAlign: "center",
                  color: color.tundora,
                  marginTop: orientation.isPortrait ? RFValue(60) : RFValue(20),
                  maxWidth: orientation.isPortrait ? "60%" : "100%",
                }}
              >
                {strings.hello}&nbsp;
                <Text style={{ textTransform: "capitalize" }}>
                  {userinfo.firstName}!
                </Text>
                &nbsp;
                <Text style={{ textTransform: "lowercase" }}>
                  {strings.welcome_back}.
                </Text>
              </Text>
            ) : (
              <Text
                style={{
                  ...CommonStyle.btnText1,
                  textAlign: "center",
                  color: color.cod_gray,
                  marginTop: orientation.isPortrait ? RFValue(60) : RFValue(20),
                  maxWidth: orientation.isPortrait ? "60%" : "100%",
                }}
              >
                {strings.hello}&nbsp;
                <Text style={{ textTransform: "capitalize" }}>
                  {userinfo.firstName}!
                </Text>
                &nbsp;
                <Text style={{ textTransform: "" }}>
                  {strings.thanks_visit}.
                </Text>
              </Text>
            )}
          </View>

          <View
            style={{
              alignItems: "center",
              justifyContent: orientation.isPortrait
                ? "center"
                : "space-evenly",
              flexDirection: orientation.isPortrait ? "column" : "row",
              marginTop: orientation.isPortrait
                ? orientation.width / 8
                : orientation.height / 12,
            }}
          >
            <View
              style={
                isSignIn
                  ? {
                      height: orientation.isPortrait
                        ? orientation.width / 2.3
                        : orientation.height / 2.3,
                      width: orientation.isPortrait
                        ? orientation.height / 3
                        : orientation.width / 3,
                      borderRadius: RFValue(8),
                      backgroundColor: color.white,
                      ...CommonStyle.shadow,
                    }
                  : {
                      height: orientation.isPortrait
                        ? orientation.width / 1.9
                        : orientation.height / 1.9,
                      width: orientation.isPortrait
                        ? orientation.height / 3
                        : orientation.width / 3,
                      borderRadius: RFValue(8),
                      backgroundColor: color.white,
                      ...CommonStyle.shadow,
                    }
              }
            >
              <View
                style={{
                  backgroundColor: thirdColor,
                  ...styles.containerSmall,
                }}
              >
                {userinfo.avatarUri ? (
                  <Image
                    source={{ uri: userinfo?.avatarUri }}
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
                  {userinfo?.firstName}&nbsp;{userinfo?.lastName}
                </Text>
                {userinfo && userinfo?.email ? (
                  <Text style={{ ...CommonStyle.text3, marginTop: RFValue(8) }}>
                    {userinfo?.email}
                  </Text>
                ) : null}
                {isSignIn ? (
                  <Text
                    style={{
                      ...CommonStyle.text3,
                      marginTop: RFValue(8),
                    }}
                  >
                    {strings.location}:&nbsp;
                    <Text
                      style={{
                        ...CommonStyle.text3,
                        color: color.spanishGray,
                      }}
                    >
                      {orginfo.siteName}
                    </Text>
                  </Text>
                ) : (
                  <Text
                    style={{
                      ...CommonStyle.text3,
                      marginTop: RFValue(8),
                    }}
                  >
                    {strings.location}:&nbsp;
                    <Text
                      style={{
                        ...CommonStyle.text3,
                        color: color.spanishGray,
                      }}
                    >
                      {signinInfo.siteName}
                    </Text>
                  </Text>
                )}
                {isSignIn ? null : (
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
                      {moment(userinfo?.checkinTime).format(
                        "hh:mma MMM DD, YYYY"
                      )}
                    </Text>
                  </Text>
                )}
                {isSignIn ? null : (
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
                )}
              </View>
            </View>
            <View>
              {isSignIn ? (
                <Pressable
                  style={{
                    ...CommonStyle.button,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: orginfo ? orginfo.btnColor : "",
                    width: orientation.isPortrait
                      ? orientation.width / 4
                      : orientation.height / 4,
                    height: orientation.isPortrait
                      ? orientation.width / 14
                      : orientation.height / 14,
                    marginTop: orientation.isPortrait
                      ? RFValue(40)
                      : RFValue(20),
                  }}
                  onPress={() => confirmSignin()}
                >
                  <Text style={{ ...CommonStyle.btnText2, color: color.white }}>
                    {strings.signin}
                  </Text>
                  <Feather
                    name="log-in"
                    size={RFValue(14)}
                    color={color.white}
                    style={{ marginLeft: RFValue(5) }}
                  />
                </Pressable>
              ) : (
                <Pressable
                  style={{
                    ...CommonStyle.button,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: orginfo ? orginfo.btnColor : "",
                    width: orientation.isPortrait
                      ? orientation.width / 4
                      : orientation.height / 4,
                    height: orientation.isPortrait
                      ? orientation.width / 14
                      : orientation.height / 14,
                    marginTop: orientation.isPortrait
                      ? RFValue(40)
                      : RFValue(20),
                  }}
                  onPress={() => confirmSignout()}
                >
                  <Text style={{ ...CommonStyle.btnText2, color: color.white }}>
                    {strings.signout}
                  </Text>
                  <Feather
                    name="log-out"
                    size={RFValue(12)}
                    color={color.white}
                    style={{ marginLeft: RFValue(5) }}
                  />
                </Pressable>
              )}
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

export default EmployeeConfirmation;
