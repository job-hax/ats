import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Redirect } from "react-router-dom";
import { withCookies } from "react-cookie";
import { Alert } from "antd";

import Header from "../Partials/Header/Header.jsx";
import Dashboard from "../Dashboard/Dashboard.jsx";
import Metrics from "../Metrics/Metrics.jsx";
import Positions from "../Positions/Positions.jsx";
import Applicants from "../Applicants/Applicants.jsx";
import Home from "../StaticPages/Home/Home.jsx";
import AboutUs from "../StaticPages/AboutUs/AboutUs.jsx";
import PrivacyPolicy from "../StaticPages/PrivacyPolicy/PrivacyPolicy.jsx";
import UserAgreement from "../StaticPages/UserAgreement/UserAgreement.jsx";
import Spinner from "../Partials/Spinner/Spinner.jsx";
import FeedBack from "../Partials/FeedBack/FeedBack.jsx";
import UnderConstruction from "../StaticPages/UnderConstruction/UnderConstruction.jsx";
import FAQ from "../StaticPages/FAQ/FAQ.jsx";
import SignIn from "../UserAuth/SignIn/SignIn.jsx";
import SignUp from "..//UserAuth/SignUp/SignUp.jsx";
import Action from "../UserAuth/Action/Action.jsx";
import LinkedInOAuthAction from "../UserAuth/Action/LinkedInOAuthAction.jsx";
import ProfilePage from "../ProfilePage/ProfilePage.jsx";
import { axiosCaptcha } from "../../utils/api/fetch_api";

import { googleClientId, jobHaxClientId, jobHaxClientSecret } from "../../config/config.js";
import { IS_CONSOLE_LOG_OPEN, USER_TYPES } from "../../utils/constants/constants.js";
import { apiRoot, USERS, NOTIFICATIONS } from "../../utils/constants/endpoints.js";

import "./style.scss";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: this.cookie("get", "jobhax_access_token"),
      active: false,
      isUserLoggedIn:
        this.cookie("get", "jobhax_access_token") == ("" || null) ||
        this.cookie("get", "signup_flow_completed") == "false"
          ? false
          : true,
      isAuthenticationChecking: true,
      isInitialRequest: "beforeRequest",
      isGapiReady: false,
      isAlertShowing: false,
      isNotificationsShowing: false,
      isAppReRenderRequested: false,
      alertType: "",
      alertMessage: "",
      profilePhotoUrl: "",
      notificationsList: [],
      syncResponseTimestamp: null,
      user: {},
      page: window.location.pathname.split("?")[0],
      logout: false,
      isSynchingGmail: false,
      feedbackEmphasis: false,
      exitIntent: false,
      exitIntentCount: 0,
      isMouseIn: true
    };
    this.notificationsList = [];
    this.handleSignOut = this.handleSignOut.bind(this);
    this.checkNotifications = this.checkNotifications.bind(this);
    this.toggleNotificationsDisplay = this.toggleNotificationsDisplay.bind(this);
    this.passStatesToApp = this.passStatesToApp.bind(this);
    this.reRunComponentDidUpdate = this.reRunComponentDidUpdate.bind(this);
    this.showAlert = this.showAlert.bind(this);
    this.cookie = this.cookie.bind(this);
    this.handleTokenExpiration = this.handleTokenExpiration.bind(this);
    this.tokenExpirationNoRenewHandle = this.tokenExpirationNoRenewHandle.bind(this);
    this.handleExit = this.handleExit.bind(this);
    this.handleIn = this.handleIn.bind(this);

    this.pages = [
      "/",
      "/home",
      "/signup",
      "/alumni-signup",
      "/signin",
      "/dashboard",
      "/metrics",
      "/applicants",
      "/alumni",
      "/alumni-search",
      "/action",
      "/action-linkedin-oauth2",
      "/underconstruction",
      "/useragreement",
      "/faqs",
      "/privacypolicy",
      "/aboutus",
      "/mentors",
      "/positions",
      "/profile",
      "/companies",
      "/createjob"
    ];
  }

  componentDidMount() {
    document.addEventListener("mouseout", this.handleExit);
    document.addEventListener("mouseover", this.handleIn);
    IS_CONSOLE_LOG_OPEN && console.log("loading gapi");
    window.gapi.load("client:auth2", () => {
      window.gapi.client.init({
        clientId: googleClientId,
        scope: "email https://www.googleapis.com/auth/gmail.readonly",
        prompt: "select_account"
      });
      IS_CONSOLE_LOG_OPEN && console.log("gapi loaded");
      this.handleTokenExpiration("app componentdidmount").then(() => {
        this.setState({
          isInitialRequest: true,
          isAuthenticationChecking: false
        });
      });
    });
    if (
      this.cookie("get", "signup_flow_completed") === "false" &&
      this.cookie("get", "signup_complete_required") != "false"
    ) {
      this.cookie("set", "signup_complete_required", true, "/");
    }
  }

  handleIn() {
    if (!this.state.isUserLoggedIn) {
      this.setState({ isMouseIn: true });
    }
  }

  handleExit(e) {
    e = e ? e : window.event;
    var vpWidth = Math.max(document.documentElement.clientWidth, window.screen.availWidth || 0);

    if (e.clientX >= vpWidth - 50) return;
    if (e.clientY >= 50) return;

    var from = e.relatedTarget || e.toElement;
    if (!from && !this.state.isUserLoggedIn) {
      this.setState({
        exitIntent: true,
        isMouseIn: false
      });
    }
  }

  componentDidUpdate() {
    if (this.state.isInitialRequest === true && this.state.isUserLoggedIn === true) {
      this.setState({
        isInitialRequest: false
      });
      let config = { method: "GET" };
      axiosCaptcha(USERS("profile/?basic=true"), config).then(response => {
        IS_CONSOLE_LOG_OPEN && console.log("photo first");
        if (response.statusText === "OK") {
          if (response.data.success == true) {
            this.props.cookies.set("user_type", response.data.data.user_type, {
              path: "/"
            });
            let profilePhotoUrl =
              response.data.data.profile_photo != ("" || null)
                ? apiRoot + response.data.data.profile_photo
                : "../../src/assets/icons/User@3x.png";
            this.setState(
              {
                active: true,
                profilePhotoUrl: profilePhotoUrl,
                user: response.data.data
              },
              IS_CONSOLE_LOG_OPEN && console.log("profilePhotoUrl", profilePhotoUrl)
            );
          }
        }
      });
      this.setState({
        isAuthenticationChecking: false
      });
    }
    if (window.location.pathname.split("?")[0] != this.state.page) {
      console.log("page", this.state.page);
      this.setState({ page: window.location.pathname.split("?")[0] });
    }
    if (this.state.exitIntent) {
      const count = this.state.exitIntentCount;
      setTimeout(() => {
        if (!this.state.isMouseIn && this.state.exitIntentCount < 1) {
          console.log(this.state.isMouseIn, this.state.exitIntentCount);
          this.setState({
            exitIntent: false,
            feedbackEmphasis: true,
            exitIntentCount: count + 1
          });
        }
      }, 200);
    }
    if (this.cookie("get", "signup_complete_required") === "true") {
      this.cookie("set", "signup_complete_required", false, "/");
      let userType = this.props.cookies.get("user_type");
      if (userType.id === USER_TYPES["alumni"]) {
        window.location = "/alumni-signup?=intro";
      } else {
        window.location = "/signup?=intro";
      }
    }
    if (this.cookie("get", "signup_flow_completed") === "true") {
      this.cookie("remove", "signup_complete_required");
      this.cookie("remove", "signup_flow_completed");
    }
  }

  reRunComponentDidUpdate() {
    this.setState({ isInitialRequest: true });
  }

  async handleTokenExpiration(whatRequested) {
    IS_CONSOLE_LOG_OPEN && console.log("token expiration check requested by:\n", whatRequested);
    let date = new Date();
    let now = date.getTime();
    let jobhax_access_token = this.props.cookies.get("jobhax_access_token");
    let jobhax_access_token_expiration = parseFloat(this.props.cookies.get("jobhax_access_token_expiration"));
    let remember_me = this.props.cookies.get("remember_me");
    if (jobhax_access_token === null) {
      this.tokenExpirationNoRenewHandle();
      this.showAlert(5000, "info", "Your session time is over!");
    } else {
      if (jobhax_access_token_expiration === null) {
        this.tokenExpirationNoRenewHandle();
        this.showAlert(5000, "info", "Your session time is over!");
      }
      let expiresIn = jobhax_access_token_expiration - parseFloat(now);
      let expirationWarning = 5 * 60 * 1000;
      if (expiresIn < expirationWarning) {
        IS_CONSOLE_LOG_OPEN &&
          console.log(
            "jobhax token expiration time checked",
            jobhax_access_token_expiration,
            now,
            "\n jobhax token expires in",
            expiresIn,
            expirationWarning
          );
        if (remember_me === "true") {
          await this.refreshJobhaxToken();
        } else {
          this.cookie("remove_all");
          this.tokenExpirationNoRenewHandle();
          this.showAlert(5000, "info", "Your session time is over!");
        }
      } else {
        await this.checkGoogleTokenExpiration(now);
      }
    }
  }

  async refreshJobhaxToken() {
    this.jobhax_refresh_token = this.props.cookies.get("jobhax_refresh_token");
    let config = { method: "POST", body: {} };
    config.body["refresh_token"] = this.jobhax_refresh_token;
    config.body["client_id"] = jobHaxClientId;
    config.body["client_secret"] = jobHaxClientSecret;
    const response = await axiosCaptcha(USERS("refreshToken"), config, false);
    if (response.statusText === "OK") {
      if (response.data.success == true) {
        this.token = `${response.data.data.token_type} ${response.data.data.access_token.trim()}`;
        this.refresh_token = response.data.data.refresh_token;
        this.setState({
          token: this.token,
          isUserLoggedIn: true,
          active: true
        });
        let date = new Date();
        date.setSeconds(date.getSeconds() + response.data.data.expires_in);
        this.props.cookies.set("jobhax_access_token", this.token, { path: "/" }, date);
        this.props.cookies.set("jobhax_access_token_expiration", parseFloat(date.getTime()), { path: "/" });
        this.props.cookies.set("jobhax_refresh_token", this.refresh_token, {
          path: "/"
        });
      }
    }
  }

  async checkGoogleTokenExpiration(now) {
    let google_access_token_expiration = parseFloat(this.props.cookies.get("google_access_token_expiration"));
    let expiresIn = google_access_token_expiration - parseFloat(now);
    let expirationWarning = 10 * 60 * 1000;
    IS_CONSOLE_LOG_OPEN &&
      console.log(
        "google token expiration time checked",
        google_access_token_expiration,
        now,
        "\n google token expires in",
        expiresIn,
        expirationWarning
      );
    if (google_access_token_expiration && google_access_token_expiration - parseFloat(now) < expirationWarning) {
      IS_CONSOLE_LOG_OPEN && console.log("updating google access token");
      this.reloadGoogle = await window.gapi.auth2
        .getAuthInstance()
        .currentUser.get()
        .reloadAuthResponse();
      let newGoogleToken = this.reloadGoogle.access_token;
      let newExpiresIn = this.reloadGoogle.expires_in;
      let googleAccessTokenExpiresOn = new Date();
      googleAccessTokenExpiresOn.setSeconds(googleAccessTokenExpiresOn.getSeconds() + newExpiresIn);
      this.props.cookies.set("google_access_token_expiration", googleAccessTokenExpiresOn.getTime(), { path: "/" });
      let config = { method: "POST" };
      config["body"] = { token: newGoogleToken };
      axiosCaptcha(USERS("updateGmailToken"), config, false);
      IS_CONSOLE_LOG_OPEN && console.log("google token refreshed", newGoogleToken);
    } else {
      IS_CONSOLE_LOG_OPEN && console.log("google is also okay!");
    }
  }

  tokenExpirationNoRenewHandle() {
    this.cookie("remove_all");
    window.gapi.auth2.getAuthInstance().signOut();
    this.setState({
      token: "",
      active: false,
      notificationsList: [],
      profileData: [],
      logout: false
    });
  }

  toggleNotificationsDisplay(open) {
    this.setState({
      isNotificationsShowing: open
    });
  }

  passStatesToApp(type, value) {
    this.setState({ [type]: value });
    if (type === "isUserLoggedIn") {
      this.reRunComponentDidUpdate();
      this.setState({ token: this.cookie("get", "jobhax_access_token") });
    }
  }

  cookie(method, name, data, path, expires) {
    const { cookies } = this.props;
    if (method.toUpperCase() === "GET") {
      return cookies.get(name);
    } else if (method.toUpperCase() === "SET") {
      cookies.set(name, data, { path: path, expires: expires });
    } else if (method === "remove_all") {
      IS_CONSOLE_LOG_OPEN && console.log("cookies removing");
      cookies.remove("jobhax_access_token", { path: "/" });
      cookies.remove("jobhax_refresh_token", { path: "/" });
      cookies.remove("google_access_token_expiration", { path: "/" });
      cookies.remove("google_login_first_instance", { path: "/" });
      cookies.remove("jobhax_access_token_expiration", { path: "/" });
      cookies.remove("remember_me", { path: "/" });
      cookies.remove("user_type", { path: "/" });
      cookies.remove("signup_flow_completed", { path: "/" });
      cookies.remove("signup_complete_required", { path: "/" });
      cookies.remove("is_demo_user", { path: "/" });
    } else if (method === "remove") {
      IS_CONSOLE_LOG_OPEN && console.log("cookie removing", name);
      cookies.remove(name, { path: "/" });
    }
  }

  async checkNotifications() {
    await this.handleTokenExpiration("app checkNotifications");
    let config = { method: "GET" };
    axiosCaptcha(NOTIFICATIONS, config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          this.notificationsList = response.data.data;
          this.setState({
            notificationsList: this.notificationsList
          });
          return this.notificationsList;
        }
      }
    });
  }

  handleSignOut() {
    IS_CONSOLE_LOG_OPEN && console.log("handle signout first");
    this.setState({ isUserLoggedIn: false });
    this.cookie("remove_all");
    let config = { method: "POST" };
    config["body"] = {
      client_id: jobHaxClientId,
      client_secret: jobHaxClientSecret
    };
    config.body.token = this.state.token.replace("Bearer ", "");
    axiosCaptcha(USERS("logout"), config, false).then(response => {
      if (response.statusText === "OK") {
        IS_CONSOLE_LOG_OPEN && console.log(response.data);
        if (response.data.success === true) {
          window.gapi.auth2.getAuthInstance().signOut();
          this.setState({
            token: "",
            active: false,
            notificationsList: [],
            profileData: [],
            logout: false
          });
          IS_CONSOLE_LOG_OPEN && console.log("handle signOut isUserLoggedIn", this.state.isUserLoggedIn);
        } else {
          IS_CONSOLE_LOG_OPEN && console.log(response, response.data.error_message);
          this.showAlert(5000, "error", "Error: " + response.data.error_message);
        }
      } else {
        this.showAlert(5000, "error", "Something went wrong!");
      }
    });
  }

  showAlert(time, type, message) {
    this.setState({
      isAlertShowing: true,
      alertType: type,
      alertMessage: message
    });
    new Promise(wait => setTimeout(wait, time)).then(() =>
      this.setState({ isAlertShowing: false, alertType: "", alertMessage: "" })
    );
  }

  generateAlert() {
    const bottom = "30px";
    return (
      <div
        style={{
          position: "fixed",
          bottom: bottom,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 100
        }}
      >
        <div>
          <Alert type={this.state.alertType} message={this.state.alertMessage} showIcon />
        </div>
      </div>
    );
  }

  render() {
    const { isUserLoggedIn, page, token, active, logout, isInitialRequest } = this.state;
    const appRenderConsole = false;
    IS_CONSOLE_LOG_OPEN &&
      appRenderConsole &&
      console.log(
        "page",
        page,
        "\nisUserLoggedIn",
        isUserLoggedIn,
        "\nisInitialRequest",
        isInitialRequest,
        "\n--token",
        token,
        "\n--active?",
        active
        //"\n cookies",
        //this.props.cookies.getAll()
      );
    if (this.state.isAuthenticationChecking) return <Spinner message="Connecting..." />;
    else if (isUserLoggedIn && !this.state.active) return <Spinner message="Reaching your account..." />;
    else if (!this.pages.includes(page)) return <Spinner message="Page not found!" />;
    else if (logout && page == "/home") return <Spinner message="Logging out..." />;
    else if (isUserLoggedIn && this.state.active) {
      return (
        <Router>
          <div className="main-container">
            <Header
              handleSignOut={this.handleSignOut}
              alert={this.showAlert}
              notificationsList={this.state.notificationsList}
              notificationCheck={this.checkNotifications}
              isNotificationsShowing={this.state.isNotificationsShowing}
              toggleNotifications={this.toggleNotificationsDisplay}
              profilePhotoUrl={this.state.profilePhotoUrl}
              cookie={this.cookie}
              handleTokenExpiration={this.handleTokenExpiration}
              passStatesToApp={this.passStatesToApp}
              isUserLoggedIn={true}
              isAdmin={this.state.user.is_admin}
              isSynchingGmail={this.state.isSynchingGmail}
            />
            <FeedBack
              alert={this.showAlert}
              handleTokenExpiration={this.handleTokenExpiration}
              feedbackEmphasis={this.state.feedbackEmphasis}
              passStatesToApp={this.passStatesToApp}
              isUserLoggedIn={isUserLoggedIn}
            />
            {this.state.isAlertShowing && <div>{this.generateAlert()}</div>}
            <Route
              exact
              path="/profile"
              render={() => (
                <ProfilePage
                  alert={this.showAlert}
                  handleTokenExpiration={this.handleTokenExpiration}
                  cookie={this.cookie}
                  setProfilePhotoUrlInHeader={this.reRunComponentDidUpdate}
                  notificationsList={this.state.notificationsList}
                  notificationCheck={this.checkNotifications}
                />
              )}
            />
            <Route
              exact
              path="/blogs"
              render={() => (
                <Blog
                  alert={this.showAlert}
                  handleTokenExpiration={this.handleTokenExpiration}
                  cookie={this.cookie}
                  user={this.state.user}
                />
              )}
            />
            <Route
              exact
              path="/dashboard"
              render={() => (
                <Dashboard
                  alert={this.showAlert}
                  handleTokenExpiration={this.handleTokenExpiration}
                  cookie={this.cookie}
                  syncResponseTimestamp={this.state.syncResponseTimestamp}
                  passStatesToApp={this.passStatesToApp}
                />
              )}
            />
            <Route
              exact
              path="/signin"
              render={() =>
                logout ? (
                  <Spinner message="Logging out..." />
                ) : window.location.search.split("=")[1] === "reCapthcaCouldNotPassed" ? (
                  <Spinner message="checking reCaptcha..." />
                ) : (
                  <Redirect to="/dashboard" />
                )
              }
            />
            <Route
              exact
              path={["/", "/home", "/alumni", "/signup", "alumni-signup"]}
              render={() => (!logout ? <Redirect to="/dashboard" /> : <Spinner message="Logging out..." />)}
            />
            <Route
              exact
              path="/metrics"
              render={() => (
                <Metrics
                  alert={this.showAlert}
                  handleTokenExpiration={this.handleTokenExpiration}
                  cookie={this.cookie}
                />
              )}
            />
            <Route
              exact
              path="/applicants"
              render={() => (
                <Applicants
                  alert={this.showAlert}
                  handleTokenExpiration={this.handleTokenExpiration}
                  cookie={this.cookie}
                />
              )}
            />
            <Route
              exact
              path="/positions"
              render={() => (
                <Positions
                  alert={this.showAlert}
                  handleTokenExpiration={this.handleTokenExpiration}
                  cookie={this.cookie}
                />
              )}
            />
            <Route exact path="/aboutus" render={() => <AboutUs />} />
            <Route exact path="/privacypolicy" render={() => <PrivacyPolicy />} />
            <Route exact path="/useragreement" render={() => <UserAgreement />} />
            <Route exact path="/underconstruction" render={() => <UnderConstruction />} />
            <Route exact path="/faqs" render={() => <FAQ />} />
            <Route exact path="/action" render={() => <Action alert={this.showAlert} />} />
            <Route exact path="/action-linkedin-oauth2" render={() => <LinkedInOAuthAction alert={this.showAlert} />} />
          </div>
        </Router>
      );
    } else {
      let allowed = [
        "/",
        "/home",
        "/signin",
        "/signup",
        "/privacypolicy",
        "/useragreement",
        "/faqs",
        "/aboutus",
        "/action",
        "/action-linkedin-oauth"
      ];
      if (!allowed.includes(page) && !logout) {
        let redirect_path = "/signin";
        window.location = redirect_path;
        return <Spinner message="Redirecting..." />;
      } else
        return (
          <Router>
            <div className="main-container">
              <Header alert={this.showAlert} isUserLoggedIn={false} cookie={this.cookie} />
              {this.state.isAlertShowing && <div>{this.generateAlert()}</div>}
              {this.state.feedbackEmphasis && (
                <FeedBack
                  alert={this.showAlert}
                  handleTokenExpiration={this.handleTokenExpiration}
                  feedbackEmphasis={this.state.feedbackEmphasis}
                  visible={true}
                  passStatesToApp={this.passStatesToApp}
                  isUserLoggedIn={isUserLoggedIn}
                />
              )}
              <Route exact path="/" render={() => <Redirect to="/home" />} />
              <Route
                exact
                path="/home"
                render={() => (
                  <Home
                    isUserLoggedIn={false}
                    passStatesToApp={this.passStatesToApp}
                    alert={this.showAlert}
                    cookie={this.cookie}
                  />
                )}
              />

              <Route exact path="/aboutus" render={() => <AboutUs isUserLoggedIn={this.state.isUserLoggedIn} />} />
              <Route exact path="/underconstruction" render={() => <UnderConstruction />} />
              <Route
                exact
                path="/signin"
                render={() => (
                  <SignIn
                    googleAuth={this.googleAuth}
                    passStatesToApp={this.passStatesToApp}
                    alert={this.showAlert}
                    cookie={this.cookie}
                  />
                )}
              />
              <Route
                exact
                path="/signup"
                render={() => (
                  <SignUp
                    googleAuth={this.googleAuth}
                    alert={this.showAlert}
                    passStatesToApp={this.passStatesToApp}
                    cookie={this.cookie}
                    signupType={"general"}
                  />
                )}
              />
              <Route exact path="/faqs" render={() => <FAQ />} />
              <Route exact path="/privacypolicy" render={() => <PrivacyPolicy />} />
              <Route exact path="/useragreement" render={() => <UserAgreement />} />
              <Route exact path="/action" render={() => <Action alert={this.showAlert} />} />
              <Route
                exact
                path="/action-linkedin-oauth2"
                render={() => <LinkedInOAuthAction alert={this.showAlert} />}
              />
            </div>
          </Router>
        );
    }
  }
}
export default withCookies(App);
