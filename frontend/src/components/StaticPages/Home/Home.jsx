import React, { Component } from "react";
import Footer from "../../Partials/Footer/Footer.jsx";
import { Redirect } from "react-router-dom";

import { apiRoot } from "../../../utils/constants/endpoints.js";
import { axiosCaptcha } from "../../../utils/api/fetch_api.js";
import { IS_CONSOLE_LOG_OPEN } from "../../../utils/constants/constants.js";
import { jobHaxClientId, jobHaxClientSecret } from "../../../config/config.js";
import { Button } from "antd";

import "./style.scss";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: null
    };

    this.handleDemo = this.handleDemo.bind(this);
    this.generateSignupButton = this.generateSignupButton.bind(this);
  }

  handleDemo() {
    const setStateAsync = state => {
      return new Promise(resolve => {
        this.setState(state, resolve);
      });
    };
    IS_CONSOLE_LOG_OPEN && console.log("handle demo first");
    let rememberMe = false;
    let config = { method: "POST" };
    config.body = {
      client_id: jobHaxClientId,
      client_secret: jobHaxClientSecret
    };
    axiosCaptcha(apiRoot + "/api/demo/", config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success === true) {
          this.token = `${
            response.data.data.token_type
          } ${response.data.data.access_token.trim()}`;
          IS_CONSOLE_LOG_OPEN && console.log(this.token);
          this.refresh_token = response.data.data.refresh_token;
          let date = new Date();
          date.setSeconds(date.getSeconds() + response.data.data.expires_in);
          this.expires_in = date;
          this.props.cookie("set", "remember_me", rememberMe, "/");
          this.props.cookie(
            "set",
            "user_type",
            response.data.data.user_type,
            "/"
          );
          this.props.cookie(
            "set",
            "signup_flow_completed",
            response.data.data.signup_flow_completed,
            "/"
          );
          this.props.cookie(
            "set",
            "jobhax_access_token",
            this.token,
            "/",
            date
          );
          this.props.cookie(
            "set",
            "jobhax_access_token_expiration",
            date.getTime(),
            "/"
          );
          this.props.cookie(
            "set",
            "jobhax_refresh_token",
            this.refresh_token,
            "/"
          );
          this.props.cookie("set", "is_demo_user", true, "/");
          setStateAsync({ redirect: "/" });
          this.props.passStatesToApp("isUserLoggedIn", true);
          this.props.passStatesToApp("isAuthenticationChecking", false);
        } else {
          this.props.alert(
            5000,
            "error",
            "Error: " + response.data.error_message
          );
        }
      } else {
        this.props.alert(5000, "error", "Something went wrong!");
      }
    });
  }

  generateSignupButton() {
    let redirect =
      window.location.pathname === "/alumni" ? "alumni-signup" : "/signup";
    return (
      <Button
        type="primary"
        size="large"
        onClick={() => this.setState({ redirect: redirect })}
      >
        Sign up for free
      </Button>
    );
  }

  generateInteriorItem(imageLink, header, body) {
    return (
      <section className="interior_area">
        <div className="row">
          <img src={imageLink} alt="" />
          <div className="text-group">
            <h4>{header}</h4>
            <p className="small-text">{body}</p>
            {this.generateSignupButton()}
          </div>
        </div>
      </section>
    );
  }

  generateInteriorItemFlipLR(imageLink, header, body) {
    return (
      <section className="interior_area">
        <div className="row flipLR">
          <div className="text-group">
            <h4>{header}</h4>
            <p className="small-text">{body}</p>
            {this.generateSignupButton()}
          </div>
          <img src={imageLink} alt="" />
        </div>
      </section>
    );
  }

  generateHomePageFirstItem() {
    return (
      <div className="homepage-first-item">
        <div className="content-big-container">
          <div className="content-container">
            <h4>Best ever built Job Posting!</h4>
            <p className="small-text">
              Track your applicants progress in a seamless and intuitive way.
            </p>
            <div className="buttons-container">
              <Button onClick={this.handleDemo} size="large">
                Try it out!
              </Button>
              {this.generateSignupButton()}
            </div>
          </div>
        </div>
        <div className="image-big-container">
          <div className="image-container">
            <img
              className="envelopes"
              src={"src/assets/images/gmail_envelopes.png"}
            ></img>
            <img
              className="dashboard-main"
              src={"src/assets/images/dashboard_main.png"}
            ></img>
          </div>
        </div>
      </div>
    );
  }

  generateHowItWorksArea() {
    return (
      <div className="how_it_works_area" id="howitworks">
        {this.generateInteriorItem(
          "src/assets/images/mail_parse.png",
          "Create a card for each application",
          "Apply anywhere - get it tracked in one place. Automatically."
        )}
        {window.screen.availWidth > 800
          ? this.generateInteriorItemFlipLR(
              "src/assets/images/move.png",
              "Organize your job hunting progress",
              "Application process is visualized like no spreadsheet can do."
            )
          : this.generateInteriorItem(
              "src/assets/images/move.png",
              "Organize your job hunting progress",
              "Application process is visualized like no spreadsheet can do."
            )}
        {this.generateInteriorItem(
          "src/assets/images/metrics.png",
          "Leverage data to step up your job search game",
          "Hiring trends, skill analysis, interview success rate to help you hunt like a pro."
        )}
      </div>
    );
  }

  generateAlumniHomePageFirstItem() {
    return (
      <div className="homepage-first-item">
        <div className="content-big-container">
          <div className="content-container">
            <h4>Job hunt is easier for ITU Alumni!</h4>
            <p className="small-text">
              Stay connected to ITU community get help for your job application
              journey!
            </p>
            <div className="buttons-container">
              <Button onClick={this.handleDemo} size="large">
                Try it out!
              </Button>
              {this.generateSignupButton()}
            </div>
          </div>
        </div>
        <div className="image-big-container">
          <div className="image-container">
            <img
              className="envelopes"
              src={"src/assets/images/gmail_envelopes.png"}
            ></img>
            <img
              className="dashboard-main"
              src={"src/assets/images/dashboard_main.png"}
            ></img>
          </div>
        </div>
      </div>
    );
  }

  generateAlumniHowItWorksArea() {
    return (
      <div className="how_it_works_area" id="howitworks">
        {this.generateInteriorItem(
          "src/assets/images/mail_parse.png",
          "Create a card for each application",
          "Apply anywhere - get it tracked in one place. Automatically."
        )}
        {window.screen.availWidth > 800
          ? this.generateInteriorItemFlipLR(
              "src/assets/images/move.png",
              "Organize your job hunting progress",
              "Application process is visualized like no spreadsheet can do."
            )
          : this.generateInteriorItem(
              "src/assets/images/move.png",
              "Organize your job hunting progress",
              "Application process is visualized like no spreadsheet can do."
            )}
        {this.generateInteriorItem(
          "src/assets/images/metrics.png",
          "Leverage data to step up your job search game",
          "Hiring trends, skill analysis, interview success rate to help you hunt like a pro."
        )}
      </div>
    );
  }

  render() {
    if (this.state.redirect != null) {
      return <Redirect to={this.state.redirect} />;
    }
    return (
      <div>
        {window.location.pathname === "/alumni" ? (
          <div className="home-container">
            {this.generateAlumniHomePageFirstItem()}
            {this.generateAlumniHowItWorksArea()}
          </div>
        ) : (
          <div className="home-container">
            {this.generateHomePageFirstItem()}
            {this.generateHowItWorksArea()}
          </div>
        )}
        <Footer />
      </div>
    );
  }
}

export default Home;
