import {
  Text,
  View,
  Pressable,
  ScrollView,
  LogBox,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  SafeAreaView,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { color } from "../../theme/colors";
import UseOrientation from "react-native-fast-orientation";
import { useNavigation, useRoute } from "@react-navigation/native";
import strings from "../../resources/localization";
import properties from "../../resources/properties.json";
import { RFValue } from "react-native-responsive-fontsize";
import Entypo from "react-native-vector-icons/Entypo";
import RNButton from "react-native-button-sample";
import AntDesign from "react-native-vector-icons/AntDesign";
import moment from "moment";
import { Dropdown } from "react-native-element-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./styles";
import CommonStyle from "../../theme/CommonStyle";
import CancleWithFooter from "../../components/CancleWithFooter";
import UserInactivity from "react-native-user-inactivity";
import CancleConfirmationModal from "../../components/CancleConfirmationModal";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { LightenColor } from "../../resources/LightenColor";
import { ButtonGroup } from "react-native-elements";
import { LogglyTracker } from "react-native-loggly-jslogger";
import DeviceInfo from "react-native-device-info";
LogBox.ignoreAllLogs();
const InfoScreen = () => {
  const orientation = UseOrientation();
  const navigation = useNavigation();
  const route = useRoute();
  const orginfo = route?.params?.orginfo;
  const [fullname, setFullName] = useState(
    route?.params?.faceIdInfo
      ? route?.params?.faceIdInfo.fullName
      : route?.params?.fullname
  );
  const strings = route?.params?.strings;
  const [email, setEmail] = useState(
    route?.params?.faceIdInfo?.email ? route?.params?.faceIdInfo?.email : ""
  );
  const [phone, setPhone] = useState(
    route?.params?.faceIdInfo?.phone ? route?.params?.faceIdInfo?.phone : ""
  );
  const [companyName, setCompanyName] = useState(
    route?.params?.faceIdInfo?.companyName
      ? route?.params?.faceIdInfo?.companyName
      : ""
  );
  const visitCustomFields = route?.params?.faceIdInfo?.visitCustomFields.length
    ? route?.params?.faceIdInfo?.visitCustomFields
    : "";
  const [preRegisterVisitId, setPreRegisterVisitId] = useState(
    route?.params?.preRegisterVisitId ? route?.params?.preRegisterVisitId : ""
  );
  const [host, setHost] = useState(
    route?.params?.faceIdInfo?.host ? route?.params?.faceIdInfo?.host : ""
  );
  const [findHostName, setFindHostName] = useState();
  const [hostId, setHostId] = useState(
    route?.params?.faceIdInfo?.hostId ? route?.params?.faceIdInfo?.hostId : ""
  );
  const [purpose, setPurpose] = useState(
    route?.params?.purpose ? route?.params?.purpose : ""
  );
  const fields = route?.params.fields;
  var orgTempId, docExpiryInDays;
  var [newFields, setNewFields] = useState(
    route?.params?.fields ? fields : visitCustomFields
  );
  const [timer, setTimer] = useState(300000);
  const [showCancle, setShowCancle] = useState(false);
  const [startPoint, setStartPoint] = useState(0);
  const [endPoint, setEndPoint] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [purposeJson, setPurposeJson] = useState();
  var questions = new Array();
  var data = new Array();
  const [date, setDate] = useState(new Date());
  const [isStartPointSet, setIsStartPointSet] = useState(true);
  var [askDoc, setAskDoc] = useState(false);
  const [modalWasClosed, setMOdalWasClosed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);
  const [userList, setUserList] = useState([]);
  const [picture, setPicture] = useState(
    route?.params?.frpic ? route?.params?.frpic : ""
  );
  const [autoFocus, setAutoFocus] = useState(false);
  var newFieldsLength, newparams, customFieldsObj;
  var mainColor = orginfo ? orginfo.btnColor : "";
  var secondaryColor, thirdColor;
  const logger = new LogglyTracker();
  const macAddress = DeviceInfo.getUniqueIdSync();

  secondaryColor = LightenColor(mainColor, 55);
  thirdColor = LightenColor(mainColor, 75);

  useEffect(() => {
    logger.push({
      logglyKey: "9cfdf91a-bc90-4b3e-8128-8d45492f08a3",
      sendConsoleErrors: true,
    });
    orginfo.visitorType
      .filter((type) => type.visitorType == purpose)
      .map((res) => {
        const tempData = res.fields.map((item) => {
          if (visitCustomFields.length > 0) {
            visitCustomFields.map((data) => {
              if (data.orgCustomFieldId == item.orgCustomFieldId) {
                if (item.type == "RADIO") {
                  const radioData = item.options.find(
                    (val) => val.value == data.value
                  );
                  let valueIdx = item.options.findIndex(
                    (val) => val.value == radioData?.value
                  );
                  item.value = radioData?.value;
                  item.valueIndex = valueIdx;
                } else if (item.type == "DROPDOWN") {
                  const drpData = item.options.find(
                    (val) => val.value == data.value
                  );
                  item.value = drpData?.value;
                } else {
                  item.value = data.value;
                }
              }
            });
          } else {
            if (item.type == "DATEPICKER") {
              item.value = moment(item.value).format("YYYY-MM-DDThh:mm:ss");
            } else {
              item.value = "";
            }
          }
          return item;
        });
        setNewFields(tempData);

        orginfo.visitorType
          .filter((type) => type.visitorType === purpose)
          .map(async (res) => setPurposeJson(res));

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
        setNewFields(filterItems);
      });
  }, []);

  var questions = new Array();
  var data = new Array();
  newFieldsLength = newFields.length;
  for (let idx = startPoint; idx < endPoint; idx++) {
    data = newFields[idx];
    if (data?.name === "Email" && data?.status === "ACTIVE") {
      questions.push(
        <View
          style={{
            marginTop: RFValue(8),
          }}
        >
          <Text style={[styles.titleHeading, { color: color.cod_gray }]}>
            {data.displayText !== "" ? data.displayText : data.name}
            {data?.setting === "MANDATORY" ? "*" : null}
          </Text>
          <TextInput
            key={idx}
            inputMode={"email"}
            blurOnSubmit={false}
            autoCorrect={false}
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => setEmail(text)}
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
    } else if (data?.name === "Host" && data?.status === "ACTIVE") {
      questions.push(
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
            clearTextOnFocus={true}
            value={host}
            inputMode={"text"}
            onChangeText={() => openHostModal()}
            onTouchStart={() => openHostModal()}
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
          <Modal
            animationType={"slide"}
            onShow={() => {
              this.textInput.focus();
            }}
            transparent={true}
            visible={showHostModal}
            onRequestClose={closeHostModal}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignSelf: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(100,100,100, 0.5)",
                  width: "100%",
                }}
              >
                <View
                  style={{
                    width: orientation.isPortrait
                      ? orientation.width / 1.5
                      : orientation.width / 1.4,
                    backgroundColor: "white",
                    height: "auto",
                    borderRadius: RFValue(10),
                  }}
                >
                  <View style={[CommonStyle.dialogHeader, { paddingTop: 8 }]}>
                    <Pressable>
                      <Entypo name="" size={40} color={"black"} />
                    </Pressable>

                    <Text
                      style={{
                        fontSize: RFValue(10),
                        fontFamily: "SFProText-Regular",
                        textAlign: "center",
                        color: color.cod_gray,
                      }}
                    >
                      {strings.search_host}
                    </Text>

                    <Pressable onPress={() => closeHostModal()}>
                      <Entypo
                        name="circle-with-cross"
                        size={40}
                        color={orginfo ? orginfo.btnColor : color.vampire_black}
                      />
                    </Pressable>
                  </View>
                  <View
                    style={{ alignItems: "center", marginBottom: RFValue(5) }}
                  >
                    <View style={CommonStyle.horizontalLine} />
                    <TextInput
                      key={idx}
                      ref={(input) => {
                        this.textInput = input;
                      }}
                      inputMode={"text"}
                      value={findHostName}
                      onChangeText={(name) => findHosts(name)}
                      style={[
                        styles.input,
                        {
                          width: orientation.isPortrait
                            ? orientation.height / 2.5
                            : orientation.height / 1.2,
                          backgroundColor: "#EEEEEE",
                          color: color.cod_gray,
                          marginBottom: orientation.isPortrait ? 30 : 20,
                          marginTop: orientation.isPortrait ? 30 : 20,
                        },
                      ]}
                    />
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                    >
                      {userList &&
                        userList.map((item, i) => (
                          <Pressable
                            onPress={() => onSelect(item)}
                            style={{
                              padding: RFValue(5),
                              backgroundColor: orginfo.btnColor,

                              width: orientation.isPortrait
                                ? orientation.height / 2.5
                                : orientation.height / 1.2,
                              borderRadius: RFValue(5),
                              marginBottom: RFValue(5),
                            }}
                          >
                            <Text
                              style={{
                                fontSize: RFValue(12),
                                color: color.white,
                                textAlign: "center",
                              }}
                            >
                              {item.firstName + " " + item.lastName}
                            </Text>
                          </Pressable>
                        ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      );
    } else if (data?.name === "Full Name" && data?.status === "ACTIVE") {
      questions.push(
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
            value={fullname}
            onChangeText={(text) => {
              setFullName(text);
              handleChange(idx, text);
            }}
            autoCapitalize="words"
            inputMode={"text"}
            autoCorrect={false}
            autoFocus={autoFocus}
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
    } else if (data?.name === "Phone Number" && data?.status === "ACTIVE") {
      questions.push(
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
            inputMode={"numeric"}
            blurOnSubmit={false}
            autoCorrect={false}
            autoCapitalize="none"
            value={phone}
            onChangeText={(text) => setPhone(text)}
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
    } else if (data?.name === "Company Name" && data?.status === "ACTIVE") {
      questions.push(
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
            value={companyName}
            onChangeText={(text) => setCompanyName(text)}
            autoCorrect={false}
            inputMode={"text"}
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
      data?.type === "TEXT" &&
      data?.status === "ACTIVE"
    ) {
      questions.push(
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
            value={newFields[idx].value}
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
      questions.push(
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
            value={newFields[idx].value}
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
      questions.push(
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
            value={newFields[idx].value}
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
      questions.push(
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
            selectedIndex={newFields[idx].valueIndex}
            value={newFields[idx].valueIndex}
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
      questions.push(
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

  // create new fields array with filled infomation
  const handleChange = (idx, evt, evtIndex) => {
    let items = [...newFields];
    let item = { ...items[idx] };
    item.value = evt;
    item.valueIndex = evtIndex;
    items[idx] = item;
    setNewFields(items);
  };

  // check validation of fields filled infomation
  const checkValidation = () => {
    const questionsNameMap = newFields.map((res) => ({
      name: res?.name,
      setting: res?.setting,
      status: res?.status,
    }));
    const fullNameField = questionsNameMap.filter(
      (da) => da?.name === "Full Name" && da?.setting === "MANDATORY"
    );
    const emailField = questionsNameMap.filter(
      (da) => da?.name === "Email" && da?.setting === "MANDATORY"
    );
    const hostField = questionsNameMap.filter(
      (da) => da?.name === "Host" && da?.setting === "MANDATORY"
    );
    const companyNameField = questionsNameMap.filter(
      (da) => da?.name === "Company Name" && da?.setting === "MANDATORY"
    );
    const phoneNumberField = questionsNameMap.filter(
      (da) => da?.name === "Phone Number" && da?.setting === "MANDATORY"
    );
    for (let i = startPoint; i < endPoint; i++) {
      if (
        newFields[i]?.name === "Full Name" &&
        (fullname === "" || fullname === null) &&
        fullNameField.length > 0
      ) {
        logger.push({
          method: "Full Name validation fail",
          type: "ERROR",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        alert(strings.common_required);
        return false;
      } else if (
        newFields[i]?.name === "Email" &&
        (email === "" || email === null) &&
        emailField.length > 0
      ) {
        logger.push({
          method: "Email validation fail",
          type: "ERROR",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        alert(strings.common_required);
        return false;
      } else if (
        newFields[i]?.name === "Host" &&
        (host === "" || host === null) &&
        hostField.length > 0
      ) {
        logger.push({
          method: "Host validation fail",
          type: "ERROR",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        alert(strings.common_required);
        return false;
      } else if (
        newFields[i]?.name === "Company Name" &&
        (companyName === "" || companyName === null) &&
        companyNameField.length > 0
      ) {
        logger.push({
          method: "Company Name validation fail",
          type: "ERROR",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        alert(strings.common_required);
        return false;
      } else if (
        newFields[i]?.name === "Phone Number" &&
        (phone === "" || phone === null) &&
        phoneNumberField.length > 0
      ) {
        logger.push({
          method: "Phone Number validation fail",
          type: "ERROR",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        alert(strings.common_required);
        return false;
      } else if (
        newFields[i]?.orgCustomFieldId &&
        newFields[i]?.setting === "MANDATORY" &&
        newFields[i]?.status === "ACTIVE" &&
        (newFields[i]?.value === "" || newFields[i]?.value === null)
      ) {
        logger.push({
          method: newFields[i]?.name + " validation fail",
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
      var regexpFullName = new RegExp(/^[a-zA-Z]+( [a-zA-Z]+)+$/i);
      var regexpEmail = new RegExp(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
      if (
        newFields[i]?.name === "Full Name" &&
        fullname !== "" &&
        newFields[i]?.setting == "MANDATORY" &&
        !regexpFullName.test(fullname?.trim())
      ) {
        logger.push({
          method: "Full Name is not fulfill with fullName regex",
          type: "ERROR",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        alert("Please enter your full name");
        return false;
      } else if (
        newFields[i]?.name === "Email" &&
        email !== "" &&
        newFields[i]?.setting == "MANDATORY" &&
        !regexpEmail.test(email?.trim())
      ) {
        logger.push({
          method: "Email is not fulfill with email regex",
          type: "ERROR",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        alert("Please enter a valid email address");
        return false;
      }
      return true;
    }
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
    logger.push({
      method: "Visitor clicked Next button after filled data.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    const isValid = await checkValidation();
    if (isValid) {
      let a = startPoint + 5;
      if (newFieldsLength > endPoint) {
        setStartPoint(a);
        setEndPoint(endPoint + 5);
      } else {
        setEndPoint(newFieldsLength);
      }
      if (totalPage > currentPage) {
        setCurrentPage(currentPage + 1);
        if (isStartPointSet) {
          let a = startPoint + 5;
          setStartPoint(a);
        } else {
          onSubmit();
        }
      } else if (isValid == true || endPoint == newFieldsLength) {
        onSubmit();
      }
    }
  };

  const onSubmit = async () => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    logger.push({
      method: "Visitors filled all fields are validate with our criteria.",
      type: "INFO",
      error: "",
      macAddress: macAddress,
      deviceId: orginfo.deviceId,
      siteId: orginfo.siteId,
      orgId: orginfo.orgId,
      orgName: orginfo.orgName,
    });
    customFieldsObj = [];
    newFields?.map((item) => {
      if (item.orgCustomFieldId) {
        customFieldsObj.push({
          orgCustomFieldId: item.orgCustomFieldId,
          value: item.value,
        });
      }
    });
    newparams = {
      fullname: fullname,
      email: email,
      purpose: purpose.name,
      host: host,
      phone: phone,
      hostId: hostId,
      orginfo: orginfo,
      companyName: companyName,
      visitCustomFieldModals: customFieldsObj,
      fields: newFields,
      visitorTypeId: purposeJson.id,
      purposeJson: purposeJson,
      preRegisterVisitId: preRegisterVisitId,
    };
    orginfo.visitorType
      .filter((type) => type.visitorType == route?.params?.purpose)
      .map((res) => {
        setPurpose(res);
        orgTempId = res?.orgTemplateId;
        docExpiryInDays = parseInt(res.docExpiryInDays);
      });
    if (orgTempId) {
      if (parseInt(docExpiryInDays) <= 0) {
        logger.push({
          method: "User navigate to Document Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        navigation.navigate("Document", {
          strings: strings,
          purposeJson: purposeJson,
          askDoc: true,
          orginfo: orginfo,
          fullname: fullname,
          email: email,
          host: host,
          phone: phone,
          companyName: companyName,
          picture: picture,
          hostId: hostId,
          preRegisterVisitId: preRegisterVisitId,
          visitCustomFields: customFieldsObj,
          params: newparams,
          userInfo: newparams,
        });
      } else if (orginfo.isIdCapturingEnabled) {
        logger.push({
          method: "User navigate to Id Type Screen.",
          type: "INFO",
          error: "",
          macAddress: macAddress,
          deviceId: orginfo.deviceId,
          siteId: orginfo.siteId,
          orgId: orginfo.orgId,
          orgName: orginfo.orgName,
        });
        setAskDoc(true);
        navigation.navigate("IDType", {
          strings: strings,
          fullname: fullname,
          email: email,
          purpose: purpose,
          host: host,
          phone: phone,
          purposeJson: purposeJson,
          hostId: hostId,
          orginfo: orginfo,
          companyName: companyName,
          askDoc: true,
          preRegisterVisitId: preRegisterVisitId,
          visitCustomFields: customFieldsObj,
          params: newparams,
        });
      } else {
        const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
        const payload = {
          fullName: fullname.trim(),
          email: email,
          companyName: companyName,
          phoneNumber: phone,
          hostUserId: hostId,
          visitorTypeId: purposeJson.id,
          docTemplateId: purposeJson.orgTemplateId,
          orgId: orginfo.orgId,
          siteId: orginfo.siteId,
          preRegisterVisitId: preRegisterVisitId,
          checkinMethod: "DEVICE",
        };
        fetch(url + "/visits/checkDocExpiry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + ACtoken,
          },
          body: JSON.stringify(payload),
        }).then((response) => {
          if (response.status === 200) {
            response.json().then(async (res) => {
              isDocExpired = res.isDocExpired;
              if (isDocExpired) {
                setAskDoc(false);
                logger.push({
                  method: "User navigate to Ducument Screen.",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
                navigation.navigate("Document", {
                  strings: strings,
                  purposeJson: purposeJson,
                  askDoc: askDoc,
                  orginfo: orginfo,
                  fullname: fullname,
                  email: email,
                  host: host,
                  phone: phone,
                  companyName: companyName,
                  picture: picture,
                  hostId: hostId,
                  preRegisterVisitId: preRegisterVisitId,
                  visitCustomFields: customFieldsObj,
                  params: newparams,
                  userInfo: newparams,
                });
              } else if (purposeJson.photoFlag) {
                setAskDoc(true);
                gotoPicture();
              } else if (purposeJson.isIdCapturingEnabled) {
                logger.push({
                  method: "User navigate to Id Type Screen.",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
                setAskDoc(true);
                navigation.navigate("IDType", {
                  strings: strings,
                  fullname: fullname,
                  email: email,
                  purpose: purpose,
                  host: host,
                  phone: phone,
                  purposeJson: purposeJson,
                  hostId: hostId,
                  orginfo: orginfo,
                  companyName: companyName,
                  askDoc: true,
                  preRegisterVisitId: preRegisterVisitId,
                  visitCustomFields: customFieldsObj,
                  params: newparams,
                });
              } else {
                console.log("id capture id enabled.....");
                customFieldsObj = [];
                newFields?.map((item) => {
                  if (item.orgCustomFieldId) {
                    customFieldsObj.push({
                      orgCustomFieldId: item.orgCustomFieldId,
                      value: item.value,
                    });
                  }
                });

                newparams = {
                  fullname: fullname,
                  email: email,
                  purpose: purpose.visitorType,
                  host: host,
                  phone: phone,
                  hostId: hostId,
                  orginfo: orginfo,
                  companyName: companyName,
                  visitCustomFieldModals: customFieldsObj,
                  fields: newFields,
                  purposeJson: purposeJson,
                  preRegisterVisitId: preRegisterVisitId,
                };
                logger.push({
                  method: "User navigate to Confirmation Screen.",
                  type: "INFO",
                  error: "",
                  macAddress: macAddress,
                  deviceId: orginfo.deviceId,
                  siteId: orginfo.siteId,
                  orgId: orginfo.orgId,
                  orgName: orginfo.orgName,
                });
                navigation.navigate("Confirmation", {
                  strings: strings,
                  fullname: fullname,
                  email: email,
                  purpose: purpose.name,
                  host: host,
                  phone: phone,
                  purposeJson: purposeJson,
                  hostId: hostId,
                  orginfo: orginfo,
                  companyName: companyName,
                  preRegisterVisitId: preRegisterVisitId,
                  askDoc: true,
                  params: newparams,
                });
              }
            });
          } else if (response.status == 401) {
            handleRefresh(() => {
              gotoDocScreen();
            });
          } else {
            Alert.alert(strings.error, strings.server_issue, [
              { text: strings.ok },
            ]);
          }
        });
      }
    } else if (purposeJson.isIdCapturingEnabled) {
      setAskDoc(true);
      logger.push({
        method: "User navigate to Id Type Screen.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      navigation.navigate("IDType", {
        strings: strings,
        fullname: fullname,
        email: email,
        purpose: purpose,
        host: host,
        phone: phone,
        purposeJson: purposeJson,
        hostId: hostId,
        orginfo: orginfo,
        companyName: companyName,
        askDoc: true,
        preRegisterVisitId: preRegisterVisitId,
        visitCustomFields: customFieldsObj,
        params: newparams,
      });
    } else {
      setAskDoc(true);
      gotoPicture();
    }
  };

  const gotoPicture = () => {
    var photoFlag = purposeJson.photoFlag;
    if (photoFlag == "Y" || photoFlag == true) {
      logger.push({
        method: "User navigate to Picture Screen.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      navigation.navigate("Picture", {
        strings: strings,
        fullname: fullname,
        email: email,
        host: host,
        phone: phone,
        purpose: purpose,
        companyName: companyName,
        hostId: hostId,
        askDoc: true,
        orginfo: orginfo,
        purposeJson: purposeJson,
        preRegisterVisitId: preRegisterVisitId,
        visitCustomFields: customFieldsObj,
        params: newparams,
      });
    } else {
      customFieldsObj = [];
      newFields?.map((item) => {
        if (item.orgCustomFieldId) {
          customFieldsObj.push({
            orgCustomFieldId: item.orgCustomFieldId,
            value: item.value,
          });
        }
      });

      newparams = {
        fullname: fullname,
        email: email,
        purpose: purpose.visitorType,
        host: host,
        phone: phone,
        hostId: hostId,
        orginfo: orginfo,
        companyName: companyName,
        visitCustomFieldModals: customFieldsObj,
        fields: newFields,
        purposeJson: purposeJson,
        preRegisterVisitId: preRegisterVisitId,
      };
      logger.push({
        method: "User navigate to Confirmation Screen.",
        type: "INFO",
        error: "",
        macAddress: macAddress,
        deviceId: orginfo.deviceId,
        siteId: orginfo.siteId,
        orgId: orginfo.orgId,
        orgName: orginfo.orgName,
      });
      navigation.navigate("Confirmation", {
        strings: strings,
        fullname: fullname,
        email: email,
        purpose: purpose.name,
        host: host,
        phone: phone,
        purposeJson: purposeJson,
        hostId: hostId,
        orginfo: orginfo,
        companyName: companyName,
        preRegisterVisitId: preRegisterVisitId,
        askDoc: true,
        params: newparams,
      });
    }
  };

  // open host modal
  const openHostModal = () => {
    setShowHostModal(true);
  };
  // close host modal
  const closeHostModal = () => {
    setShowHostModal(false);
  };
  const clearHostText = () => {
    setHost("");
  };

  const findHosts = (name) => {
    setFindHostName(name);
    onTyping(name);
  };
  // search host after 3 character
  const onTyping = async (text) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    var t = text;
    t = t.split(" ")[0];
    if (text.length >= 3) {
      const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
      const hostOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + ACtoken,
        },
      };
      fetch(url + "/users?status=ACTIVE&q=" + t, hostOptions)
        .then(async (response) => {
          if (response.status < 400) {
            response.json().then(async (data) => {
              const orgUsers = data.results.map(
                (host) => host.firstName + " " + host.lastName
              );
              setUserList(data.results);
            });
          } else if (response.status == 401) {
            handleRefresh(() => onTyping(text));
          } else if (response.status >= 400 && response.status < 500) {
            Alert.alert(strings.error, strings.OrgSetup_invalid, [
              { text: strings.ok },
            ]);
          } else {
            Alert.alert(strings.oops, strings.server_issue, [
              { text: strings.ok },
            ]);
          }
        })
        .catch((error) => {
          // console.log(error);
        });
    } else {
      setUserList([]);
    }
  };

  // when accesstoken expired
  const handleRefresh = async (func) => {
    const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
    await AsyncStorage.getItem("VisitlyStore:refreshToken")
      .then((refreshToken) => {
        if (refreshToken == null && refreshToken == "") {
          Alert.alert(strings.error, strings.session_timeout, [
            {
              text: strings.ok,
              onPress: async () => {
                await AsyncStorage.setItem(
                  "VisitlyStore:refreshToken",
                  ""
                ).then(() => navigation.navigate("SigninDevice"));
              },
            },
          ]);
          return;
        }
        fetch(url + "/development/v1/devices/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            refreshToken: refreshToken,
          }),
        }).then(async (response) => {
          if (response.status == 401) {
            Alert.alert(strings.error, strings.session_timeout, [
              {
                text: strings.ok,
                onPress: async () => {
                  await AsyncStorage.setItem(
                    "VisitlyStore:refreshToken",
                    ""
                  ).then(() => navigation.navigate("SigninDevice"));
                },
              },
            ]);
          } else {
            response.json().then(async (data) => {
              await AsyncStorage.setItem(
                "VisitlyStore:accessToken",
                data.accessToken
              );
              if (func) {
                func();
              } else {
                Alert.alert(strings.error, strings.session_timeout, [
                  {
                    text: strings.ok,
                    onPress: async () => {
                      await AsyncStorage.setItem(
                        "VisitlyStore:refreshToken",
                        ""
                      ).then(() => navigation.navigate("SigninDevice"));
                    },
                  },
                ]);
              }
            });
          }
        });
      })
      .catch((error) => {
        Alert.alert(strings.error, strings.session_timeout, [
          {
            text: strings.ok,
            onPress: async () => {
              await AsyncStorage.setItem("VisitlyStore:refreshToken", "").then(
                () => navigation.navigate("SigninDevice")
              );
            },
          },
        ]);
      });
  };

  // select host from list of employee
  const onSelect = (user) => {
    const fullname = user.firstName + " " + user.lastName;
    const hostId = user.id;
    setHost(fullname);
    setHostId(hostId);
    setShowHostModal(false);
  };

  const onChange = (value) => {
    setHost("");
  };

  return (
    <UserInactivity
      checkInterval={5000}
      timeForInactivity={timer}
      isActive={true}
      onAction={() => navigation.navigate("Home")}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: color.white }}>
        <View style={{ flex: 1, backgroundColor: color.white }}>
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
                      {questions}
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
                        disabled={startPoint == 0 ? true : false}
                        onPress={onhandlePrev}
                      >
                        <AntDesign
                          name="arrowleft"
                          color={orginfo.btnColor}
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
      </SafeAreaView>
    </UserInactivity>
  );
};

export default InfoScreen;
