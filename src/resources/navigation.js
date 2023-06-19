import { StatusBar } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CustomerSplashScreen from "../screens/CustomerSplashScreen";
import HomeScreen from "../screens/HomeScreen";
import SigninDevice from "../screens/SigninDevice";
import ScanLocationQRScreen from "../screens/ScanLocationQRScreen";
import LocationKeyScreen from "../screens/LocationKeyScreen";
import SetPinScreen from "../screens/SetPinScreen";
import SetupSuccessful from "../screens/SetupSuccessful";
import PrinterSetup from "../screens/PrinterSetup";
import PrivacyDocument from "../screens/PrivacyDocument";
import FaceRecognition from "../screens/FaceRecognition";
import FullNameScreen from "../screens/FullNameScreen";
import SplashScreen from "../screens/SplashScreen";
import VisitorType from "../screens/VisitorType";
import InfoScreen from "../screens/InfoScreen";
import PictureScreen from "../screens/PictureScreen";
import DocumentScreen from "../screens/DocumentScreen";
import { Provider } from "react-redux";
import store from "../services/store";
import SignOutScreen from "../screens/SignOutScreen";
import SignOutConfirmation from "../screens/SignOutConfirmation";
import SignOutSuccess from "../screens/SignOutSuccess";
import SignOutFaceRecognition from "../screens/SignOutFaceRecognition";
import DeliveryScreen from "../screens/DeliveryScreen";
import SignOutInfoScreen from "../screens/SignOutInfoScreen";
import AdminInfoScreen from "../screens/AdminInfoScreen";
import IdTypeScreen from "../screens/IdTypeScreen";
import IdCaptureScreen from "../screens/IdCaptureScreen";
import ConfirmationScreen from "../screens/ConfirmationScreen";
import RevisitConfirmation from "../screens/RevisitConfirmation";
import EmployeeScreen from "../screens/EmployeeScreen";
import EmployeeSuccess from "../screens/EmployeeSuccess";
import EmployeeConfirmation from "../screens/EmployeeConfirmation";
import EmployeeInfoScreen from "../screens/EmployeeInfoScreen";
const Stack = createNativeStackNavigator();
function AppNavigation() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar backgroundColor="#000" barStyle="dark-content" />
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Splash"
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="SigninDevice" component={SigninDevice} />
          <Stack.Screen
            name="ScanLocationQR"
            component={ScanLocationQRScreen}
          />
          <Stack.Screen name="LocationKey" component={LocationKeyScreen} />
          <Stack.Screen name="SetPin" component={SetPinScreen} />
          <Stack.Screen name="PrinterSetup" component={PrinterSetup} />
          <Stack.Screen name="Setupsuccess" component={SetupSuccessful} />
          <Stack.Screen
            name="CustomerSplash"
            component={CustomerSplashScreen}
          />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AdminInfo" component={AdminInfoScreen} />
          <Stack.Screen name="Delivery" component={DeliveryScreen} />
          <Stack.Screen name="PrivacyDocument" component={PrivacyDocument} />
          <Stack.Screen name="FaceRecognition" component={FaceRecognition} />
          <Stack.Screen name="RevisitConfirmation" component={RevisitConfirmation} />
          <Stack.Screen name="FullName" component={FullNameScreen} />
          <Stack.Screen name="VisitorType" component={VisitorType} />
          <Stack.Screen name="Info" component={InfoScreen} />
          <Stack.Screen name="Picture" component={PictureScreen} />
          <Stack.Screen name="Document" component={DocumentScreen} />
          <Stack.Screen name="IDType" component={IdTypeScreen} />
          <Stack.Screen name="IDCapture" component={IdCaptureScreen} />
          <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
          <Stack.Screen name="Employee" component={EmployeeScreen} />
          <Stack.Screen name="EmployeeConfir" component={EmployeeConfirmation} />
          <Stack.Screen name="EmployeeInfo" component={EmployeeInfoScreen} />
          <Stack.Screen name="EmployeeSuccess" component={EmployeeSuccess} />
          <Stack.Screen name="Signout" component={SignOutScreen} />
          <Stack.Screen name="SignoutFace" component={SignOutFaceRecognition} />
          <Stack.Screen name="SignoutVisitor" component={SignOutConfirmation} />
          <Stack.Screen name="SignoutInfo" component={SignOutInfoScreen} />
          <Stack.Screen name="SignoutSuccess" component={SignOutSuccess} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default AppNavigation;
