import { Text, View, Pressable, ScrollView, LogBox } from "react-native";
import React, { useEffect, useState } from "react";
import { color } from "../../theme/colors";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import { RFValue } from "react-native-responsive-fontsize";
import Entypo from "react-native-vector-icons/Entypo";
import CancleWithFooter from "../../components/CancleWithFooter";
import CustomButton from "../../components/CustomButton";
import CommonStyle from "../../theme/CommonStyle";
import UserInactivity from "react-native-user-inactivity";
import CancleConfirmationModal from "../../components/CancleConfirmationModal";
import { LightenColor } from "../../resources/LightenColor";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
LogBox.ignoreAllLogs();
const VisitorType = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  const picture = route?.params?.picture ? route?.params?.picture : "";
  const fullname = route?.params?.faceIdInfo
    ? route?.params?.faceIdInfo.fullName
    : "";
  const email = route?.params?.faceIdInfo
    ? route?.params?.faceIdInfo.email
    : "";
  const host = route?.params?.faceIdInfo ? route?.params?.faceIdInfo.host : "";
  const companyName = route?.params?.faceIdInfo
    ? route?.params?.faceIdInfo.companyName
    : "";
  const phone = route?.params?.faceIdInfo
    ? route?.params?.faceIdInfo.phone
    : "";
  const hostId = route?.params?.faceIdInfo
    ? route?.params?.faceIdInfo.hostId
    : "";
  const preRegisterVisitId = route?.params?.preRegisterVisitId
    ? route?.params?.preRegisterVisitId
    : "";
  const visitCustomFields =
    route?.params?.faceIdInfo &&
    route?.params?.faceIdInfo?.visitCustomFields?.length
      ? route?.params?.faceIdInfo.visitCustomFields
      : "";
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  var mainColor = orginfo ? orginfo.btnColor : "";
  var secondaryColor, thirdColor;
  secondaryColor = LightenColor(mainColor, 55);
  thirdColor = LightenColor(mainColor, 75);
  const macAddress = DeviceInfo.getUniqueIdSync();
  const logger = new LogglyTracker();

  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
  }, []);

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
              ...CommonStyle.btnText2,
              fontSize: RFValue(13),
              color: color.tundora,
              textAlign: "center",
              marginTop: orientation.isPortrait ? RFValue(40) : RFValue(30),
              marginBottom: orientation.isPortrait ? RFValue(20) : RFValue(14),
            }}
          >
            {strings.plz_purpose}
          </Text>
          <ScrollView
            style={{ flex: 1, height: "100%" }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                alignItems: "center",
              }}
            >
              {orginfo.visitorType.map((item, index) => (
                <CustomButton
                  key={index}
                  action={() => {
                    logger.push({
                      method:
                        "User clicked on " + item.visitorType + " as a visitor type for sign in.",
                      type: "INFO",
                      error: "",
                      macAddress: macAddress,
                      deviceId: orginfo.deviceId,
                      siteId: orginfo.siteId,
                      orgId: orginfo.orgId,
                      orgName: orginfo.orgName,
                    });
                    navigation.navigate("Info", {
                      strings: strings,
                      fields: item.fields,
                      orginfo: orginfo,
                      purpose: item.description,
                      fullname: fullname,
                      docId: item.orgTemplateId,
                      picture: picture,
                      frpic: picture,
                      preRegisterVisitId: preRegisterVisitId,
                      faceIdInfo: {
                        fullName: fullname,
                        email: email,
                        companyName: companyName,
                        phone: phone,
                        host: host,
                        hostId: hostId,
                        visitCustomFields: visitCustomFields
                          ? visitCustomFields
                          : [],
                      },
                    });
                  }}
                  borderColor={secondaryColor}
                  btnBGColor={thirdColor}
                  btnText={item.visitorType}
                  btnTextColor={color.cod_gray}
                  iconColor={orginfo.btnColor}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        <CancleWithFooter
          strings={strings}
          onCancle={() => setShowCancle(true)}
          BGColor={color.white}
        />
        <CancleConfirmationModal
          strings={strings}
          isVisible={showCancle}
          primaryColor={orginfo.btnColor}
          secondaryColor={secondaryColor}
          onClose={() => setShowCancle(false)}
        />
      </View>
    </UserInactivity>
  );
};

export default VisitorType;
