import { ImageBackground, LogBox, View, Image, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import RNButton from "react-native-button-sample";
import UseOrientation from "react-native-fast-orientation";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import { useNavigation, useRoute } from "@react-navigation/native";
import CommonStyle from "../../theme/CommonStyle";
import strings from "../../resources/localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
LogBox.ignoreAllLogs();
const CustomerSplashScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const [orginfo, setOrgInfo] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      setOrgInfo(
        JSON.parse(await AsyncStorage.getItem("VisitlyStore:orginfo"))
      );
    };
    fetchData();
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <Pressable
        onPress={() => navigation.navigate("Home")}
        style={{ flex: 1, alignItems: "center" }}
      >
        <ImageBackground
          source={{ uri: orginfo ? orginfo.bgImgURI : "" }}
          resizeMode="cover"
          style={{
            height: orientation.height,
            width: orientation.width,
            alignItems: "center",
          }}
        >
          <View
            style={{
              flex: 1,
              marginTop: orientation.isPortrait
                ? orientation.width / 3
                : orientation.height / 6,
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: orginfo ? orginfo.logoURI : "" }}
              style={{ height: RFValue(100), width: RFValue(160) }}
              resizeMode={"contain"}
            />
          </View>
          <RNButton
            buttonStyle={{
              ...CommonStyle.button,
              paddingTop: RFValue(12),
              paddingBottom: RFValue(12),
              borderRadius: RFValue(8),
              width: orientation.isPortrait
                ? orientation.width / 4
                : orientation.width / 5,
              marginBottom: orientation.isPortrait ? RFValue(60) : RFValue(60),
              ...CommonStyle.shadow,
              backgroundColor: color.white,
            }}
            buttonTitle={strings.tap_start}
            btnTextStyle={{
              fontSize: RFValue(14),
              fontWeight: "400",
              fontFamily: "SFProText-Regular",
              color: orginfo ? orginfo.btnColor : color.bright_Turquoise,
              letterSpacing: 0.6,
            }}
            onPress={() => navigation.goBack()}
          />
        </ImageBackground>
      </Pressable>
    </View>
  );
};

export default CustomerSplashScreen;
