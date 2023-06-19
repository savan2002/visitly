import { SafeAreaView, StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import Footer from "../../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CommonStyle from "../../theme/CommonStyle";
import SetupIcon from "../../assets/svg/setup.svg";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
const SetupSuccessful = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const strings = route?.params?.strings;
  const [orginfo, setOrgInfo] = useState([]);
  const logger = new LogglyTracker();
  const macAddress = DeviceInfo.getUniqueIdSync();
  useEffect(async () => {
    setOrgInfo(JSON.parse(await AsyncStorage.getItem("VisitlyStore:orginfo")));
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
    logger.push({
      method: "Device setup success screen appear.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
  }, []);

  useEffect(() => {
    setTimeout(() => {
      logger.push({
        method: "User navigate to Printer Setup Screen.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
      }); 
      navigation.navigate("PrinterSetup", { strings: strings });
    }, 5000);
  }, []);
  return (
    <SafeAreaView style={CommonStyle.mainScreen}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View
          style={{
            marginTop: orientation.isPortrait ? RFValue(50) : RFValue(20),
            marginBottom: orientation.isPortrait ? RFValue(50) : RFValue(20),
          }}
        >
          <SetupIcon
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
        </View>
        <Text style={{ ...CommonStyle.text2, fontSize: RFValue(16) }}>
          {strings.setup_successful}
        </Text>
        <Text
          style={{
            ...CommonStyle.text2,
            fontSize: RFValue(16),
            color: color.royal_blue,
            marginTop: orientation.isPortrait ? RFValue(20) : RFValue(14),
          }}
        >
          {orginfo?.siteName}
        </Text>
      </View>
      <View
        style={{
          marginBottom: orientation.isPortrait ? RFValue(20) : RFValue(16),
        }}
      >
        <Footer />
      </View>
    </SafeAreaView>
  );
};

export default SetupSuccessful;
