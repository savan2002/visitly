import {
  SafeAreaView,
  Text,
  View,
  LogBox,
  Pressable,
  Modal,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation } from "@react-navigation/native";
import strings from "../../resources/localization";
import RNButton from "react-native-button-sample";
import DeviceInfo from "react-native-device-info";
import properties from "../../resources/properties.json";
import DotActivity from "../../components/DotActivity";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ErrorModal from "../../components/ErrorModal";
import CommonStyle from "../../theme/CommonStyle";
import styles from "./styles";
import LocalizedStrings from "react-native-localization";
import WelcomeIcon from "../../assets/svg/welcome.svg";
import VisitlyIcon from "../../assets/svg/visitly.svg";
import DevicePinModal from "../../components/DevicePinModal";
import crashlytics from "@react-native-firebase/crashlytics";
import analytics from "@react-native-firebase/analytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
import RadioForm from "react-native-simple-radio-button";
LogBox.ignoreAllLogs();
const SigninDevice = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const [showPinModal, setShowPinModal] = useState(false);
  const [forgotPinModal, setForgotPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinReady, setPinReady] = useState(false);
  const [errText, setErrText] = useState(false);
  const [macAddress, setMacAddress] = useState(DeviceInfo.getUniqueIdSync());
  const [loading, setLoading] = useState(false);
  const [errModal, setErrModal] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  var [strings, setStrings] = useState(new Object());
  const [pressed, setPressed] = useState(5);
  const [envModal, setEnvModal] = useState(false);
  const [apiUrl, setApiUrl] = useState(properties.prodUrl);
  const [radioIndex, setRadioIndex] = useState(0);
  const logger = new LogglyTracker();
  useEffect(() => {
    fetchLanguage();
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
    storeData();
  }, []);

  const storeData = async () => {
    await AsyncStorage.setItem("VisitlyStore:apiUrl", apiUrl);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      console.log(properties.prodUrl,'-----listerhit');
      setRadioIndex(0);
      await AsyncStorage.setItem("VisitlyStore:apiUrl", properties.prodUrl);
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
          setStrings(Languagestrings);
        } else {
          setStrings(str);
        }
      });
  };

  useEffect(() => {
    if (pin.length != 0) {
      setErrText("");
    }
  }, [pin.length]);

  const submitPin = async () => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "User clicked submit button for login with device",
      type: "INFO",
      error: "",
      macAddress: macAddress,
    });
    await analytics().logEvent("SigninByDevicePin", {
      screen_name: "Sign in Device Screen",
      api_url: `${url}/devices/authenticate`,
    });
    crashlytics().log("Api call to authenticate with device.");
    setLoading(true);
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
          await AsyncStorage.setItem(
            "VisitlyStore:accessToken",
            data.accessToken
          );
          await AsyncStorage.setItem(
            "VisitlyStore:refreshToken",
            data.refreshToken
          );
          crashlytics().log("Api call successful to authenticate with device.");
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
                var currentDateTime = new Date();
                await AsyncStorage.setItem(
                  "VisitlyStore:lastOrgUpdate",
                  JSON.stringify(currentDateTime)
                );
                crashlytics().log(
                  "Api call successful to get org config data."
                );
                var orgOptions = {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${data.accessToken}`,
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
                        var currentDateTime = new Date();
                        await AsyncStorage.setItem(
                          "VisitlyStore:lastOrgUpdate",
                          currentDateTime.toString()
                        );
                        setLoading(false);
                        setShowPinModal(false);
                        logger.push({
                          method:
                            "Api call successful to authenticate with device.",
                          type: "INFO",
                          error: "",
                          macAddress: macAddress,
                          deviceId: orgdata.deviceId,
                          siteId: orgdata.siteId,
                          orgId: orgdata.orgId,
                          orgName: orgdata.orgName,
                        });
                        logger.push({
                          method: "User navigate to Home Screen.",
                          type: "INFO",
                          error: "",
                          macAddress: macAddress,
                          deviceId: orgdata.deviceId,
                          siteId: orgdata.siteId,
                          orgId: orgdata.orgId,
                          orgName: orgdata.orgName,
                        });
                        navigation.navigate("Home", {
                          orginfo: orgdata,
                          deviceOrginfo: devorgdata,
                        });
                        crashlytics().log(
                          "Api call successful to get device org config data."
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
                        apiUrl: url + "/devices/" + orgdata.deviceId,
                        apiMethod: "GET",
                        apiResStatus: response.status,
                      });
                      setLoading(false);
                      setErrModal(true);
                      setErrMsg(strings.org_fail);
                      setTimeout(() => {
                        setErrModal(false);
                      }, 5000);
                      crashlytics().log(
                        "Api request fail to get device org config data."
                      );
                    } else {
                      logger.push({
                        method:
                          "Api request fail to get device org config data.",
                        type: "ERROR",
                        error: strings.OrgSetup_bitoftime,
                        macAddress: macAddress,
                        apiUrl: url + "/devices/" + orgdata.deviceId,
                        apiMethod: "GET",
                        apiResStatus: response.status,
                      });
                      setLoading(false);
                      setErrModal(true);
                      setErrMsg(strings.OrgSetup_bitoftime);
                      setTimeout(() => {
                        setErrModal(false);
                      }, 5000);
                      crashlytics().log(
                        "Api request fail to get device org config data."
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
                apiUrl: url + "/devices/orgconfig",
                apiMethod: "GET",
                apiResStatus: response.status,
              });
              setLoading(false);
              setErrModal(true);
              setTimeout(() => {
                setErrModal(false);
              }, 5000);
              setErrMsg(strings.org_fail);
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
          });
        });
      } else if (response.status >= 400 && response.status < 500) {
        logger.push({
          method: "Api request fail to autheticate with device.",
          type: "ERROR",
          error: "User entered device pin is not correct.",
          macAddress: macAddress,
          postData: { deviceKey: pin },
          apiUrl: url + "/devices/authenticate",
          apiMethod: "POST",
          apiResStatus: response.status,
        });
        setLoading(false);
        setErrText(true);
        setPin("");
        crashlytics().log("Api request fail to autheticate with device.");
      } else {
        logger.push({
          method: "Api request fail to autheticate with device.",
          type: "ERROR",
          error: "Api request fail to autheticate with device.",
          macAddress: macAddress,
          postData: { deviceKey: pin },
          apiUrl: url + "/devices/authenticate",
          apiMethod: "POST",
          apiResStatus: response.status,
        });
        setLoading(false);
        setErrText(true);
        setPin("");
        crashlytics().log("Api request fail to autheticate with device.");
      }
    });
  };

  const radioData = [
    {
      label: "Prod",
      value: properties.prodUrl,
    },
    {
      label: "Stage",
      value: properties.stageUrl,
    },
    {
      label: "Dev",
      value: properties.devUrl,
    },
  ];

  return (
    <SafeAreaView style={CommonStyle.mainScreen}>
      <DotActivity loadingColor={color.royal_blue} isLoading={loading} />
      <ErrorModal
        strings={strings}
        isVisible={errModal}
        onPress={() => setErrModal(false)}
        errText={errMsg}
      />
      <View style={CommonStyle.mainScreen}>
        <View
          elevation={5}
          style={{
            ...styles.toopContainer,
            ...CommonStyle.bottomShadow,
          }}
        >
          <View
            style={{
              marginTop: orientation.isPortrait ? RFValue(60) : RFValue(20),
              alignItems: "center",
            }}
          >
            <Pressable
              onPress={() => {
                let a = pressed - 1;
                setPressed(a);
                if (a == 0) {
                  setEnvModal(true);
                } else {
                  setEnvModal(false);
                }
              }}
              disabled={pressed == 0 ? true : false}
            >
              <VisitlyIcon height={RFValue(40)} width={RFValue(120)} />
            </Pressable>
            <Modal
              animationType={"fade"}
              transparent={true}
              visible={envModal}
              onRequestClose={() => setEnvModal(false)}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPressOut={() => {
                  setPressed(5);
                  setEnvModal(false);
                }}
                style={CommonStyle.modalBackground}
              >
                <View
                  style={{
                    width: orientation.isPortrait
                      ? orientation.width / 2
                      : orientation.height / 1.8,
                    backgroundColor: "white",
                    height: orientation.isPortrait
                      ? orientation.width / 2
                      : orientation.height / 1.8,
                    borderRadius: RFValue(10),
                    justifyContent: "center",
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        ...CommonStyle.text3,
                      }}
                    >
                      Select Your Environment
                    </Text>
                    <RadioForm
                      radio_props={radioData}
                      initial={radioIndex}
                      formHorizontal={false}
                      labelHorizontal={true}
                      buttonColor={color.royal_blue}
                      animation={false}
                      onPress={async (event) => {
                        setApiUrl(event);
                        await AsyncStorage.setItem(
                          "VisitlyStore:apiUrl",
                          event
                        );
                        let item = radioData.findIndex(
                          (val) => val.value == event
                        );
                        setRadioIndex(item);
                      }}
                      labelStyle={{
                        fontSize: RFValue(10),
                        marginRight: 10,
                        color: color.cod_gray,
                      }}
                      style={{ marginTop: 30 }}
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
                        marginTop: RFValue(20),
                      }}
                      btnTextStyle={{ ...styles.btnText, color: color.white }}
                      onPress={async () => {
                        setPressed(5);
                        setEnvModal(false);
                      }}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
            <WelcomeIcon
              height={
                orientation.isPortrait
                  ? orientation.width / 2
                  : orientation.height / 2.8
              }
              width={
                orientation.isPortrait
                  ? orientation.width / 2
                  : orientation.height / 3
              }
            />
            <Text style={{ ...styles.welcomeText }}>
              {strings.welcome_visitly}
            </Text>
            <Text
              style={{
                ...styles.welcomeSubText,
                marginTop: orientation.isPortrait ? RFValue(16) : RFValue(8),
              }}
            >
              {strings.welcome_subtext}
            </Text>
          </View>

          <RNButton
            buttonTitle={strings.sign_newdevice}
            buttonStyle={{
              ...CommonStyle.button,
              backgroundColor: color.royal_blue,
              width: orientation.isPortrait
                ? orientation.width / 3
                : orientation.height / 3,
              height: orientation.isPortrait
                ? orientation.width * 0.1
                : orientation.height * 0.08,
              marginTop: orientation.isPortrait ? RFValue(30) : RFValue(12),
              marginBottom: orientation.isPortrait ? RFValue(30) : RFValue(12),
            }}
            btnTextStyle={{ ...styles.btnText }}
            onPress={() => {
              logger.push({
                method: "User navigate to Scan Location QR Code Screen.",
                type: "INFO",
                error: "",
                macAddress: macAddress,
              });
              navigation.navigate("ScanLocationQR", { strings: strings });
            }}
          />
        </View>
      </View>
      <View
        style={{
          alignItems: "center",
          marginTop: orientation.isPortrait ? RFValue(8) : RFValue(5),
        }}
      >
        <RNButton
          buttonTitle={strings.got_signin_pin}
          btnTextStyle={{ ...styles.btn2Text, color: color.cod_gray }}
          buttonStyle={{
            marginBottom: orientation.isPortrait ? RFValue(14) : RFValue(10),
          }}
        />
        <DevicePinModal
          strings={strings}
          showModal={showPinModal}
          closeModal={() => setShowPinModal(false)}
          primaryColor={color.royal_blue}
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
        <RNButton
          buttonTitle={strings.sign_pin}
          buttonStyle={{
            ...CommonStyle.button,
            backgroundColor: color.concrete,
            width: orientation.isPortrait
              ? orientation.width / 3
              : orientation.height / 3,
            height: orientation.isPortrait
              ? orientation.width * 0.1
              : orientation.height * 0.08,
            marginBottom: orientation.isPortrait ? RFValue(12) : RFValue(8),
          }}
          btnTextStyle={{ ...styles.btnText, color: color.royal_blue }}
          onPress={() => {
            logger.push({
              method: "User choosed signin using PIN",
              type: "INFO",
              error: "",
              macAddress: macAddress,
            });
            setPin("");
            setShowPinModal(true);
          }}
        />
        <Text
          style={{
            ...styles.welcomeSubText,
            marginBottom: orientation.isPortrait ? RFValue(14) : RFValue(10),
          }}
        >
          {strings.pin_subtext}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SigninDevice;
