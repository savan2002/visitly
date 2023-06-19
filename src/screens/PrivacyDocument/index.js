import {
  SafeAreaView,
  Text,
  View,
  Pressable,
  ScrollView,
  LogBox,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { color } from "../../theme/colors";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RFValue } from "react-native-responsive-fontsize";
import Entypo from "react-native-vector-icons/Entypo";
import RNButton from "react-native-button-sample";
import CheckBox from "react-native-check-box";
import CommonStyle from "../../theme/CommonStyle";
import styles from "./styles";
import { LightenColor } from "../../resources/LightenColor";
import properties from "../../resources/properties.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RenderHtml from "react-native-render-html";
import UserInactivity from "react-native-user-inactivity";
import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
LogBox.ignoreAllLogs();
const PrivacyDocument = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const [isChecked, setIsChecked] = useState(false);
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  var mainColor = orginfo ? orginfo.btnColor : "";
  var secondaryColor, thirdColor;
  secondaryColor = LightenColor(mainColor, 55);
  thirdColor = LightenColor(mainColor, 75);
  const [pdfSource, setPdfSource] = useState();
  const [timer, setTimer] = useState(300000);
  const logger = new LogglyTracker();
  const macAddress = DeviceInfo.getUniqueIdSync();

  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
    fetchPdfData();
  }, []);

  const fetchPdfData = async () => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "Api call to get privacy document for new visitor sign in.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    await analytics().logEvent("privacy_document", {
      screen_name: "Privacy_Document_Screen",
      api_url: `${url}/doctemplates/$PRIVACYDOCTEMPLETEID`,
    });
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    const docOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + ACtoken,
      },
    };
    fetch(
      url + "/doctemplates/" + orginfo.privacyDocTemplateId,
      docOptions
    ).then(async (response) => {
      if (response.status < 400) {
        response.json().then(async (data) => {
          logger.push({
            method:
              "Api call successful to get privacy document for new visitor sign in.",
            type: "INFO",
            error: "",
            macAddress: macAddress,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api call successful to get privacy document for new visitor sign in"
          );
          fetch(data.docTemplateUri)
            .then((res) => {
              return res.text();
            })
            .then((data) => {
              var htmlWidth = orientation.width * 0.8;
              var htmlContent =
                "<div style='width:" +
                htmlWidth +
                "'px'>" +
                data.toString() +
                "</div><br><br><br><br>";
              htmlContent = htmlContent
                .split("{{org_name}}")
                .join(orginfo.orgName);
              const source = {
                html: `${htmlContent}`,
              };
              setPdfSource(source);
            });
        });
      } else if (response.status >= 400 && response.status < 500) {
        logger.push({
          method:
            "Api request fail to get privacy document for new visitor sign in.",
          type: "ERROR",
          error: response,
          macAddress: macAddress,
          apiUrl: url + "/doctemplates/" + orginfo.privacyDocTemplateId,
          apiMethod: "GET",
          apiResStatus: response.status,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log(
          "Api request fail to get privacy document for new visitor sign in"
        );
      } else {
        logger.push({
          method:
            "Api request fail to get privacy document for new visitor sign in.",
          type: "ERROR",
          error: response,
          macAddress: macAddress,
          apiUrl: url + "/doctemplates/" + orginfo.privacyDocTemplateId,
          apiMethod: "GET",
          apiResStatus: response.status,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log(
          "Api request fail to get privacy document for new visitor sign in"
        );
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
      <SafeAreaView style={CommonStyle.mainScreen}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              marginTop: orientation.isPortrait ? RFValue(14) : RFValue(14),
              paddingHorizontal: RFValue(20),
            }}
          >
            <Pressable
              onPress={() => navigation.goBack()}
              style={{
                ...CommonStyle.btnBoxBackground,
                ...CommonStyle.shadow,
                backgroundColor: color.white,
              }}
            >
              <Entypo
                name="chevron-left"
                size={RFValue(18)}
                color={orginfo ? orginfo.btnColor : color.royal_blue}
              />
            </Pressable>
          </View>
          <Text
            style={{
              ...CommonStyle.btnText1,
              marginTop: orientation.isPortrait ? RFValue(30) : RFValue(20),
              textAlign: "center",
            }}
          >
            {strings.privacy}
          </Text>

          <View style={{ alignItems: "center" }}>
            <View
              style={{
                ...styles.docView,
                marginTop: orientation.isPortrait ? RFValue(14) : RFValue(10),
                width: orientation.isPortrait ? "85%" : "90%",
                height: orientation.isPortrait ? "87%" : "82%",
              }}
            >
              <ScrollView
                alwaysBounceVertical={false}
                contentContainerStyle={{ ...styles.pdfStyle }}
              >
                {pdfSource ? (
                  <RenderHtml
                    style={{ height: "100%", width: "100%" }}
                    source={pdfSource ? pdfSource : "<p>Loading...</p>"}
                    contentWidth={Dimensions.get("window").width}
                  />
                ) : null}
              </ScrollView>
            </View>
          </View>
        </View>
        <View elevation={5} style={{ ...styles.topShadow }}>
          {orginfo.privacyConsentType == "Explicit" ? (
            <View style={{ ...styles.container }}>
              <View style={{ width: "4%" }}>
                <CheckBox
                  style={{}}
                  onClick={() => setIsChecked(!isChecked)}
                  isChecked={isChecked}
                />
              </View>
              <View style={{ width: "80%", marginBottom: RFValue(8) }}>
                <Text style={{ ...CommonStyle.text3, fontSize: RFValue(11) }}>
                  {strings.personal_data}&nbsp;{orginfo ? orginfo.orgName : ""}
                  &nbsp;
                  {strings.personal_data_continue}
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ ...styles.container }}>
              <View style={{ width: orientation.isPortrait ? "80%" : "90%" }}>
                <Text style={{ ...CommonStyle.text3, fontSize: RFValue(11) }}>
                  {strings.consent_allow}&nbsp;{orginfo ? orginfo.orgName : ""}
                  &nbsp;
                  {strings.consent_allow_continue}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.btnBox}>
            <RNButton
              buttonTitle={strings.cancel}
              buttonStyle={{
                ...CommonStyle.button,
                backgroundColor: thirdColor,
                width: orientation.isPortrait
                  ? orientation.width / 3.6
                  : orientation.height / 3.6,
                height: orientation.isPortrait
                  ? orientation.width / 14
                  : orientation.height / 16,
                marginTop: orientation.isPortrait ? RFValue(20) : RFValue(12),
                marginBottom: orientation.isPortrait
                  ? RFValue(20)
                  : RFValue(12),
              }}
              btnTextStyle={{
                ...CommonStyle.btnText2,
                color: orginfo.btnColor,
              }}
              onPress={() => navigation.goBack()}
            />
            <View
              style={{
                width: orientation.isPortrait ? RFValue(20) : RFValue(14),
              }}
            />
            <Pressable
              style={{
                ...CommonStyle.button,
                backgroundColor: orginfo.btnColor,
                width: orientation.isPortrait
                  ? orientation.width / 3.6
                  : orientation.height / 3.6,
                height: orientation.isPortrait
                  ? orientation.width / 14
                  : orientation.height / 16,
                marginTop: orientation.isPortrait ? RFValue(20) : RFValue(12),
                marginBottom: orientation.isPortrait
                  ? RFValue(20)
                  : RFValue(12),
              }}
              onPress={() => {
                logger.push({
                  method: "User clicked continue button on privacy screen.",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
                if (orginfo.faceRecogFlag == true) {
                  logger.push({
                    method: "User navigate to Sign In Facial Recognition Screen.",
                    type: "INFO",
                    error: "",
                    macAddress: macAddress,
                    deviceId: orginfo.deviceId,
                    siteId: orginfo.siteId,
                    orgId: orginfo.orgId,
                    orgName: orginfo.orgName,
                  });
                  navigation.navigate("FaceRecognition", {
                    orginfo: orginfo,
                    strings: strings,
                  });
                } else {
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
                }
              }}
              disabled={
                !isChecked &&
                orginfo &&
                orginfo.privacyConsentType == "Explicit"
                  ? true
                  : false
              }
            >
              <Text style={{ ...CommonStyle.btnText2, color: color.white }}>
                {strings.continue}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </UserInactivity>
  );
};

export default PrivacyDocument;
