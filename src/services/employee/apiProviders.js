import { API_URL } from "./constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const postFetchData = async (url, methodtype, options) => {
  let results = [];
  const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");

  const response = await fetch(url, {
    method: methodtype,
    headers: new Headers({
      Authorization: "Bearer " + ACtoken,
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(options),
  });
  if (response.status === 401 || response.status === 403) {
    interceptor();
  } else {
    results = response.json();
  }
  return results;
};

export const getFetchData = async (url, methodtype = "GET") => {
  const ACtoken = await AsyncStorage.getItem("VisitlyStore:accessToken");
  let results = [];
  const response = await fetch(url, {
    method: methodtype,
    headers: new Headers({
      Authorization: "Bearer " + ACtoken,
      "Content-Type": "application/json",
    }),
  });

  if (response.status === 401 || response.status === 403) {
    interceptor();
  } else {
    results = response.json();
  }
  return results;
};

const interceptor = async () => {
  const url = await AsyncStorage.getItem("VisitlyStore:apiUrl");
  const refreshToken = await AsyncStorage.getItem("VisitlyStore:refreshToken");
  const response = await fetch(`${url}/devices/token`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ refreshToken: refreshToken }),
  });
  const data = await response.json();
  if (data) {
    await AsyncStorage.setItem(
      "@VisitlyStore:accessToken",
      `Bearer ` + data.accessToken
    );
  }
};
