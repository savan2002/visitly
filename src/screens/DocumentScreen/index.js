import {
  Text,
  View,
  Pressable,
  Image,
  LogBox,
  Dimensions,
  ScrollView,
} from "react-native";
import React, { useState, useEffect, createRef } from "react";
import { RFValue } from "react-native-responsive-fontsize";
import Entypo from "react-native-vector-icons/Entypo";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import RNButton from "react-native-button-sample";
import CommonStyle from "../../theme/CommonStyle";
import { color } from "../../theme/colors";
import styles from "./styles";
import moment from "moment";
import SignatureCapture from "react-native-signature-capture";
import properties from "../../resources/properties.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RenderHtml from "react-native-render-html";
import UserInactivity from "react-native-user-inactivity";
import { LightenColor } from "../../resources/LightenColor";
import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
LogBox.ignoreAllLogs();
const DocumentScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const fullname = route?.params?.fullname;
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  const purpose = route?.params?.purpose;
  const purposeJson = route?.params?.purposeJson;
  const askDoc = route?.params?.askDoc;
  const email = route?.params?.email;
  const host = route?.params?.host;
  const hostId = route?.params?.hostId;
  const phone = route?.params?.phone;
  const companyName = route?.params?.companyName;
  const frFlag = route?.params?.frFlag;
  const visitCustomFields = route?.params?.visitCustomFields;
  const params = route?.params?.params;
  const preRegisterVisitId = route?.params?.preRegisterVisitId
    ? route?.params?.preRegisterVisitId
    : "";
  const idFrontImageBase64String = route?.params?.idFrontImageBase64String;
  const idBackImageBase64String = route?.params?.idBackImageBase64String;
  const userInfo = route?.params?.userInfo;
  var mainColor = orginfo ? orginfo.btnColor : "";
  var date = moment(new Date()).format("DD MMMM YYYY");
  const [timer, setTimer] = useState(300000);
  const sign = createRef();
  const [signature, setSignature] = useState({});
  const [pdfSource, setPdfSource] = useState();
  const [skipSigningFlag, setSkipSigningFlag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docSignin, setDocSignin] = useState(false);
  const [documentName, setDocumentName] = useState();
  var today = new Date();
  var mainColor = orginfo ? orginfo.btnColor : "";
  var secondaryColor, thirdColor;
  secondaryColor = LightenColor(mainColor, 55);
  thirdColor = LightenColor(mainColor, 75);
  const logger = new LogglyTracker();
  const macAddress = DeviceInfo.getUniqueIdSync();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  var dd = today.getDate();
  var mm = monthNames[today.getMonth()];

  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  var today = mm + " " + dd + ", " + yyyy;

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
      method: "Api call for get org document for new visitor sign in.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    await analytics().logEvent("org_document", {
      screen_name: "Document_Screen",
      api_url: `${url}/doctemplates/$ORGTEMPLATEID`,
    });
    setLoading(true);
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    const docOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + ACtoken,
      },
    };
    fetch(url + "/doctemplates/" + purposeJson.orgTemplateId, docOptions).then(
      async (response) => {
        if (response.status < 400) {
          response.json().then(async (data) => {
            logger.push({
              method:
                "Api call successful to get org document for new visitor sign in.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            crashlytics().log(
              "Api call successful to get org document for new visitor sign in"
            );
            setDocSignin(data.skipSigningFlag);
            setSkipSigningFlag(data.skipSigningFlag);
            setDocumentName(data.name);
            fetch(data.docTemplateUri)
              .then((res) => {
                return res.text();
              })
              .then((data) => {
                var htmlWidth = Dimensions.get("window").width * 0.8;
                var htmlContent =
                  "<div style='width:" +
                  htmlWidth +
                  "'px'>" +
                  data.toString() +
                  "</div><br><br><br><br>";
                htmlContent = htmlContent
                  .split("{{visitor_name}}")
                  .join(userInfo.fullname);
                htmlContent = htmlContent
                  .split("{{org_name}}")
                  .join(orginfo.orgName);
                htmlContent = htmlContent.split("{{checkin_date}}").join(today);
                const source = {
                  html: `${htmlContent}`,
                };
                setPdfSource(source);
              });
            setLoading(false);
          });
        } else if (response.status >= 400 && response.status < 500) {
          logger.push({
            method:
              "Api request fail to get org docuemnt for new visitor sign in.",
            type: "ERROR",
            error: response,
            macAddress: macAddress,
            apiUrl: url + "/doctemplates/" + purposeJson.orgTemplateId,
            apiMethod: "GET",
            apiResStatus: response.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api request fail to get org document for new visitor for sign in"
          );
          setLoading(false);
        } else {
          logger.push({
            method:
              "Api request fail to get org docuemnt for new visitor sign in.",
            type: "ERROR",
            error: response,
            macAddress: macAddress,
            apiUrl: url + "/doctemplates/" + purposeJson.orgTemplateId,
            apiMethod: "GET",
            apiResStatus: response.status,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          crashlytics().log(
            "Api request fail to get org document for new visitor for sign in"
          );
          setLoading(false);
        }
      }
    );
  };

  const onSaveEvent = (result) => {
    setSignature(result);
    if (purposeJson.photoFlag) {
      logger.push({
        method: "User navigate to Picture Screen.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      navigation.navigate("Picture", {
        strings: strings,
        fullname: fullname,
        email: email,
        purpose: purpose,
        host: host,
        phone: phone,
        purposeJson: purposeJson,
        hostId: hostId,
        signature: result?.encoded,
        skipSigningFlag: skipSigningFlag,
        documentName: documentName,
        orginfo: orginfo,
        companyName: companyName,
        preRegisterVisitId: preRegisterVisitId,
        fields: visitCustomFields,
        askDoc: askDoc,
        params: params,
      });
    } else if (purposeJson.isIdCapturingEnabled) {
      logger.push({
        method: "User navigate to Id Type Screen.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      navigation.navigate("IDType", {
        strings: strings,
        fullname: fullname,
        email: email,
        purpose: purpose,
        host: host,
        phone: phone,
        purposeJson: purposeJson,
        hostId: hostId,
        signature: result?.encoded,
        skipSigningFlag: skipSigningFlag,
        documentName: documentName,
        orginfo: orginfo,
        companyName: companyName,
        preRegisterVisitId: preRegisterVisitId,
        fields: visitCustomFields,
        askDoc: askDoc,
        params: params,
      });
    } else {
      logger.push({
        method: "User navigate to Confirmation Screen.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      navigation.navigate("Confirmation", {
        strings: strings,
        fullname: fullname,
        email: email,
        purpose: purpose,
        host: host,
        phone: phone,
        purposeJson: purposeJson,
        hostId: hostId,
        signature: result?.encoded,
        skipSigningFlag: skipSigningFlag,
        documentName: documentName,
        orginfo: orginfo,
        companyName: companyName,
        preRegisterVisitId: preRegisterVisitId,
        fields: visitCustomFields,
        frFlag: frFlag,
        params: params,
        idFrontImageBase64String: idFrontImageBase64String,
        idBackImageBase64String: idBackImageBase64String,
        askDoc: askDoc,
      });
    }
  };

  const onAgreePress = () => {
    logger.push({
      method: "User clicked Agree button on document screen.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    setSkipSigningFlag(false);
    sign.current.saveImage();
  };

  // decline NDA document
  const onDeclinePress = () => {
    logger.push({
      method: "User clicked Decline button on document screen.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    setSkipSigningFlag(true);
    onSaveEvent();
  };
  // reset digital signature
  const resetSign = () => {
    sign.current.resetImage();
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

          <View style={{ alignItems: "center" }}>
            <View
              style={{
                ...styles.docView,
                width: orientation.isPortrait ? "85%" : "75%",
                marginTop: orientation.isPortrait ? RFValue(30) : RFValue(16),
                marginBottom: orientation.isPortrait
                  ? orientation.height / 9
                  : orientation.height / 6.2,
              }}
            >
              <ScrollView
                alwaysBounceVertical={false}
                contentContainerStyle={styles.scrollviewStyle}
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

        <View
          style={{
            ...styles.bottomView,
            paddingHorizontal: orientation.isPortrait
              ? RFValue(30)
              : RFValue(50),
            flexDirection: orientation.isPortrait ? "column" : "row",
            marginTop: orientation.isPortrait ? RFValue(8) : RFValue(5),
            paddingBottom: orientation.isPortrait ? 0 : RFValue(10),
          }}
        >
          <View
            style={{
              width: orientation.isPortrait ? "100%" : "70%",
            }}
          >
            <View style={styles.buttonContainer}>
              <Text
                style={{
                  ...CommonStyle.text3,
                  color: color.boulder,
                  fontSize: RFValue(10),
                }}
              >
                {fullname},&nbsp;{date}
              </Text>
              <RNButton
                buttonTitle={strings.clear}
                buttonStyle={{
                  ...CommonStyle.button,
                  marginRight: orientation.isPortrait
                    ? RFValue(8)
                    : RFValue(10),
                }}
                btnTextStyle={{
                  ...CommonStyle.btnText2,
                  fontSize: RFValue(10),
                  color: orginfo.btnColor,
                }}
                onPress={() => resetSign()}
              />
            </View>
            <View
              style={{
                marginTop: orientation.isPortrait ? RFValue(12) : RFValue(8),
                height: orientation.isPortrait
                  ? orientation.width / 6
                  : orientation.height / 6,
                width: orientation.isPortrait ? "100%" : "99%",
                ...styles.signatureContainer,
              }}
            >
              <Text
                style={{
                  ...CommonStyle.text1,
                  color: secondaryColor,
                  letterSpacing: 0.1,
                }}
              >
                {strings.sign_here}
              </Text>
              <SignatureCapture
                ref={sign}
                onSaveEvent={onSaveEvent}
                showTitleLabel={false}
                showNativeButtons={false}
                showBorder={false}
                backgroundColor={"transparent"}
                style={{
                  position: "absolute",
                  height: orientation.isPortrait
                    ? orientation.width / 6
                    : orientation.height / 6,
                  width: "100%",
                }}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: orientation.isPortrait ? "row" : "column",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: orientation.isPortrait ? RFValue(12) : RFValue(0),
              marginTop: orientation.isPortrait ? RFValue(0) : RFValue(16),
            }}
          >
            {docSignin ? (
              <RNButton
                buttonTitle={strings.decline}
                buttonStyle={{
                  ...CommonStyle.button,
                  backgroundColor: thirdColor,
                  width: orientation.isPortrait
                    ? orientation.width / 3.4
                    : orientation.height / 3.4,
                  height: orientation.isPortrait
                    ? orientation.width / 14
                    : orientation.height / 15,
                  marginRight: orientation.isPortrait
                    ? RFValue(20)
                    : RFValue(0),
                  borderRadius: RFValue(8),
                }}
                btnTextStyle={{
                  ...CommonStyle.btnText2,
                  color: orginfo ? orginfo.btnColor : "",
                }}
                onPress={() => onDeclinePress()}
              />
            ) : null}

            <RNButton
              buttonTitle={strings.accept}
              buttonStyle={{
                ...CommonStyle.button,
                backgroundColor: orginfo ? orginfo.btnColor : "",
                width: orientation.isPortrait
                  ? orientation.width / 3.4
                  : orientation.height / 3.4,
                height: orientation.isPortrait
                  ? orientation.width / 14
                  : orientation.height / 15,
                borderRadius: RFValue(8),
                marginTop: orientation.isPortrait ? 0 : RFValue(12),
              }}
              btnTextStyle={{ ...CommonStyle.btnText2, color: color.white }}
              onPress={() => onAgreePress()}
            />
          </View>
        </View>
      </View>
    </UserInactivity>
  );
};

export default DocumentScreen;
