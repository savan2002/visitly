import AsyncStorage from "@react-native-async-storage/async-storage";
import { InterCepter_URL } from ".";

export const getDeviceData = async(url, options) => {
  let results = [];   
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  };
  const response = await fetch(url, config);
  if (response.status < 400) {
    results = response.json();
  }
  return results;
}

export const InterCepter = async () => {
  const refreshToken = await AsyncStorage.getItem("VisitlyStore:refreshToken");
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken: refreshToken }),
  };
  const response = await fetch(InterCepter_URL, config);
  const data = await response.json();
  if (data) {
    await AsyncStorage.setItem(
      "VisitlyStore:accessToken",
      `Bearer ` + data.accessToken
    );
  }
};
