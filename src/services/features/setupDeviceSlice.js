import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SETUP_NEW_DEVICE_URL } from "../constants";
import DeviceInfo from "react-native-device-info";
const deviceName = DeviceInfo.getDeviceNameSync();
const deviceId = DeviceInfo.getDeviceId();
const ipAddress = DeviceInfo.getIpAddressSync();
const macAddress = DeviceInfo.getUniqueIdSync();
const osversion =
  DeviceInfo.getSystemName() + " " + DeviceInfo.getSystemVersion();

export const setupDevice = createAsyncThunk("setupdevice", async (data) => {
  var results = [];
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deviceName: deviceName,
      deviceType: deviceId,
      ipAddress: ipAddress,
      macAddress: macAddress,
      osversion: osversion,
      siteKey: `${data}`,
    }),
  };
  // console.log(config, "------> data payload");
  // console.log(SETUP_NEW_DEVICE_URL, "----url");

  const response = await fetch(SETUP_NEW_DEVICE_URL, config);
  if (response.status === 200) {
    results = response.json();
  } else {
    results = response;
  }
  // console.log(results, "-------------result log main set");
  return results;
});

const initialState = {
  results: [],
  isLoading: false,
  error: null,
};

const setupDeviceSlice = createSlice({
  name: "setup",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setupDevice.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      // console.log(state, "---------- extra reducer log pending");
    });

    builder.addCase(setupDevice.fulfilled, (state, action) => {
      state.isLoading = false;
      state.results = action.payload;
      // console.log(state, "---------- extra reducer log fulfilled");
    });

    builder.addCase(setupDevice.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error;
      // console.log(state.error, "---------- extra reducer log rejected");
    });
  },
});

export default setupDeviceSlice.reducer;
