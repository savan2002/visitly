import {
  Text,
  View,
  Pressable,
  Image,
  Modal,
  LogBox,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { color } from "../../theme/colors";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import { RFValue } from "react-native-responsive-fontsize";
import Entypo from "react-native-vector-icons/Entypo";
import RNButton from "react-native-button-sample";
import { RNCamera } from "react-native-camera";
import AntDesign from "react-native-vector-icons/AntDesign";
import CancleWithFooter from "../../components/CancleWithFooter";
import QrScannerModal from "../../components/QrScannerModal";
import properties from "../../resources/properties.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CommonStyle from "../../theme/CommonStyle";
import styles from "./styles";
import moment from "moment";
import UserInactivity from "react-native-user-inactivity";
import CancleConfirmationModal from "../../components/CancleConfirmationModal";
import { LightenColor } from "../../resources/LightenColor";
import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
import { logstring } from "../../resources/loggerstrings";
LogBox.ignoreAllLogs();
const SignOutFaceRecognition = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  const [loading, setLoading] = useState(false);
  var timeing = 0;
  const [retakePicture, setReTakePicture] = useState(true);
  const [faceLoading, setFaceLoading] = useState(false);
  const [showScnnerModal, setShowScannerModal] = useState(false);
  const [showBlur, setShowBlur] = useState(true);
  const [scannedResult, setScannedResult] = useState();
  const [picture, setPicture] = useState(
    route?.params?.picture ? route?.params?.picture : ""
  );
  const [data, setData] = useState([]);
  const [visitMap, setVisitMap] = useState([]);

  const [emailRes, setEmailRes] = useState();
  var sevenDaysAgo = moment().subtract(7, "days").utc().format("YYYY-MM-DD");
  const [cancleModal, setCancleModal] = useState(false);
  const [signoutNotFound, setSignoutNotFound] = useState(false);
  const [userObject, setUserObject] = useState(null);
  const [signoutVisitId, setSignoutVisitId] = useState("");
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  const [errorFlag, setErrorFlag] = useState(false);
  var regexpEmail = new RegExp(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
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
        "Click picture after 3 seconds for signout visitor by facial recognition.",
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
        handleNext(data.base64);
        setFaceLoading(true);
      });
    }
  };

  const cameraLoad = () => {
    var timerId = setInterval(() => {
      timeing = timeing + 1;
      clearInterval();
      if (timeing == 3) {
        clearInterval(timerId);
        // if (orginfo.faceRecogFlag == true && frFlag == true) {
        takepicture();
        // }
      }
    }, 1000);
  };

  const handleNext = async (imgdata) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    await analytics().logEvent("facial_recog_signout", {
      screen_name: "SignOut Facial Recog Screen",
      api_url: `${url}/visits/revisit`,
    });
    if (
      orginfo.faceRecogFlag == true
      // && frFlag == true
    ) {
      setLoading(true);
      const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
      const revisitOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + ACtoken,
        },
        body: JSON.stringify({
          visitPhotoImage: imgdata,
        }),
      };
      fetch(url + "/visits/revisit", revisitOptions)
        .then((res) => {
          if (res.status < 400) {
            res.json().then((data) => {
              crashlytics().log(
                "Api call successful to get visitor data by using facial recognition for sign out"
              );
              if (!data.fullName) {
                logger.push({
                  method: "Visitors details not found",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
                logger.push({
                  method: "User navigate to Sign Out Name Screen.",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
                navigation.navigate("Signout", {
                  strings: strings,
                  orginfo: orginfo,
                });
              } else if (data && data.fullName) {
                setSignoutNotFound(false);
                const visitorTypeFields = orginfo.visitorType.filter(
                  (org) => data?.visitorTypeId === org.id
                );
                const signoutFields =
                  visitorTypeFields.length > 0 &&
                  visitorTypeFields[0].signOutFields
                    ? visitorTypeFields[0].signOutFields
                    : [];
                if (!data.checkoutTime || data.checkoutTime === null) {
                  logger.push({
                    method:
                      "Api call successful to get visitor data by using facial recognition for sign out.",
                    type: "INFO",
                    error: "",
                    macAddress: macAddress,
                    deviceId: orginfo.deviceId,
                    siteId: orginfo.siteId,
                    orgId: orginfo.orgId,
                    orgName: orginfo.orgName,
                  });
                  setUserObject(data);
                  setSignoutVisitId(data.id);
                  logger.push({
                    method: "User navigate to Sign Out Confirmation Screen.",
                    type: "INFO",
                    error: "",
                    macAddress: macAddress,
                    deviceId: orginfo.deviceId,
                    siteId: orginfo.siteId,
                    orgId: orginfo.orgId,
                    orgName: orginfo.orgName,
                  });
                  navigation.navigate("SignoutVisitor", {
                    strings: strings,
                    userObject: data,
                    visitorSignoutFields: signoutFields,
                    orginfo: orginfo,
                    signoutVisitId: data.id,
                  });
                } else {
                  logger.push({
                    method: "Visitors details not found",
                    type: "INFO",
                    error: "",
                    macAddress: macAddress,
                    deviceId: orginfo.deviceId,
                    siteId: orginfo.siteId,
                    orgId: orginfo.orgId,
                    orgName: orginfo.orgName,
                  });
                  logger.push({
                    method: "User navigate to Sign Out Name Screen.",
                    type: "INFO",
                    error: "",
                    macAddress: macAddress,
                    deviceId: orginfo.deviceId,
                    siteId: orginfo.siteId,
                    orgId: orginfo.orgId,
                    orgName: orginfo.orgName,
                  });
                  setSignoutNotFound(true);
                  navigation.navigate("Signout", {
                    strings: strings,
                    orginfo: orginfo,
                    signoutNotFound: signoutNotFound,
                  });
                }
              }
            });
            setLoading(false);
          }
        })
        .catch((err) => {
          logger.push({
            method:
              "Api request fail to get visitor data by using facial recognition for sign out.",
            type: "ERROR",
            error: err,
            macAddress: macAddress,
            apiUrl: url + "/visits/revisit",
            apiMethod: "POST",
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api request fail to get visitor data by using facial recognition for sign out"
          );
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      timeing = 0;
      setFaceLoading(false);
      cameraLoad();
    });

    return unsubscribe;
  }, [navigation]);

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

  // return preregistervisitid to sign out visitor
  const returnPreregister = async (preregisteredVisitId) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method:
        "Sign out visitor by using pre-reigster qr code scanned successfully.",
      type: "INFO",
      error: "",
      preregisteredVisitId: preregisteredVisitId,
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    crashlytics().log(
      "Api request fail to Get visitor details by pre-register qr code for sign out"
    );
    await analytics().logEvent("signout_preregister_qrcode_first", {
      screen_name: "Signout Facial Recognition Screen",
      api_url: `${url}/visit/preregister/$PRIREGISTERVISITID`,
    });
    setLoading(true);
    const preregVisitId = String(preregisteredVisitId.toString());
    if (preregVisitId.indexOf("PREREG") >= 0) {
      const preRegId = preregVisitId.substring(
        preregVisitId.indexOf("$") + 1,
        preregVisitId.lastIndexOf("$")
      );
      const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
      const SignoutOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + ACtoken,
        },
      };
      fetch(
        url + "/visits?preRegisterVisitId=" + preRegId,
        SignoutOptions
      ).then((response) => {
        if (response.status < 400) {
          response.json().then(async (data) => {
            crashlytics().log(
              "Api call successful to get pre-register visitor data by using qr code for signout"
            );
            if (data && data.results.length > 0) {
              var dataFilter = data.results.filter(
                (visit) => visit.checkoutTime == null || !visit.checkoutTime
              );
              const visitorTypeFields = orginfo.visitorType.filter(
                (org) => data.results[0].visitorTypeId === org.id
              );
              const signoutFields =
                visitorTypeFields.length > 0 &&
                visitorTypeFields[0].signOutFields
                  ? visitorTypeFields[0].signOutFields
                  : [];
              if (dataFilter) {
                logger.push({
                  method:
                    "Api call successful to get pre-register visitor data by using qr code for signout.",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
                const visits = dataFilter.map((visit) => visit.email);
                const dataMap = dataFilter.map((visit) => visit.Id);
                setData(dataMap);
                setVisitMap(visits);
                setSignoutVisitId(dataFilter[0]?.id);
                setLoading(false);
                setShowScannerModal(false);
                logger.push({
                  method: "User navigate to Sign Out Confirmation Screen.",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
                navigation.navigate("SignoutVisitor", {
                  strings: strings,
                  userObject: data.results[0],
                  visitorSignoutFields: signoutFields,
                  orginfo: orginfo,
                  signoutVisitId: dataFilter[0].id,
                });
              } else {
                setLoading(false);
              }
            } else {
              setLoading(false);
              setErrorFlag(true);
            }
          });
        } else if (response.status == 401) {
          logger.push({
            method:
              "Api request fail to Get visitor details by pre-register qr code for sign out.",
            type: "ERROR",
            error: logstring.accessToken_error,
            macAddress: macAddress,
            apiUrl: url + "/visits?preRegisterVisitId=" + preRegId,
            apiMethod: "GET",
            apiResStatus: response.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api request fail to Get visitor details by pre-register qr code for sign out"
          );
          setLoading(false);
          handleRefresh(() => returnData(preregisteredVisitId));
        } else if (response.status >= 400 && response.status < 500) {
          logger.push({
            method:
              "Api request fail to Get visitor details by pre-register qr code for sign out.",
            type: "ERROR",
            error: response,
            macAddress: macAddress,
            apiUrl: url + "/visits?preRegisterVisitId=" + preRegId,
            apiMethod: "GET",
            apiResStatus: response.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api request fail to Get visitor details by pre-register qr code for sign out"
          );
          setLoading(false);
        } else {
          logger.push({
            method:
              "Api request fail to Get visitor details by pre-register qr code for sign out.",
            type: "ERROR",
            error: response,
            macAddress: macAddress,
            apiUrl: url + "/visits?preRegisterVisitId=" + preRegId,
            apiMethod: "GET",
            apiResStatus: response.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api request fail to Get visitor details by pre-register qr code for sign out"
          );
          setLoading(false);
        }
      });
    } else {
      await analytics().logEvent("signout_preregister_qrcode_second", {
        screen_name: "Signout_Facial_Recognition_Screen",
        api_url: `${url}/visits?limit=100&offset=0&orgId=$ORGID&q=$PREREGISTERVISITID&sort=desc&sortBy=checkinTime`,
      });
      const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
      const SignoutOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + ACtoken,
        },
      };
      fetch(
        url +
          "/visits?limit=100&offset=0&visitStartDate=" +
          sevenDaysAgo +
          "&orgId=" +
          orginfo.orgId +
          "&sortBy=checkinTime&sort=desc&q=" +
          preregisteredVisitId,
        SignoutOptions
      ).then((response) => {
        if (response.status < 400) {
          response.json().then(async (data) => {
            crashlytics().log(
              "Api call successful to get pre-register visitor data by using qr code for signout"
            );
            if (data.results.length > 0) {
              var dataFilter = data.results.filter(
                (visit) => visit.checkoutTime === null || !visit.checkoutTime
              );
              const visitorTypeFields = orginfo.visitorType.filter(
                (org) => data.results[0].visitorTypeId === org.id
              );
              const signoutFields =
                visitorTypeFields.length > 0 &&
                visitorTypeFields[0].signOutFields
                  ? visitorTypeFields[0].signOutFields
                  : [];
              if (dataFilter) {
                logger.push({
                  method:
                    "Api call successful to get pre-register visitor data by using qr code for signout.",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
                const visits = dataFilter.map((visit) => visit.email);
                const dataMap = dataFilter.map((visit) => visit.id);
                setData(dataMap);
                setVisitMap(visits);
                setSignoutVisitId(dataFilter[0].id);
                setLoading(false);
                setShowScannerModal(false);
                logger.push({
                  method: "User navigate to Sign Out Confirmation Screen.",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
                navigation.navigate("SignoutVisitor", {
                  strings: strings,
                  userObject: data.results[0],
                  visitorSignoutFields: signoutFields,
                  orginfo: orginfo,
                  signoutVisitId: dataFilter[0].id,
                });
              } else {
                setLoading(false);
              }
            } else {
              setLoading(false);
              setErrorFlag(true);
            }
          });
        } else if (response.status == 401) {
          logger.push({
            method:
              "Api request fail to Get visitor details by pre-register qr code for sign out.",
            type: "ERROR",
            error: logstring.accessToken_error,
            macAddress: macAddress,
            apiUrl:
              url +
              "/visits?limit=100&offset=0&visitStartDate=" +
              sevenDaysAgo +
              "&orgId=" +
              orginfo.orgId +
              "&sortBy=checkinTime&sort=desc&q=" +
              preregisteredVisitId,
            apiMethod: "GET",
            apiResStatus: response.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api request fail to Get visitor details by pre-register qr code for sign out"
          );
          setLoading(false);
          handleRefresh(() => returnData(preregisteredVisitId));
        } else if (response.status >= 400 && response.status < 500) {
          logger.push({
            method:
              "Api request fail to Get visitor details by pre-register qr code for sign out.",
            type: "ERROR",
            error: response,
            macAddress: macAddress,
            apiUrl:
              url +
              "/visits?limit=100&offset=0&visitStartDate=" +
              sevenDaysAgo +
              "&orgId=" +
              orginfo.orgId +
              "&sortBy=checkinTime&sort=desc&q=" +
              preregisteredVisitId,
            apiMethod: "GET",
            apiResStatus: response.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api request fail to Get visitor details by pre-register qr code for sign out"
          );
          setLoading(false);
        } else {
          logger.push({
            method:
              "Api request fail to Get visitor details by pre-register qr code for sign out.",
            type: "ERROR",
            error: response,
            macAddress: macAddress,
            apiUrl:
              url +
              "/visits?limit=100&offset=0&visitStartDate=" +
              sevenDaysAgo +
              "&orgId=" +
              orginfo.orgId +
              "&sortBy=checkinTime&sort=desc&q=" +
              preregisteredVisitId,
            apiMethod: "GET",
            apiResStatus: response.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api request fail to Get visitor details by pre-register qr code for sign out"
          );
          setLoading(false);
        }
      });
    }
  };

  // return email to signout visitor
  const returnEmail = async (email) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "Sign out visitor by using email qr code scanned successfully.",
      type: "INFO",
      error: "",
      email: email,
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    crashlytics().log(
      "Sign out visitor by using email qr code scanned successfully"
    );
    await analytics().logEvent("singout_by_email", {
      screen_name: "SignOut Facial Recog Screen",
      api_url: `${url}/visits?orgId=$ORGID&q=$EMAIL&siteId=$SITEID`,
    });
    setLoading(true);
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    const SignoutOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + ACtoken,
      },
    };
    fetch(
      url +
        "/visits?limit=100&offset=0&visitStartDate=" +
        sevenDaysAgo +
        "&orgId=" +
        orginfo.orgId +
        "&sortBy=checkinTime&sort=desc&q=" +
        email,
      SignoutOptions
    ).then((response) => {
      if (response.status < 400) {
        response.json().then(async (data) => {
          setEmailRes(data.results[0]);
          crashlytics().log(
            "Api call successful to get visitor data for sign out by using email qr code"
          );
          const visitorTypeFields = orginfo.visitorType.filter(
            (org) => data.results[0].visitorTypeId === org.id
          );
          const signoutFields =
            visitorTypeFields.length > 0 && visitorTypeFields[0].signOutFields
              ? visitorTypeFields[0].signOutFields
              : [];
          if (data && data.results.length > 0) {
            var dataFilter = data.results.filter(
              (visit) => visit.checkoutTime == null
            );
            logger.push({
              method:
                "Api call successful to get visitor data for sign out by using email qr code.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            const visits = dataFilter.map((visit) => visit.email);
            const dataMap = dataFilter.map((visit) => visit.Id);
            setData(dataMap);
            setVisitMap(visits);
            setSignoutVisitId(dataFilter[0].id);
            setLoading(false);
            setShowScannerModal(false);
            logger.push({
              method: "User navigate to Sign Out Confirmation Screen.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            navigation.navigate("SignoutVisitor", {
              strings: strings,
              userObject: data.results[0],
              visitorSignoutFields: signoutFields,
              orginfo: orginfo,
              signoutVisitId: dataFilter[0].id,
            });
          } else {
            setLoading(false);
            setErrorFlag(true);
          }
        });
      } else if (response.status == 401) {
        logger.push({
          method:
            "Api request fail to Get visitor details by email qr code for sign out.",
          type: "ERROR",
          error: logstring.accessToken_error,
          macAddress: macAddress,
          apiUrl:
            url +
            "/visits?limit=100&offset=0&visitStartDate=" +
            sevenDaysAgo +
            "&orgId=" +
            orginfo.orgId +
            "&sortBy=checkinTime&sort=desc&q=" +
            email,
          apiMethod: "GET",
          apiResStatus: response.status,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log(
          "Api request fail to Get visitor details by email qr code for sign out"
        );
        setLoading(false);
        handleRefresh(() => returnData(email));
      } else if (response.status >= 400 && response.status < 500) {
        logger.push({
          method:
            "Api request fail to Get visitor details by email qr code for sign out.",
          type: "ERROR",
          error: response,
          macAddress: macAddress,
          apiUrl:
            url +
            "/visits?limit=100&offset=0&visitStartDate=" +
            sevenDaysAgo +
            "&orgId=" +
            orginfo.orgId +
            "&sortBy=checkinTime&sort=desc&q=" +
            email,
          apiMethod: "GET",
          apiResStatus: response.status,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log(
          "Api request fail to Get visitor details by email qr code for sign out"
        );
        setLoading(false);
      } else {
        logger.push({
          method:
            "Api request fail to Get visitor details by email qr code for sign out.",
          type: "ERROR",
          error: response,
          macAddress: macAddress,
          apiUrl:
            url +
            "/visits?limit=100&offset=0&visitStartDate=" +
            sevenDaysAgo +
            "&orgId=" +
            orginfo.orgId +
            "&sortBy=checkinTime&sort=desc&q=" +
            email,
          apiMethod: "GET",
          apiResStatus: response.status,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log(
          "Api request fail to Get visitor details by email qr code for sign out"
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
          <View
            style={{
              alignItems: "center",
              marginTop: orientation.isPortrait ? RFValue(40) : RFValue(20),
            }}
          >
            {faceLoading ? (
              <View
                style={{
                  width: orientation.isPortrait
                    ? orientation.height / 3
                    : orientation.height / 2.2,
                  height: orientation.isPortrait
                    ? orientation.height / 3
                    : orientation.height / 2.2,
                  marginTop: orientation.isPortrait ? RFValue(60) : 20,
                  ...CommonStyle.shadow,
                  ...styles.modalContainer,
                }}
              >
                <Image
                  source={require("../../assets/gif/recognition.gif")}
                  style={styles.gifStyle}
                />
                <Text
                  style={{
                    ...CommonStyle.btnText2,
                    fontSize: RFValue(13),
                    textAlign: "center",
                    color: color.bright_gray,
                  }}
                >
                  {strings.recognition_process}
                </Text>
                <RNButton
                  buttonTitle={strings.cancel}
                  buttonStyle={{
                    ...CommonStyle.button,
                    backgroundColor: "",
                    width: orientation.isPortrait
                      ? orientation.width / 5
                      : orientation.height / 5,
                    height: orientation.isPortrait
                      ? orientation.width / 14
                      : orientation.height / 14,
                  }}
                  btnTextStyle={{
                    ...CommonStyle.btnText2,
                    color: color.white,
                    color: orginfo ? orginfo.btnColor : color.royal_blue,
                  }}
                  onPress={() => {
                    logger.push({
                      method: "User navigate to Sign Out Name Screen.",
                      type: "INFO",
                      error: "",
                      macAddress: macAddress,
                      deviceId: orginfo.deviceId,
                      siteId: orginfo.siteId,
                      orgId: orginfo.orgId,
                      orgName: orginfo.orgName,
                    });
                    navigation.navigate("Signout", {
                      orginfo: orginfo,
                      strings: strings,
                    });
                  }}
                />
              </View>
            ) : (
              <RNCamera
                ref={(ref) => {
                  this.camera = ref;
                }}
                captureAudio={false}
                style={{
                  width: orientation.isPortrait
                    ? orientation.height / 3
                    : orientation.height / 2.2,
                  height: orientation.isPortrait
                    ? orientation.height / 3
                    : orientation.height / 2.2,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: orientation.isPortrait ? RFValue(60) : 20,
                  borderRadius: RFValue(5),
                  overflow: "hidden",
                }}
                type={"front"}
                onCameraReady={cameraLoad}
              ></RNCamera>
            )}
          </View>
          <View style={{ alignItems: "center" }}>
            <Pressable
              onPress={() => {
                setShowScannerModal(true);
                timeing = 0;
              }}
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
                marginTop: orientation.isPortrait ? RFValue(100) : RFValue(40),
              }}
            >
              <Text
                style={{
                  ...CommonStyle.text3,
                  color: orginfo ? orginfo.btnColor : color.royal_blue,
                }}
              >
                {strings.qr_code}&nbsp;&nbsp;
              </Text>
              <AntDesign
                name="qrcode"
                size={RFValue(14)}
                color={orginfo ? orginfo.btnColor : color.royal_blue}
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
                  closeModal={() => {
                    setShowScannerModal(false);
                    timeing = 3;
                    cameraLoad();
                  }}
                />
              ) : null}
            </Modal>
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

export default SignOutFaceRecognition;
