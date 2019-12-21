import React from "react";
import { Redirect } from "react-router-dom";

import { axiosCaptcha } from "../../../utils/api/fetch_api";
import Spinner from "../../Partials/Spinner/Spinner.jsx";
import ChangePassword from "../ChangePassword/ChangePassword.jsx";
import { IS_CONSOLE_LOG_OPEN } from "../../../utils/constants/constants";
import { jobHaxClientId, jobHaxClientSecret } from "../../../config/config";
import { USERS } from "../../../utils/constants/endpoints";

class LinkedInOAuthAction extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: "",
      code: ""
    };
  }

  async componentDidMount() {
    let params = window.location.search.split("&");
    IS_CONSOLE_LOG_OPEN && console.log("params", params);
    if (params.length < 2) {
      let param = params[0];
      if (param.substring(0, 6) === "?code=") {
        let authCode = param.split("code=")[1];
        IS_CONSOLE_LOG_OPEN && console.log("authCode", authCode);
        let config = { method: "POST" };
        config.body = {
          client_id: jobHaxClientId,
          client_secret: jobHaxClientSecret,
          provider: "linkedin-oauth2"
        };
        config.body.token = authCode;
        await axiosCaptcha(USERS("linkSocialAccount"), config).then(
          response => {
            if (response.statusText === "OK") {
              IS_CONSOLE_LOG_OPEN && console.log(response);
            }
          }
        );
        this.setState({ code: authCode, redirect: "signup" });
        window.close();
      } else {
        this.setState({ redirect: "home" });
      }
    } else {
      const error = params[0].split("=")[1];
      const description = params[1].split("=")[1];
      IS_CONSOLE_LOG_OPEN &&
        console.log("error", error, "\ndescription", description);
      this.setState({ redirect: "profile" });
      this.props.alert(5000, "error", description);
    }
  }
  render() {
    if (this.state.redirect === "home") {
      return <Redirect to="/home" />;
    } else if (this.state.redirect === "validateForgotPassword") {
      return <ChangePassword code={this.state.code} alert={this.props.alert} />;
    } else if (this.state.redirect === "signin") {
      return <Redirect to="/signin" />;
    } else if (this.state.redirect === "signup") {
      return <Redirect to="/signup?linkedin=synced" />;
    } else if (this.state.redirect === "profile") {
      return <Redirect to="/profile" />;
    } else if (this.state.redirect === "back") {
      return window.history.back();
    }
    return <Spinner message="Loading..." />;
  }
}

export default LinkedInOAuthAction;
