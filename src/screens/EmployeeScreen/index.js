import {
  Text,
  View,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  LogBox,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { color } from "../../theme/colors";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import { RFValue } from "react-native-responsive-fontsize";
import Entypo from "react-native-vector-icons/Entypo";
import RNButton from "react-native-button-sample";
import AntDesign from "react-native-vector-icons/AntDesign";
import CancleWithFooter from "../../components/CancleWithFooter";
import QrScannerModal from "../../components/QrScannerModal";
import CommonStyle from "../../theme/CommonStyle";
import styles from "./styles";
import UserInactivity from "react-native-user-inactivity";
import CancleConfirmationModal from "../../components/CancleConfirmationModal";
import moment from "moment";
import { LightenColor } from "../../resources/LightenColor";
import WarningIcon from "../../assets/svg/warning.svg";
import {
  getEmployeeByPIN,
  getEmployeeInfoById,
  getEmployeeByEmail,
} from "../../services/employee/employee.service";
import ErrorModal from "../../components/ErrorModal";
import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
import AsyncStorage from "@react-native-async-storage/async-storage";
LogBox.ignoreAllLogs();
const EmployeeScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  const [empPin, setEmpPin] = useState("");
  const [showBlur, setShowBlur] = useState(true);
  const [scannedResult, setScannedResult] = useState();
  const [showScnnerModal, setShowScannerModal] = useState(false);
  const [errEmployee, setErrEmployee] = useState(null);
  const [errEmployeeFlag, setErrEmployeeFlag] = useState(false);
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  const [errorFlag, setErrorFlag] = useState(false);
  const todayDate = moment().utcOffset(0, true).format("YYYY-MM-DD");
  const sevenDays = moment().add(7, "days").utc().format("YYYY-MM-DD");
  const [errModal, setErrModal] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  var mainColor = orginfo ? orginfo.btnColor : "";
  var secondaryColor, thirdColor;
  secondaryColor = LightenColor(mainColor, 55);
  thirdColor = LightenColor(mainColor, 75);
  var regexpEmail = new RegExp(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  const [warning, setWarning] = useState(strings.warning);
  const logger = new LogglyTracker();
  const macAddress = DeviceInfo.getUniqueIdSync();
  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
  }, []);

  useEffect(() => {
    if (empPin.length != 0) {
      setErrEmployeeFlag(false);
    }
  }, [empPin.length]);

  useEffect(() => {
    setErrEmployee(
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: orientation.isPortrait ? RFValue(12) : RFValue(10),
        }}
      >
        <WarningIcon
          height={RFValue(10)}
          width={RFValue(10)}
          style={{ color: color.red }}
        />
        <Text
          style={{
            fontSize: RFValue(10),
            fontWeight: "400",
            fontFamily: "SFProText-Regular",
            color: color.red,
          }}
        >
          &nbsp;{strings.emp_err}
        </Text>
      </View>
    );
  }, []);

  const handleNext = () => {
    if (empPin == "") {
      setErrEmployeeFlag(true);
    } else {
      EmployeeAuth();
    }
  };

  const EmployeeAuth = async () => {
    logger.push({
      method: "Employee clicked Next for employee sign in by Employee pin.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    crashlytics().log(
      "Employee clicked Next for employee sign in by Employee pin"
    );
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    await analytics().logEvent("employee_signin", {
      screen_name: "Employee Screen",
      api_url: `${url}/$EMPID`,
    });
    const data = await getEmployeeByPIN(url, empPin);
    console.log(data,'----------data log-');
    if (data.status === 500 || data.status === 404) {
      logger.push({
        method: "Api call fail for get employee sign in details.",
        type: "ERROR",
        error: strings.incorrect_pin,
        macAddress: macAddress,
        apiUrl: url + "/users/userinfo/" + empPin,
        apiMethod: "GET",
        apiResStatus: data.status,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      crashlytics().log("Api call fail for get employee sign in details");
      setErrModal(true);
      setErrMsg(strings.incorrect_pin);
      setTimeout(() => {
        setErrModal(false);
      }, 5000);
      setEmpPin("");
    } else if (data.allowSigninFlag === false) {
      logger.push({
        method: "Api reqest failed based on your entered pin.",
        type: "ERROR",
        error: strings.signin_not_allowed,
        macAddress: macAddress,
        apiUrl: url + "/users/userinfo/" + empPin,
        apiMethod: "GET",
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      crashlytics().log("Api call fail for get employee sign in details");
      setErrModal(true);
      setErrMsg(strings.signin_not_allowed);
      setTimeout(() => {
        setErrModal(false);
      }, 5000);
      setEmpPin("");
    } else if (data.allowSigninFlag === true) {
      logger.push({
        method: "Api call successful to get employee details.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      crashlytics().log("Api call successful to get employee details");
      await analytics().logEvent("employee_data", {
        screen_name: "Employee Screen",
        api_url: `${url}/employeesignin?userId=$EMPID&limit=1&offset=0&sort=desc&sortBy=checkinTime&q=&signinStartDate=$THREEDAYSAGO&siteId=$SITEID`,
      });
      const userdata = await getEmployeeInfoById(url, data.id, orginfo.siteId);
      logger.push({
        method: "Api call successful to get employee details for Sign In.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      crashlytics().log(
        "Api call successful to get employee details for Sign In"
      );
      if (userdata.results.length === 0 || userdata.results[0].checkoutTime) {
        logger.push({
          method: "User navigate to Employee Confirmation Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        navigation.navigate("EmployeeConfir", {
          strings: strings,
          orginfo: orginfo,
          userinfo: data,
          signinInfo: userdata,
          isSignIn: true,
        });
      } else {
        logger.push({
          method: "User navigate to Employee Confirmation Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        navigation.navigate("EmployeeConfir", {
          strings: strings,
          orginfo: orginfo,
          userinfo: data,
          signinInfo: userdata.results[0],
          allowSigninFlag: data.allowSigninFlag,
          isSignIn: false,
        });
      }
    } else {
      logger.push({
        method: "Api request fail to get employee sign in details.",
        type: "ERROR",
        error: strings.incorrect_pin,
        macAddress: macAddress,
        apiUrl: url + "/users/userinfo/" + empPin,
        apiMethod: "GET",
        apiResStatus: data.status,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      crashlytics().log("Api request fail to get employee sign in details");
      setErrModal(true);
      setErrMsg(strings.incorrect_pin);
      setTimeout(() => {
        setErrModal(false);
      }, 5000);
      setEmpPin("");
    }
  };

  useEffect(() => {
    if (regexpEmail.test(scannedResult?.trim())) {
      returnEmail(scannedResult);
    }
  }, [scannedResult]);

  const returnEmail = async (email) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method:
        "Api call to get employee sign in details by using scanned employee qr code.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    const data = await getEmployeeByEmail(url, email);
    if (data.status === 500 || data.status === 404) {
      logger.push({
        method: "Api request fail to get employee sign in details",
        type: "ERROR",
        error: strings.incorrect_email,
        macAddress: macAddress,
        apiUrl: url + "/users?status=ACTIVE&q=" + email,
        apiMethod: "GET",
        apiResStatus: data.status,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      setShowScannerModal(false);
      setErrModal(true);
      setErrMsg(strings.incorrect_email);
      setTimeout(() => {
        setErrModal(false);
      }, 5000);
    } else if (data.results[0]?.allowSigninFlag === false) {
      logger.push({
        method: "Api request fail for scanned email qr code.",
        type: "ERROR",
        error: strings.signin_not_allowed_by_email,
        macAddress: macAddress,
        apiUrl: url + "/users?status=ACTIVE&q=" + email,
        apiMethod: "GET",
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      setShowScannerModal(false);
      setErrModal(true);
      setErrMsg(strings.signin_not_allowed_by_email);
      setTimeout(() => {
        setErrModal(false);
      }, 5000);
    } else if (data.results[0]?.allowSigninFlag === true) {
      logger.push({
        method: "Api call successful to get Employee details.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      const userdata = await getEmployeeInfoById(
        url,
        data.results[0]?.id,
        orginfo.siteId
      );
      logger.push({
        method: "Api call successful to get Employee details for Sign In.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      if (userdata.results.length === 0 || userdata.results[0].checkoutTime) {
        logger.push({
          method: "User navigate to Employee Confirmation Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        setShowScannerModal(false);
        navigation.navigate("EmployeeConfir", {
          strings: strings,
          orginfo: orginfo,
          userinfo: data.results[0],
          signinInfo: userdata,
          isSignIn: true,
        });
      } else {
        logger.push({
          method: "User navigate to Employee Confirmation Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        setShowScannerModal(false);
        navigation.navigate("EmployeeConfir", {
          strings: strings,
          orginfo: orginfo,
          userinfo: data.results[0],
          signinInfo: userdata.results[0],
          allowSigninFlag: data.results[0].allowSigninFlag,
          isSignIn: false,
        });
      }
    } else {
      logger.push({
        method: "Api request fail for scanned email qr code.",
        type: "ERROR",
        error: strings.incorrect_email,
        macAddress: macAddress,
        apiUrl: url + "/users?status=ACTIVE&q=" + email,
        apiMethod: "GET",
        apiResStatus: data.status,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      setShowScannerModal(false);
      setErrModal(true);
      setErrMsg(strings.incorrect_email);
      setTimeout(() => {
        setErrModal(false);
      }, 5000);
    }
  };

  return (
    <UserInactivity
      checkInterval={5000}
      timeForInactivity={timer}
      isActive={true}
      onAction={() => navigation.navigate("Home")}
    >
      <View style={{ flex: 1, backgroundColor: color.white }}>
        <ErrorModal
          strings={strings}
          isVisible={errModal}
          onPress={() => setErrModal(false)}
          errText={errMsg}
          btnColor={orginfo.btnColor}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1, height: "100%" }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flex: 1, backgroundColor: color.white }}>
              <View
                style={{
                  marginTop: orientation.isPortrait ? RFValue(30) : RFValue(30),
                  paddingHorizontal: RFValue(20),
                }}
              >
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

              <Text
                style={{
                  ...CommonStyle.btnText1,
                  textAlign: "center",
                  fontSize: RFValue(13),
                  color: color.tundora,
                  marginTop: orientation.isPortrait
                    ? orientation.width / 2.4
                    : orientation.height / 4,
                }}
              >
                {strings.emp_id}
              </Text>
              <View
                style={{
                  alignItems: "center",
                  marginTop: orientation.isPortrait ? RFValue(14) : RFValue(10),
                }}
              >
                <TextInput
                  autoCorrect={false}
                  keyboardType={"numeric"}
                  value={empPin}
                  onChangeText={setEmpPin}
                  style={{
                    ...styles.input,
                    width: orientation.isPortrait
                      ? orientation.height / 2
                      : orientation.width / 2,
                    borderBottomColor: orginfo.btnColor,
                    backgroundColor: color.white,
                    color: color.cod_gray,
                  }}
                />
                {errEmployeeFlag && errEmployee ? (
                  errEmployee
                ) : (
                  <View
                    style={{
                      height: RFValue(12),
                      width: RFValue(12),
                      marginTop: orientation.isPortrait
                        ? RFValue(12)
                        : RFValue(10),
                    }}
                  ></View>
                )}

                <RNButton
                  buttonTitle={strings.setup_next}
                  buttonStyle={{
                    ...CommonStyle.button,
                    backgroundColor: orginfo ? orginfo.btnColor : "",
                    width: orientation.isPortrait
                      ? orientation.width / 4
                      : orientation.height / 4,
                    height: orientation.isPortrait
                      ? orientation.width / 14
                      : orientation.height / 14,
                    marginTop: orientation.isPortrait
                      ? RFValue(30)
                      : RFValue(20),
                  }}
                  btnTextStyle={{
                    ...CommonStyle.btnText2,
                    color: color.white,
                  }}
                  onPress={() => handleNext()}
                />
              </View>
              <View style={{ alignItems: "center" }}>
                <Pressable
                  onPress={() => setShowScannerModal(true)}
                  style={{
                    ...styles.btn2,
                    shadowColor: "#000",
                    shadowOpacity: 0.2,
                    shadowRadius: 1,
                    shadowOffset: { width: 0, height: 1 },
                    width: orientation.isPortrait
                      ? orientation.width / 3.2
                      : orientation.height / 3.2,
                    height: orientation.isPortrait
                      ? orientation.width / 14
                      : orientation.height / 14,
                    borderRadius: orientation.isPortrait
                      ? orientation.width / 3.2 / 2
                      : orientation.height / 3.2 / 2,
                    marginTop: orientation.isPortrait
                      ? RFValue(100)
                      : RFValue(40),
                  }}
                >
                  <Text
                    style={{
                      ...CommonStyle.text3,
                      color: orginfo ? orginfo.btnColor : "",
                    }}
                  >
                    {strings.qr_code}&nbsp;&nbsp;
                  </Text>
                  <AntDesign
                    name="qrcode"
                    size={RFValue(14)}
                    color={orginfo ? orginfo.btnColor : ""}
                  />
                </Pressable>
                <Modal
                  animationType={"fade"}
                  transparent={true}
                  visible={showScnnerModal}
                  onRequestClose={() => setShowScannerModal(false)}
                >
                  {showBlur ? (
                    <QrScannerModal
                      strings={strings}
                      result={scannedResult}
                      setResult={setScannedResult}
                      errFlag={errorFlag}
                      warningText={warning}
                      reOpenCamera={() => setErrorFlag(false)}
                      primaryColor={orginfo.btnColor}
                      secondaryColor={secondaryColor}
                      closeModal={() => setShowScannerModal(false)}
                    />
                  ) : null}
                </Modal>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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

export default EmployeeScreen;
