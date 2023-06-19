import {
  SafeAreaView,
  Text,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Linking,
  Keyboard,
  TextInput,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import Entypo from "react-native-vector-icons/Entypo";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import RNButton from "react-native-button-sample";
import AsyncStorage from "@react-native-async-storage/async-storage";
import properties from "../../resources/properties.json";
import DotActivity from "../../components/DotActivity";
import ErrorModal from "../../components/ErrorModal";
import CommonStyle from "../../theme/CommonStyle";
import styles from "./styles";
import crashlytics from "@react-native-firebase/crashlytics";
import analytics from "@react-native-firebase/analytics";
import DeviceInfo from "react-native-device-info";
import { LogglyTracker } from "react-native-loggly-jslogger";
const SetPinScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const strings = route?.params?.strings;
  const [pin, setPin] = useState("");
  const [ConfirmPin, setConfirmPin] = useState("");
  const MAX_PIN = 4;
  const [loading, setLoading] = useState(false);
  const [errModal, setErrModal] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const textInputRefPin = useRef(null);
  const macAddress = DeviceInfo.getUniqueIdSync();
  const logger = new LogglyTracker();
  const pinDigitsArray = new Array(MAX_PIN).fill(0);
  const CpinDigitsArray = new Array(MAX_PIN).fill(0);

  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
  }, []);

  const handleOnPress = () => {
    textInputRefPin?.current?.focus();
  };

  const handleOnPressCpin = () => {
    this.secondTextInput.focus();
  };

  const securePassword = (value) => {
    return value && value;
  };

  const toPinDigitInput = (_value, index) => {
    const dd = pin[index];
    const emptyInputChar = " ";
    const digit = securePassword(dd) || emptyInputChar;
    return (
      <View
        key={index}
        style={{
          ...styles.pinInput,
          width: orientation.isPortrait ? "16%" : "13%",
          height: orientation.isPortrait
            ? orientation.width / 12
            : orientation.height / 13,
        }}
      >
        <Text style={styles.pinInputText}>{digit}</Text>
      </View>
    );
  };

  const toCPinDigitInput = (_value, index) => {
    const dd = ConfirmPin[index];
    const emptyInputChar = " ";
    const digit = securePassword(dd) || emptyInputChar;
    return (
      <View
        key={index}
        style={{
          ...styles.pinInput,
          width: orientation.isPortrait ? "16%" : "13%",
          height: orientation.isPortrait
            ? orientation.width / 12
            : orientation.height / 13,
        }}
      >
        <Text style={styles.pinInputText}>{digit}</Text>
      </View>
    );
  };

  const submitPin = async () => {
    crashlytics().log("Api call to set device pin.");
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    const orgInfo = JSON.parse(
      await AsyncStorage.getItem("VisitlyStore:orginfo")
    );

    if (pin === ConfirmPin) {
      logger.push({
        method: "Entered both pin are same.",
        type: "INFO",
        error: "",
        pin: pin,
        macAddress: macAddress,
      });
      await analytics().logEvent("SetDevicePin", {
        screen_name: "Set Device Pin Screen",
        api_url: `${url}/devices/$DEVICEID`,
      });
      Keyboard.dismiss();
      setLoading(true);
      var pinOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${ACtoken}`,
        },
        body: JSON.stringify({
          deviceKey: ConfirmPin,
        }),
      };
      fetch(
        url + "/devices/" + orgInfo.deviceId + "/pin",
        pinOptions
      ).then((response) => {
        if (response.status < 400) {
          response.json().then(async (result) => {
            logger.push({
              method: "Api call successful to set new device pin.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orgInfo.deviceId,
              siteId: orgInfo.siteId,
              orgId: orgInfo.orgId,
              orgName: orgInfo.orgName,
            });
            crashlytics().log(
              "Api call successful to set new device pin"
            );
            logger.push({
              method: "User navigate to Device Setup Successful Screen.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orgInfo.deviceId,
              siteId: orgInfo.siteId,
              orgId: orgInfo.orgId,
              orgName: orgInfo.orgName,
            }); 
            setLoading(false);
            navigation.navigate("Setupsuccess", { strings: strings });
          });
        } else if (response.status >= 400 && response.status < 500) {
          logger.push({
            method: "Api request fail to set new device pin.",
            type: "ERROR",
            error: strings.OrgSetup_bitoftime,
            macAddress: macAddress,
            EnteredPin: pin,
            ApiUrl: url + "/devices/" + orgInfo.deviceId + "/pin",
            ApiMethod: "POST",
            ApiResStatus: response.status,
            deviceId: orgInfo.deviceId,
            siteId: orgInfo.siteId,
            orgId: orgInfo.orgId,
            orgName: orgInfo.orgName,
          });
          setLoading(false);
          setErrModal(true);
          setErrMsg(strings.OrgSetup_invalid);
          setTimeout(() => {
            setErrModal(false);
          }, 5000);
          crashlytics().log(
            "Api request fail to set new device pin"
          );
        } else {
          logger.push({
            method: "Api request fail to set new device pin.",
            type: "ERROR",
            error: strings.OrgSetup_bitoftime,
            macAddress: macAddress,
            EnteredPin: pin,
            ApiUrl: url + "/devices/" + orgInfo.deviceId + "/pin",
            ApiMethod: "POST",
            ApiResStatus: response.status,
            deviceId: orgInfo.deviceId,
            siteId: orgInfo.siteId,
            orgId: orgInfo.orgId,
            orgName: orgInfo.orgName,
          });
          setLoading(false);
          setErrModal(true);
          setErrMsg(strings.OrgSetup_bitoftime);
          setTimeout(() => {
            setErrModal(false);
          }, 5000);
          crashlytics().log(
            "Api request fail to set new device pin"
          );
        }
      });
    } else if (pin != ConfirmPin) {
      logger.push({
        method: "User entered both pin are not same.",
        type: "ERROR",
        error: strings.Orgsetup_otherpin,
        macAddress: macAddress,
        EnteredPin: pin,
        ConfirmPin: ConfirmPin,
        ApiUrl: url + "/devices/" + orgInfo.deviceId + "/pin",
        ApiMethod: "POST",
        deviceId: orgInfo.deviceId,
        siteId: orgInfo.siteId,
        orgId: orgInfo.orgId,
        orgName: orgInfo.orgName,
      });
      setLoading(false);
      setErrModal(true);
      setErrMsg(strings.Orgsetup_otherpin);
      setTimeout(() => {
        setErrModal(false);
      }, 5000);
      crashlytics().log("User entered both pin are not same");
    } else {
      logger.push({
        method: "User entered both pin are not same.",
        type: "ERROR",
        error: strings.Orgsetup_otherpin,
        macAddress: macAddress,
        EnteredPin: pin,
        ConfirmPin: ConfirmPin,
        ApiUrl: url + "/devices/" + orgInfo.deviceId + "/pin",
        ApiMethod: "POST",
        deviceId: orgInfo.deviceId,
        siteId: orgInfo.siteId,
        orgId: orgInfo.orgId,
        orgName: orgInfo.orgName,
      });
      setLoading(false);
      setErrModal(true);
      setErrMsg(strings.Orgsetup_otherpin);
      setTimeout(() => {
        setErrModal(false);
      }, 5000);
      crashlytics().log("User entered both pin are not same");
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
            {strings.create}&nbsp;
            <Text
              style={{
                ...CommonStyle.text2,
                textTransform: "lowercase",
                textAlign: "center",
              }}
            >
              {strings.new_pin}
            </Text>
          </Text>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: "auto",
            }}
          >
            <View style={{ width: orientation.isPortrait ? "50%" : "43%" }}>
              <Text
                style={{
                  ...CommonStyle.btnText2,
                  color: color.black,
                  textAlign: "center",
                  marginTop: orientation.isPortrait ? RFValue(40) : RFValue(30),
                  marginBottom: orientation.isPortrait
                    ? RFValue(20)
                    : RFValue(14),
                }}
              >
                {strings.new_pin}
              </Text>
              <View>
                <Pressable
                  onPress={handleOnPress}
                  style={styles.pinInputsContainer}
                >
                  {pinDigitsArray.map(toPinDigitInput)}
                </Pressable>
                <TextInput
                  ref={textInputRefPin}
                  value={pin}
                  onChangeText={(text) => setPin(text)}
                  autoFocus={pin.length == 0 ? true : false}
                  onSubmitEditing={() => {
                    this.secondTextInput.focus();
                  }}
                  keyboardType="number-pad"
                  returnKeyType="next"
                  textContentType="oneTimePin"
                  maxLength={MAX_PIN}
                  secureTextEntry={true}
                  style={styles.hiddenTextInput}
                  blurOnSubmit={false}
                />
              </View>
            </View>
            <View style={{ width: orientation.isPortrait ? "50%" : "43%" }}>
              <Text
                style={{
                  ...CommonStyle.btnText2,
                  color: color.black,
                  textAlign: "center",
                  marginTop: orientation.isPortrait ? RFValue(26) : RFValue(18),
                  marginBottom: orientation.isPortrait
                    ? RFValue(20)
                    : RFValue(14),
                }}
              >
                {strings.confirm}&nbsp;
                <Text
                  style={{
                    ...CommonStyle.btnText2,
                    textTransform: "lowercase",
                  }}
                >
                  {strings.new_pin}
                </Text>
              </Text>
              <View>
                <Pressable
                  onPress={handleOnPressCpin}
                  style={styles.pinInputsContainer}
                >
                  {CpinDigitsArray.map(toCPinDigitInput)}
                </Pressable>
                <TextInput
                  ref={(input) => {
                    this.secondTextInput = input;
                  }}
                  value={ConfirmPin}
                  onChangeText={(text) => setConfirmPin(text)}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  textContentType="oneTimePin"
                  autoCorrect={false}
                  maxLength={MAX_PIN}
                  secureTextEntry={true}
                  style={styles.hiddenTextInput}
                />
              </View>
            </View>
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
              onPress={() => submitPin()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            ...CommonStyle.text3,
            color: color.black,
            textAlign: "center",
            maxWidth: orientation.isPortrait ? "70%" : "80%",
            marginBottom: orientation.isPortrait ? RFValue(40) : RFValue(30),
          }}
        >
          {strings.link_device}
          <Text
            style={styles.linkText}
            onPress={() => {
              logger.push({
                method: "User clicked in Web portal login link.",
                type: "INFO",
                error: "",
                macAddress: macAddress,
              });
              Linking.openURL("https://app.visitly.io/visitly/login");
            }}
          >
            {strings.visitly_url}
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SetPinScreen;
