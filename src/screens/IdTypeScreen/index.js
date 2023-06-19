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
const IdTypeScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  const IDtype = [
    { id: 1, name: `${strings.DL}`, type: `${strings.send_dl}` },
    { id: 2, name: `${strings.passport}`, type: `${strings.send_passport}` },
    { id: 3, name: `${strings.state_id}`, type: `${strings.send_stateid}` },
    { id: 4, name: `${strings.other}`, type: `${strings.send_other}` },
  ];
  const purpose = route?.params?.purpose;
  const fullname = route?.params?.fullname;
  const email = route?.params?.email;
  const phone = route?.params?.phone;
  const host = route?.params?.host;
  const companyName = route?.params?.companyName;
  const purposeJson = route?.params?.purposeJson;
  const picture = route?.params?.picture;
  const signature = route?.params?.signature;
  const skipSigningFlag = route?.params?.skipSigningFlag;
  const documentName = route?.params?.documentName;
  const hostId = route?.params?.hostId;
  const preRegisterVisitId = route?.params?.preRegisterVisitId;
  const fields = route?.params?.fields;
  const askDoc = route?.params?.askDoc;
  const params = route?.params?.params;
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  var mainColor = orginfo ? orginfo.btnColor : "";
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
            {strings.select_idType}
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
              {IDtype.map((item, index) => (
                <CustomButton
                  key={index}
                  action={() => {
                    logger.push({
                      method:
                        "User select " +
                        item.name +
                        " as a id proof for new visitor sign in.",
                      type: "INFO",
                      error: "",
                      macAddress: macAddress,
                      deviceId: orginfo.deviceId,
                      siteId: orginfo.siteId,
                      orgId: orginfo.orgId,
                      orgName: orginfo.orgName,
                    });
                    logger.push({
                      method: "User navigate to Id Capture Screen.",
                      type: "INFO",
                      error: "",
                      macAddress: macAddress,
                      deviceId: orginfo.deviceId,
                      siteId: orginfo.siteId,
                      orgId: orginfo.orgId,
                      orgName: orginfo.orgName,
                    });
                    if (
                      item.type == `${strings.send_other}` ||
                      item.type == `${strings.send_passport}`
                    ) {
                      navigation.navigate("IDCapture", {
                        strings: strings,
                        IDType: item.type,
                        Idname: item.name,
                        fullname: fullname,
                        email: email,
                        host: host,
                        phone: phone,
                        companyName: companyName,
                        hostId: hostId,
                        orginfo: orginfo,
                        purpose: purpose,
                        skipSigningFlag: skipSigningFlag,
                        documentName: documentName,
                        preRegisterVisitId: preRegisterVisitId,
                        purposeJson: purposeJson,
                        signature: signature,
                        fields: fields,
                        askDoc: askDoc,
                        params: params,
                        frontOnly: true,
                        picture: picture,
                      });
                    } else {
                      navigation.navigate("IDCapture", {
                        strings: strings,
                        IDType: item.type,
                        Idname: item.name,
                        fullname: fullname,
                        email: email,
                        host: host,
                        phone: phone,
                        companyName: companyName,
                        hostId: hostId,
                        orginfo: orginfo,
                        purpose: purpose,
                        skipSigningFlag: skipSigningFlag,
                        documentName: documentName,
                        preRegisterVisitId: preRegisterVisitId,
                        purposeJson: purposeJson,
                        signature: signature,
                        fields: fields,
                        askDoc: askDoc,
                        params: params,
                        picture: picture,
                        frontOnly: false,
                      });
                    }
                  }}
                  borderColor={secondaryColor}
                  btnBGColor={thirdColor}
                  btnText={item.name}
                  btnTextColor={color.cod_gray}
                  iconColor={orginfo ? orginfo.btnColor : color.silver}
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

export default IdTypeScreen;
