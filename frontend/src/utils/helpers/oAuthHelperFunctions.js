import axios from "axios";
import { linkedInClientId, linkedInClientSecret } from "../../config/config.js";
import { IS_CONSOLE_LOG_OPEN } from "../constants/constants.js";

export function linkedInOAuth() {
  let url =
    "https://www.linkedin.com/oauth/v2/authorization" +
    "?response_type=code" +
    "&client_id=" +
    linkedInClientId +
    "&redirect_uri=https://jobhax.com/action-linkedin-oauth2" +
    "&scope=" +
    "r_emailaddress%20" +
    "r_liteprofile%20";
  window.open(url);
}

export async function linkedInAccessTokenRequester(authCode) {
  IS_CONSOLE_LOG_OPEN &&
    console.log("access code will be requested with", authCode);
  response = await axios({
    method: "POST",
    url: "https://www.linkedin.com/oauth/v2/accessToken",
    data: {
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: "https://jobhax.com/action-linkedin-oauth2",
      client_id: linkedInClientId,
      client_secret: linkedInClientSecret
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  }).catch(error => {
    IS_CONSOLE_LOG_OPEN && console.log(error);
  });
  IS_CONSOLE_LOG_OPEN && console.log("linkedInOAuth response", response);
}
