import {
  LogBox,
  View,
  Image,
  Pressable,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import UseOrientation from "react-native-fast-orientation";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import { useNavigation, useRoute } from "@react-navigation/native";
import Octicons from "react-native-vector-icons/Octicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import str from "../../resources/localization";
import CommonStyle from "../../theme/CommonStyle";
import styles from "./styles";
// import UserInactivity from "react-native-user-inactivity";
import Footer from "../../components/Footer";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import properties from "../../resources/properties.json";
import moment from "moment";
import ErrorModal from "../../components/ErrorModal";
import DeviceInfo from "react-native-device-info";
import RNPrint from "react-native-print";
import NetInfo from "@react-native-community/netinfo";
import DotActivity from "../../components/DotActivity";
import GenericErrorModal from "../../components/GenericErrorModal";
import { LightenColor } from "../../resources/LightenColor";
import crashlytics from "@react-native-firebase/crashlytics";
import NoInternet from "../../assets/svg/noInternet.svg";
import Billing from "../../assets/svg/billing.svg";
import DevicePinModal from "../../components/DevicePinModal";
import { BarIndicator } from "react-native-indicators";
import analytics from "@react-native-firebase/analytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import LocalizedStrings from "react-native-localization";
LogBox.ignoreAllLogs();
const HomeScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const [accessToken, setAccessToken] = useState();
  const [value, setValue] = useState("English");
  const [timer, setTimer] = useState(900000);
  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [contactlessQRCode, setContactlessQRCode] = useState();
  const [orgInfo, setOrgInfo] = useState(
    route?.params?.orginfo ? route?.params?.orginfo : []
  );
  const [isExpired, setIsExpired] = useState(false);
  const [errModal, setErrModal] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [contactlessVisitor, setContactlessVisitor] = useState([]);
  const [pin, setPin] = useState("");
  const [errText, setErrText] = useState(false);
  const [macAddress, setMacAddress] = useState(DeviceInfo.getUniqueIdSync());
  const [pinReady, setPinReady] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [forgotPinModal, setForgotPinModal] = useState(false);
  const [printUrl, setPrintUrl] = useState("");
  const [isInternet, setIsInternet] = useState(false);
  const [isDotloading, setIsDotLoading] = useState(false);
  var [strings, setStrings] = useState(new Object());
  const [isBgImg, setIsBgImg] = useState(false);
  var refreshIntervalPtr;
  // const orginfo = route?.params?.orginfo;
  var secondaryColor;
  const logger = new LogglyTracker();
  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setPrintUrl(await AsyncStorage.getItem("VisitlyStore:printerUrl"));
      const orgData = JSON.parse(
        await AsyncStorage.getItem("VisitlyStore:orginfo")
      );
      secondaryColor = orgData ? LightenColor(orgData?.btnColor, 55) : null;
      orgData.orgProducts.products[0].entitlements.map((item) => {
        if (item.key == "CUSTOM_BG_IMG" && item.value) {
          setIsBgImg(item.value);
        } else {
        }
      });
      // setTimer(900000);
      setOrgInfo(orgData);
    });

    return unsubscribe;
  }, [navigation]);

  const fetchLanguage = async () => {
    await fetch(
      "https://s3-us-west-2.amazonaws.com/visitly-web-assets/assets/scripts/languages2.json",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then(async (response) => response.text())
      .then(async (res) => {
        if (res) {
          const result = JSON.parse(res);
          await AsyncStorage.setItem("VisitlyStore:localization", res);
          Languagestrings = new LocalizedStrings(result);
          Languagestrings.setLanguage(orgInfo.language);
          setStrings(Languagestrings);
        } else {
          setStrings(str);
        }
      });
  };

  // const languageData = [
  //   { id: 1, label: "English", value: "en" },
  //   { id: 2, label: "Spanish", value: "es" },
  //   { id: 3, label: "French", value: "fr" },
  //   { id: 4, label: "Italian", value: "de" },
  //   { id: 5, label: "German", value: "it" },
  //   { id: 6, label: "Norwegian", value: "no" },
  //   { id: 7, label: "Swedish", value: "sv" },
  //   { id: 8, label: "Polish", value: "pl" },
  //   { id: 9, label: "Finnish", value: "fi" },
  //   { id: 10, label: "Portugese", value: "pt" },
  // ];

  // const setCurrentLanguage = (e) => {
  //   if (e == "en") {
  //     setValue("English");
  //     setSelectedIndex(0);
  //   } else if (e == "es") {
  //     setValue("Spanish");
  //     setSelectedIndex(1);
  //   } else if (e == "fr") {
  //     setValue("French");
  //     setSelectedIndex(2);
  //   } else if (e == "de") {
  //     setValue("Italian");
  //     setSelectedIndex(3);
  //   } else if (e == "it") {
  //     setValue("German");
  //     setSelectedIndex(4);
  //   } else if (e == "no") {
  //     setValue("Norwegian");
  //     setSelectedIndex(5);
  //   } else if (e == "sv") {
  //     setValue("Swedish");
  //     setSelectedIndex(6);
  //   } else if (e == "pl") {
  //     setValue("Polish");
  //     setSelectedIndex(7);
  //   } else if (e == "fi") {
  //     setValue("Finnish");
  //     setSelectedIndex(8);
  //   } else if (e == "pt") {
  //     setValue("Portugese");
  //     setSelectedIndex(9);
  //   }
  // };

  useEffect(() => {
    const netWorkSubscribe = NetInfo.addEventListener((state) => {
      setIsInternet(!state.isConnected && !state.isInternetReachable);
    });
    return netWorkSubscribe;
  }, []);

  useEffect(() => {
    if (pin.length != 0) {
      setErrText("");
    }
  }, [pin.length]);

  const submitPin = async () => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "User clicked submit button for access Admin setting.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orgInfo.deviceId,
      siteId: orgInfo.siteId,
      orgId: orgInfo.orgId,
      orgName: orgInfo.orgName,
    });
    await analytics().logEvent("authenticate_for_admin_setting", {
      screen_name: "HomeScreen",
      api_url: `${url}/devices/authenticate`,
    });
    crashlytics().log("Call api for authenticate with device pin");
    var pinOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        deviceKey: pin,
        macAddress: macAddress,
      }),
    };
    fetch(url + "/devices/authenticate", pinOptions).then((response) => {
      if (response.status < 400) {
        response.json().then(async (data) => {
          setAccessToken(data.accessToken);
          await AsyncStorage.setItem(
            "VisitlyStore:accessToken",
            data.accessToken
          );
          await AsyncStorage.setItem(
            "VisitlyStore:refreshToken",
            data.refreshToken
          );
          crashlytics().log("Call api for authenticate for device success");
          var orgOptions = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${data.accessToken}`,
            },
            redirect: "follow",
          };
          fetch(url + "/devices/orgconfig", orgOptions).then((response) => {
            if (response.status < 400) {
              response.json().then(async (orgdata) => {
                await AsyncStorage.setItem(
                  "VisitlyStore:orginfo",
                  JSON.stringify(orgdata)
                );
                secondaryColor = LightenColor(orgdata?.btnColor, 55);
                var currentDateTime = new Date();
                await AsyncStorage.setItem(
                  "VisitlyStore:lastOrgUpdate",
                  JSON.stringify(currentDateTime)
                );
                crashlytics().log("Call api for get config data with device.");
                var orgOptions = {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                  },
                  redirect: "follow",
                };
                fetch(`${url}/devices/${orgdata.deviceId}`, orgOptions).then(
                  async (response) => {
                    if (response.status < 400) {
                      response.json().then(async (devorgdata) => {
                        await AsyncStorage.setItem(
                          "VisitlyStore:deviceOrgInfo",
                          JSON.stringify(devorgdata)
                        );
                        logger.push({
                          method:
                            "Api call success to get Access of Admin setting.",
                          type: "INFO",
                          error: "",
                          macAddress: macAddress,
                          deviceId: orgInfo.deviceId,
                          siteId: orgInfo.siteId,
                          orgId: orgInfo.orgId,
                          orgName: orgInfo.orgName,
                        });
                        setShowPinModal(false);
                        logger.push({
                          method: "User navigate to Admin Setting Screen.",
                          type: "INFO",
                          error: "",
                          macAddress: macAddress,
                          deviceId: orgInfo.deviceId,
                          siteId: orgInfo.siteId,
                          orgId: orgInfo.orgId,
                          orgName: orgInfo.orgName,
                        });
                        navigation.navigate("AdminInfo", {
                          strings: strings,
                          orginfo: orgdata,
                          deviceOrginfo: devorgdata,
                          adminPin: pin,
                        });
                        crashlytics().log(
                          "Api call success to get Access of Admin setting"
                        );
                      });
                    } else if (
                      response.status >= 400 &&
                      response.status < 500
                    ) {
                      logger.push({
                        method:
                          "Api request fail to get device org config data.",
                        type: "ERROR",
                        error: strings.org_fail,
                        macAddress: macAddress,
                        ApiUrl: url + "/devices/" + orgdata.deviceId,
                        ApiMethod: "GET",
                        ApiResStatus: response.status,
                        deviceId: orgInfo.deviceId,
                        siteId: orgInfo.siteId,
                        orgId: orgInfo.orgId,
                        orgName: orgInfo.orgName,
                      });
                      setErrModal(true);
                      setErrMsg(strings.org_fail);
                      setTimeout(() => {
                        setErrModal(false);
                      }, 5000);
                      crashlytics().log(
                        "Api request fail to get device org config data"
                      );
                    } else {
                      logger.push({
                        method:
                          "Api request fail to get device org config data.",
                        type: "ERROR",
                        error: strings.OrgSetup_bitoftime,
                        macAddress: macAddress,
                        ApiUrl: url + "/devices/" + orgdata.deviceId,
                        ApiMethod: "GET",
                        ApiResStatus: response.status,
                        deviceId: orgInfo.deviceId,
                        siteId: orgInfo.siteId,
                        orgId: orgInfo.orgId,
                        orgName: orgInfo.orgName,
                      });
                      setErrModal(true);
                      setErrMsg(strings.OrgSetup_bitoftime);
                      setTimeout(() => {
                        setErrModal(false);
                      }, 5000);
                      crashlytics().log(
                        "Api request fail to get device org config data"
                      );
                    }
                  }
                );
              });
            } else if (response.status >= 400 && response.status < 500) {
              logger.push({
                method: "Api request fail to get org config data.",
                type: "ERROR",
                error: strings.org_fail,
                macAddress: macAddress,
                ApiUrl: url + "/devices/orgconfig",
                ApiMethod: "GET",
                ApiResStatus: response.status,
                deviceId: orgInfo.deviceId,
                siteId: orgInfo.siteId,
                orgId: orgInfo.orgId,
                orgName: orgInfo.orgName,
              });
              setErrModal(true);
              setTimeout(() => {
                setErrModal(false);
              }, 5000);
              setErrMsg(strings.org_fail);
              crashlytics().log("Api request fail to get org config data");
            } else {
              logger.push({
                method: "Api request fail to get org config data.",
                type: "ERROR",
                error: strings.OrgSetup_bitoftime,
                macAddress: macAddress,
                ApiUrl: url + "/devices/orgconfig",
                ApiMethod: "GET",
                ApiResStatus: response.status,
                deviceId: orgInfo.deviceId,
                siteId: orgInfo.siteId,
                orgId: orgInfo.orgId,
                orgName: orgInfo.orgName,
              });
              setErrModal(true);
              setErrMsg(strings.OrgSetup_bitoftime);
              setTimeout(() => {
                setErrModal(false);
              }, 5000);
              crashlytics().log("Api request fail to get org config data");
            }
          });
        });
      } else if (response.status >= 400 && response.status < 500) {
        logger.push({
          method: "Api request fail to authenticate with device pin.",
          type: "ERROR",
          error: "User entered device pin is not correct.",
          macAddress: macAddress,
          postData: { deviceKey: pin },
          ApiUrl: url + "/devices/authenticate",
          ApiMethod: "POST",
          ApiResStatus: response.status,
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        setErrText(true);
        setPin("");
        crashlytics().log("Api request fail to authenticate with device pin");
      } else {
        logger.push({
          method: "Api request fail to authenticate with device pin.",
          type: "ERROR",
          error: "User entered device pin is not correct.",
          macAddress: macAddress,
          postData: { deviceKey: pin },
          ApiUrl: url + "/devices/authenticate",
          ApiMethod: "POST",
          ApiResStatus: response.status,
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        setErrText(true);
        setPin("");
        crashlytics().log("Api request fail to authenticate with device pin");
      }
    });
  };

  // const onInactivity = () => {
  //   navigation.navigate("CustomerSplash");
  // };

  // const onChangeLanguage = (value) => {
  //   language.setLanguage(value);
  // };

  useEffect(() => {
    fetchdata();
    fetchLanguage();
    if (orgInfo !== "") {
      setOrgInfoWithRefresh();
    }

    setTimeout(async () => {
      const orgData = JSON.parse(
        await AsyncStorage.getItem("VisitlyStore:orginfo")
      );
      // language.setLanguage(orgData.language);
      // setCurrentLanguage(orgData.language);
      if (orgData.allowSignInOnPersonalDevice) {
        getTouchlessToken();
      }
      getOrgData();
    }, 2000);

    setInterval(async () => {
      const orgData = JSON.parse(
        await AsyncStorage.getItem("VisitlyStore:orginfo")
      );
      if (orgData.allowSignInOnPersonalDevice) {
        getTouchlessToken();
      }
    }, 15 * 60 * 1000);

    refreshIntervalPtr = setInterval(() => {
      getOrgData();
    }, 300000);

    storerefreshInteval();
  }, []);

  const fetchPrinterURL = async () => {
    const BadgePrinterUrl = await AsyncStorage.getItem(
      "VisitlyStore:printerUrl"
    );
    if (orgInfo?.allowBadgePolling == true && BadgePrinterUrl) {
      intervalId = setInterval(async () => {
        const print = await AsyncStorage.getItem("VisitlyStore:printerUrl");
        if (print) {
          PrintBadge(print);
        }
      }, 10000);
    } else if (orgInfo?.allowBadgePolling == true && !BadgePrinterUrl) {
      logger.push({
        method: "Printer URL not found for poller.",
        PriterUrl: BadgePrinterUrl,
        type: "ERROR",
        error: "printer url not found...",
        deviceId: orgInfo.deviceId,
        siteId: orgInfo.siteId,
        orgId: orgInfo.orgId,
        orgName: orgInfo.orgName,
      });
    }
    return () => clearInterval(intervalId);
  };

  useEffect(() => {
    fetchPrinterURL();
  }, [orgInfo?.allowBadgePolling]);

  const PrintBadge = async (urlPrint) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    await analytics().logEvent("print_badge_for_contactless_signin", {
      screen_name: "HomeScreen",
      api_url: `${url}/badgehtml/all`,
    });
    crashlytics().log(
      "Api call for print badge for all contactless visitor who signed in print"
    );
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    var requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${ACtoken}`,
      },
    };

    fetch(url + "/badgehtml/all", requestOptions).then((response) => {
      if (response.status < 400) {
        response.json().then(async (result) => {
          for (let index = 0; index < result.length; index++) {
            const element = result[index];
            const badgeContent = await fetch(element.badgePdfS3Url).then(
              (response) => response.text()
            );
            const results = await RNHTMLtoPDF.convert({
              html: badgeContent,
              fileName: "visitly-badge-print",
              base64: false,
              height: 175,
              width: 283,
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              paddingBottom: 0,
              bgColor: "white",
              isLandscape: false,
            });
            await RNPrint.print({
              printerURL: urlPrint,
              filePath: results.filePath,
            }).catch(async (error) => {
              logger.push({
                method: "print badge for contactless visitor print failed.",
                PriterUrl: urlPrint,
                type: "ERROR",
                error: error.message,
                deviceId: orgInfo.deviceId,
                siteId: orgInfo.siteId,
                orgId: orgInfo.orgId,
                orgName: orgInfo.orgName,
              });
            });
            logger.push({
              method: "print badge for contactless visitor print successful.",
              PriterUrl: urlPrint,
              type: "INFO",
              error: "",
              deviceId: orgInfo.deviceId,
              siteId: orgInfo.siteId,
              orgId: orgInfo.orgId,
              orgName: orgInfo.orgName,
            });
          }
          crashlytics().log(
            "Api call for print badge for all contactless visitor who signed in with success print"
          );
          if (result.length > 0) {
            logger.push({
              method:
                "Api call to get contactless visitor badge successful records found.",
              PriterUrl: printUrl,
              type: "INFO",
              error: "",
              message: result,
              deviceId: orgInfo.deviceId,
              siteId: orgInfo.siteId,
              orgId: orgInfo.orgId,
              orgName: orgInfo.orgName,
            });
          }
        });
      } else if (response.status == 401) {
        handleRefresh();
        logger.push({
          method: "Api call to get contactless visitor badge failed.",
          PriterUrl: urlPrint,
          type: "ERROR",
          error: response,
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        crashlytics().log(
          "Api call for print badge for all contactless visitor who signed in with refresh accesstoken print"
        );
      }
    });
  };

  const storerefreshInteval = async () => {
    await AsyncStorage.setItem(
      "@VisitlyStore:refreshIntervalPtr",
      JSON.stringify(refreshIntervalPtr)
    );
  };

  const fetchdata = async () => {
    setPrintUrl(await AsyncStorage.getItem("VisitlyStore:printerUrl"));
    const orgdataaa = JSON.parse(
      await AsyncStorage.getItem("VisitlyStore:orginfo")
    );
    secondaryColor = LightenColor(orgdataaa?.btnColor, 55);
    setOrgInfo(orgdataaa);
    var flag = false;
    orgdataaa.orgProducts.products[0].entitlements.map((item) => {
      if (item.key == "CUSTOM_BG_IMG" && item.value) {
        setIsBgImg(item.value);
      } else {
      }
    });
    const orgProductLength = orgdataaa.orgProducts.products.length;
    // console.log(orgProductLength);
    if (orgProductLength == 0) {
      // console.log(orgProductLength, "use Effect set 111111111111------------");
      setIsExpired(true);
    } else {
      setIsExpired(false);
    }
    // newFunction();

    // function newFunction() {
    //   // console.log(orgdataaa, 'local data to use all thihs');
    // }
  };

  // get contect less QR code
  const getTouchlessToken = async (deviceId) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method:
        "Api call for get contactless QR code for visitors and emplpoyee sign in.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orgInfo.deviceId,
      siteId: orgInfo.siteId,
      orgId: orgInfo.orgId,
      orgName: orgInfo.orgName,
    });
    await analytics().logEvent("contactless_signin_QR_code", {
      screen_name: "HomeScreen",
      api_url: `${url}/devices/touchlessQRCode/${deviceId}?expiryTimeInMinutes=30`,
    });
    crashlytics().log("Api call for get contactless QR code");
    const token = await AsyncStorage.getItem("VisitlyStore:accessToken");
    var touchlessTokenOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      redirect: "follow",
    };
    fetch(
      `${url}/devices/touchlessQRCode/${deviceId}?expiryTimeInMinutes=30`,
      touchlessTokenOptions
    ).then((response) => {
      if (response.status < 400) {
        response.json().then(async (data) => {
          logger.push({
            method:
              "Api call successful to get contactless QR code for visitors and employee sign in.",
            type: "INFO",
            error: "",
            macAddress: macAddress,
            deviceId: orgInfo.deviceId,
            siteId: orgInfo.siteId,
            orgId: orgInfo.orgId,
            orgName: orgInfo.orgName,
          });
          await AsyncStorage.setItem(
            "VisitlyStore:touchlessQRCode",
            data.qrCodeUrl
          );
          setContactlessQRCode(data.qrCodeUrl);
          crashlytics().log(
            "Api call successful to get contactless QR code for visitors and employee sign in"
          );
        });
      } else if (response.status >= 400 && response.status < 500) {
        logger.push({
          method:
            "Api request fail to get contactless QR code for visitors and employee sign in",
          type: "ERROR",
          error: strings.home_error,
          macAddress: macAddress,
          ApiUrl:
            url +
            "/devices/touchlessQRCode/" +
            deviceId +
            "?expiryTimeInMinutes=30",
          ApiMethod: "GET",
          ApiResStatus: response.status,
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        setErrMsg(strings.home_error);
        crashlytics().log(
          "Api request fail to get contactless QR code for visitors and employee sign in"
        );
      } else {
        logger.push({
          method:
            "Api request fail to get contactless QR code for visitors and employee sign in",
          type: "ERROR",
          error: strings.server_issue,
          macAddress: macAddress,
          ApiUrl:
            url +
            "/devices/touchlessQRCode/" +
            deviceId +
            "?expiryTimeInMinutes=30",
          ApiMethod: "GET",
          ApiResStatus: response.status,
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        setErrMsg(strings.server_issue);
        crashlytics().log(
          "Api request fail to get contactless QR code for visitors and employee sign in"
        );
      }
    });

    await AsyncStorage.setItem(
      "VisitlyStore:refreshIntervalPtr",
      JSON.stringify(refreshIntervalPtr)
    );
  };

  const qrImageContent = () => {
    if (contactlessQRCode) {
      return (
        <Image
          source={{ uri: contactlessQRCode }}
          style={{
            height: RFValue(60),
            width: RFValue(60),
            marginRight: RFValue(5),
          }}
          resizeMode={"contain"}
        />
      );
    }
    return <BarIndicator color={orgInfo.btnColor} size={RFValue(12)} />;
  };

  const Employess = () => {
    if (orgInfo.allowEmployeeSignInFeature) {
      return (
        <Pressable
          onPress={() => {
            logger.push({
              method: "User navigate to Employee Sign In Screen.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orgInfo.deviceId,
              siteId: orgInfo.siteId,
              orgId: orgInfo.orgId,
              orgName: orgInfo.orgName,
            });
            navigation.navigate("Employee", {
              orginfo: orgInfo,
              strings: strings,
            });
          }}
          style={styles.button}
        >
          <Ionicons
            name="person"
            size={RFValue(14)}
            color={orgInfo ? orgInfo.btnColor : ""}
            style={{ marginRight: RFValue(6) }}
          />
          <Text
            style={{
              ...styles.footerBtnText,
              color: orgInfo ? orgInfo.btnColor : "",
            }}
          >
            {strings.employee}
          </Text>
        </Pressable>
      );
    }
    return null;
  };

  const Signout = () => {
    if (orgInfo.checkOutFlag) {
      return (
        <Pressable
          onPress={() => {
            if (orgInfo.faceRecogFlag) {
              logger.push({
                method: "User navigate to Sign Out Facial Recognition Screen.",
                type: "INFO",
                error: "",
                macAddress: macAddress,
                deviceId: orgInfo.deviceId,
                siteId: orgInfo.siteId,
                orgId: orgInfo.orgId,
                orgName: orgInfo.orgName,
              });
              navigation.navigate("SignoutFace", {
                orginfo: orgInfo,
                strings: strings,
              });
            } else {
              logger.push({
                method: "User navigate to  Sign Out Name Screen.",
                type: "INFO",
                error: "",
                macAddress: macAddress,
                deviceId: orgInfo.deviceId,
                siteId: orgInfo.siteId,
                orgId: orgInfo.orgId,
                orgName: orgInfo.orgName,
              });
              navigation.navigate("Signout", {
                orginfo: orgInfo,
                strings: strings,
              });
            }
          }}
          style={styles.button}
        >
          <Octicons
            name="sign-out"
            size={RFValue(14)}
            color={orgInfo.btnColor}
            style={{ marginRight: RFValue(6) }}
          />
          <Text
            style={{
              ...styles.footerBtnText,
              color: orgInfo.btnColor,
            }}
          >
            {strings.signout}
          </Text>
        </Pressable>
      );
    }
    return null;
  };

  const Delivery = () => {
    if (orgInfo.deliveryEnabledFlag) {
      return (
        <Pressable onPress={() => clickDelivery()} style={styles.button}>
          <MaterialCommunityIcons
            name="truck-delivery"
            size={RFValue(14)}
            color={orgInfo ? orgInfo.btnColor : ""}
            style={{ marginRight: RFValue(6) }}
          />
          <Text
            style={{
              ...styles.footerBtnText,
              color: orgInfo ? orgInfo.btnColor : "",
            }}
          >
            {strings.deliveries}
          </Text>
        </Pressable>
      );
    }
    return null;
  };

  const getOrgData = async () => {
    const lastOrgUpdate = await AsyncStorage.getItem(
      "VisitlyStore:lastOrgUpdate"
    ).then(async (data) => {
      var lastDateTime = new Date(data);
      var ONE_HOUR = 60 * 60 * 1000; /* ms */
      var FIVE_MIN = 5 * 60 * 1000;
      var ONE_MIN = 1 * 60 * 1000;

      if (new Date() - lastDateTime > FIVE_MIN) {
        setOrgInfoWithRefresh();
      } else {
        setOrgInfoNoRefresh();
      }
    });
  };

  // orginfo api call
  const setOrgInfoNoRefresh = async () => {
    const temp = JSON.parse(await AsyncStorage.getItem("VisitlyStore:orginfo"));
    secondaryColor = LightenColor(temp?.btnColor, 55);
    setOrgInfo(temp);
    temp.orgProducts.products[0].entitlements.map((item) => {
      if (item.key == "CUSTOM_BG_IMG" && item.value) {
        setIsBgImg(item.value);
      } else {
      }
    });
    const orgProductLength = temp.orgProducts.products.length;
    if (orgProductLength == 0) {
      setIsExpired(true);
    } else {
      setIsExpired(false);
    }
  };

  // orginfo api call
  const setOrgInfoWithRefresh = async () => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "Api call to get org config data.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orgInfo.deviceId,
      siteId: orgInfo.siteId,
      orgId: orgInfo.orgId,
      orgName: orgInfo.orgName,
    });
    await analytics().logEvent("OrgCongifData", {
      screen_name: "HomeScreen",
      api_url: `${url}/devices/orgconfig`,
    });
    crashlytics().log("Api call for get config data with refresh");
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    var orgOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACtoken}`,
        Accept: "application/json",
      },
    };
    fetch(url + "/devices/orgconfig", orgOptions).then(async (response) => {
      if (response.status < 400) {
        response.json().then(async (orgdata) => {
          setOrgInfo(orgdata);
          secondaryColor = LightenColor(orgdata?.btnColor, 55);
          // strings.setLanguage(orgdata.language);
          // setCurrentLanguage(orgdata.language);
          if (orgdata.allowSignInOnPersonalDevice) {
            getTouchlessToken(orgdata.deviceId);
          }
          fetch(url + "/devices/" + orgdata.deviceId, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + ACtoken,
            },
          }).then((response) => {
            if (response < 400) {
              response.json().then((data) => {});
            }
          });
          await AsyncStorage.setItem(
            "VisitlyStore:orginfo",
            JSON.stringify(orgdata)
          );
          orgdata.orgProducts.products[0].entitlements.map((item) => {
            if (item.key == "CUSTOM_BG_IMG" && item.value) {
              setIsBgImg(item.value);
            } else {
            }
          });
          logger.push({
            method: "Api call successful to get org config data.",
            type: "INFO",
            error: "",
            macAddress: macAddress,
            deviceId: orgInfo.deviceId,
            siteId: orgInfo.siteId,
            orgId: orgInfo.orgId,
            orgName: orgInfo.orgName,
          });
          var currentDateTime = new Date();
          await AsyncStorage.setItem(
            "VisitlyStore:lastOrgUpdate",
            currentDateTime.toString()
          );
          setOrgInfo(orgdata);
          const orgProductLength = orgdata.orgProducts.products.length;
          if (orgProductLength == 0) {
            setIsExpired(true);
          } else {
            setIsExpired(false);
          }
          crashlytics().log("Api call successful to get org config data");
        });
      } else if (response.status === 401) {
        logger.push({
          method: "User navigate to Sign In Device Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        navigation.navigate("SigninDevice");
        crashlytics().log("Api request fail to get org config data.");
      } else if (response.status >= 400 && response.status < 500) {
        logger.push({
          method: "Api request fail to get org config data.",
          type: "ERROR",
          error: strings.org_fail,
          macAddress: macAddress,
          ApiUrl: url + "/devices/orgconfig",
          ApiMethod: "GET",
          ApiResStatus: response.status,
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        setErrModal(true);
        setErrMsg(strings.org_fail);
        setTimeout(() => {
          setErrModal(false);
        }, 5000);
        crashlytics().log("Api request fail to get org config data");
      } else {
        logger.push({
          method: "Api request fail to get org config data.",
          type: "ERROR",
          error: strings.server_issue,
          macAddress: macAddress,
          ApiUrl: url + "/devices/orgconfig",
          ApiMethod: "GET",
          ApiResStatus: response.status,
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        setErrModal(true);
        setErrMsg(strings.server_issue);
        setTimeout(() => {
          setErrModal(false);
        }, 5000);
        crashlytics().log("Api request fail to get org config data");
      }
    });
  };

  const onRefresh = async () => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "User want to refresh org config data on Home Screen",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orgInfo.deviceId,
      siteId: orgInfo.siteId,
      orgId: orgInfo.orgId,
      orgName: orgInfo.orgName,
    });
    await analytics().logEvent("org_config_data_refresh", {
      screen_name: "HomeScreen",
      api_url: `${url}/devices/orgconfig`,
    });
    crashlytics().log("Api call for get config data when user swipe down");
    setIsDotLoading(true);
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    var orgOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${ACtoken}`,
      },
    };
    fetch(url + "/devices/orgconfig", orgOptions)
      .then((response) => {
        if (response.status < 400) {
          response.json().then(async (orgdata) => {
            secondaryColor = LightenColor(orgdata?.btnColor, 55);
            setOrgInfo(orgdata);
            // language.setLanguage(orgdata.language);
            // setCurrentLanguage(orgdata.language);
            logger.push({
              method:
                "Api call successful to get config data when user swipe down",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orgInfo.deviceId,
              siteId: orgInfo.siteId,
              orgId: orgInfo.orgId,
              orgName: orgInfo.orgName,
            });
            await AsyncStorage.setItem(
              "VisitlyStore:orginfo",
              JSON.stringify(orgdata)
            );
            orgdata.orgProducts.products[0].entitlements.map((item) => {
              if (item.key == "CUSTOM_BG_IMG" && item.value) {
                setIsBgImg(item.value);
              } else {
              }
            });
            var currentDateTime = new Date();
            await AsyncStorage.setItem(
              "VisitlyStore:lastOrgUpdate",
              JSON.stringify(currentDateTime)
            );
            if (isExpired) {
              const orgProductLength = orgdata.orgProducts.products.length;
              if (orgProductLength == 0) {
                setIsDotLoading(false);
                setIsExpired(true);
              } else {
                setIsDotLoading(false);
                setIsExpired(false);
              }
            } else {
              setIsDotLoading(false);
              setIsInternet(false);
            }
            crashlytics().log(
              "Api call successful to get config data when user swipe down"
            );
          });
        }
      })
      .catch((err) => {
        logger.push({
          method:
            "Api request fail when user scroll down to refresh org config data.",
          type: "ERROR",
          error: err,
          macAddress: macAddress,
          apiUrl: url + "/devices/orgconfig",
          apiMethod: "GET",
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
      })
      .finally(() => {
        setIsDotLoading(false);
      });
  };

  const clickDelivery = async () => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "User clicked delivery button for receive package.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orgInfo.deviceId,
      siteId: orgInfo.siteId,
      orgId: orgInfo.orgId,
      orgName: orgInfo.orgName,
    });
    await analytics().logEvent("Delivery", {
      screen_name: "HomeScreen",
      api_url: `${url}/delivery`,
    });
    crashlytics().log("User clicked delivery button for receive package");
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    const currentDate = moment().utcOffset(0, true).format();
    const payload = {
      deliveryName: "Delivery",
      deliveryTime: currentDate?.replace("Z", ""),
      siteId: orgInfo.siteId,
    };
    fetch(url + "/delivery", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + ACtoken,
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      const result = response.json();
      if (response.status < 400) {
        logger.push({
          method: "Api call successful to receive delivery package.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        logger.push({
          method: "User navigate to Delivery Successful Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        navigation.navigate("Delivery", {
          strings: strings,
          orginfo: orgInfo,
        });
        crashlytics().log("Api call successful to receive delivery package");
      } else if (response.status >= 400 && response.status < 500) {
        logger.push({
          method: "Api request fail to receive delivery package.",
          type: "ERROR",
          error: err,
          macAddress: macAddress,
          postData: payload,
          apiUrl: url + "/delivery",
          apiMethod: "POST",
          apiResStatus: response.status,
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        crashlytics().log("Api request fail to receive delivery package");
      } else {
        logger.push({
          method: "Api request fail to receive delivery package.",
          type: "ERROR",
          error: err,
          macAddress: macAddress,
          postData: payload,
          apiUrl: url + "/delivery",
          apiMethod: "POST",
          apiResStatus: response.status,
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        crashlytics().log("Api request fail to receive delivery package");
      }
    });
  };

  return (
    // <UserInactivity
    //   timeForInactivity={timer}
    //   checkInterval={5000}
    //   onInactivity={() => onInactivity()}
    // >    style={isBgImg ? { flex: 1 } : { ...CommonStyle.mainScreen }}
    <View style={isBgImg ? { flex: 1 } : { ...CommonStyle.mainScreen }}>
      <ImageBackground
        source={isBgImg ? { uri: orgInfo.bgImgURI } : ""}
        resizeMode="cover"
        style={[
          styles.fixed,
          { height: orientation.height, width: orientation.width },
        ]}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            isBgImg
              ? [styles.fixed, styles.scrollview]
              : { ...CommonStyle.mainScreen }
          }
          onMomentumScrollBegin={onRefresh}
        >
          <DotActivity
            loadingColor={orgInfo.btnColor}
            isLoading={isDotloading}
          />
          <GenericErrorModal
            strings={strings}
            isVisible={isInternet}
            iconSource={
              <NoInternet
                style={{ color: orgInfo.btnColor }}
                width={RFValue(150)}
                height={RFValue(150)}
              />
            }
            onPress={() => onRefresh()}
            title={strings.no_internet}
            subText={strings.internet_subText}
            primaryColor={orgInfo.btnColor}
            secondaryColor={secondaryColor}
            isLinking={false}
          />
          <GenericErrorModal
            strings={strings}
            isVisible={isExpired}
            iconSource={
              <Billing
                style={{ color: orgInfo.btnColor }}
                width={RFValue(150)}
                height={RFValue(150)}
              />
            }
            onPress={() => onRefresh()}
            title={strings.bill_err}
            primaryColor={orgInfo.btnColor}
            secondaryColor={secondaryColor}
            isLinking={true}
          />
          <ErrorModal
            strings={strings}
            isVisible={errModal}
            onPress={() => setErrModal(false)}
            errText={errMsg}
            btnColor={orgInfo.btnColor}
          />

          <View style={isBgImg ? { flex: 1 } : { ...CommonStyle.mainScreen }}>
            <View
              style={{
                ...styles.headerContainer,
                marginTop: orientation.isPortrait ? RFValue(30) : RFValue(30),
                paddingHorizontal: RFValue(20),
              }}
            >
              <Pressable
                onPress={() => {
                  setPin("");
                  setShowPinModal(true);
                }}
                style={{
                  ...CommonStyle.btnBoxBackground,
                  ...CommonStyle.shadow,
                }}
              >
                <Ionicons
                  name="settings-sharp"
                  size={RFValue(18)}
                  color={color.silver}
                />
              </Pressable>

              {/* <Pressable
              onPress={() => setShowModal(true)}
              style={{
                ...styles.dropdown,
                ...CommonStyle.shadow,
                ...styles.headerContainer,
                justifyContent: "",
              }}
            >
              <AntDesign
                color={color.silver}
                name="earth"
                size={RFValue(16)}
                style={{ marginRight: RFValue(5) }}
              />
              <Text style={styles.text}>{value}</Text>
            </Pressable>
            <Modal
              animationType={"fade"}
              transparent={true}
              visible={showModal}
              onRequestClose={() => setShowModal(false)}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPressOut={() => setShowModal(false)}
                style={CommonStyle.modalBackground}
              >
                <View style={styles.dropdownContainer}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {languageData?.map((item, index) => (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          setCurrentLanguage(item.value);
                          onChangeLanguage(item.value);
                          setShowModal(false);
                        }}
                        style={styles.dropdownView}
                      >
                        <View style={styles.dropdownBtn}>
                          <Text
                            style={{
                              ...styles.dropdownText,
                              color:
                                selectedIndex == index
                                  ? orgInfo.btnColor
                                  : color.boulder,
                            }}
                          >
                            {item.label}
                          </Text>
                          {selectedIndex == index ? (
                            <Feather
                              name={"check"}
                              color={orgInfo.btnColor}
                              size={RFValue(12)}
                            />
                          ) : null}
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal> */}
            </View>
            <DevicePinModal
              strings={strings}
              showModal={showPinModal}
              closeModal={() => setShowPinModal(false)}
              primaryColor={orgInfo.btnColor}
              pin={pin}
              setPin={setPin}
              forgotModal={forgotPinModal}
              showForgotModal={() => setForgotPinModal(true)}
              closeforgotModal={() => setForgotPinModal(false)}
              errText={errText}
              setPinReady={setPinReady}
              setErrText={setErrText}
              handleNext={() => submitPin()}
            />

            <View
              style={{
                alignItems: "center",
                marginTop: orientation.isPortrait ? RFValue(80) : RFValue(20),
                marginBottom: orientation.isPortrait
                  ? RFValue(70)
                  : RFValue(20),
              }}
            >
              <Image
                source={{ uri: orgInfo ? orgInfo.logoURI : "" }}
                style={{ height: RFValue(100), width: RFValue(200) }}
                resizeMode={"contain"}
              />
            </View>

            <View style={{ alignItems: "center" }}>
              <Pressable
                onPress={() => {
                  if (
                    orgInfo.privacyDocTemplateId &&
                    orgInfo.privacyConsentType &&
                    orgInfo.privacyDocTemplateId != "" &&
                    orgInfo.privacyConsentType != ""
                  ) {
                    logger.push({
                      method:
                        "User navigate to Privacy Policy Document Screen.",
                      type: "INFO",
                      error: "",
                      macAddress: macAddress,
                      deviceId: orgInfo.deviceId,
                      siteId: orgInfo.siteId,
                      orgId: orgInfo.orgId,
                      orgName: orgInfo.orgName,
                    });
                    navigation.navigate("PrivacyDocument", {
                      orginfo: orgInfo,
                      strings: strings,
                    });
                  } else if (orgInfo.faceRecogFlag == true) {
                    logger.push({
                      method:
                        "User navigate to Sign In Facial Recognition Screen.",
                      type: "INFO",
                      error: "",
                      macAddress: macAddress,
                      deviceId: orgInfo.deviceId,
                      siteId: orgInfo.siteId,
                      orgId: orgInfo.orgId,
                      orgName: orgInfo.orgName,
                    });
                    navigation.navigate("FaceRecognition", {
                      orginfo: orgInfo,
                      strings: strings,
                    });
                  } else {
                    logger.push({
                      method: "User navigate to Enter Full Name Screen.",
                      type: "INFO",
                      error: "",
                      macAddress: macAddress,
                      deviceId: orgInfo.deviceId,
                      siteId: orgInfo.siteId,
                      orgId: orgInfo.orgId,
                      orgName: orgInfo.orgName,
                    });
                    navigation.navigate("FullName", {
                      orginfo: orgInfo,
                      strings: strings,
                    });
                  }
                }}
                style={{
                  ...styles.button,
                  ...CommonStyle.shadow,
                  width: orientation.isPortrait
                    ? orientation.height * 0.54
                    : orientation.width * 0.56,
                  backgroundColor: orgInfo.btnColor,
                  height: orientation.isPortrait ? RFValue(90) : RFValue(70),
                  borderRadius: RFValue(10),
                }}
              >
                <Text
                  style={{
                    ...CommonStyle.text1,
                    color: color.white,
                  }}
                >
                  {strings.tap_signin}
                </Text>
                <Feather
                  name="log-in"
                  size={RFValue(14)}
                  color={color.white}
                  style={{ marginLeft: RFValue(5) }}
                />
              </Pressable>

              {orgInfo.allowSignInOnPersonalDevice ? (
                <View
                  style={{
                    ...styles.button,
                    ...styles.qrContainer,
                    width: orientation.isPortrait
                      ? orientation.height * 0.46
                      : orientation.width * 0.46,
                    height: orientation.isPortrait ? RFValue(90) : RFValue(70),
                  }}
                >
                  <View style={styles.qrView}>{qrImageContent()}</View>
                  <Text
                    style={{
                      ...CommonStyle.btnText2,
                      color: color.tundora,
                      fontWeight: "400",
                    }}
                  >
                    <Text
                      style={{ ...CommonStyle.btnText2, color: color.tundora }}
                    >
                      {strings.scan_QRCode}
                    </Text>
                    &nbsp;
                    {strings.contactless_signin}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View
            style={isBgImg ? styles.footerContainerImg : styles.footerContainer}
          >
            <View style={{ width: orientation.isPortrait ? "90%" : "80%" }}>
              <View style={styles.headerContainer}>
                {Employess()}
                {Signout()}
                {Delivery()}
              </View>
            </View>
          </View>

          <View
            style={
              isBgImg
                ? {
                    paddingBottom: orientation.isPortrait
                      ? RFValue(16)
                      : RFValue(14),
                    paddingTop: orientation.isPortrait
                      ? RFValue(16)
                      : RFValue(14),
                    width: "100%",
                  }
                : {
                    paddingBottom: orientation.isPortrait
                      ? RFValue(16)
                      : RFValue(14),
                    paddingTop: orientation.isPortrait
                      ? RFValue(16)
                      : RFValue(14),
                    width: "100%",
                    backgroundColor: color.concrete,
                  }
            }
          >
            <Footer />
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
    // </UserInactivity>
  );
};

export default HomeScreen;
