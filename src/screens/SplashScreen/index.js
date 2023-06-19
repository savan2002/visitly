import React, { useState, useEffect } from "react";
import { View, Image } from "react-native";
import ErrorModal from "../../components/ErrorModal";
import strings from "../../resources/localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import properties from "../../resources/properties.json";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
import crashlytics from "@react-native-firebase/crashlytics";
const SplashScreen = ({ navigation }) => {
  const [animating, setAnimating] = useState(true);
  const [errModal, setErrModal] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const logger = new LogglyTracker();
  const macAddress = DeviceInfo.getUniqueIdSync();
  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      getData();
    });

    return unsubscribe;
  }, [navigation]);

  const getData = async () => {
    const RCtoken = await AsyncStorage.getItem("VisitlyStore:refreshToken");
    if (RCtoken) {
      logger.push({
        logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
        sendConsoleErrors: true,
      });
      fetchData(RCtoken);
    } else {
      setTimeout(() => {
        setAnimating(false);
        navigation.navigate("SigninDevice");
      }, 1000);
    }
  };

  const fetchData = async (RCtoken) => {
    if (RCtoken !== null && RCtoken !== "") {
      const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
      let appUrl;
      if (url) {
        appUrl = url;
      } else {
        appUrl = properties.prodUrl;
      }
      crashlytics().log("Api call to update accessToken");
      fetch(appUrl + "/devices/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          refreshToken: RCtoken,
        }),
      }).then((response) => {
        if (response?.status !== 200) {
          navigation.navigate("SigninDevice");
        } else {
          response.json().then(async (data) => {
            logger.push({
              method: "Api call successful to update accessToken.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
            });
            crashlytics().log("Api call successful to update accessToken");
            await AsyncStorage.setItem(
              "VisitlyStore:accessToken",
              data.accessToken
            );
            var orgOptions = {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.accessToken}`,
              },
            };
            fetch(`${appUrl}/devices/orgconfig`, orgOptions).then(
              async (response) => {
                if (response?.status < 400) {
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
                    crashlytics().log(
                      "Api call successful to get org config data"
                    );
                    await AsyncStorage.setItem(
                      "VisitlyStore:orginfo",
                      JSON.stringify(orgdata)
                    );
                    var currentDateTime = new Date();
                    await AsyncStorage.setItem(
                      "VisitlyStore:lastOrgUpdate",
                      currentDateTime.toString()
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
                    fetch(`${appUrl}/devices/${orgdata.deviceId}`, orgOptions)
                      .then((response) => response.json())
                      .then(async (devOrg) => {
                        logger.push({
                          method:
                            "Api call successful to get device org config data.",
                          type: "INFO",
                          error: "",
                          macAddress: macAddress,
                          deviceId: orgdata.deviceId,
                          siteId: orgdata.siteId,
                          orgId: orgdata.orgId,
                          orgName: orgdata.orgName,
                        });
                        crashlytics().log(
                          "Api call successful to get device org config data"
                        );
                        await AsyncStorage.setItem("VisitlyStore:apiUrl", appUrl);
                        navigation.navigate("Home", {
                          orginfo: orgdata,
                          deviceOrginfo: devOrg,
                        });
                      })
                      .catch((error) => {
                        logger.push({
                          method:
                            "Api request fail to get device org config data.",
                          type: "ERROR",
                          error: error,
                          macAddress: macAddress,
                          apiUrl: appUrl + "/devices/orgconfig",
                          apiMethod: "GET",
                        });
                        crashlytics().log(
                          "Api request fail to get org config data"
                        );
                      });
                  });
                } else if (response.status >= 400 && response.status < 500) {
                  logger.push({
                    method: "Api request fail to get org config data.",
                    type: "ERROR",
                    error: strings.org_fail,
                    macAddress: macAddress,
                    apiUrl: appUrl + "/devices/orgconfig",
                    apiMethod: "GET",
                    apiResStatus: response.status,
                  });
                  crashlytics().log("Api request fail to get org config data");
                  setErrModal(true);
                  setErrMsg(strings.org_fail);
                  setTimeout(() => {
                    setErrModal(false);
                  }, 5000);
                } else {
                  logger.push({
                    method: "Api request fail to get org config data.",
                    type: "ERROR",
                    error: strings.org_fail,
                    macAddress: macAddress,
                    apiUrl: appUrl + "/devices/orgconfig",
                    apiMethod: "GET",
                    apiResStatus: response.status,
                  });
                  crashlytics().log("Api request fail to get org config data");
                  setErrModal(true);
                  setErrMsg(strings.OrgSetup_bitoftime);
                  setTimeout(() => {
                    setErrModal(false);
                  }, 5000);
                }
              }
            );
          });
        }
      });
    } else {
      navigation.navigate("SigninDevice");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ErrorModal
        strings={strings}
        isVisible={errModal}
        onPress={() => setErrModal(false)}
        errText={errMsg}
      />
      <Image
        source={require("../../assets/icons/Splash.png")}
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
};

export default SplashScreen;
