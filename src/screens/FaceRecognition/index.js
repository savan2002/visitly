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
import CancleConfirmationModal from "../../components/CancleConfirmationModal";
import UserInactivity from "react-native-user-inactivity";
import moment from "moment";
import { LightenColor } from "../../resources/LightenColor";
import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
import { logstring } from "../../resources/loggerstrings";
LogBox.ignoreAllLogs();
const FaceRecognition = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  const [loading, setLoading] = useState(false);
  var timeing = 3;
  const [retakePicture, setReTakePicture] = useState(true);
  const [faceLoading, setFaceLoading] = useState(false);
  const [showScnnerModal, setShowScannerModal] = useState(false);
  const [showBlur, setShowBlur] = useState(true);
  const [scannedResult, setScannedResult] = useState("");
  const [picture, setPicture] = useState(
    route?.params?.picture ? route?.params?.picture : ""
  );
  const [fields, setFields] = useState();
  const [fullname, setFullName] = useState(
    route?.params.fullName ? route?.params?.fullName : ""
  );
  const [email, setEmail] = useState(
    route?.params.email ? route?.params?.email : ""
  );
  const [host, setHost] = useState(
    route?.params.host ? route?.params?.faceIdInfo.host : ""
  );
  const [companyName, setCompanyName] = useState(
    route?.params.companyName ? route?.params?.faceIdInfo.companyName : ""
  );
  const [phone, setPhone] = useState(
    route?.params.phone ? route?.params?.faceIdInfo.phone : ""
  );
  const [hostId, setHostId] = useState(
    route?.params?.hostId ? route?.params?.faceIdInfo?.hostId : ""
  );
  const [visitCustomFields, setVisitCustomFields] = useState(
    route?.params?.visitCustomFields?.length
      ? route?.params?.faceIdInfo?.visitCustomFields
      : []
  );
  const [preRegisterVisitId, setPreRegisterVisitId] = useState(
    route?.params?.preRegisterVisitId ? route?.params?.preRegisterVisitId : ""
  );
  const [cancleModal, setCancleModal] = useState(false);
  const [isRevisit, setIsRevisit] = useState(true);
  const [purpose, setPurpose] = useState();
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  const [errorFlag, setErrorFlag] = useState(false);
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
  var mainColor = orginfo ? orginfo.btnColor : "";
  var secondaryColor, thirdColor;
  secondaryColor = LightenColor(mainColor, 55);
  thirdColor = LightenColor(mainColor, 75);
  var regexpEmail = new RegExp(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  const takepicture = async () => {
    logger.push({
      method:
        "Click picture after 3 second for revisit visitor by facial recognition.",
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
      timeing = timeing - 1;
      clearInterval();
      if (timeing == 0) {
        clearInterval(timerId);
        // if (orginfo.faceRecogFlag == true && frFlag == true) {
        takepicture();
        // }
      }
    }, 1000);
  };

  const handleNext = async (imgdata) => {
    setLoading(true);
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "Api call for get visitor details by using facial recognition.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    await analytics().logEvent("facial_recognition", {
      screen_name: "Facial_Recognition_Screen",
      api_url: `${url}/visits/revisit`,
    });
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
              "Api call successful to get visitor data by using facial recognition for revisit visitor sign in"
            );
            if (!data.fullName) {
              logger.push({
                method: "Visitor details not found",
                type: "INFO",
                error: "",
                macAddress: macAddress,
                deviceId: orginfo.deviceId,
                siteId: orginfo.siteId,
                orgId: orginfo.orgId,
                orgName: orginfo.orgName,
              });
              logger.push({
                method: "User navigate to Sign In Full Name Screen.",
                type: "INFO",
                error: "",
                macAddress: macAddress,
                deviceId: orginfo.deviceId,
                siteId: orginfo.siteId,
                orgId: orginfo.orgId,
                orgName: orginfo.orgName,
              });
              navigation.navigate("FullName", {
                strings: strings,
                orginfo: orginfo,
              });
            } else if (data && data.fullName) {
              logger.push({
                method:
                  "Api call successful to get visitor data by using facial recognition for revisit visitor sign in.",
                type: "INFO",
                error: "",
                macAddress: macAddress,
                deviceId: orginfo.deviceId,
                siteId: orginfo.siteId,
                orgId: orginfo.orgId,
                orgName: orginfo.orgName,
              });
              orginfo.visitorType
                .filter((type) => type.visitorType == purpose)
                .map(async (res) => {
                  const newfields = res.fields.map((item) => {
                    item.value = "";
                    return item;
                  });
                  setFields(newfields);
                });
              setIsRevisit(true);
              setPreRegisterVisitId("");
              setFullName(data.fullName);
              setEmail(data.email);
              setCompanyName(data.companyName);
              setPhone(data.phoneNumber);
              setHost(data.hostName);
              setHostId(data.hostUserId);
              setVisitCustomFields(
                data.visitCustomFields ? data.visitCustomFields : []
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
              navigation.navigate("RevisitConfirmation", {
                strings: strings,
                purpose: orginfo.visitorType[0].visitorType,
                orginfo: orginfo,
                picture: data.visitPhotoURI,
                faceId: picture,
                preRegisterVisitId: preRegisterVisitId,
                qrNotFound: true,
                checkinTime: data.checkinTime,
                faceIdInfo: {
                  fullName: data.fullName,
                  email: data.email,
                  companyName: data.companyName,
                  phone: data.phoneNumber,
                  host: data.hostName,
                  hostId: data.hostUserId,
                  visitCustomFields: data.visitCustomFields
                    ? data.visitCustomFields
                    : [],
                },
              });
            } else {
              logger.push({
                method: "Visitor details not found",
                type: "INFO",
                error: "",
                macAddress: macAddress,
                deviceId: orginfo.deviceId,
                siteId: orginfo.siteId,
                orgId: orginfo.orgId,
                orgName: orginfo.orgName,
              });
              setIsRevisit(false);
            }
          });
          setLoading(false);
        } else if (res.status == 401) {
          logger.push({
            method:
              "Api request fail to get visitor details by using facial recognition.",
            type: "ERROR",
            error: logstring.accessToken_error,
            macAddress: macAddress,
            apiUrl: url + "/visits/revisit",
            apiMethod: "POST",
            apiResStatus: res.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api request fail to get visitor details by using facial recognition"
          );
          setLoading(false);
          handleRefresh(() => handleNext(picture));
        } else {
          logger.push({
            method:
              "Api request fail to get visitor details by using facial recognition.",
            type: "ERROR",
            error: res,
            macAddress: macAddress,
            apiUrl: url + "/visits/revisit",
            apiMethod: "POST",
            apiResStatus: res.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api request fail to get visitor details by using facial recognition"
          );
          setLoading(false);
        }
      })
      .catch((err) => {
        logger.push({
          method:
            "Api request fail to get visitor details by using facial recognition.",
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
        setLoading(false);
      });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      timeing = 3;
      setFaceLoading(false);
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

  // return preregistervisitid visitor
  const returnPreregister = async (preregisteredVisitId) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
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
    await analytics().logEvent("preregister_qr_code_first", {
      screen_name: "Facial Recognition Screen",
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
                "Api call successful to get preregister vistior data."
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
        screen_name: "Facial_Recognition_Screen",
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
              "Api call successful to get visitor data for sign in by using pre-reigster qr code"
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
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
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
    await analytics().logEvent("revisit_qr_code_email", {
      screen_name: "Facial_Recognition_Screen",
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
              purpose: orginfo.visitorType[0].visitorType,
              orginfo: orginfo,
              picture: res.results[0].visitPhotoURI,
              faceId: picture,
              preRegisterVisitId: preRegisterVisitId,
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
      timeForInactivity={timer}
      isActive={true}
      checkInterval={5000}
      onAction={() => navigation.navigate("Home")}
    >
      <View style={{ flex: 1, backgroundColor: color.white }}>
        <View style={{ flex: 1, backgroundColor: color.white }}>
          <View
            style={{
              marginTop: orientation.isPortrait ? RFValue(30) : RFValue(30),
              paddingHorizontal: RFValue(20),
            }}
          >
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
                  style={{ width: 150, height: 150 }}
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
                  // onPress={() => setCancleModal(true)}
                  onPress={() => {
                    logger.push({
                      method: "User navigate to Sign In Full Name Screen.",
                      type: "INFO",
                      error: "",
                      macAddress: macAddress,
                      deviceId: orginfo.deviceId,
                      siteId: orginfo.siteId,
                      orgId: orginfo.orgId,
                      orgName: orginfo.orgName,
                    });
                    navigation.navigate("FullName", {
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
              />
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
          BGColor={color.concrete}
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

export default FaceRecognition;
