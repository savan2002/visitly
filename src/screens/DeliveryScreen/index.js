import { SafeAreaView, Text, View, Image } from "react-native";
import React, { useEffect } from "react";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import Footer from "../../components/Footer";
import CommonStyle from "../../theme/CommonStyle";
import Delivery from "../../assets/svg/delivery.svg";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
const DeliveryScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
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
      method: "Delivery success screen appear.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    setTimeout(() => {
      navigation.navigate("Home");
    }, 5000);
  }, []);
  return (
    <SafeAreaView style={CommonStyle.mainScreen}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Delivery
          style={{ color: orginfo.btnColor }}
          width={RFValue(200)}
          height={RFValue(200)}
        />
        <Text style={{ ...CommonStyle.text2, fontSize: RFValue(16) }}>
          {strings.thank_you}&nbsp;{strings.for_delivery}!
        </Text>
        <Text
          style={{
            ...CommonStyle.text2,
            fontSize: RFValue(14),
            marginTop: orientation.isPortrait ? RFValue(20) : RFValue(14),
          }}
        >
          {strings.delivery_message}
        </Text>
      </View>
      <View
        style={{
          marginBottom: orientation.isPortrait ? RFValue(8) : RFValue(6),
        }}
      >
        <Footer />
      </View>
    </SafeAreaView>
  );
};

export default DeliveryScreen;
