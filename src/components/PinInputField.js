import React, { useRef, useState, useEffect } from "react";
import { TextInput, View, StyleSheet, Pressable, Text } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { color } from "../theme/colors";
import UseOrientation from "react-native-fast-orientation";
const PinInputField = ({ setPinReady, pin, setPin, maxLength, AllBorder, focusKeyboard }) => {
  const textInputRef = useRef(null);
  const [inputIsFocused, setInputIsFocused] = useState(false);
  const pinDigitsArray = new Array(maxLength).fill(0);
  const orientation = UseOrientation();
  const pinRef = useRef();
  const handleOnBlur = () => {

    setInputIsFocused(false);
  };
  useEffect(() => {
    setPinReady(pin.length === maxLength);
    return () => setPinReady(false);
  }, [pin]);

  const handleOnPress = () => {
    setInputIsFocused(true);
    textInputRef?.current?.focus();
  };
  const securePassword = (value) => {
    return value && value?.replace(/./g, '\u25CF');
  };

  const toPinDigitInput = (_value, index) => {
    const dd = pin[index];
    const emptyInputChar = " ";
    const digit = securePassword(dd) || emptyInputChar;

    return (
      <View
        key={index}
        style={
          AllBorder
            ? [
                styles.pinInputFocused,
                {
                  width: orientation.isPortrait ? "16%" : "13%",
                  height: orientation.isPortrait
                    ? orientation.width / 12
                    : orientation.height / 13,
                },
              ]
            : [
                styles.pinInput,
                {
                  width: orientation.isPortrait ? "16%" : "13%",
                  height: orientation.isPortrait
                    ? orientation.width / 12
                    : orientation.height / 13,
                },
              ]
        }
      >
        <Text style={styles.pinInputText}>{digit}</Text>
      </View>
    );
  };

  return (
    <View>
      <Pressable onPress={handleOnPress} style={styles.pinInputsContainer}>
        {pinDigitsArray.map(toPinDigitInput)}
      </Pressable>
      <TextInput
        ref={textInputRef}
        value={pin}
        onChangeText={setPin}
        autoFocus={focusKeyboard}
        onSubmitEditing={handleOnBlur}
        keyboardType="number-pad"
        returnKeyType="done"
        textContentType="oneTimePin"
        maxLength={maxLength}
        secureTextEntry={true}
        style={styles.hiddenTextInput}
      />
    </View>
  );
};

export default PinInputField;

const styles = StyleSheet.create({
  pinInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  hiddenTextInput: {
    opacity: 0,
  },
  pinInputText: {
    fontSize: RFValue(14),
    fontWeight: "bold",
    textAlign: "center",
    color: color.black,
  },
  pinInputFocused: {
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
  },
  pinInput: {
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: color.white,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    shadowOffset: { width: 0, height: 1 },
  },
});
