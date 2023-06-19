import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  LogBox,
} from "react-native";
import React, { useState, useEffect } from "react";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import Entypo from "react-native-vector-icons/Entypo";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import RNButton from "react-native-button-sample";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";
import properties from "../../resources/properties.json";
import DotActivity from "../../components/DotActivity";
import LocationIntroModal from "../../components/LocationIntroModal";
import ErrorModal from "../../components/ErrorModal";
import CommonStyle from "../../theme/CommonStyle";
import WarningIcon from "../../assets/svg/warning.svg";
import crashlytics from "@react-native-firebase/crashlytics";
import analytics from "@react-native-firebase/analytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
LogBox.ignoreAllLogs();
const LocationKeyScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const strings = route?.params?.strings;
  const [locationKey, setLocationKey] = useState("");
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
  const [errlocation, setErrLocation] = useState(null);
  const [errFlag, setErrFlag] = useState(false);
  const logger = new LogglyTracker();
  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
  }, []);
  
  useEffect(() => {
    setErrLocation(
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
          &nbsp;{strings.location_empty}
        </Text>
      </View>
    );
  }, []);

  useEffect(() => {
    if (locationKey.length != 0) {
      setErrFlag(false);
    }
  }, [locationKey.length]);

  const authenticateWithSiteKey = async () => {
    if (!locationKey) {
      setErrFlag(true);
    } else {
      setLoading(true);
      logger.push({
        method: "Api call to setup new device using enter location key manually",
        type: "INFO",
        error: "",
        locationKey: locationKey,
        macAddress: macAddress,
      });
      const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
      crashlytics().log(
        "Api call to setup new device using enter location key manually."
      );
      var raw = JSON.stringify({
        deviceName: deviceName,
        deviceType: deviceId,
        ipAddress: ipAddress,
        macAddress: macAddress,
        osversion: osversion,
        siteKey: locationKey,
      });
      await analytics().logEvent("Device__setup_by_locationKey", {
        screen_name: "Location Key Screen",
        api_url: `${url}/devices/setup`,
      });
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
                      navigation.navigate("SetPin", { strings: strings });
                      crashlytics().log(
                        "Api call successful to get org config data"
                      );
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
                    crashlytics().log("Api request fail to get org config data");
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
                    crashlytics().log("Api request fail to get org config data");
                  }
                }
              );
            });
          } else if (response.status >= 400 && response.status < 500) {
            if (response.status == 409) {
              logger.push({
                method:
                  "Api request fail to device setup to get accessToken & refreshToken.",
                type: "ERROR",
                error: strings.setup_alert,
                locationKey: locationKey,
                postData: raw,
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
              crashlytics().log(
                "Api request fail to device setup to get accessToken & refreshToken"
              );
            } else {
              logger.push({
                method:
                  "Api request fail to device setup to get accessToken & refreshToken.",
                type: "ERROR",
                error: strings.setup_invalid,
                locationKey: locationKey,
                postData: raw,
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
              crashlytics().log(
                "Api request fail to device setup to get accessToken & refreshToken"
              );
            }
          } else {
            logger.push({
              method:
                "Api request fail to device setup to get accessToken & refreshToken.",
              type: "ERROR",
              error: strings.OrgSetup_bitoftime,
              locationKey: locationKey,
              postData: raw,
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
            crashlytics().log(
              "Api request fail to device setup to get accessToken & refreshToken"
            );
          }
        }
      );
    }
  };

  return (
    <SafeAreaView style={CommonStyle.mainScreen}>
      <DotActivity loadingColor={color.royal_blue} isLoading={loading} />
      <ErrorModal
        strings={strings}
        isVisible={errModal}
        onPress={() => setErrModal(false)}
        errText={errMsg}
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
              marginTop: orientation.isPortrait ? RFValue(40) : RFValue(20),
            }}
          >
            {strings.enter_locationKey}
          </Text>
          <View
            style={{
              alignItems: "center",
              marginTop: orientation.isPortrait
                ? orientation.width / 3
                : orientation.height / 4,
            }}
          >
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={"default"}
              value={locationKey}
              onChangeText={(text) => setLocationKey(text)}
              style={{
                ...styles.input,
                ...CommonStyle.bottomShadow,
                width: orientation.isPortrait
                  ? orientation.height / 2
                  : orientation.height / 2,
                backgroundColor: color.white,
                color: color.cod_gray,
              }}
            />
            {errFlag ? (
              errlocation
            ) : (
              <View
                style={{
                  height: RFValue(12),
                  width: RFValue(200),
                  marginTop: orientation.isPortrait ? RFValue(12) : RFValue(10),
                }}
              ></View>
            )}
            <RNButton
              buttonTitle={strings.setup_text}
              btnTextStyle={{ ...CommonStyle.text3, color: color.royal_blue }}
              buttonStyle={{
                marginTop: orientation.isPortrait ? RFValue(20) : RFValue(14),
              }}
              onPress={() => setShowModal(true)}
            />
            <LocationIntroModal
              strings={strings}
              isVisible={showModal}
              onPress={() => setShowModal(false)}
            />
            <RNButton
              buttonTitle={strings.submit}
              buttonStyle={{
                ...CommonStyle.button,
                backgroundColor: color.royal_blue,
                width: orientation.isPortrait
                  ? orientation.width / 5
                  : orientation.height / 5,
                height: orientation.isPortrait
                  ? orientation.width / 14
                  : orientation.height / 14,
                marginTop: orientation.isPortrait ? RFValue(24) : RFValue(16),
              }}
              btnTextStyle={{ ...CommonStyle.btnText2, color: color.white }}
              onPress={() => authenticateWithSiteKey()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LocationKeyScreen;

const styles = StyleSheet.create({
  input: {
    fontSize: RFValue(12),
    fontFamily: "SFProText-Regular",
    padding: RFValue(8),
    borderRadius: RFValue(5),
    paddingTop: 14,
    paddingBottom: 14,
  },
});
