import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { RFValue } from "react-native-responsive-fontsize";
import { color } from "../../theme/colors";
import UseOrientation from "react-native-fast-orientation";
import DotActivity from "../../components/DotActivity";
import strings from "../../resources/localization";
import { useNavigation, useRoute } from "@react-navigation/native";
import properties from "../../resources/properties.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import RNPrint from "react-native-print";
import Footer from "../../components/Footer";
import VisitorSignin from "../../assets/svg/visitorSignin.svg";
import crashlytics from "@react-native-firebase/crashlytics";
import analytics from "@react-native-firebase/analytics";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
import { logstring } from "../../resources/loggerstrings";
const ConfirmationScreen = () => {
  const route = useRoute();
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const params = route?.params?.params;
  const strings = route?.params?.strings;
  const fullname = route?.params?.fullname;
  const skipSigningFlag = route?.params?.skipSigningFlag;
  const picture = route?.params?.picture;
  const IDType = route?.params?.IDType;
  const signature = route?.params?.signature;
  const purposeJson = route?.params?.purposeJson;
  const orginfo = route?.params?.orginfo;
  const idFrontImageBase64String = route?.params?.idFrontImageBase64String;
  const idBackImageBase64String = route?.params?.idBackImageBase64String;
  var intervalId;
  var customFieldsObj = [];
  const [visitorApproved, setVisitorApproved] = useState(false);
  const [isStatusApproved, setISStatusApproved] = useState(false);
  const [isStatusReview, setISStatusReview] = useState(false);
  const welcomeMsg = purposeJson.welcomeMessage;
  const watchlistMsg = purposeJson.watchListHitMsg;
  const logger = new LogglyTracker();
  const macAddress = DeviceInfo.getUniqueIdSync();

  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
    handleFetchData();
  }, []);

  // final api of new visitor
  const handleFetchData = async () => {
    setLoading(true);
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    crashlytics().log("Api call for sign in new visitor");
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    logger.push({
      method: "Api call for sign in new visitor.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    var now = moment().format("YYYY-MM-DDTHH:mm:ss");

    if (params.fields) {
      params.fields.forEach((item) => {
        if (item?.orgCustomFieldId) {
          let custtype;
          if (item?.type == "RADIO") {
            const index = parseInt(item?.value);
            custtype = item.options[index]?.value;
          } else {
            custtype = item?.value;
          }
          customFieldsObj.push({
            orgCustomFieldId: item?.orgCustomFieldId,
            value: item?.value,
          });
        }
      });
    }
    const visitOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + ACtoken,
        Accept: "application/json",
      },
      redirect: "follow",
      body: JSON.stringify({
        fullName: params.fullname,
        email: params.email,
        companyName: params.companyName,
        phoneNumber: params.phone,
        hostUserId: params.hostId,
        visitorTypeId: purposeJson.id,
        idFrontImageBase64String: idFrontImageBase64String,
        idBackImageBase64String: idBackImageBase64String,
        idType: IDType,
        checkInTime: now,
        orgId: orginfo.orgId,
        siteId: orginfo.siteId,
        docTemplateId: purposeJson.orgTemplateId,
        docSignatureImage: signature ? signature : "",
        skipSigningFlag: skipSigningFlag ? skipSigningFlag : "",
        visitPhotoImage: picture ? picture : "",
        deviceId: orginfo.deviceId,
        checkinMethod: "DEVICE",
        scheduledCheckInTime: "",
        preRegisterVisitId: params.preRegisterVisitId
          ? params.preRegisterVisitId
          : "",
        visitCustomFieldModels: customFieldsObj ? customFieldsObj : null,
      }),
    };
    fetch(url + "/visits", visitOptions).then(async (response) => {
      if (response.status < 400 || response.status == 500) {
        response.json().then(async (res) => {
          setVisitorApproved(true);
          if (res && res.visitStatus == "IN_REVIEW") {
            logger.push({
              method: "Visitor created successfully, status is in review.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            crashlytics().log(
              "Visitor created successfully, status is in review"
            );
            setLoading(false);
            setISStatusReview(true);
            intervalId = setTimeout(() => {
              logger.push({
                method: "User navigate to Home Screen.",
                type: "INFO",
                error: "",
                macAddress: macAddress,
                deviceId: orginfo.deviceId,
                siteId: orginfo.siteId,
                orgId: orginfo.orgId,
                orgName: orginfo.orgName,
              });
              clearTimeout(intervalId);
              navigation.navigate("Home");
            }, 5000);
          } else {
            logger.push({
              method: "Visitor created successfully, status is approved",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            crashlytics().log(
              "Visitor created successfully, status is approved"
            );
            setLoading(false);
            setISStatusApproved(true);
            intervalId = setTimeout(() => {
              clearTimeout(intervalId);
              if (
                purposeJson.printBadgeFlag == true &&
                purposeJson.printBadgeFlag != null
              ) {
                slientPrinter(res.id);
              } else {
                logger.push({
                  method: "User navigate to Home Screen.",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
                navigation.navigate("Home");
              }
            }, 5000);
          }
        });
      } else if (response.status == 200) {
        setLoading(false);
        setVisitorApproved(true);
      } else if (response.status == 401) {
        logger.push({
          method: "Api request fail for Visitor sign in.",
          type: "ERROR",
          error: logstring.accessToken_error,
          macAddress: macAddress,
          apiUrl: url + "/visits",
          apiMethod: "POST",
          apiResStatus: response.status,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log("Api request fail for Visitor sign in.");
        setLoading(false);
        handleRefresh(() => handleFetchData());
      } else if (response.status >= 400 && response.status < 500) {
        logger.push({
          method: "Api request fail for Visitor sign in.",
          type: "ERROR",
          error: response,
          macAddress: macAddress,
          apiUrl: url + "/visits",
          apiMethod: "POST",
          apiResStatus: response.status,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log("Api request fail for Visitor sign in.");
        setLoading(false);
        intervalId = setTimeout(() => {
          logger.push({
            method: "User navigate to Home Screen.",
            type: "INFO",
            error: "",
            macAddress: macAddress,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
          clearTimeout(intervalId);
          navigation.navigate("Home", { orginfo: orginfo });
        }, 3000);
      }
    });
  };

  // setup printer
  const slientPrinter = async (visitId) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    const printUrl = await AsyncStorage.getItem("VisitlyStore:printerUrl");
    if (printUrl) {
      var orgOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACtoken}`,
        },
        redirect: "follow",
      };
      fetch(url + "/badgehtml/" + visitId, orgOptions)
        .then((response) => response.json())
        .then(async (result) => {
          const badgeContent = await fetch(result[0].badgePdfS3Url).then(
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
            printerURL: printUrl,
            filePath: results.filePath,
          }).catch((err) => {
            logger.push({
              method: "Print badge for device sign in",
              PriterUrl: printUrl,
              type: "ERROR",
              error: err.message,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
          });
          logger.push({
            method: "Print badge for device sign in successful.",
            PriterUrl: printUrl,
            type: "INFO",
            error: "",
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
        })
        .catch(async (err) => {
          logger.push({
            method: "Print badge for device sign in",
            PriterUrl: printUrl,
            type: "ERROR",
            error: err.message,
            deviceId: orginfo.deviceId,
            siteId: orginfo.siteId,
            orgId: orginfo.orgId,
            orgName: orginfo.orgName,
          });
        })
        .finally(() => {
          intervalId = setTimeout(() => {
            logger.push({
              method: "User navigate to Home Screen.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orginfo.deviceId,
              siteId: orginfo.siteId,
              orgId: orginfo.orgId,
              orgName: orginfo.orgName,
            });
            clearTimeout(intervalId);
            navigation.navigate("Home");
          }, 3000);
        });
    } else {
      logger.push({
        method: "Printer URL not found for device sign in.",
        PriterUrl: printUrl,
        type: "ERROR",
        error: "printer url not found...",
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      intervalId = setTimeout(() => {
        logger.push({
          method: "User navigate to Home Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        clearTimeout(intervalId);
        navigation.navigate("Home");
      }, 3000);
    }
  };

  const handleRefresh = async (func) => {
    setLoading(true);
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    await AsyncStorage.getItem("VisitlyStore:refreshToken")
      .then((refreshToken) => {
        if (refreshToken == null && refreshToken == "") {
          setLoading(false);
          Alert.alert(strings.error, strings.session_timeout, [
            {
              text: strings.ok,
              onPress: async () => {
                await AsyncStorage.setItem(
                  "VisitlyStore:refreshToken",
                  ""
                ).then(() => navigation.navigate("SigninDevice"));
              },
            },
          ]);
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
            Alert.alert(strings.error, strings.session_timeout, [
              {
                text: strings.ok,
                onPress: async () => {
                  await AsyncStorage.setItem(
                    "VisitlyStore:refreshToken",
                    ""
                  ).then(() => navigation.navigate("SigninDevice"));
                },
              },
            ]);
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
                Alert.alert(strings.error, strings.session_timeout, [
                  {
                    text: strings.ok,
                    onPress: async () => {
                      await AsyncStorage.setItem(
                        "VisitlyStore:refreshToken",
                        ""
                      ).then(() => navigation.navigate("SigninDevice"));
                    },
                  },
                ]);
              }
            });
          }
        });
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert(strings.error, strings.session_timeout, [
          {
            text: strings.ok,
            onPress: async () => {
              await AsyncStorage.setItem("VisitlyStore:refreshToken", "").then(
                () => navigation.navigate("SigninDevice")
              );
            },
          },
        ]);
      });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: orginfo ? color.white : "" }}
    >
      <View style={{ flex: 1 }}>
        <DotActivity isLoading={loading} loadingColor={orginfo.btnColor} />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          isPortrait={orientation.isPortrait}
        >
          {visitorApproved ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: color.white,
              }}
            >
              <VisitorSignin
                style={{ color: orginfo.btnColor }}
                width={RFValue(200)}
                height={RFValue(200)}
              />
              <Text
                style={[
                  styles.Maintext,
                  {
                    marginTop: orientation.isPortrait
                      ? RFValue(10)
                      : RFValue(8),
                  },
                ]}
              >
                {isStatusReview
                  ? `${strings.visitor_review}${fullname}`
                  : `${strings.thank_visiting}${fullname}!`}
              </Text>
              <Text
                style={[
                  styles.msgText,
                  {
                    marginTop: orientation.isPortrait
                      ? RFValue(10)
                      : RFValue(8),
                    maxWidth: orientation.isPortrait ? "80%" : "90%",
                  },
                ]}
              >
                {isStatusApproved ? welcomeMsg : watchlistMsg}
              </Text>
            </View>
          ) : (
            <View />
          )}
        </View>
      </View>
      <Footer />
    </SafeAreaView>
  );
};

export default ConfirmationScreen;

const styles = StyleSheet.create({
  Maintext: {
    fontFamily: "SFProText-Regular",
    fontSize: RFValue(16),
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 0.6,
    color: color.cod_gray,
  },
  msgText: {
    color: "#333F54",
    fontFamily: "SFProText-Regular",
    fontSize: RFValue(14),
    textAlign: "center",
    letterSpacing: 0.6,
    color: color.cod_gray,
  },
});
