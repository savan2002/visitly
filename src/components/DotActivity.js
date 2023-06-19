import React from "react";
import { StyleSheet, View, Modal, ActivityIndicator } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import CommonStyle from "../theme/CommonStyle";
import { DotIndicator } from "react-native-indicators";
const DotActivity = (props) => {
  const { isLoading, loadingColor, ...attributes } = props;

  return (
    <Modal transparent={true} animationType={"none"} visible={isLoading}>
      <View style={CommonStyle.modalBackground}>
        <View style={s.activityIndicatorWrapper}>
          <DotIndicator color={loadingColor} size={RFValue(6)} />
        </View>
      </View>
    </Modal>
  );
};

export default DotActivity;

const s = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "#00000040",
  },
  activityIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 60,
    width: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
  },
  activityIndicator: {
    alignItems: "center",
    height: 80,
  },
});
