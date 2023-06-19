import { SafeAreaView, StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/languages.json";
import Footer from "../../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CommonStyle from "../../theme/CommonStyle";
const SigninSuccessful = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const [orginfo, setOrgInfo] = useState([]);
  useEffect(async () => {
    setOrgInfo(JSON.parse(await AsyncStorage.getItem("VisitlyStore:orginfo")));
    setTimeout(() => {
      navigation.navigate("PrinterSetup");
    }, 5000);
  }, []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.white }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image
          source={require("../../assets/icons/signin.png")}
          style={{
            height: orientation.isPortrait
              ? orientation.width / 2
              : orientation.height / 2.8,
            width: orientation.isPortrait
              ? orientation.width / 2
              : orientation.height / 3,
          }}
          resizeMode={"contain"}
        />
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

export default SigninSuccessful;
