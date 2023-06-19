import { SafeAreaView, StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import Footer from "../../components/Footer";
import CommonStyle from "../../theme/CommonStyle";
import VisitorSignout from "../../assets/svg/visitorSignout.svg";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
const SignOutSuccess = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const userName = route?.params?.userName;
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;

  const logger = new LogglyTracker();
  const macAddress = DeviceInfo.getUniqueIdSync();
  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
    logger.push({
      method: "Visitor signout confirmation screen appear.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
  }, []);

  useEffect(async () => {
    setTimeout(() => {
      navigation.navigate("Home");
    }, 5000);
  }, []);

  return (
    <SafeAreaView style={CommonStyle.mainScreen}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <VisitorSignout
          style={{ color: orginfo.btnColor }}
          width={RFValue(200)}
          height={RFValue(200)}
        />
        <Text style={{ ...CommonStyle.text2, fontSize: RFValue(18) }}>
          {strings.thank_visit}&nbsp;{userName}!
        </Text>
        <Text
          style={{
            ...CommonStyle.text2,
            fontSize: RFValue(12),
            marginTop: orientation.isPortrait ? RFValue(20) : RFValue(14),
          }}
        >
          {strings.thank_for_visit_continue}&nbsp;
          <Text style={{ fontWeight: "700", textTransform: "lowercase" }}>
            {strings.signedOut}.
          </Text>
        </Text>
      </View>
      <View
        style={{
          marginBottom: orientation.isPortrait ? RFValue(5) : RFValue(8),
        }}
      >
        <Footer />
      </View>
    </SafeAreaView>
  );
};

export default SignOutSuccess;
