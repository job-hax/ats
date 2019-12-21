import axios from "axios";

import {
  reCaptchaV3SiteKey,
  IS_RECAPTCHA_ENABLED
} from "../../config/config.js";
import { IS_CONSOLE_LOG_OPEN } from "../../utils/constants/constants.js";
import { apiRoot } from "../constants/endpoints.js";

const script = document.createElement("script");
script.src = `https://www.google.com/recaptcha/api.js?render=${reCaptchaV3SiteKey}`;
document.body.appendChild(script);

function reCaptchaToken(action) {
  return new Promise(resolve => {
    grecaptcha.ready(async () => {
      const token = await grecaptcha.execute(reCaptchaV3SiteKey, {
        action: action
      });
      resolve(token);
    });
  });
}

function log(url, config, response) {
  return (
    IS_CONSOLE_LOG_OPEN &&
    console.log(
      "Request : ",
      url,
      " Params : ",
      config,
      " Response : ",
      response,
      new Date()
    )
  );
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function removeAllCookies() {
  document.cookie =
    "google_access_token_expiration=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "jobhax_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "jobhax_access_token_expiration=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "jobhax_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "remember_me=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "user_type=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "signup_flow_completed=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "signup_complete_required=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "is_demo_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export async function axiosCaptcha(url, config, action) {
  let response = "before";
  config.mode = "cors";
  config.cache = "no-cache";
  if (!config.headers) {
    config.headers = {
      "Content-Type": "application/json; charset=utf-8"
    };
  }
  if (url.substring(0, apiRoot.length) === apiRoot) {
    if (url.substring(url.length - 13, url.length) != "refreshToken/") {
      config.headers.Authorization = getCookie("jobhax_access_token");
    }
  }
  if (config.method === "GET") {
    response = await axios.get(url, config).catch(error => {
      console.log(error);
    });
    log(url, config, response);
  } else {
    if (
      action != false &&
      action != undefined &&
      grecaptcha != null &&
      IS_RECAPTCHA_ENABLED === true
    ) {
      const recaptchaToken = await reCaptchaToken(action);
      if (config.body) {
        config.body["recaptcha_token"] = recaptchaToken;
        config.body["action"] = action;
      } else {
        config["body"] = { recaptcha_token: recaptchaToken };
        config.body["action"] = action;
      }
      if (url.split("api")[1] === "/users/verifyRecaptcha/") {
        response = await axios({
          method: "POST",
          url: url,
          data: JSON.stringify(config.body),
          headers: config.headers
        }).catch(error => {
          console.log(error);
        });
        log(url, config, response);
        if (response.data.error_code === 99) {
          removeAllCookies();
          window.location = "/signin?alert=reCapthcaCouldNotPassed";
        }
      }
    }
    if (url.split("api")[1] != "/users/verifyRecaptcha/") {
      response = await axios({
        method: config.method,
        url: url,
        data:
          config.headers["Content-Type"] != "multipart/form-data"
            ? JSON.stringify(config.body)
            : config.body,
        headers: config.headers
      }).catch(error => {
        console.log(error);
      });
      log(url, config, response);
    }
  }

  if (response == undefined) {
    IS_CONSOLE_LOG_OPEN &&
      console.log(
        "response undefined URL: ",
        url,
        "\nconfig: ",
        config,
        "action: ",
        action
      );
    response = { statusText: "no response received" };
    //removeAllCookies();
    //window.location = "/?alert=your-session-has-been-terminated";
  }
  if (response == "before") {
    response = {
      statusText: "request has not been sent because of internal filters"
    };
  }
  return response;
}
