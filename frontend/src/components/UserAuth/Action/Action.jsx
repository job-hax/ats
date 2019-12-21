import React from "react";
import { Redirect } from "react-router-dom";

import { axiosCaptcha } from "../../../utils/api/fetch_api";
import Spinner from "../../Partials/Spinner/Spinner.jsx";
import ChangePassword from "../ChangePassword/ChangePassword.jsx";
import { IS_CONSOLE_LOG_OPEN } from "../../../utils/constants/constants";
import { USERS } from "../../../utils/constants/endpoints";

class Action extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: "",
      code: ""
    };
  }
  componentDidMount() {
    let params = window.location.search.split("&");
    if (params.length < 2) {
      this.setState({ redirect: "/home" });
    } else {
      if (params[0].split("=")[1] == "redirect") {
        this.setState({
          redirect: window.location.search.split("redirect&")[1]
        });
      } else {
        IS_CONSOLE_LOG_OPEN && console.log();
        const action = params[0].split("=")[1];
        const code = params[1].split("=")[1];
        this.setState({ code: code });
        IS_CONSOLE_LOG_OPEN &&
          console.log("action : ", action, "\ncode : ", code);
        let config = { method: "GET" };
        axiosCaptcha(USERS(action) + "?code=" + code, config).then(response => {
          if (response.statusText === "OK") {
            if (response.data.success === true) {
              if (action === "activate") {
                this.setState({ redirect: "/signin" });
                this.props.alert(
                  5000,
                  "success",
                  "Your account has activated successfully. You can sign in now!"
                );
              } else if (action === "validateForgotPassword") {
                this.setState({ redirect: "validateForgotPassword" });
              }
            } else {
              this.props.alert(5000, "error", "Something went wrong!");
              this.setState({ redirect: "/home" });
            }
          } else {
            this.props.alert(5000, "error", "Something went wrong!");
          }
        });
      }
    }
  }
  render() {
    if (this.state.redirect === "") {
      return <Spinner message="Loading..." />;
    } else if (this.state.redirect === "validateForgotPassword") {
      return <ChangePassword code={this.state.code} alert={this.props.alert} />;
    } else {
      return <Redirect to={this.state.redirect} />;
    }
  }
}

export default Action;
