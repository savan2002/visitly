import {
  Image,
  Text,
  View,
  Pressable,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { RFValue } from "react-native-responsive-fontsize";
import { color } from "../../theme/colors";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import CommonStyle from "../../theme/CommonStyle";
import strings from "../../resources/localization";
import properties from "../../resources/properties.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNPrint from "react-native-print";
import WebView from "react-native-webview";
import styles from "./styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import RNButton from "react-native-button-sample";
import Entypo from "react-native-vector-icons/Entypo";
import DotActivity from "../../components/DotActivity";
import { LightenColor } from "../../resources/LightenColor";
import SignOutDevice from "../../assets/svg/signOutDevice.svg";
import WarningIcon from "../../assets/svg/warning.svg";
import PrinterSuccessModal from "../../components/PrinterSuccessModal";
import crashlytics from "@react-native-firebase/crashlytics";
import VersionInfo from "react-native-version-info";
import analytics from "@react-native-firebase/analytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
const AdminInfoScreen = () => {
  const navigation = useNavigation();
  const orientation = UseOrientation();
  const route = useRoute();
  const [orginfo, setOrgInfo] = useState(
    route?.params?.orginfo ? route?.params?.orginfo : ""
  );
  const strings = route?.params?.strings;
  const adminPin = route?.params?.adminPin;
  const [loading, setLoading] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [index, setIndex] = useState(0);
  const [cancleModal, setCancleModal] = useState(false);
  const [showPrinterMsg, setShowPrinterMsg] = useState(false);
  const logger = new LogglyTracker();
  const macAddress = DeviceInfo.getUniqueIdSync();
  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
    fetchData();
  }, []);

  var mainColor = orginfo ? orginfo.btnColor : "";
  var secondaryColor, thirdColor;
  secondaryColor = LightenColor(mainColor, 55);
  thirdColor = LightenColor(mainColor, 75);

  // config api
  const fetchData = async () => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "Api call to refresh org config data on admin setting screen.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    await analytics().logEvent("reload_configuration", {
      screen_name: "AdminInfo",
      api_url: `${url}/devices/orgconfig`,
    });
    setLoading(true);
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    var orgOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${ACtoken}`,
      },
    };
    fetch(url + "/devices/orgconfig", orgOptions).then(
      (response) => {
        if (response.status < 400) {
          response.json().then(async (orgdata) => {
            setOrgInfo(orgdata);
            logger.push({
              method:
                "Api call successful to refresh org config data on admin setting screen.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            await AsyncStorage.setItem(
              "VisitlyStore:orginfo",
              JSON.stringify(orgdata)
            );
            var currentDateTime = new Date();
            await AsyncStorage.setItem(
              "VisitlyStore:lastOrgUpdate",
              JSON.stringify(currentDateTime)
            );
            crashlytics().log(
              "Api call successful to refresh org config data on admin setting screen."
            );
            setLoading(false);
          });
        } else if (response.status >= 400 && response.status < 500) {
          logger.push({
            method:
              "Api request fail to refresh org config data on admin setting screen.",
            type: "ERROR",
            error: strings.org_fail,
            macAddress: macAddress,
            apiUrl: url+ "/devices/orgconfig",
            apiMethod: "POST",
            apiResStatus: response.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          setLoading(false);
          crashlytics().log(
            "Api request fail to refresh org config data on admin setting screen."
          );
        } else {
          logger.push({
            method:
              "Api request fail to refresh org config data on admin setting screen.",
            type: "ERROR",
            error: strings.OrgSetup_bitoftime,
            macAddress: macAddress,
            apiUrl:url + "/devices/orgconfig",
            apiMethod: "POST",
            apiResStatus: response.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          setLoading(false);
          crashlytics().log(
            "Api request fail to refresh org config data on admin setting screen."
          );
        }
      }
    );
  };

  //for logout
  const handleLogOut = async () => {
    setLoading(true);
    logger.push({
      method: "Api call to device logout on this location.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    await analytics().logEvent("logout_device", {
      screen_name: "AdminInfo",
      api_url: `${url}/devices/logout`,
    });
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    crashlytics().log("Api call to device logout on this location.");
    const logoutOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + ACtoken,
      },
      body: JSON.stringify({
        deviceKey: adminPin,
      }),
    };
    fetch(url+ "/devices/logout", logoutOptions)
      .then(async (response) => {
        if (response.status < 400) {
          response.json().then(async (data) => {
            setLoading(false);
            setCancleModal(false);
            logger.push({
              method: "Api call successful to Device logout for this location.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              apiUrl: url + "/devices/logout",
              apiMethod: "POST",
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            await AsyncStorage.setItem("VisitlyStore:refreshToken", "").then(
              await AsyncStorage.setItem("VisitlyStore:apiUrl", "").then(
                await AsyncStorage.setItem("VisitlyStore:orginfo", "").then(
              () => {
                crashlytics().log(
                  "Api call successful to Device logout for this location."
                );
                navigation.navigate("SigninDevice");
              }
            )));
          });
        } else {
          logger.push({
            method: "Api request failed to device logout for this location.",
            type: "ERROR",
            error: response,
            macAddress: macAddress,
            apiUrl: url + "/devices/logout",
            apiMethod: "POST",
            apiResStatus: response.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api request failed to device logout for this location."
          );
        }
      })
      .catch((err) => {
        logger.push({
          method: "Api request failed to device logout for this location.",
          type: "ERROR",
          error: err,
          macAddress: macAddress,
          apiUrl: url + "/devices/logout",
          apiMethod: "POST",
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log(
          "Api request failed to device logout for this location."
        );
        setLoading(false);
      });
  };

  // setup printer
  const selectPrinter = async (evt) => {
    logger.push({
      method:
        "User clicked select printer button for device link with printer.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    await analytics().logEvent("printer_setup", {
      screen_name: "AdminInfo",
      api_url: `${url}/devices/$DEVICEID`,
    });
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    crashlytics().log(
      "User clicked select printer button for device link with printer."
    );
    const selectedPrinter = await RNPrint.selectPrinter({
      x: evt.pageX,
      y: evt.pageY,
    });
    setSelectedPrinter(selectedPrinter);
    await AsyncStorage.setItem("VisitlyStore:printerUrl", selectedPrinter.url);
    await AsyncStorage.setItem(
      "VisitlyStore:printername",
      selectedPrinter.name
    );
    const accessToken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    setLoading(true);
    var printOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        printerModel: `${selectedPrinter.name}`,
        printerURL: `${selectedPrinter.url}`,
      }),
      redirect: "follow",
    };
    fetch(url + "/devices/" + orginfo.deviceId, printOptions)
      .then((response) => response.json())
      .then((result) => {
        var orgOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          redirect: "follow",
        };
        fetch(`${url}/devices/${orginfo.deviceId}`, orgOptions)
          .then((response) => response.json())
          .then(async (orgdata) => {
            await AsyncStorage.setItem(
              "VisitlyStore:deviceorginfo",
              JSON.stringify(orgdata)
            );
            logger.push({
              method: "Api call successful to printer linked with device.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            setLoading(false);
            setShowPrinterMsg(true);
            crashlytics().log(
              "Api call successful to printer linked with device."
            );
            setTimeout(() => {
              setShowPrinterMsg(false);
            }, 3000);
          })
          .catch((error) => {
            logger.push({
              method: "Api request fail to get device org config data.",
              type: "ERROR",
              error: error.message,
              macAddress: macAddress,
              apiUrl: url + "/devices/" + orginfo.deviceId,
              apiMethod: "GET",
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            crashlytics().log("Api request fail to get device org config data");
          });
      })
      .catch((err) => {
        logger.push({
          method: "Device fail to link with printer.",
          type: "ERROR",
          error: err.message,
          macAddress: macAddress,
          apiUrl: url + "/devices/" + orginfo.deviceId,
          apiMethod: "PUT",
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        setLoading(false);
      });
  };

  // general information about device and config
  const General = () => {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView>
          <View
            style={{
              height: orientation.isPortrait ? "90%" : "88%",
              width: orientation.isPortrait ? "88%" : "92%",
            }}
          >
            <View
              style={{
                paddingHorizontal: RFValue(30),
                marginTop: RFValue(10),
              }}
            >
              <View
                style={{
                  marginTop: orientation.isPortrait ? 20 : 30,
                  width: orientation.isPortrait ? "100%" : "70%",
                }}
              >
                <Text style={CommonStyle.subTitle}>{strings.device_id}</Text>
                <Text
                  style={{
                    ...CommonStyle.text3,
                    color: color.spanishGray,
                    marginTop: orientation.isPortrait
                      ? RFValue(8)
                      : RFValue(10),
                  }}
                >
                  {orginfo.deviceId}
                </Text>
              </View>
              <View
                style={{
                  marginTop: orientation.isPortrait ? 20 : 30,
                  width: orientation.isPortrait ? "80%" : "70%",
                }}
              >
                <Text style={CommonStyle.subTitle}>{strings.org_name}</Text>
                <Text
                  style={{
                    ...CommonStyle.text3,
                    color: color.spanishGray,
                    marginTop: orientation.isPortrait
                      ? RFValue(8)
                      : RFValue(10),
                  }}
                >
                  {orginfo.orgName}
                </Text>
              </View>

              <View
                style={{
                  marginTop: orientation.isPortrait ? 20 : 30,
                  width: orientation.isPortrait ? "80%" : "70%",
                }}
              >
                <Text style={CommonStyle.subTitle}>
                  {strings.location_admin}
                </Text>
                <Text
                  style={{
                    ...CommonStyle.text3,
                    color: color.spanishGray,
                    marginTop: orientation.isPortrait
                      ? RFValue(8)
                      : RFValue(10),
                  }}
                >
                  {orginfo.siteName}
                </Text>
              </View>
            </View>
            <View
              style={{
                marginTop: orientation.isPortrait ? RFValue(20) : RFValue(14),
                marginLeft: RFValue(30),
              }}
            >
              <Pressable
                onPress={fetchData}
                style={{
                  ...styles.btnReload,
                  backgroundColor: secondaryColor,
                  width: orientation.isPortrait ? "45%" : "30%",
                }}
              >
                <Ionicons
                  name="ios-reload"
                  color={orginfo.btnColor}
                  size={RFValue(10)}
                />
                <Text
                  style={{ ...styles.btnReloadText, color: orginfo.btnColor }}
                >
                  {strings.reload}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  // printer modal design
  const Printer = () => {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          marginTop: orientation.isPortrait ? 30 : 20,
        }}
      >
        <Text style={styles.printerTitle}>{strings.select_wireless}</Text>
        <RNButton
          buttonStyle={{
            ...styles.printerBtn,
            backgroundColor: orginfo.btnColor,
            width: orientation.isPortrait ? "35%" : "25%",
            marginTop: orientation.isPortrait ? 30 : 20,
          }}
          buttonTitle={strings.select_printer}
          btnTextStyle={styles.printerText}
          onPress={(e) => selectPrinter(e.nativeEvent)}
        />
        <PrinterSuccessModal
          strings={strings}
          isVisible={showPrinterMsg}
          primaryColor={orginfo.btnColor}
          onPress={() => setShowPrinterMsg(false)}
        />
      </View>
    );
  };

  // privacy web-page
  const Privacy = () => {
    return (
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            height: orientation.isPortrait ? "90%" : "88%",
            width: orientation.isPortrait ? "88%" : "94%",
          }}
        >
          <WebView
            source={{ uri: "https://www.visitly.io/privacy/" }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            showsVerticalScrollIndicator={true}
          />
        </View>
      </View>
    );
  };

  // terms web-page
  const Terms = () => {
    return (
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            height: orientation.isPortrait ? "90%" : "88%",
            width: orientation.isPortrait ? "88%" : "94%",
          }}
        >
          <WebView
            source={{ uri: "https://www.visitly.io/security/tos/" }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            showsVerticalScrollIndicator={true}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={CommonStyle.mainScreen}>
      <DotActivity loadingColor={orginfo.btnColor} isLoading={loading} />
      <View style={{ marginTop: RFValue(30), paddingHorizontal: RFValue(30) }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            ...CommonStyle.bottomShadow,
            ...styles.backBtn,
          }}
        >
          <Entypo
            name="chevron-left"
            size={RFValue(18)}
            color={orginfo ? orginfo.btnColor : ""}
          />
          <Text
            style={{
              ...CommonStyle.text3,
              marginLeft: RFValue(5),
              color: orginfo ? orginfo.btnColor : "",
            }}
          >
            {strings.home}
          </Text>
        </Pressable>
      </View>

      <View style={styles.mainLeftContainer}>
        <View
          style={{
            ...styles.leftContainer,
            width: orientation.isPortrait ? "25%" : "18%",

            marginRight: orientation.isPortrait ? RFValue(8) : RFValue(30),
          }}
        >
          <View style={{ flex: 1 }}>
            <RNButton
              buttonStyle={{
                ...styles.topBtnStyle,
                height: orientation.isPortrait ? 60 : 50,
                width: index == 0 ? "110%" : "100%",
                backgroundColor: index == 0 ? orginfo.btnColor : color.white,
                borderTopRightRadius: RFValue(5),
                borderBottomRightRadius: index == 0 ? RFValue(5) : RFValue(0),
              }}
              buttonTitle={strings.general}
              btnTextStyle={{
                ...CommonStyle.text3,
                fontSize: RFValue(10),
                color: index == 0 ? color.white : color.cod_gray,
              }}
              onPress={() => setIndex(0)}
            />
            <RNButton
              buttonStyle={{
                ...styles.topBtnStyle,
                height: orientation.isPortrait ? 60 : 50,
                backgroundColor: index == 1 ? orginfo.btnColor : color.white,
                width: index == 1 ? "110%" : "100%",
                borderTopRightRadius: index == 1 ? RFValue(5) : RFValue(0),
                borderBottomRightRadius: index == 1 ? RFValue(5) : RFValue(0),
              }}
              buttonTitle={strings.printer_setup}
              btnTextStyle={{
                ...CommonStyle.text3,
                fontSize: RFValue(10),
                color: index == 1 ? color.white : color.cod_gray,
              }}
              onPress={() => setIndex(1)}
            />
            <RNButton
              buttonStyle={{
                ...styles.topBtnStyle,
                height: orientation.isPortrait ? 60 : 50,
                width: index == 2 ? "110%" : "100%",
                borderTopRightRadius: index == 2 ? RFValue(5) : RFValue(0),
                borderBottomRightRadius: index == 2 ? RFValue(5) : RFValue(0),
                backgroundColor: index == 2 ? orginfo.btnColor : color.white,
              }}
              buttonTitle={strings.privacy}
              btnTextStyle={{
                ...CommonStyle.text3,
                fontSize: RFValue(10),
                color: index == 2 ? color.white : color.cod_gray,
              }}
              onPress={() => setIndex(2)}
            />
            <RNButton
              buttonStyle={{
                ...styles.topBtnStyle,
                height: orientation.isPortrait ? 60 : 50,
                width: index == 3 ? "110%" : "100%",
                borderTopRightRadius: index == 3 ? RFValue(5) : RFValue(0),
                borderBottomRightRadius: index == 3 ? RFValue(5) : RFValue(0),
                backgroundColor: index == 3 ? orginfo.btnColor : color.white,
              }}
              buttonTitle={strings.temrs}
              btnTextStyle={{
                ...CommonStyle.text3,
                fontSize: RFValue(10),
                color: index == 3 ? color.white : color.cod_gray,
              }}
              onPress={() => setIndex(3)}
            />
          </View>

          <View style={{ flex: 0.4 }}>
            <Pressable
              onPress={() => setCancleModal(true)}
              style={{
                ...styles.footerBtnView,
                height: orientation.isPortrait ? 60 : 50,
              }}
            >
              <SignOutDevice height={RFValue(18)} width={RFValue(18)} />
              <Text
                style={{
                  ...CommonStyle.btnText2,
                  color: color.red,
                  marginLeft: RFValue(5),
                }}
              >
                {strings.logout}
              </Text>
            </Pressable>
            <Text
              style={{
                textAlign: "center",
                ...CommonStyle.text3,
                fontSize: RFValue(8),
                marginTop: RFValue(5),
              }}
            >
              Version&nbsp;{VersionInfo.appVersion}
            </Text>
          </View>
        </View>

        <Modal
          animationType={"fade"}
          transparent={true}
          visible={cancleModal}
          onRequestClose={() => setCancleModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPressOut={() => setCancleModal(false)}
            style={CommonStyle.modalBackground}
          >
            <View
              style={{
                width: orientation.isPortrait
                  ? orientation.height / 3
                  : orientation.height / 2.2,
                height: orientation.isPortrait
                  ? orientation.height / 3
                  : orientation.height / 2.2,
                justifyContent: "space-evenly",
                alignItems: "center",
                marginTop: orientation.isPortrait ? RFValue(60) : 20,
                borderRadius: RFValue(5),
                ...CommonStyle.shadow,
                backgroundColor: color.white,
              }}
            >
              <WarningIcon
                height={RFValue(18)}
                width={RFValue(18)}
                style={{ color: color.darkRed }}
              />
              <Text
                style={{
                  ...CommonStyle.text3,
                  fontSize: RFValue(13),
                  textAlign: "center",
                  color: color.bright_gray,
                }}
              >
                {strings.logout_title}
              </Text>
              <RNButton
                buttonTitle={strings.no_cancel}
                buttonStyle={{
                  ...CommonStyle.button,
                  backgroundColor: secondaryColor,
                  width: orientation.isPortrait
                    ? orientation.width / 4
                    : orientation.height / 5,
                  height: orientation.isPortrait
                    ? orientation.width / 14
                    : orientation.height / 14,
                }}
                btnTextStyle={{
                  ...CommonStyle.btnText2,
                  color: orginfo.btnColor,
                }}
                onPress={() => setCancleModal(false)}
              />
              <RNButton
                buttonTitle={strings.yes_logout}
                buttonStyle={{
                  ...CommonStyle.button,
                  backgroundColor: "",
                  borderColor: secondaryColor,
                  borderWidth: 1,
                  width: orientation.isPortrait
                    ? orientation.width / 4
                    : orientation.height / 5,
                  height: orientation.isPortrait
                    ? orientation.width / 14
                    : orientation.height / 14,
                }}
                btnTextStyle={{
                  ...CommonStyle.btnText2,
                  color: orginfo.btnColor,
                }}
                onPress={() => handleLogOut()}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <View
          style={{
            height: orientation.height,
            width: "75%",
            marginTop: orientation.isPortrait ? RFValue(30) : RFValue(20),
          }}
        >
          {index == 0 ? <General /> : null}
          {index == 1 ? <Printer /> : null}
          {index == 2 ? <Privacy /> : null}
          {index == 3 ? <Terms /> : null}
        </View>
      </View>
    </View>
  );
};

export default AdminInfoScreen;
