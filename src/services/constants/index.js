import properties from "../../resources/properties.json";

export const API_URL = (endPoint) => properties.Url + endPoint;
export const InterCepter_URL = API_URL("/devices/token");
export const SETUP_NEW_DEVICE_URL = API_URL("/devices/setup");
export const ORG_CONFIG_URL = API_URL("/devices/orgconfig");
