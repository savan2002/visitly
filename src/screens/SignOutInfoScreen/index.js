import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CommonStyle from "../../theme/CommonStyle";
import moment from "moment";
import RNButton from "react-native-button-sample";
import properties from "../../resources/properties.json";
import styles from "./styles";
import { Dropdown } from "react-native-element-dropdown";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import CancleWithFooter from "../../components/CancleWithFooter";
import UserInactivity from "react-native-user-inactivity";
import CancleConfirmationModal from "../../components/CancleConfirmationModal";
import { LightenColor } from "../../resources/LightenColor";
import DotActivity from "../../components/DotActivity";
import { ButtonGroup } from "react-native-elements";
import analytics from "@react-native-firebase/analytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
const SignOutInfoScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  const userObject = route?.params?.userObject;
  const signoutVisitId = route?.params?.signoutVisitId;
  var [fields, setFields] = useState([]);
  const [userName, setuserName] = useState(userObject?.fullName);
  const [loading, setLoading] = useState(false);
  const [visitorSignoutFields, setVisitorSignoutFields] = useState(
    route?.params?.visitorSignoutFields
      ? route?.params?.visitorSignoutFields
      : ""
  );
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  const [startPoint, setStartPoint] = useState(0);
  const [endPoint, setEndPoint] = useState(5);
  const [totalPage, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isStartPointSet, setIsStartPointSet] = useState(true);
  const now = moment().format("YYYY-MM-DDTHH:mm:ss");
  const [date, setDate] = useState(new Date());
  var newFieldsLength;
  var mainColor = orginfo ? orginfo.btnColor : "";
  var secondaryColor, thirdColor;
  secondaryColor = LightenColor(mainColor, 55);
  thirdColor = LightenColor(mainColor, 75);
  const logger = new LogglyTracker();
  const macAddress = DeviceInfo.getUniqueIdSync();

  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
    if (visitorSignoutFields.length > 0) {
      var tempData = visitorSignoutFields.map((item) => {
        if (item.type == "RADIO") {
          const radioData = item.options.find(
            (val) => val.value == data?.value
          );
          let valueIdx = item.options.findIndex(
            (val) => val.value == radioData?.value
          );
          item.value = radioData?.value;
          item.valueIndex = valueIdx;
        } else if (item.type == "DROPDOWN") {
          const drpData = item.options.find((val) => val.value == data?.value);
          item.value = drpData?.value;
        } else if (item.type == "DATEPICKER") {
          item.value =
            item.type == "DATEPICKER" ? moment().format("DD-MMM-YYYY") : "";
        } else {
          item.value = data?.value;
        }
        return item;
      });
    }
    setFields(tempData);
    const filterItems = tempData.filter((fill) => fill.status == "ACTIVE");
    const maxItem = Math.max(filterItems.length / 5);
    const floorItem = Math.floor(filterItems.length / 5);
    const tPage = maxItem > floorItem ? floorItem + 1 : floorItem;
    if (filterItems.length > endPoint) {
      setEndPoint(startPoint + 5);
      setTotalPage(tPage === 1 ? 0 : tPage - 1);
    } else {
      setEndPoint(filterItems.length);
      setTotalPage(tPage === 1 ? 0 : tPage - 1);
    }
    setFields(filterItems);
  }, []);

  // create signout fields dynamically
  var fieldsMap = new Array();
  var data = new Array();
  newFieldsLength = fields.length;
  for (let idx = startPoint; idx < endPoint; idx++) {
    data = fields[idx];
    if (
      data?.orgCustomFieldId &&
      data?.type === "TEXT" &&
      data?.status === "ACTIVE"
    ) {
      fieldsMap.push(
        <View
          style={{
            marginTop: RFValue(8),
          }}
        >
          <Text style={[styles.titleHeading, { color: color.cod_gray }]}>
            {data?.displayText !== "" ? data?.displayText : data?.name}
            {data?.setting === "MANDATORY" ? "*" : null}
          </Text>
          <TextInput
            key={idx}
            autoCorrect={false}
            blurOnSubmit={false}
            autoCapitalize="none"
            value={visitorSignoutFields[idx].value}
            inputMode={"text"}
            onChangeText={(event) => handleChange(idx, event)}
            style={[
              styles.input,
              {
                width: orientation.isPortrait
                  ? orientation.height / 2
                  : orientation.height / 2,
                backgroundColor: "#EEEEEE",
                color: color.cod_gray,
              },
            ]}
          />
        </View>
      );
    } else if (
      data?.orgCustomFieldId &&
      data?.type === "NUMBER" &&
      data?.status === "ACTIVE"
    ) {
      fieldsMap.push(
        <View
          style={{
            marginTop: RFValue(8),
          }}
        >
          <Text style={[styles.titleHeading, { color: color.cod_gray }]}>
            {data?.displayText !== "" ? data?.displayText : data?.name}
            {data?.setting === "MANDATORY" ? "*" : null}
          </Text>
          <TextInput
            key={idx}
            value={visitorSignoutFields[idx].value}
            onChangeText={(event) => handleChange(idx, event)}
            inputMode={"numeric"}
            blurOnSubmit={false}
            autoCorrect={false}
            autoCapitalize="none"
            style={[
              styles.input,
              {
                width: orientation.isPortrait
                  ? orientation.height / 2
                  : orientation.height / 2,
                backgroundColor: "#EEEEEE",
                color: color.cod_gray,
              },
            ]}
          />
        </View>
      );
    } else if (
      data?.orgCustomFieldId &&
      data?.type === "DROPDOWN" &&
      data?.status === "ACTIVE"
    ) {
      const temp = [];
      data.options.map((val) => {
        temp.push({ label: val.label, value: val.value });
      });
      fieldsMap.push(
        <View
          style={{
            marginTop: RFValue(8),
            width: orientation.isPortrait
              ? orientation.height / 2
              : orientation.height / 2,
          }}
        >
          <Text style={[styles.titleHeading, { color: color.cod_gray }]}>
            {data?.displayText !== "" ? data.displayText : data?.name}
            {data?.setting === "MANDATORY" ? "*" : null}
          </Text>
          <Dropdown
            key={idx}
            style={[CommonStyle.dropdown, { backgroundColor: "#EEEEEE" }]}
            placeholderStyle={CommonStyle.dropdowText}
            selectedTextStyle={CommonStyle.dropdowText}
            inputSearchStyle={CommonStyle.dropdowText}
            iconStyle={CommonStyle.iconStyle}
            data={temp}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={"Select item"}
            searchPlaceholder={strings.search}
            value={fields[idx].value}
            onChange={(item) => handleChange(idx, item.value)}
          />
        </View>
      );
    } else if (
      data?.orgCustomFieldId &&
      data?.type === "RADIO" &&
      data?.status === "ACTIVE"
    ) {
      const temp = data.options.map((item) => item.label);
      fieldsMap.push(
        <View
          style={{
            marginTop: orientation.isPortrait ? RFValue(10) : 8,
            width: orientation.isPortrait
              ? orientation.height / 2
              : orientation.height / 2,
          }}
        >
          <Text style={[styles.titleHeading, { color: color.cod_gray }]}>
            {data.displayText !== "" ? data.displayText : data.name}
            {data.setting === "MANDATORY" ? "*" : null}
          </Text>
          <ButtonGroup
            key={idx}
            onPress={(event) => handleChange(idx, temp[event], event)}
            selectedIndex={fields[idx].valueIndex}
            value={fields[idx].valueIndex}
            buttons={temp}
            vertical={true}
            selectedButtonStyle={{
              backgroundColor: orginfo.btnColor,
            }}
            selectedTextStyle={CommonStyle.selectedRadioText}
            buttonStyle={CommonStyle.buttonStyle}
            innerBorderStyle={{ color: orginfo.btnColor }}
            textStyle={{
              ...CommonStyle.radioTextStyle,
              color: orginfo.btnColor,
            }}
            containerStyle={{
              ...CommonStyle.radioContainer,
              borderColor: orginfo.btnColor,
              width: orientation.isPortrait
                ? orientation.height / 2
                : orientation.height / 2,
            }}
          />
        </View>
      );
    } else if (
      data?.orgCustomFieldId &&
      data?.type === "DATEPICKER" &&
      data?.status === "ACTIVE"
    ) {
      fieldsMap.push(
        <View
          style={{
            marginTop: RFValue(8),
            width: orientation.isPortrait
              ? orientation.height / 2
              : orientation.height / 2,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={[styles.titleHeading, { color: color.cod_gray }]}>
              {data?.displayText !== "" ? data?.displayText : data?.name}
              {data?.setting === "MANDATORY" ? "*" : null}
            </Text>
          </View>
          <RNDateTimePicker
            key={idx}
            mode="date"
            value={date}
            textColor={orginfo ? orginfo.btnColor : ""}
            accentColor={color.white}
            themeVariant={"light"}
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate;
              setDate(currentDate);
              handleChange(idx, moment(selectedDate).format("DD-MM-YYYY"));
            }}
            style={{
              opacity: 0.5,
              borderRadius: 10,
              maxHeight: 80,
            }}
          />
        </View>
      );
    }
  }

  // redesign signout fields
  const handleChange = (idx, evt, evtIndex) => {
    let items = [...fields];
    let item = { ...items[idx] };
    item.value = evt;
    item.valueIndex = evtIndex;
    items[idx] = item;
    setFields(items);
  };

  // check filled data
  const checkValidation = () => {
    for (let i = startPoint; i < endPoint; i++) {
      if (
        fields[i]?.orgCustomFieldId &&
        fields[i]?.setting === "MANDATORY" &&
        fields[i]?.status === "ACTIVE" &&
        (fields[i]?.value === "" ||
          fields[i]?.value === null ||
          fields[i]?.value === undefined)
      ) {
        logger.push({
          method: fields[i]?.name + " validation fail",
          type: "ERROR",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        alert(strings.common_required);
        return false;
      }
    }
    return true;
  };

  // previous 5 fields
  const onhandlePrev = async () => {
    let df = currentPage * 5;
    setEndPoint(df);
    let de = startPoint - 5;
    setStartPoint(de);
    setCurrentPage(currentPage - 1);
  };

  // next 5 fields
  const onhandleNext = async () => {
    const isValid = await checkValidation();
    if (isValid) {
      let a = startPoint + 5;
      if (fields?.length > endPoint) {
        setStartPoint(a);
        setEndPoint(endPoint + 5);
      } else {
        setEndPoint(fields?.length);
      }
      if (totalPage > currentPage) {
        setCurrentPage(currentPage + 1);
        if (isStartPointSet) {
          let ab = startPoint + 5;
          setStartPoint(ab);
        } else {
          onFinalSubmit();
        }
      } else if (isValid == true || endPoint == fields?.length) {
        onFinalSubmit();
      }
    }
  };

  // last check
  const onFinalSubmit = async () => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "Api call for sign out visitor after validating fields.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    const signoutFields = fields?.map((item) => {
      if (item.type === "RADIO") {
        const radioData = item.options.find((val) => val.value == item?.value);
        item.value = radioData?.value;
      } else if (item.type === "DROPDOWN") {
        const drpData = item.options.find((val) => val.value == item?.value);
        item.value = drpData?.value;
      }
      return item;
    });
    await analytics().logEvent("signout_info_for_visitor", {
      screen_name: "SignOut Info Screen",
      api_url: `${url}/visits/$signoutVisitId`,
    });
    setLoading(true);
    const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
    await fetch(url + "/visits/" + signoutVisitId, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + ACtoken,
      },
      body: JSON.stringify({
        checkoutTime: now,
        visitSignoutCustomFields: signoutFields,
      }),
    }).then((response) => {
      logger.push({
        method: "Visitor signout successfully.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      logger.push({
        method: "User navigate to Sign Out Success Screen.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      setLoading(false);
      navigation.navigate("SignoutSuccess", {
        strings: strings,
        orginfo: orginfo,
        userName: userName,
      });
    });
  };

  return (
    <UserInactivity
      checkInterval={5000}
      timeForInactivity={timer}
      isActive={true}
      onAction={() => navigation.navigate("Home")}
    >
      <SafeAreaView
        style={{ ...CommonStyle.mainScreen, justifyContent: "center" }}
      >
        <DotActivity isLoading={loading} loadingColor={orginfo.btnColor} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, flexGrow: 1, opacity: 1 }}
        >
          <ScrollView
            style={{ flex: 1, height: "100%" }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{ alignItems: "center" }}
              isPortrait={orientation.isPortrait}
            >
              <View
                style={[
                  CommonStyle.container,
                  {
                    marginTop: orientation.isPortrait
                      ? RFValue(30)
                      : RFValue(20),
                    width: orientation.isPortrait ? "85%" : "90%",
                    backgroundColor: color.white,
                  },
                ]}
              >
                <View
                  style={{ alignItems: "center", marginBottom: RFValue(12) }}
                >
                  {/* <Pressable
                  onPress={onhandlePrev}
                  disabled={startPoint == 0 ? true : false}
                >
                  <AntDesign
                    name="arrowleft"
                    color={orginfo ? orginfo.btnColor : color.vampire_black}
                    size={RFValue(14)}
                    style={{ marginRight: RFValue(3) }}
                  />
                </Pressable> */}

                  <Text
                    style={{
                      fontFamily: "SFProText-Regular",
                      fontSize: RFValue(11),
                      color: orginfo ? orginfo.btnColor : color.vampire_black,
                    }}
                  >
                    {strings.enter_details}
                  </Text>

                  {/* <Pressable>
                  <Image style={{ height: RFValue(16), width: RFValue(16) }} />
                </Pressable> */}
                </View>
                <View style={{ alignItems: "center" }}>
                  <View style={CommonStyle.horizontalLine} />

                  <View
                    style={
                      orientation.isPortrait
                        ? {}
                        : {
                            alignContent: "space-between",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            flexDirection: "row",
                            width: orientation.isPortrait ? "85%" : "90%",
                          }
                    }
                  >
                    {fieldsMap}
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: orientation.isPortrait
                      ? RFValue(20)
                      : RFValue(14),
                    justifyContent: "space-evenly",
                  }}
                >
                  {newFieldsLength > 5 ? (
                    <Pressable
                      style={[
                        styles.button,
                        {
                          width: orientation.isPortrait ? "25%" : "20%",
                          paddingTop: orientation.isPortrait
                            ? RFValue(10)
                            : RFValue(8),
                          paddingBottom: orientation.isPortrait
                            ? RFValue(10)
                            : RFValue(8),
                          flexDirection: "row",
                          alignItems: "center",
                          // backgroundColor: "",
                        },
                      ]}
                      onPress={onhandlePrev}
                    >
                      <AntDesign
                        name="arrowleft"
                        color={color.vampire_black}
                        size={RFValue(16)}
                        style={{ marginRight: RFValue(3) }}
                      />
                      <Text
                        style={[
                          styles.buttonText,
                          {
                            marginLeft: RFValue(8),
                            color: orginfo
                              ? orginfo.btnColor
                              : color.vampire_black,
                          },
                        ]}
                      >
                        {strings.back}
                      </Text>
                    </Pressable>
                  ) : null}
                  <RNButton
                    buttonStyle={{
                      ...styles.button,
                      width: orientation.isPortrait ? "25%" : "20%",
                      paddingTop: orientation.isPortrait
                        ? RFValue(10)
                        : RFValue(8),
                      paddingBottom: orientation.isPortrait
                        ? RFValue(10)
                        : RFValue(8),
                      backgroundColor: orginfo.btnColor,
                    }}
                    buttonTitle={strings.setup_next}
                    btnTextStyle={{
                      ...styles.buttonText,
                      color: color.white,
                    }}
                    onPress={() => onhandleNext()}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
      </SafeAreaView>
    </UserInactivity>
  );
};

export default SignOutInfoScreen;
