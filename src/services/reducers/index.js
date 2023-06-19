import { combineReducers } from "redux";
import orgInfoSlice from "../features/orgInfoSlice";
import setupDeviceSlice from "../features/setupDeviceSlice";

const appReducer = combineReducers({
  setupNewDevice: setupDeviceSlice,
  orgInfo: orgInfoSlice
});

export default appReducer;
