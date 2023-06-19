import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ORG_CONFIG_URL } from "../constants";

export const orginfo = createAsyncThunk("orgConfig", async () => {
  var data = null;
  const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
  const config = {
    method: "GET",
    headers: {
      Authorization: "Bearer " + ACtoken,
      "Content-Type": "application/json",
    },
  };
  // console.log(config, "------>orginfo data payload");
  // console.log(ORG_CONFIG_URL, "---- orginfo url");
  await fetch(ORG_CONFIG_URL, config).then((response) =>
    response.json().then(async (result) => {
      data = result;
      // console.log(data, "---------");
      await AsyncStorage.setItem(
        "VisitlyStore:orginfo",
        JSON.stringify(result)
      );
    })
  );
  // console.log(data, "---------");
  return data;
});

const initialState = {
  orgInforesults: [],
  isLoading: false,
  error: null,
};

const orginfoSlice = createSlice({
  name: "orginfo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(orginfo.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      // console.log(state, "---------- extra reducer log pending");
    });

    builder.addCase(orginfo.fulfilled, (state, action) => {
      state.isLoading = false;
      state.orgInforesults = action.payload;
      // console.log(state, "---------- extra reducer log fulfilled");
    });

    builder.addCase(orginfo.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error;
      // console.log(state, "---------- extra reducer log rejected");
    });
  },
});

export default orginfoSlice.reducer;
