import {
  Text,
  View,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  LogBox,
  Modal,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { color } from "../../theme/colors";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
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
import properties from "../../resources/properties.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { LightenColor } from "../../resources/LightenColor";
import WarningIcon from "../../assets/svg/warning.svg";
import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
import { logstring } from "../../resources/loggerstrings";
LogBox.ignoreAllLogs();
const FullNameScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  const [fullName, setFullName] = useState("");
  const [showBlur, setShowBlur] = useState(true);
  const [scannedResult, setScannedResult] = useState("");
  const [showScnnerModal, setShowScannerModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errFullName, setErrFullName] = useState(null);
  const [errFullNameFlag, setErrFullnameFlag] = useState(false);
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  const [errorFlag, setErrorFlag] = useState(false);
  const [searchedData, setSearchedData] = useState();
  const [isresults, setIsresults] = useState(false);
  const todayDate = moment().utcOffset(0, true).format("YYYY-MM-DD");
  const sevenDays = moment().add(7, "days").utc().format("YYYY-MM-DD");
  var mainColor = orginfo ? orginfo.btnColor : "";
  var secondaryColor, thirdColor;
  secondaryColor = LightenColor(mainColor, 55);
  thirdColor = LightenColor(mainColor, 75);
  var regexpEmail = new RegExp(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  const logger = new LogglyTracker();
  const macAddress = DeviceInfo.getUniqueIdSync();

  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
  }, []);

  const isFutureDate = (idate) => {
    const currentDate = moment(new Date()).format("DD/MM/YYYY");
    if (idate === currentDate) {
      return true;
    }
    var today = new Date().getTime();
    idate = idate.split("/");

    idate = new Date(idate[2], idate[1] - 1, idate[0]).getTime();
    return today - idate <= 0;
  };

  const isEmpty = (obj) => {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
  };

  useEffect(() => {
    if (fullName.length != 0) {
      setErrFullnameFlag(false);
    }
  }, [fullName.length]);

  useEffect(() => {
    setErrFullName(
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
          &nbsp;{strings.enter_fullname}
        </Text>
      </View>
    );
  }, []);

  const handleNext = () => {
    var regexpFullName = new RegExp(/^[a-zA-Z]+( [a-zA-Z]+)+$/i);
    if (fullName !== "" && !regexpFullName.test(fullName?.trim())) {
      setErrFullnameFlag(true);
    } else if (!fullName) {
      setErrFullnameFlag(true);
    } else {
      searchVisitor();
    }
  };

  const searchVisitor = async () => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method:
        "Api call to get pre-register visitor details by using full name.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    await analytics().logEvent("Visitor_search", {
      screen_name: "Full Name Screen",
      api_url: `${url}/visit/preregister?fullName=$FullName&scheduleCheckinStartDate=$TodayDate&scheduleCheckinEndDate=$SevendaysPlus&limit=100&offset=0&sortBy=scheduledCheckinTime&sort=ASC`,
    });
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    const apiInfo = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + ACtoken,
      },
    };
    fetch(
      url +
        "/visit/preregister?fullName=" +
        fullName +
        "&scheduleCheckinStartDate=" +
        todayDate +
        "&scheduleCheckinEndDate=" +
        sevenDays +
        "&limit=100&offset=0&sortBy=scheduledCheckinTime&sort=ASC",
      apiInfo
    ).then((response) => {
      if (response.status < 400) {
        response.json().then(async (data) => {
          crashlytics().log(
            "Api call for search preregister visitor data by full name with sucess"
          );
          if (data.results[0]) {
            onSelect(data.results[0]);
          } else {
            logger.push({
              method:
                "Api call successful to get pre-register visitor details for sign in by using full name.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
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
                fields: orginfo.visitorType[0].fields,
                orginfo: orginfo,
                purpose: orginfo.visitorType[0].description,
                fullname: fullName,
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
                orginfo: orginfo,
                faceIdInfo: {
                  fullName: fullName,
                },
              });
            }
          }
        });
      } else if (response.status >= 400 && response.status < 500) {
        logger.push({
          method:
            "Api request fail to get pre-register visitor details for sign in by using full name",
          type: "ERROR",
          error: response,
          macAddress: macAddress,
          apiUrl:
            url +
            "/visit/preregister?fullName=" +
            fullName +
            "&scheduleCheckinStartDate=" +
            todayDate +
            "&scheduleCheckinEndDate=" +
            sevenDays +
            "&limit=100&offset=0&sortBy=scheduledCheckinTime&sort=ASC",
          apiMethod: "GET",
          apiResStatus: response.status,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log(
          "Api request fail to get pre-register visitor details for sign in by using full name"
        );
      } else {
        logger.push({
          method:
            "Api request fail to get pre-register visitor details for sign in by using full name.",
          type: "ERROR",
          error: response,
          macAddress: macAddress,
          apiUrl:
            url +
            "/visit/preregister?fullName=" +
            fullName +
            "&scheduleCheckinStartDate=" +
            todayDate +
            "&scheduleCheckinEndDate=" +
            sevenDays +
            "&limit=100&offset=0&sortBy=scheduledCheckinTime&sort=ASC",
          apiMethod: "GET",
          apiResStatus: response.status,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log(
          "Api request fail to get pre-register visitor details for sign in by using full name"
        );
      }
    });
  };

  const onSelect = async (item) => {
    logger.push({
      method: "User navigate to Visitor Confirmation Screen.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    navigation.navigate("RevisitConfirmation", {
      strings: strings,
      isPrerigster: true,
      purpose: item.visitorType,
      orginfo: orginfo,
      preRegisterVisitId: item.id,
      qrNotFound: true,
      checkinTime: item.scheduleCheckinDate,
      faceIdInfo: {
        fullName: item.fullName,
        email: item.email,
        companyName: item.companyName,
        phone: item.phoneNumber,
        host: item.hostName,
        hostId: item.hostUserId,
        visitCustomFields: item.preregisterVisitCustomFieldModels
          ? item.preregisterVisitCustomFieldModels
          : [],
      },
    });
  };

  useEffect(() => {
    if (scannedResult) {
      if (scannedResult.indexOf("PREREG") >= 0) {
        returnPreregister(scannedResult);
      } else if (scannedResult && regexpEmail.test(scannedResult?.trim())) {
        returnEmail(scannedResult);
      } else {
        setErrorFlag(true);
      }
    }
  }, [scannedResult]);

  // return preregistervisitid visitor
  const returnPreregister = async (preregisteredVisitId) => {
    logger.push({
      method:
        "Sign in visitor by using pre-reigster qr code scanned successfully.",
      type: "INFO",
      error: "",
      preregisteredVisitId: preregisteredVisitId,
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    await analytics().logEvent("preregister_qr_code_first", {
      screen_name: "Full Name Screen",
      api_url: `${url}/visit/preregister/$PRIREGISTERVISITID`,
    });
    const preregVisitId = String(preregisteredVisitId.toString());
    if (preregVisitId.indexOf("PREREG") >= 0) {
      const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
      setLoading(true);
      const preRegId = preregVisitId.substring(
        preregVisitId.indexOf("$") + 1,
        preregVisitId.lastIndexOf("$")
      );
      setLoading(true);

      const preRegisterOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + ACtoken,
        },
      };
      fetch(url + "/visit/preregister/" + preRegId, preRegisterOptions).then(
        (response) => {
          if (response.status < 400) {
            response.json().then(async (data) => {
              crashlytics().log(
                "Api call for get preregister vistior data with success"
              );
              if (!isEmpty(data)) {
                var ScheduleCheckinDate = moment(
                  data.scheduleCheckinDate
                ).format("DD/MM/YYYY");
                if (
                  isFutureDate(ScheduleCheckinDate) &&
                  data.siteId === orginfo.siteId
                ) {
                  logger.push({
                    method:
                      "Api call successful to get visitor data for sign in by using pre-reigster qr code.",
                    type: "INFO",
                    error: "",
                    macAddress: macAddress,
                    deviceId: orginfo.deviceId,
                    siteId: orginfo.siteId,
                    orgId: orginfo.orgId,
                    orgName: orginfo.orgName,
                  });
                  logger.push({
                    method: "User navigate to Visitor Confirmation Screen.",
                    type: "INFO",
                    error: "",
                    macAddress: macAddress,
                    deviceId: orginfo.deviceId,
                    siteId: orginfo.siteId,
                    orgId: orginfo.orgId,
                    orgName: orginfo.orgName,
                  });
                  setLoading(false);
                  setShowScannerModal(false);
                  navigation.navigate("RevisitConfirmation", {
                    strings: strings,
                    isPrerigster: true,
                    purpose: data.visitorType,
                    orginfo: orginfo,
                    preRegisterVisitId: data.id,
                    qrNotFound: true,
                    checkinTime: data.scheduleCheckinDate,
                    faceIdInfo: {
                      fullName: data.fullName,
                      email: data.email,
                      companyName: data.companyName,
                      phone: data.phoneNumber,
                      host: data.hostName,
                      hostId: data.hostUserId,
                      visitCustomFields: data.preregisterVisitCustomFieldModels
                        ? data.preregisterVisitCustomFieldModels
                        : [],
                    },
                  });
                }
              } else {
                setErrorFlag(true);
                setLoading(false);
              }
            });
          } else if (response.status == 401) {
            logger.push({
              method:
                "Api request fail to get visitor details by pre-register qr code for sign in.",
              type: "ERROR",
              error: logstring.accessToken_error,
              macAddress: macAddress,
              apiUrl: url + "/visit/preregister/" + preRegId,
              apiMethod: "GET",
              apiResStatus: response.status,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            crashlytics().log(
              "Api request fail to get visitor details by pre-register qr code for sign in"
            );
            setLoading(false);
            handleRefresh(() => returnData(preregisteredVisitId));
          } else if (response.status >= 400 && response.status < 500) {
            logger.push({
              method:
                "Api request fail to get visitor details by pre-register qr code for sign in.",
              type: "ERROR",
              error: response,
              macAddress: macAddress,
              apiUrl: url + "/visit/preregister/" + preRegId,
              apiMethod: "GET",
              apiResStatus: response.status,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            crashlytics().log(
              "Api request fail to get visitor details by pre-register qr code for sign in"
            );
            setLoading(false);
          } else {
            logger.push({
              method:
                "Api request fail to get visitor details by pre-register qr code for sign in.",
              type: "ERROR",
              error: response,
              macAddress: macAddress,
              apiUrl: url + "/visit/preregister/" + preRegId,
              apiMethod: "GET",
              apiResStatus: response.status,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            crashlytics().log(
              "Api request fail to get visitor details by pre-register qr code for sign in"
            );
            setLoading(false);
          }
        }
      );
    } else {
      await analytics().logEvent("preregister_qr_code_second", {
        screen_name: "Full Name Screen",
        api_url: `${url}/visits?limit=100&offset=0&orgId=$ORGID&q=$PREREGISTERVISITID&sort=desc&sortBy=checkinTime`,
      });
      const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
      setLoading(true);
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + ACtoken,
        },
      };
      fetch(
        url +
          "/visits?limit=100&offset=0" +
          "&orgId=" +
          orginfo.orgId +
          "&q=" +
          preregVisitId +
          "&sort=desc&sortBy=checkinTime",
        options
      ).then((response) => {
        if (response.status < 400) {
          response.json().then(async (data) => {
            crashlytics().log(
              "Api call for get preregister vistior data with success"
            );
            if (data.totalRecords == 0) {
              setErrorFlag(true);
              setLoading(false);
            } else if (!isEmpty(data.results[0])) {
              var ScheduleCheckinDate = moment(
                data?.results[0]?.scheduleCheckinDate
              ).format("DD/MM/YYYY");
              if (
                isFutureDate(ScheduleCheckinDate) &&
                data?.siteId === orginfo.siteId
              ) {
                logger.push({
                  method:
                    "Api call successful to get visitor data for sign in by using pre-reigster qr code.",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
                setLoading(false);
                setShowScannerModal(false);
                logger.push({
                  method: "User navigate to Visitor Confirmation Screen.",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
                navigation.navigate("RevisitConfirmation", {
                  strings: strings,
                  isPrerigster: true,
                  purpose: data.results[0].visitorType,
                  orginfo: orginfo,
                  preRegisterVisitId: data.results[0].id,
                  qrNotFound: true,
                  checkinTime: data.results[0].scheduleCheckinDate,
                  faceIdInfo: {
                    fullName: data.results[0].fullName,
                    email: data.results[0].email,
                    companyName: data.results[0].companyName,
                    phone: data.results[0].phoneNumber,
                    host: data.results[0].hostName,
                    hostId: data.results[0].hostUserId,
                    visitCustomFields: data.results[0]
                      .preregisterVisitCustomFieldModels
                      ? data.results[0].preregisterVisitCustomFieldModels
                      : [],
                  },
                });
              }
            } else {
              setErrorFlag(true);
              setLoading(false);
            }
          });
        } else if (response.status >= 400 && response.status < 500) {
          logger.push({
            method:
              "Api request fail to get visitor details by pre-register qr code for sign in.",
            type: "ERROR",
            error: response,
            macAddress: macAddress,
            apiUrl:
              url +
              "/visits?limit=100&offset=0" +
              "&orgId=" +
              orginfo.orgId +
              "&q=" +
              preregVisitId +
              "&sort=desc&sortBy=checkinTime",
            apiMethod: "GET",
            apiResStatus: response.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api request fail to get visitor details by pre-register qr code for sign in"
          );
          setErrorFlag(true);
          setLoading(false);
        } else {
          logger.push({
            method:
              "Api request fail to get visitor details by pre-register qr code for sign in.",
            type: "ERROR",
            error: response,
            macAddress: macAddress,
            apiUrl:
              url +
              "/visits?limit=100&offset=0" +
              "&orgId=" +
              orginfo.orgId +
              "&q=" +
              preregVisitId +
              "&sort=desc&sortBy=checkinTime",
            apiMethod: "GET",
            apiResStatus: response.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api request fail to get visitor details by pre-register qr code for sign in."
          );
          setErrorFlag(true);
          setLoading(false);
        }
      });
    }
  };

  // return email visitor
  const returnEmail = async (email) => {
    setLoading(true);
    logger.push({
      method: "Sign in visitor by using email qr code scanned successfully.",
      type: "INFO",
      error: "",
      email: email,
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    await analytics().logEvent("revisit_qr_code_email", {
      screen_name: "Full Name Screen",
      api_url: `${url}/visits?orgId=$ORGID&q=$EMAIL&siteId=$SITEID`,
    });
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    const visitorScanOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + ACtoken,
      },
    };
    fetch(
      url +
        "/visits?orgId=" +
        orginfo.orgId +
        "&q=" +
        email +
        "&siteId=" +
        orginfo.siteId,
      visitorScanOptions
    ).then((response) => {
      if (response.status < 400) {
        response.json().then((res) => {
          if (res.results[0]) {
            logger.push({
              method:
                "Api call successful to get visitor data for sign in by using email qr code.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            crashlytics().log(
              "Api call get already sign in visitor data with success"
            );
            logger.push({
              method: "User navigate to Visitor Confirmation Screen.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            logger.push({
              method: "User navigate to Visitor Confirmation Screen.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            setLoading(false);
            setShowScannerModal(false);
            navigation.navigate("RevisitConfirmation", {
              strings: strings,
              purpose: orginfo.visitorType[0].visitorType,
              orginfo: orginfo,
              picture: res.results[0].visitPhotoURI,
              // preRegisterVisitId: preRegisterVisitId,
              qrNotFound: true,
              checkinTime: res.results[0].checkinTime,
              faceIdInfo: {
                fullName: res.results[0].fullName,
                email: res.results[0].email,
                companyName: res.results[0].companyName,
                phone: res.results[0].phoneNumber,
                host: res.results[0].hostName,
                hostId: res.results[0].hostUserId,
                visitCustomFields: res.results[0].visitCustomFields
                  ? res.results[0].visitCustomFields
                  : [],
              },
            });
          } else {
            setErrorFlag(true);
            setLoading(false);
          }
        });
      } else if (response.status >= 400 && response.status < 500) {
        logger.push({
          method:
            "Api request fail for Get visitor details by email qr code for sign in.",
          type: "ERROR",
          error: response,
          macAddress: macAddress,
          apiUrl:
            url +
            "/visits?orgId=" +
            orginfo.orgId +
            "&q=" +
            email +
            "&siteId=" +
            orginfo.siteId,
          apiMethod: "GET",
          apiResStatus: response.status,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log(
          "Api request fail for Get visitor details by email qr code for sign in"
        );
        setLoading(false);
      } else {
        logger.push({
          method:
            "Api request fail for Get visitor details by email qr code for sign in.",
          type: "ERROR",
          error: response,
          macAddress: macAddress,
          apiUrl:
            url +
            "/visits?orgId=" +
            orginfo.orgId +
            "&q=" +
            email +
            "&siteId=" +
            orginfo.siteId,
          apiMethod: "GET",
          apiResStatus: response.status,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log(
          "Api request fail for Get visitor details by email qr code for sign in"
        );
        setLoading(false);
      }
    });
  };

  return (
    <UserInactivity
      checkInterval={5000}
      timeForInactivity={timer}
      isActive={true}
      onAction={() => navigation.navigate("Home")}
    >
      <View style={{ flex: 1, backgroundColor: color.white }}>
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
                {strings.enter_your_fname}
              </Text>
              <View
                style={{
                  alignItems: "center",
                  marginTop: orientation.isPortrait ? RFValue(14) : RFValue(10),
                }}
              >
                <TextInput
                  autoCapitalize="words"
                  autoCorrect={false}
                  keyboardType={"default"}
                  placeholder={"e.g. Callie Johnson"}
                  placeholderTextColor={color.silver}
                  value={fullName}
                  onChangeText={(text) => setFullName(text)}
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
                {errFullNameFlag && errFullName ? (
                  errFullName
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
                      warningText={strings.warning}
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

export default FullNameScreen;
