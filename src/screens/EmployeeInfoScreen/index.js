import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { color } from "../../theme/colors";
import { RFValue } from "react-native-responsive-fontsize";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import CommonStyle from "../../theme/CommonStyle";
import moment from "moment";
import RNButton from "react-native-button-sample";
import styles from "./styles";
import { Dropdown } from "react-native-element-dropdown";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import CancleWithFooter from "../../components/CancleWithFooter";
import UserInactivity from "react-native-user-inactivity";
import CancleConfirmationModal from "../../components/CancleConfirmationModal";
import { LightenColor } from "../../resources/LightenColor";
import { postEmployeeSignInfo } from "../../services/employee/employee.service";
import DotActivity from "../../components/DotActivity";
import { ButtonGroup } from "react-native-elements";
import analytics from "@react-native-firebase/analytics";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
import AsyncStorage from "@react-native-async-storage/async-storage";
import crashlytics from "@react-native-firebase/crashlytics";
const EmployeeInfoScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const orginfo = route?.params?.orginfo;
  const strings = route?.params?.strings;
  const userinfo = route?.params?.userinfo;
  var [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visitorSignoutFields, setVisitorSignoutFields] = useState(
    route?.params?.visitorSignoutFields
      ? route?.params?.visitorSignoutFields
      : ""
  );
  const isSignIn = route?.params?.isSignIn;
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  const [startPoint, setStartPoint] = useState(0);
  const [endPoint, setEndPoint] = useState(5);
  const [totalPage, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [date, setDate] = useState(new Date());
  const now = moment().format("YYYY-MM-DDTHH:mm:ss");
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
    if (
      orginfo.employeeSigninConfigModel &&
      orginfo.employeeSigninConfigModel.fields.length > 0
    ) {
      orginfo.employeeSigninConfigModel.fields.map((data) => {
        if (data.type == "DATEPICKER") {
          data.value = moment().format("DD-MMM-YYYY");
        } else {
          data.value = "";
        }
      });
      setFields(orginfo.employeeSigninConfigModel.fields);
    }
  }, []);

  // create signout fields dynamically
  var fieldsMap = [];
  var field = [];
  for (let idx = 0; idx < fields.length; idx++) {
    field = fields[idx];
    if (
      field?.orgCustomFieldId &&
      field?.type === "TEXT" &&
      field?.status === "ACTIVE"
    ) {
      fieldsMap.push(
        <View
          style={{
            marginTop: RFValue(8),
          }}
        >
          <Text style={[styles.titleHeading, { color: color.cod_gray }]}>
            {field?.displayText !== "" ? field?.displayText : field?.name}
            {field?.setting === "MANDATORY" ? "*" : null}
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
      field?.orgCustomFieldId &&
      field?.type === "NUMBER" &&
      field?.status === "ACTIVE"
    ) {
      fieldsMap.push(
        <View
          style={{
            marginTop: RFValue(8),
          }}
        >
          <Text style={[styles.titleHeading, { color: color.cod_gray }]}>
            {field?.displayText !== "" ? field?.displayText : field?.name}
            {field?.setting === "MANDATORY" ? "*" : null}
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
      field?.orgCustomFieldId &&
      field?.type === "DROPDOWN" &&
      field?.status === "ACTIVE"
    ) {
      const temp = [];
      field.options.map((val) => {
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
            {field?.displayText !== "" ? field.displayText : field?.name}
            {field?.setting === "MANDATORY" ? "*" : null}
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
      field?.orgCustomFieldId &&
      field?.type === "RADIO" &&
      field?.status === "ACTIVE"
    ) {
      const temp = field.options.map((item) => item.label);
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
            {field.displayText !== "" ? field.displayText : field.name}
            {field.setting === "MANDATORY" ? "*" : null}
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
      field?.orgCustomFieldId &&
      field?.type === "DATEPICKER" &&
      field?.status === "ACTIVE"
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
              {field?.displayText !== "" ? field?.displayText : data?.name}
              {field?.setting === "MANDATORY" ? "*" : null}
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
    for (let i = 0; i < fields.length; i++) {
      if (
        fields[i].orgCustomFieldId &&
        fields[i].setting == "MANDATORY" &&
        fields[i].status == "ACTIVE" &&
        (fields[i].value == "" || fields[i].value == null)
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

  // // previous 5 fields
  // const onhandlePrev = async () => {
  //   let df = currentPage * 5;
  //   setEndPoint(df);
  //   let de = startPoint - 5;
  //   setStartPoint(de);
  //   setCurrentPage(currentPage - 1);
  // };

  // // next 5 fields
  // const onhandleNext = async () => {
  //   const isValid = await checkValidation();
  //   if (isValid) {
  //     let a = startPoint + 5;
  //     if (newFieldsLength > endPoint) {
  //       setStartPoint(a);
  //       setEndPoint(endPoint + 5);
  //     } else {
  //       setEndPoint(newFieldsLength);
  //     }
  //     if (totalPage > currentPage) {
  //       setCurrentPage(currentPage + 1);
  //       if (isStartPointSet) {
  //         let a = startPoint + 5;
  //         setStartPoint(a);
  //       } else {
  //         onFinalSubmit();
  //       }
  //     } else if (isValid == true || endPoint == newFieldsLength) {
  //       onFinalSubmit();
  //     }
  //   }
  // };

  // last api post filed data
  const onContinueSubmit = async () => {
    logger.push({
      method: "Employee clicked Next button after filled data.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    // const {userinfo, orginfo} = checkData;
    const isValid = await checkValidation();
    const currentDateTime = moment().format("YYYY-MM-DDTHH:mm:ss");

    if (isValid) {
      if (fields.length > 0) {
        fields.map((item) => {
          if (item?.type == "RADIO") {
            const radioData = item.options.find(
              (val) => val.value == item?.value
            );
            item.value = radioData?.value;
          } else if (item.type == "DROPDOWN") {
            const drpData = item.options.find(
              (val) => val.value == item?.value
            );
            item.value = drpData?.value;
          } else {
            item.value = item?.value;
          }
        });
      }

      setLoading(true);
      const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
      const payload = {
        siteId: orginfo.siteId,
        checkinTime: currentDateTime,
        userId: userinfo.id,
        employeeSigninConfigId: orginfo.employeeSigninConfigModel.id,
        employeeSigninLogCustomFieldModels: fields,
        checkinMethod: "DEVICE",
      };
      await analytics().logEvent("employee_info", {
        screen_name: "Employee Info Screen",
        api_url: `${url}/employeesignin`,
      });
      const response = await postEmployeeSignInfo(url, payload);
      if (response) {
        logger.push({
          method: "Api call successful to employee sign in.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        logger.push({
          method: "User navigate to Employee Sign In Success Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        crashlytics().log("Api call successful to employee sign in");
        setLoading(false);
        navigation.navigate("EmployeeSuccess", {
          strings: strings,
          orginfo: orginfo,
          userinfo: userinfo,
          isSignIn: isSignIn,
          userName: `${userinfo.firstName} ${userinfo.lastName}`,
          allowSigninFlag: true,
          signInOut: false,
        });
      }
      setLoading(false);
    }
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
                  {/* {newFieldsLength > 5 ? (
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
                  ) : null} */}
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
                    onPress={() => onContinueSubmit()}
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

export default EmployeeInfoScreen;
