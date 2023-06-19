import { SafeAreaView, Text, View, LogBox } from "react-native";
import React, { useState, useEffect } from "react";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import Footer from "../../components/Footer";
import RNButton from "react-native-button-sample";
import RNPrint from "react-native-print";
import AsyncStorage from "@react-native-async-storage/async-storage";
import properties from "../../resources/properties.json";
import DotActivity from "../../components/DotActivity";
import CommonStyle from "../../theme/CommonStyle";
import PrinterIcon from "../../assets/svg/printer.svg";
import crashlytics from "@react-native-firebase/crashlytics";
import PrinterSuccessModal from "../../components/PrinterSuccessModal";
import analytics from "@react-native-firebase/analytics";
import DeviceInfo from "react-native-device-info";
import { LogglyTracker } from "react-native-loggly-jslogger";
LogBox.ignoreAllLogs();
const PrinterSetup = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPrinterMsg, setShowPrinterMsg] = useState(false);
  const route = useRoute();
  const macAddress = DeviceInfo.getUniqueIdSync();
  const logger = new LogglyTracker();
  const strings = route?.params?.strings;

  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
  }, []);

  const selectPrinter = async (evt) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    const orgInfo = JSON.parse(
      await AsyncStorage.getItem("VisitlyStore:orginfo")
    );
    logger.push({
      method:
        "User clicked select printer button for device link with printer.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orgInfo.deviceId,
      siteId: orgInfo.siteId,
      orgId: orgInfo.orgId,
      orgName: orgInfo.orgName,
    });
    crashlytics().log("User clicked select printer button for device link with printer");
    const selectedPrinterData = await RNPrint.selectPrinter({
      x: evt.pageX,
      y: evt.pageY,
    });
    await AsyncStorage.setItem(
      "VisitlyStore:printerUrl",
      selectedPrinterData.url
    );
    await AsyncStorage.setItem(
      "VisitlyStore:printername",
      selectedPrinterData.name
    );
    setSelectedPrinter(selectedPrinterData);
    setLoading(true);
    const accessToken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    await analytics().logEvent("PrinterSetup", {
      screen_name: "Printer_Screen",
      api_url: `${url}/devices/${orgInfo.deviceId}`,
    });
    const printRaw = JSON.stringify({
      printerModel: `${selectedPrinterData.name}`,
      printerURL: `${selectedPrinterData.url}`,
    });
    var printOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: printRaw,
      redirect: "follow",
    };
    fetch(url + "/devices/" + orgInfo.deviceId, printOptions)
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
        fetch(`${url}/devices/${orgInfo.deviceId}`, orgOptions)
          .then((response) => response.json())
          .then(async (orgdata) => {
            await AsyncStorage.setItem(
              "VisitlyStore:deviceorginfo",
              JSON.stringify(orgdata)
            );
            logger.push({
              method: "Api call successful to link pritner with device.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orgInfo.deviceId,
              siteId: orgInfo.siteId,
              orgId: orgInfo.orgId,
              orgName: orgInfo.orgName,
            });
            logger.push({
              method: "User navigate to Home Screen.",
              type: "INFO",
              error: "",
              macAddress: macAddress,
              deviceId: orgInfo.deviceId,
              siteId: orgInfo.siteId,
              orgId: orgInfo.orgId,
              orgName: orgInfo.orgName,
            }); 
            setShowPrinterMsg(true);
            setLoading(false);
            setTimeout(() => {
              setShowPrinterMsg(false);
              navigation.navigate("Home", {
                orginfo: orgInfo,
              });
            }, 3000);
          })
          .catch((error) => {
            logger.push({
              method: "Api request fail to get Device Org Config data.",
              type: "ERROR",
              error: error.message,
              macAddress: macAddress,
              apiUrl: url + "/devices/" + orgInfo.deviceId,
              apiMethod: "GET",
              deviceId: orgInfo.deviceId,
              siteId: orgInfo.siteId,
              orgId: orgInfo.orgId,
              orgName: orgInfo.orgName,
            });
          });
      })
      .catch((err) => {
        logger.push({
          method: "Printer Setup api call failur",
          type: "ERROR",
          error: err.message,
          macAddress: macAddress,
          PutData: printRaw,
          apiUrl: url + "/devices/" + orgInfo.deviceId,
          apiMethod: "PUT",
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        setLoading(false);
      });
  };

  const handleDone = async () => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    const orgInfo = JSON.parse(
      await AsyncStorage.getItem("VisitlyStore:orginfo")
    );
    logger.push({
      method: "User clicked `do it later` button for skip printer setup",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orgInfo.deviceId,
      siteId: orgInfo.siteId,
      orgId: orgInfo.orgId,
      orgName: orgInfo.orgName,
    });
    const accessToken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    setLoading(true);
    var orgOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      redirect: "follow",
    };
    fetch(`${url}/devices/${orgInfo.deviceId}`, orgOptions)
      .then((response) => response.json())
      .then(async (orgdata) => {
        logger.push({
          method: "Api call successful to get Device Org Config data.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        logger.push({
          method: "User navigate to Home Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        }); 
        setLoading(false);
        navigation.navigate("Home", {
          orginfo: orgInfo,
          deviceOrginfo: orgdata,
        });
        crashlytics().log("Api call successful to get Device Org Config data");
      })
      .catch((error) => {
        logger.push({
          method: "Api request fail to get Device Org Config data.",
          type: "ERROR",
          error: error.message,
          macAddress: macAddress,
          apiUrl: url + "/devices/" + orgInfo.deviceId,
          apiMethod: "GET",
          deviceId: orgInfo.deviceId,
          siteId: orgInfo.siteId,
          orgId: orgInfo.orgId,
          orgName: orgInfo.orgName,
        });
        crashlytics().log("Api request fail to get Device Org Config data");
      });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.white }}>
      <DotActivity loadingColor={color.royal_blue} isLoading={loading} />
      <View style={{ flex: 1 }}>
        <View
          elevation={5}
          style={{
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 1,
            shadowOffset: { width: 0, height: 1 },
            backgroundColor: color.white,
            borderBottomLeftRadius: RFValue(10),
            borderBottomRightRadius: RFValue(10),
          }}
        >
          <PrinterIcon
            height={
              orientation.isPortrait
                ? orientation.width / 2
                : orientation.height / 3
            }
            width={
              orientation.isPortrait
                ? orientation.width / 2
                : orientation.height / 3
            }
            style={{
              marginTop: orientation.isPortrait ? RFValue(50) : RFValue(20),
              marginBottom: orientation.isPortrait ? RFValue(50) : RFValue(20),
            }}
          />
        </View>
        <Text
          style={{
            ...CommonStyle.text3,
            color: color.black,
            textAlign: "center",
            marginTop: orientation.isPortrait ? RFValue(40) : RFValue(20),
          }}
        >
          {strings.printer_text}
        </Text>
        <View style={{ alignItems: "center" }}>
          <RNButton
            buttonTitle={strings.select_a_printer}
            buttonStyle={{
              ...CommonStyle.button,
              backgroundColor: color.royal_blue,
              width: orientation.isPortrait
                ? orientation.width / 3
                : orientation.height / 3,
              height: orientation.isPortrait
                ? orientation.width * 0.1
                : orientation.height * 0.08,
              marginTop: orientation.isPortrait ? RFValue(30) : RFValue(20),
            }}
            btnTextStyle={{ ...CommonStyle.btnText2, color: color.white }}
            onPress={(e) => selectPrinter(e.nativeEvent)}
          />
          <PrinterSuccessModal
            strings={strings}
            isVisible={showPrinterMsg}
            primaryColor={color.royal_blue}
            onPress={() => setShowPrinterMsg(false)}
          />
          <RNButton
            buttonTitle={strings.do_it_later}
            buttonStyle={{
              ...CommonStyle.button,
              backgroundColor: "",
              width: orientation.isPortrait
                ? orientation.width / 3
                : orientation.height / 3,
              height: orientation.isPortrait
                ? orientation.width * 0.1
                : orientation.height * 0.08,
              marginTop: orientation.isPortrait ? RFValue(30) : RFValue(20),
            }}
            btnTextStyle={{ ...CommonStyle.btnText2, color: color.royal_blue }}
            onPress={() => handleDone()}
          />
        </View>
      </View>
      <View
        style={{
          marginBottom: orientation.isPortrait ? RFValue(16) : RFValue(12),
        }}
      >
        <Footer />
      </View>
    </SafeAreaView>
  );
};

export default PrinterSetup;
