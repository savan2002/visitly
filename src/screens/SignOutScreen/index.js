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
  FlatList,
  Keyboard,
} from "react-native";
import React, { useEffect, useState } from "react";
import { color } from "../../theme/colors";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import { RFValue } from "react-native-responsive-fontsize";
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LightenColor } from "../../resources/LightenColor";
import AntDesign from "react-native-vector-icons/AntDesign";
import CancleWithFooter from "../../components/CancleWithFooter";
import QrScannerModal from "../../components/QrScannerModal";
import CommonStyle from "../../theme/CommonStyle";
import styles from "./styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import properties from "../../resources/properties.json";
import moment from "moment";
import UserInactivity from "react-native-user-inactivity";
import CancleConfirmationModal from "../../components/CancleConfirmationModal";
import WarningIcon from "../../assets/svg/warning.svg";
import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
import { logstring } from "../../resources/loggerstrings";
LogBox.ignoreAllLogs();
const SignOutScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  const [fullName, setFullName] = useState("");
  const [showBlur, setShowBlur] = useState(true);
  const [scannedResult, setScannedResult] = useState();
  const [showScnnerModal, setShowScannerModal] = useState(false);
  const [signoutVisitId, setSignoutVisitId] = useState("");
  const [errFullName, setErrFullName] = useState(null);
  const [showCross, setShowCross] = useState(false);
  const [data, setData] = useState([]);
  const [visitMap, setVisitMap] = useState([]);
  const [nameMap, setNameMap] = useState([]);
  const [searchedData, setSearchedData] = useState();
  const [isresults, setIsresults] = useState(false);
  const [message, setMessage] = useState("");
  const [findName, setFindName] = useState();
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setuserName] = useState("");
  const [emailRes, setEmailRes] = useState();
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  const [errorFlag, setErrorFlag] = useState(false);
  var now = moment().format("YYYY-MM-DDTHH:mm:ss");
  var sevenDaysAgo = moment().subtract(7, "days").utc().format("YYYY-MM-DD");
  var isOnSiteFlag = true;
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

  useEffect(() => {
    if (fullName.length != 0) {
      setErrFullName(null);
      setShowCross(true);
      if (fullName !== "" && fullName.length == 0) {
        setErrFullName(strings.enter_fullname);
      } else if (!fullName) {
        setErrFullName(strings.enter_fullname);
      } else {
      }
    }
    if (fullName.length == 0) {
      setShowCross(false);
      setIsresults(false);
    }
  }, [fullName]);

  const handleNext = () => {};

  const onClear = () => {
    setFullName("");
  };

  const findHosts = (name) => {
    setSearchedData(null);
    setFullName(name);
    setFindName(name);
    onTyping(name);
  };

  var mainColor = orginfo ? orginfo.btnColor : "";
  var secondaryColor, thirdColor;
  secondaryColor = LightenColor(mainColor, 55);
  thirdColor = LightenColor(mainColor, 75);

  const onTyping = async (text) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    var t = text;
    t = t.split(" ")[0];
    if (text.length >= 3) {
      const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
      const Options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + ACtoken,
          Accept: "application/json",
        },
      };
      fetch(
        url +
          "/visits?limit=100&offset=0&visitStartDate=" +
          sevenDaysAgo +
          "&isOnSiteFlag=" +
          isOnSiteFlag +
          "&orgId=" +
          orginfo.orgId +
          "&sortBy=checkinTime&sort=desc&q=" +
          t,
        Options
      )
        .then(async (response) => {
          if (response.status < 400) {
            response.json().then(async (data) => {
              if (data.results.length != 0) {
                setIsresults(true);
                var dataFilter = data.results.filter(
                  (visit) => visit.checkoutTime == null
                );
                setSearchedData(dataFilter);
                var dataFilter2 = dataFilter.map((visit) => ({
                  email: visit.email ? visit.email.toLowerCase() : "", //
                  id: visit.id,
                  fullName: visit.fullName,
                }));
                var visits = [];
                var dataMap = [];
                var nameMap = [];
                for (var j = 0; j < dataFilter2.length; j++) {
                  if (
                    visits.filter((visit) => visit == dataFilter2[j].email)
                      .length == 0
                  ) {
                    visits.push(dataFilter2[j].email);
                    dataMap.push(dataFilter2[j].id);
                    nameMap.push(dataFilter[j].fullName);
                  } else if (
                    visits.filter((visit) => visit == dataFilter2[j].email)
                      .length > 0 &&
                    visits.filter((visit) => visit == dataFilter2[j].fullName)
                      .length == 0
                  ) {
                    visits.push(dataFilter2[j].email);
                    dataMap.push(dataFilter2[j].id);
                    nameMap.push(dataFilter[j].fullName);
                  }
                }
                setData(dataMap);
                setVisitMap(visits);
                setNameMap(nameMap);
              } else {
                setIsresults(false);
                setMessage("Visitor not exist..!");
              }
            });
          } else if (response.status == 401) {
            handleRefresh(() => {
              onTyping(text);
            });
          } else if (response.status >= 400 && response.status < 500) {
            // Alert.alert(strings.error, strings.OrgSetup_invalid, [
            //   { text: strings.ok },
            // ]);
          } else {
            // Alert.alert(strings.oops, strings.server_issue, [
            //   { text: strings.ok },
            // ]);
          }
        })
        .catch((error) => {
          // console.log(error);
        });
    } else {
      setData([]);
      setVisitMap([]);
      setNameMap([]);
    }
  };

  const ItemView = ({ item }) => {
    return (
      <Pressable
        onPress={() => {
          setFullName(item.fullName);
          onSelect(item.fullName);
        }}
        style={{
          marginBottom: RFValue(8),
          width: orientation.isPortrait
            ? orientation.height / 2.6
            : orientation.width / 2.6,
        }}
      >
        <Text
          style={{
            ...CommonStyle.text3,
            color: color.boulder,
            paddingLeft: RFValue(10),
          }}
        >
          {item.fullName}
        </Text>
      </Pressable>
    );
  };

  const onSelect = async (name) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "User click visitor name for get visitor details.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });

    setUser(name);
    var index;
    for (var i = 0; i < visitMap.length; i++) {
      if (nameMap[i] == name) {
        index = i;
      }
    }
    var visitId = data[index];
    setSignoutVisitId(visitId);
    await analytics().logEvent("signout_name", {
      screen_name: "Signout Screen",
      api_url: `${url}/visits/$VISITID`,
    });
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    const Options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + ACtoken,
        Accept: "application/json",
      },
    };
    fetch(url + "/visits/" + visitId, Options).then((response) => {
      if (response.status < 400) {
        response.json().then((data) => {
          logger.push({
            method:
              "Api call successful to get visitor details from api for sign out.",
            type: "INFO",
            error: "",
            macAddress: macAddress,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api call successful to get visitor details from api for sign out"
          );
          const visitorTypeFields = orginfo.visitorType.filter(
            (org) => data?.visitorTypeId === org.id
          );
          const signoutFields =
            visitorTypeFields.length > 0 && visitorTypeFields[0].signOutFields
              ? visitorTypeFields[0].signOutFields
              : [];
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
            signoutVisitId: visitId,
          });
        });
      } else if (response.status == 401) {
        logger.push({
          method: "Api request fail to fetch visitor details for sign out.",
          type: "ERROR",
          error: logstring.accessToken_error,
          error: response,
          macAddress: macAddress,
          apiUrl: url + "/visits/" + visitId,
          apiMethod: "GET",
          apiResStatus: response.status,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log(
          "Api request fail to fetch visitor details for sign out"
        );
        handleRefresh(() => onSelect(name));
      } else {
        logger.push({
          method: "Api request fail to fetch visitor details for sign out.",
          type: "ERROR",
          error: response,
          macAddress: macAddress,
          apiUrl: url + "/visits/" + visitId,
          apiMethod: "GET",
          apiResStatus: response.status,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
      }
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setFullName("");
      Keyboard.dismiss();
    });

    return unsubscribe;
  }, [navigation]);

  const handleRefresh = async (func) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "Api call for refresh accessToken.",
      type: "INFO",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    setLoading(true);
    await AsyncStorage.getItem("VisitlyStore:refreshToken")
      .then((refreshToken) => {
        if (refreshToken == null && refreshToken == "") {
          setLoading(false);
          return;
        }
        fetch(url + "/devices/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            refreshToken: refreshToken,
          }),
        }).then(async (response) => {
          if (response.status == 401) {
            setLoading(false);
          } else {
            response.json().then(async (data) => {
              await AsyncStorage.setItem(
                "VisitlyStore:accessToken",
                data.accessToken
              );
              if (func) {
                func();
              } else {
                setLoading(false);
              }
            });
          }
        });
      })
      .catch((error) => {
        setLoading(false);
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

  // return preregistervisitid to sign out visitor
  const returnPreregister = async (preregisteredVisitId) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method:
        "Sign out visitor by using pre reigster qr code scanned successfully.",
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
      "Sign out visitor by using pre reigster qr code scanned successfully"
    );
    await analytics().logEvent("signout_preregister_qrcode_first", {
      screen_name: "Signout Screen",
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
              "Api call successful to get visitor data by using pre reigster qr code"
            );
            if (data && data.results.length > 0) {
              var dataFilter = data.results.filter(
                (visit) => visit.checkoutTime == null || !visit.checkoutTime
              );
              const visitorTypeFields = orginfo.visitorType.filter(
                (org) => data.results[0]?.visitorTypeId === org.id
              );
              const signoutFields =
                visitorTypeFields.length > 0 &&
                visitorTypeFields[0].signOutFields
                  ? visitorTypeFields[0].signOutFields
                  : [];
              if (dataFilter) {
                logger.push({
                  method:
                    "Api call successful to get visitor data by using pre reigster qr code.",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
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
                const visits = dataFilter.map((visit) => visit.email);
                const dataMap = dataFilter.map((visit) => visit.Id);
                setData(dataMap);
                setVisitMap(visits);
                setSignoutVisitId(dataFilter[0]?.id);
                setLoading(false);
                setShowScannerModal(false);
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
              "Api request fail to get visitor details by pre-register qr code for sign out.",
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
            "Api request fail to get visitor details by pre-register qr code for sign out"
          );
          setLoading(false);
          handleRefresh(() => returnData(preregisteredVisitId));
        } else if (response.status >= 400 && response.status < 500) {
          logger.push({
            method:
              "Api request fail to get visitor details by pre-register qr code for sign out",
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
            "Api request fail to get visitor details by pre-register qr code for sign out"
          );
          setLoading(false);
        } else {
          logger.push({
            method:
              "Api request fail to get visitor details by pre-register qr code for sign out.",
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
            "Api request fail to get visitor details by pre-register qr code for sign out"
          );
          setLoading(false);
        }
      });
    } else {
      await analytics().logEvent("signout_preregister_qrcode_second", {
        screen_name: "Signout Screen",
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
              "Api call successful to get visitor data by using pre-reigster qr code"
            );
            if (data.results.length > 0) {
              var dataFilter = data.results.filter(
                (visit) => visit.checkoutTime === null || !visit.checkoutTime
              );
              const visitorTypeFields = orginfo.visitorType.filter(
                (org) => data.results[0]?.visitorTypeId === org.id
              );
              const signoutFields =
                visitorTypeFields.length > 0 &&
                visitorTypeFields[0].signOutFields
                  ? visitorTypeFields[0].signOutFields
                  : [];
              if (dataFilter) {
                logger.push({
                  method:
                    "Api call successful to get visitor data by using pre-reigster qr code.",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
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
                const visits = dataFilter.map((visit) => visit.email);
                const dataMap = dataFilter.map((visit) => visit.id);
                setData(dataMap);
                setVisitMap(visits);
                setSignoutVisitId(dataFilter[0].id);
                setLoading(false);
                setShowScannerModal(false);
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
              "Api request fail to get visitor details by pre-register qr code for sign out.",
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
            "Api request fail to get visitor details by pre-register qr code for sign out"
          );
          setLoading(false);
          handleRefresh(() => returnData(preregisteredVisitId));
        } else if (response.status >= 400 && response.status < 500) {
          logger.push({
            method:
              "Api request fail to get visitor details by pre-register qr code for sign out.",
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
            "Api request fail to get visitor details by pre-register qr code for sign out"
          );
          setLoading(false);
        } else {
          logger.push({
            method:
              "Api request fail to get visitor details by pre-register qr code for sign out.",
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
            "Api request fail to get visitor details by pre-register qr code for sign out"
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
      screen_name: "SignOut Screen",
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
          crashlytics().log(
            "Api call successful to get visitor data by using email qr code"
          );
          setEmailRes(data.results[0]);
          const visitorTypeFields = orginfo.visitorType.filter(
            (org) => data.results[0]?.visitorTypeId === org.id
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
                "Api call successful to get visitor data by using email qr code.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
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
            const visits = dataFilter.map((visit) => visit.email);
            const dataMap = dataFilter.map((visit) => visit.Id);
            setData(dataMap);
            setVisitMap(visits);
            setSignoutVisitId(dataFilter[0].id);
            setLoading(false);
            setShowScannerModal(false);
            navigation.navigate("SignoutVisitor", {
              strings: strings,
              userObject: data.results[0],
              visitorSignoutFields: signoutFields,
              orginfo: orginfo,
              signoutVisitId: dataFilter[0].id,
            });
          } else {
            setErrorFlag(true);
            setLoading(false);
          }
        });
      } else if (response.status == 401) {
        logger.push({
          method:
            "Api request fail to get visitor details by email qr code for sign out.",
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
          "Api request fail to get visitor details by email qr code for sign out"
        );
        setLoading(false);
        handleRefresh(() => returnData(email));
      } else if (response.status >= 400 && response.status < 500) {
        logger.push({
          method:
            "Api request fail to get visitor details by email qr code for sign out.",
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
          "Api request fail to get visitor details by email qr code for sign out"
        );
        setLoading(false);
      } else {
        logger.push({
          method:
            "Api request fail to get visitor details by email qr code for sign out.",
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
          "Api request fail to get visitor details by email qr code for sign out"
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1, height: "100%" }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={CommonStyle.mainScreen}>
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
                {strings.enter_your_fname},&nbsp;{strings.email},&nbsp;
                {strings.or}&nbsp;{strings.mobile}
              </Text>
              <View
                style={{
                  alignItems: "center",
                  marginTop: orientation.isPortrait ? RFValue(14) : RFValue(10),
                }}
              >
                <View
                  style={{
                    ...styles.inputContainer,
                    borderBottomColor: orginfo ? orginfo.btnColor : "",
                    width: orientation.isPortrait
                      ? orientation.height / 2.6
                      : orientation.width / 2.6,
                  }}
                >
                  <TextInput
                    autoCapitalize="words"
                    autoCorrect={false}
                    keyboardType={"default"}
                    value={fullName}
                    onChangeText={(name) => findHosts(name)}
                    style={{
                      ...styles.input,
                      width: orientation.isPortrait
                        ? orientation.height / 2.8
                        : orientation.width / 2.8,
                    }}
                  />
                  {showCross ? (
                    <Pressable
                      style={{ paddingRight: RFValue(5) }}
                      onPress={() => onClear()}
                    >
                      <Ionicons
                        name="ios-close"
                        size={RFValue(12)}
                        color={color.cod_gray}
                      />
                    </Pressable>
                  ) : null}
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: orientation.isPortrait
                      ? RFValue(12)
                      : RFValue(10),
                  }}
                >
                  {errFullName ? (
                    <WarningIcon
                      height={RFValue(10)}
                      width={RFValue(10)}
                      style={{ color: color.red }}
                    />
                  ) : null}
                  <Text style={CommonStyle.errTextStyle}>{errFullName}</Text>
                </View>
                {isresults ? (
                  <FlatList
                    data={searchedData}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={ItemView}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={true}
                    style={{
                      width: orientation.isPortrait
                        ? orientation.height / 2.6
                        : orientation.width / 2.6,
                      height: orientation.isPortrait
                        ? orientation.width / 2.8
                        : orientation.height / 6,
                      paddingVertical: RFValue(3),
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: orientation.isPortrait
                        ? orientation.height / 2.6
                        : orientation.width / 2.6,
                      height: orientation.isPortrait
                        ? orientation.width / 2.8
                        : orientation.height / 6,
                      alignItems: "center",
                    }}
                  >
                    <Text style={CommonStyle.text2}>{message}</Text>
                  </View>
                )}
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
                      ? RFValue(20)
                      : RFValue(20),
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

export default SignOutScreen;
