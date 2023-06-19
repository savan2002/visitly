import { API_URL, USER_INFO_API, USER_API } from "./constants";
import { getFetchData, postFetchData } from "./apiProviders";
import moment from "moment";
export const getEmployeeByPIN = async (apiURL, pin) => {
  const url = `${apiURL}/users/userinfo/${pin}`;
  const response = await getFetchData(url);
  return response;
};

export const getEmployeeByEmail = async (apiURL, email) => {
  const url = `${apiURL}/users?status=ACTIVE&q=${email}`;
  const response = await getFetchData(url);
  return response;
};

export const getEmployeeInfoById = async (apiURL, userId, siteId) => {
  const threeDaysAgo = moment().subtract(3, "days").utc().format("YYYY-MM-DD");
  const url = `${apiURL}/employeesignin?userId=${userId}&limit=1&offset=0&sort=desc&sortBy=checkinTime&q=&signinStartDate=${threeDaysAgo}&siteId=${siteId}`;
  const response = await getFetchData(url);
  return response;
};

export const patchEmployeeSignInfo = async (apiURL, payload, id) => {
  const url = `${apiURL}/employeesignin/${id}`;
  const response = await postFetchData(url, "PATCH", payload);
  return response;
};

export const postEmployeeSignInfo = async (apiURL, payload) => {
  const url = `${apiURL}/employeesignin`;
  const response = await postFetchData(url, "POST", payload);
  return response;
};
