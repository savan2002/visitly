import { SafeAreaView, Text, View, Pressable, LogBox } from "react-native";
import React, { useEffect, useState } from "react";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import Entypo from "react-native-vector-icons/Entypo";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import QRCodeScanner from "react-native-qrcode-scanner";
import RNButton from "react-native-button-sample";
import DeviceInfo from "react-native-device-info";
import properties from "../../resources/properties.json";
import DotActivity from "../../components/DotActivity";
import LocationIntroModal from "../../components/LocationIntroModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ErrorModal from "../../components/ErrorModal";
import CommonStyle from "../../theme/CommonStyle";
import styles from "./styles";
import { useDispatch, useSelector } from "react-redux";
import { setupDevice } from "../../services/features/setupDeviceSlice";
import { orginfo } from "../../services/features/orgInfoSlice";
import ScannerFrame from "../../assets/svg/scan.svg";
import crashlytics from "@react-native-firebase/crashlytics";
import analytics from "@react-native-firebase/analytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
LogBox.ignoreAllLogs();
const ScanLocationQRScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const strings = route?.params?.strings;
  const [deviceName, setDeviceName] = useState(DeviceInfo.getDeviceNameSync());
  const [deviceId, setDeviceId] = useState(DeviceInfo.getDeviceId());
  const [ipAddress, setIpAddress] = useState(DeviceInfo.getIpAddressSync());
  const [macAddress, setMacAddress] = useState(DeviceInfo.getUniqueIdSync());
  const [osversion, setOsVersion] = useState(
    DeviceInfo.getSystemName() + " " + DeviceInfo.getSystemVersion()
  );
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errModal, setErrModal] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [isactive, setIsactive] = useState(false);
  const dispatch = useDispatch();
  const { results } = useSelector((state) => state.setupNewDevice);
  const { orgInforesults } = useSelector((state) => state.orgInfo);
  const logger = new LogglyTracker();
  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
  }, []);

  const onSuccess = async (e) => {
    if (e.data) {
      logger.push({
        method: "Scanned location qr code successful.",
        type: "INFO",
        error: "",
        locationKey: e.data,
        macAddress: macAddress,
      });
      const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
      await analytics().logEvent("device_setup_by_qrcode", {
        screen_name: "Scan Location QR Screen",
        api_url: `${url}/devices/setup`,
      });
      setIsactive(true);
      // dispatch(setupDevice(e.data));
      setLoading(true);
      var raw = JSON.stringify({
        deviceName: deviceName,
        deviceType: deviceId,
        ipAddress: ipAddress,
        macAddress: macAddress,
        osversion: osversion,
        siteKey: `${e.data}`,
      });
      crashlytics().log("Api call to setup new device using location QR code");
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      fetch(`${url}/devices/setup`, requestOptions).then(
        async (response) => {
          if (response.status < 400) {
            response.json().then(async (result) => {
              await AsyncStorage.setItem(
                "VisitlyStore:accessToken",
                result.accessToken
              );
              await AsyncStorage.setItem(
                "VisitlyStore:refreshToken",
                result.refreshToken
              );
              crashlytics().log("Api call successful to setup new device.");
              var orgOptions = {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${result.accessToken}`,
                },
              };
              fetch(`${url}/devices/orgconfig`, orgOptions).then(
                async (response) => {
                  if (response.status < 400) {
                    setIsactive(false);
                    response.json().then(async (orgdata) => {
                      logger.push({
                        method: "Api call successful to get org config data.",
                        type: "INFO",
                        error: "",
                        macAddress: macAddress,
                        deviceId: orgdata.deviceId,
                        siteId: orgdata.siteId,
                        orgId: orgdata.orgId,
                        orgName: orgdata.orgName,
                      });
                      await AsyncStorage.setItem(
                        "VisitlyStore:orginfo",
                        JSON.stringify(orgdata)
                      );
                      var currentDateTime = new Date();
                      await AsyncStorage.setItem(
                        "VisitlyStore:lastOrgUpdate",
                        currentDateTime.toString()
                      );
                      logger.push({
                        method: "User navigate to Set Device Pin Screen.",
                        type: "INFO",
                        error: "",
                        macAddress: macAddress,
                        deviceId: orgdata.deviceId,
                        siteId: orgdata.siteId,
                        orgId: orgdata.orgId,
                        orgName: orgdata.orgName,
                      });
                      setLoading(false);
                      crashlytics().log(
                        "Api call successful to get org config data"
                      );
                      navigation.navigate("SetPin", { strings: strings });
                    });
                  } else if (response.status >= 400 && response.status < 500) {
                    logger.push({
                      method: "Api request fail to get org config data.",
                      type: "ERROR",
                      error: strings.org_fail,
                      macAddress: macAddress,
                      apiUrl: url + "/devices/orgconfig",
                      apiMethod: "GET",
                      apiResStatus: response.status,
                    });
                    setLoading(false);
                    setErrModal(true);
                    setErrMsg(strings.org_fail);
                    setTimeout(() => {
                      setErrModal(false);
                    }, 5000);
                    crashlytics().log("Api request fail to get org config data.");
                  } else {
                    logger.push({
                      method: "Api request fail to get org config data.",
                      type: "ERROR",
                      error: strings.OrgSetup_bitoftime,
                      macAddress: macAddress,
                      apiUrl: url + "/devices/orgconfig",
                      apiMethod: "GET",
                      apiResStatus: response.status,
                    });
                    setLoading(false);
                    setErrModal(true);
                    setErrMsg(strings.OrgSetup_bitoftime);
                    setTimeout(() => {
                      setErrModal(false);
                    }, 5000);
                    crashlytics().log("Api request fail to get org config data.");
                  }
                }
              );
            });
          } else if (response.status >= 400 && response.status < 500) {
            if (response.status == 409) {
              logger.push({
                method:
                  "Api request fail to device setup for get accessToken & refreshToken.",
                type: "ERROR",
                error: strings.setup_alert,
                locationKey: e.data,
                postData: raw,
                macAddress: macAddress,
                apiUrl: url + "/devices/setup",
                apiMethod: "POST",
                apiResStatus: response.status,
              });
              setLoading(false);
              setErrModal(true);
              setErrMsg(strings.setup_alert);
              setTimeout(() => {
                setErrModal(false);
              }, 5000);
              crashlytics().log("Api request fail to device setup for get accessToken & refreshToken");
            } else {
              logger.push({
                method:
                  "Api request fail to device setup for get accessToken & refreshToken.",
                type: "ERROR",
                error: strings.setup_invalid,
                locationKey: e.data,
                postData: raw,
                macAddress: macAddress,
                apiUrl: url + "/devices/setup",
                apiMethod: "POST",
                apiResStatus: response.status,
              });
              setLoading(false);
              setErrModal(true);
              setErrMsg(strings.setup_invalid);
              setTimeout(() => {
                setErrModal(false);
              }, 5000);
              crashlytics().log("Api request fail to device setup for get accessToken & refreshToken");
            }
          } else {
            logger.push({
              method:
                "Api request fail to device setup for get accessToken & refreshToken.",
              type: "ERROR",
              error: strings.OrgSetup_bitoftime,
              locationKey: e.data,
              postData: raw,
              macAddress: macAddress,
              apiUrl: url + "/devices/setup",
              apiMethod: "POST",
              apiResStatus: response.status,
            });
            setLoading(false);
            setErrModal(true);
            setErrMsg(strings.OrgSetup_bitoftime);
            setTimeout(() => {
              setErrModal(false);
            }, 5000);
            crashlytics().log("Api request fail to device setup for get accessToken & refreshToken");
          }
        }
      );
    }
  };

  // For redux testing mode on
  // useEffect(() => {
  //   if (isactive) {
  //     setIsactive(false);
  //     console.log("set false------------");
  //     if (results.accessToken) {
  //       setLocalACtoken();
  //     }
  //     if (results.status) {
  //       if (results.status == 409) {
  //         setErrModal(true);
  //         setErrMsg(strings.setup_alert);
  //         setTimeout(() => {
  //           setErrModal(false);
  //         }, 5000);
  //       } else {
  //         setErrModal(true);
  //         setErrMsg(strings.setup_invalid);
  //         setTimeout(() => {
  //           setErrModal(false);
  //         }, 5000);
  //       }
  //     } else {
  //       dispatch(orginfo());
  //     }
  //   }
  // }, [results]);

  // const setLocalACtoken = async () => {
  //   await AsyncStorage.setItem("VisitlyStore:accessToken", results.accessToken);
  //   await AsyncStorage.setItem(
  //     "VisitlyStore:refreshToken",
  //     results.refreshToken
  //   );
  // };

  return (
    <SafeAreaView style={CommonStyle.mainScreen}>
      <DotActivity loadingColor={color.royal_blue} isLoading={loading} />
      <ErrorModal
        strings={strings}
        isVisible={errModal}
        onPress={() => setErrModal(false)}
        errText={errMsg}
      />
      <View style={{ flex: 1 }}>
        <View
          elevation={5}
          style={{
            ...CommonStyle.bottomShadow,
            ...styles.container,
          }}
        >
          <View
            style={{
              marginTop: orientation.isPortrait ? RFValue(20) : RFValue(20),
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
                color={color.royal_blue}
              />
            </Pressable>
          </View>
          <Text
            style={{
              ...CommonStyle.text2,
              textAlign: "center",
              marginTop: orientation.isPortrait ? RFValue(40) : RFValue(16),
            }}
          >
            {strings.scan_location_qr}
          </Text>

          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: orientation.isPortrait
                  ? orientation.height / 2
                  : orientation.height / 1.8,
                height: orientation.isPortrait
                  ? orientation.height / 2.2
                  : orientation.height / 2.2,
                marginTop: orientation.isPortrait ? RFValue(30) : RFValue(16),
              }}
            >
              <QRCodeScanner
                onRead={onSuccess}
                fadeIn={false}
                showMarker={true}
                reactivate={false}
                markerStyle={{
                  width: orientation.isPortrait
                    ? orientation.width / 2.6
                    : orientation.height / 2.8,
                  height: orientation.isPortrait
                    ? orientation.width / 2.6
                    : orientation.height / 2.8,
                }}
                ref={(node) => {
                  scanner = node;
                }}
                customMarker={
                  <ScannerFrame
                    width={
                      orientation.isPortrait
                        ? orientation.width / 2.6
                        : orientation.height / 2.8
                    }
                    height={
                      orientation.isPortrait
                        ? orientation.width / 2.6
                        : orientation.height / 2.8
                    }
                  />
                }
                cameraStyle={{
                  width: orientation.isPortrait
                    ? orientation.height / 2.05
                    : orientation.height / 1.85,
                  height: orientation.isPortrait
                    ? orientation.height / 2.25
                    : orientation.height / 2.25,
                  borderRadius: orientation.isPortrait
                    ? RFValue(30)
                    : RFValue(20),
                  overflow: "hidden",
                }}
                containerStyle={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: orientation.isPortrait
                    ? orientation.height / 2
                    : orientation.height / 1.8,
                  height: orientation.isPortrait
                    ? orientation.height / 2.2
                    : orientation.height / 2.2,
                  borderRadius: orientation.isPortrait
                    ? RFValue(30)
                    : RFValue(20),
                  borderStyle: "dashed",
                  borderWidth: 2,
                  borderColor: color.royal_blue,
                }}
              />
            </View>

            <RNButton
              buttonTitle={strings.setup_text}
              btnTextStyle={{ ...CommonStyle.text3, color: color.royal_blue }}
              buttonStyle={{
                marginTop: orientation.isPortrait ? RFValue(30) : RFValue(12),
                marginBottom: orientation.isPortrait
                  ? RFValue(30)
                  : RFValue(10),
              }}
              onPress={() => setShowModal(true)}
            />

            <LocationIntroModal
              strings={strings}
              isVisible={showModal}
              onPress={() => setShowModal(false)}
            />
          </View>
        </View>
      </View>
      <View
        style={{
          alignItems: "center",
          marginTop: orientation.isPortrait ? RFValue(8) : RFValue(5),
        }}
      >
        <Text
          style={{
            ...CommonStyle.text3,
            color: color.boulder,
            marginBottom: orientation.isPortrait ? RFValue(14) : RFValue(10),
          }}
        >
          {strings.locationkey_manually}
        </Text>
        <RNButton
          buttonTitle={strings.setup_key}
          buttonStyle={{
            ...CommonStyle.button,
            backgroundColor: color.concrete,
            width: orientation.isPortrait
              ? orientation.width / 3
              : orientation.height / 3,
            height: orientation.isPortrait
              ? orientation.width * 0.1
              : orientation.height * 0.08,
            marginBottom: orientation.isPortrait ? RFValue(20) : RFValue(16),
          }}
          btnTextStyle={{ ...CommonStyle.btnText2, color: color.royal_blue }}
          onPress={() => {
            logger.push({
              method: "User navigate to Enter Lcoation Key Manually Screen.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
            });
            navigation.navigate("LocationKey", { strings: strings });
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default ScanLocationQRScreen;
