import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import {
  Form,
  Input,
  Icon,
  Select,
  Checkbox,
  Button,
  Switch,
  Menu,
  Dropdown,
  AutoComplete
} from "antd";

import { linkedInOAuth } from "../../../utils/helpers/oAuthHelperFunctions.js";
import {
  googleClientId,
  jobHaxClientId,
  jobHaxClientSecret
} from "../../../config/config.js";
import { USERS, AUTOCOMPLETE } from "../../../utils/constants/endpoints.js";
import { axiosCaptcha } from "../../../utils/api/fetch_api";
import {
  IS_CONSOLE_LOG_OPEN,
  USER_TYPES
} from "../../../utils/constants/constants.js";
import Footer from "../../Partials/Footer/Footer.jsx";

import "./style.scss";

class SignUpPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: null,
      companyAutoCompleteData: [],
      positionAutoCompleteData: [],
      countryList: [],
      stateOrProvinceList: [],
      mustInputEmphasis: false,
      confirmDirty: false,
      isEmailSignUpRequested: false,
      level:
        window.location.search.split("=")[1] == "synced"
          ? "submit"
          : window.location.search.split("=")[1] == "intro"
          ? "intro"
          : "undefined",
      user_type:
        this.props.signupType === "alumni" ? USER_TYPES["alumni"] : null,
      first_name: "",
      last_name: "",
      company: "",
      job_title: "",
      country: "",
      country_id: null,
      stateOrProvince: "",
      state_id: null,
      googleAccessToken: "",
      photoUrl: ""
    };

    this.nextButtonStyle = {
      borderRadius: 0,
      width: "272px"
    };

    this.narrowInputStyle = {
      width: "240px",
      marginBottom: 16
    };

    this.warningStyle = {
      width: "240px",
      marginBottom: 16,
      border: "1px solid red",
      borderRadius: 4
    };

    this.handleAutoCompleteSearch = this.handleAutoCompleteSearch.bind(this);
    this.handleCompanySearch = this.handleCompanySearch.bind(this);
    this.handleSignUpFormNext = this.handleSignUpFormNext.bind(this);
    this.handleFinish = this.handleFinish.bind(this);
    this.generateSignUpForm = this.generateSignUpForm.bind(this);
    this.compareToFirstPassword = this.compareToFirstPassword.bind(this);
    this.validateToNextPassword = this.validateToNextPassword.bind(this);
    this.handleConfirmBlur = this.handleConfirmBlur.bind(this);
    this.handleGoogleSignUp = this.handleGoogleSignUp.bind(this);
    this.linkedInOAuthRequest = this.linkedInOAuthRequest.bind(this);
    this.onAlumniEmploymentSwitch = this.onAlumniEmploymentSwitch.bind(this);
    this.checkMustInputs = this.checkMustInputs.bind(this);
    this.setCountryOrStateList = this.setCountryOrStateList.bind(this);
    this.generateUrlForGetData = this.generateUrlForGetData.bind(this);
    this.setCookies = this.setCookies.bind(this);
  }

  componentDidMount() {
    this.props.cookie("remove", "signup_complete_required");
  }

  componentDidUpdate() {
    if (
      this.props.signupType === "alumni" &&
      this.state.user_type != USER_TYPES["alumni"]
    ) {
      this.setState({ user_type: USER_TYPES["alumni"] });
    }
  }

  currentStyle(state, condition) {
    if (this.state.mustInputEmphasis === false) {
      return this.narrowInputStyle;
    } else {
      if (state != condition) {
        return this.narrowInputStyle;
      } else {
        return this.warningStyle;
      }
    }
  }

  compareToFirstPassword(rule, value, callback) {
    const form = this.props.form;
    if (value && value !== form.getFieldValue("password")) {
      callback("Two passwords do not match!");
    } else {
      callback();
    }
  }

  validateToNextPassword(rule, value, callback) {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(["confirm"], { force: true });
    }
    callback();
  }

  handleConfirmBlur(event) {
    const value = event.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  setCookies(response, googleAccessTokenExpiresOn) {
    this.token = `${
      response.data.data.token_type
    } ${response.data.data.access_token.trim()}`;
    IS_CONSOLE_LOG_OPEN && console.log(this.token);
    this.refresh_token = response.data.data.refresh_token;
    let date = new Date();
    date.setSeconds(date.getSeconds() + response.data.data.expires_in);
    this.props.cookie(
      "set",
      "google_access_token_expiration",
      googleAccessTokenExpiresOn.getTime(),
      "/",
      googleAccessTokenExpiresOn
    );
    this.props.cookie("set", "google_login_first_instance", true, "/");
    this.props.cookie("set", "jobhax_access_token", this.token, "/", date);
    this.props.cookie(
      "set",
      "jobhax_access_token_expiration",
      date.getTime(),
      "/"
    );
    this.props.cookie("set", "jobhax_refresh_token", this.refresh_token, "/");
    this.props.cookie("set", "user_type", response.data.data.user_type, "/");
    this.props.cookie(
      "set",
      "signup_flow_completed",
      response.data.data.signup_flow_completed,
      "/"
    );
  }

  handleGoogleSignUp() {
    window.gapi.load("client:auth2", () => {
      window.gapi.client
        .init({
          apiKey: "AIzaSyBnF8loY6Vqhs4QWTM_fWCP93Xidbh1kYo",
          clientId: googleClientId,
          prompt: "select_account"
        })
        .then(() => {
          this.googleAuth = window.gapi.auth2.getAuthInstance();
          this.googleAuth.signIn().then(response => {
            IS_CONSOLE_LOG_OPEN && console.log("signUp response", response);
            if (response.Zi.token_type === "Bearer") {
              let photoUrl = response.w3.Paa;
              let googleAccessTokenExpiresOn = new Date();
              googleAccessTokenExpiresOn.setSeconds(
                googleAccessTokenExpiresOn.getSeconds() + response.Zi.expires_in
              );
              const googleAccessToken = this.googleAuth.currentUser
                .get()
                .getAuthResponse().access_token;
              let config = { method: "POST" };
              config.body = {
                client_id: jobHaxClientId,
                client_secret: jobHaxClientSecret,
                provider: "google-oauth2"
              };
              config.body.token = googleAccessToken;
              if (this.state.user_type != null) {
                config.body.user_type = this.state.user_type;
              }
              axiosCaptcha(USERS("authSocialUser"), config, "signin")
                .then(response => {
                  if (response.statusText === "OK") {
                    if (response.data.success === true) {
                      this.setCookies(response, googleAccessTokenExpiresOn);
                    }
                  }
                  return response;
                })
                .then(response => {
                  if (response.statusText === "OK") {
                    if (response.data.success === true) {
                      if (!response.data.data.signup_flow_completed) {
                        this.setState({ level: "intro" });
                      } else {
                        this.props.cookie("set", "remember_me", true, "/");
                        this.props.passStatesToApp("isUserLoggedIn", true);
                      }
                      this.postGoogleProfilePhoto(photoUrl);
                    }
                  }
                });
            }
          });
        });
    });
  }

  postGoogleProfilePhoto(photoURL) {
    let bodyFormData = new FormData();
    bodyFormData.set("photo_url", photoURL);
    let config = { method: "POST" };
    config.body = bodyFormData;
    axiosCaptcha(USERS("updateProfilePhoto"), config).then(response => {
      if (response.statusText === "OK") {
        IS_CONSOLE_LOG_OPEN && console.log(response);
      }
    });
  }

  handleFinish() {
    let config = { method: "POST" };
    config.body = {};
    if (this.state.first_name != "") {
      config.body.first_name = this.state.first_name.trim();
    }
    if (this.state.last_name != "") {
      config.body.last_name = this.state.last_name.trim();
    }
    if (this.state.country_id != null) {
      config.body.country_id = this.state.country_id;
    }
    if (this.state.state_id != null) {
      config.body.state_id = this.state.state_id;
    }
    if (this.state.user_type != null) {
      config.body.user_type = this.state.user_type;
    }
    if (this.state.company != "") {
      config.body.company = this.state.company.trim();
    }
    if (this.state.job_title != "") {
      config.body.job_title = this.state.job_title.trim();
    }
    axiosCaptcha(USERS("updateProfile"), config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success === true) {
          this.props.cookie(
            "set",
            "user_type",
            response.data.data.user_type,
            "/"
          );
          this.props.cookie("set", "signup_flow_completed", true, "/");
          this.setState({ redirect: "/signup?=final" });
          this.props.passStatesToApp("isUserLoggedIn", true);
          this.props.alert(
            5000,
            "success",
            "Your account information has been saved successfully!"
          );
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

  handleSignUpFormNext(event) {
    event.preventDefault();
    let config = { method: "POST" };
    config.body = {};
    if (
      event.target[1].value.trim() === (null || "") ||
      event.target[2].value.trim() === (null || "") ||
      event.target[3].value.trim() === (null || "") ||
      event.target[4].value.trim() === (null || "")
    ) {
      this.props.alert(3000, "error", "You have to fill out all sign up form!");
    } else {
      if (this.state.isAgreementRead === true) {
        config.body.username = event.target[1].value;
        config.body.email = event.target[2].value;
        config.body.password = event.target[3].value;
        config.body.password2 = event.target[4].value;
        config.body.client_id = jobHaxClientId;
        config.body.client_secret = jobHaxClientSecret;
        if (this.state.user_type != null) {
          config.body.user_type = this.state.user_type;
        }
        axiosCaptcha(USERS("register"), config, "signup").then(response => {
          if (response.statusText === "OK") {
            if (response.data.success === true) {
              this.token = `${
                response.data.data.token_type
              } ${response.data.data.access_token.trim()}`;
              if (!response.data.data.signup_flow_completed) {
                this.setState({ level: "intro" });
              } else {
                this.props.passStatesToApp("isUserLoggedIn", true);
              }
              IS_CONSOLE_LOG_OPEN && console.log(this.token);
              this.refresh_token = response.data.data.refresh_token;
              let date = new Date();
              date.setSeconds(
                date.getSeconds() + response.data.data.expires_in
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
            } else {
              IS_CONSOLE_LOG_OPEN &&
                console.log(response, response.data.error_message);
              this.props.alert(
                5000,
                "error",
                "Error: " + response.data.error_message
              );
            }
          } else {
            if (response.data == "500") {
              this.props.alert(3000, "error", "You have to fill out all form!");
            } else {
              this.props.alert(5000, "error", "Something went wrong!");
            }
          }
        });
      } else {
        this.props.alert(
          3000,
          "error",
          "You have to agree with the user agreement!"
        );
      }
    }
  }

  generateSignUpForm() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={() => this.handleSignUpFormNext(event)}>
        <div style={{ margin: "0px 0 16px 0" }}>
          <div className="social-buttons-container">
            <div>
              <Button
                type="primary"
                icon="google"
                onClick={this.handleGoogleSignUp}
                style={{ width: "240px" }}
              >
                {" "}
                Sign Up with Google
              </Button>
            </div>
          </div>
        </div>
        <div
          className="separator"
          style={{ margin: "12px 24px 12px 24px", width: 224 }}
        />
        <Form.Item style={{ width: "272px" }}>
          {getFieldDecorator("Username", {
            rules: [
              {
                required: true,
                message: "Please enter your Username!",
                whitespace: true
              }
            ]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Username"
              style={{ width: "272px" }}
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator("email", {
            rules: [
              {
                type: "email",
                message: "The enter is not valid E-mail!"
              },
              {
                required: true,
                message: "Please enter your E-mail!"
              }
            ]
          })(
            <Input
              prefix={<Icon type="mail" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="E-mail"
              style={{ width: "272px" }}
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator("password", {
            rules: [
              {
                required: true,
                message: "Please enter your password!"
              },
              {
                validator: this.validateToNextPassword
              }
            ]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder="Password"
              style={{ width: "272px" }}
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator("confirm", {
            rules: [
              {
                required: true,
                message: "Please confirm your password!"
              },
              {
                validator: this.compareToFirstPassword
              }
            ]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder="Confirm Password"
              style={{ width: "272px" }}
              onBlur={this.handleConfirmBlur}
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator("agreement", {
            valuePropName: "checked"
          })(
            <div style={{ display: "flex", justifyContent: "left" }}>
              <div>
                <Checkbox
                  style={{
                    width: "24px",
                    height: "48px"
                  }}
                  onClick={() =>
                    this.setState({
                      isAgreementRead: !this.state.isAgreementRead
                    })
                  }
                />
              </div>
              <div style={{ marginTop: "-8px" }}>
                <span
                  style={{
                    width: "252px",
                    fontSize: "90%",
                    height: "48px",
                    padding: 0
                  }}
                >
                  I agree with the{" "}
                  <a onClick={() => window.open("/useragreement")}>
                    user agreement
                  </a>{" "}
                  and{" "}
                </span>
                <div
                  style={{
                    marginTop: "-24px",
                    fontSize: "90%"
                  }}
                >
                  <a onClick={() => window.open("/privacypolicy")}>
                    privacy policy
                  </a>
                </div>
              </div>
            </div>
          )}
        </Form.Item>
        <Form.Item>
          <div style={{ marginTop: "-28px" }}>
            <Button
              type="primary"
              htmlType="submit"
              style={this.nextButtonStyle}
            >
              Next
            </Button>
          </div>
        </Form.Item>
        <div style={{ fontSize: "90%" }}>
          Do you have an account? Go <Link to="/signin">sign in!</Link>
        </div>
      </Form>
    );
  }

  generateSignupOptions() {
    return (
      <div>
        <div>
          <div className="social-buttons-container">
            <div>
              <Button
                type="primary"
                icon="google"
                onClick={this.handleGoogleSignUp}
                style={{ width: "240px" }}
              >
                {" "}
                Sign Up with Google
              </Button>
            </div>
          </div>
          <div
            className="separator"
            style={{ width: "224px", margin: "12px 24px 0px 24px" }}
          />
          <div
            className="social-buttons-container"
            style={{ marginBottom: 20 }}
          >
            <div>
              <Button
                icon="mail"
                onClick={() =>
                  this.setState({
                    isEmailSignUpRequested: true,
                    user_type: null,
                    college_id: null,
                    college: "",
                    collegeList: [],
                    major: "",
                    grad_year: null,
                    alumniEmployment: true,
                    company: "",
                    job_title: "",
                    country: "",
                    stateOrProvince: "",
                    googleAccessToken: "",
                    photoUrl: ""
                  })
                }
                style={{ width: "240px" }}
              >
                {" "}
                Sign Up with Email
              </Button>
            </div>
          </div>
        </div>
        <div style={{ fontSize: "90%" }}>
          Do you have an account? Go <Link to="/signin">sign in!</Link>
        </div>
      </div>
    );
  }

  generateSignUp() {
    return (
      <div className="sign_up-form-container">
        <div className="content-container">
          <h1>Sign up</h1>
          {this.state.isEmailSignUpRequested
            ? this.generateSignUpForm()
            : this.generateSignupOptions()}
        </div>
      </div>
    );
  }

  generateBackButton(level) {
    return (
      <div>
        <div style={{ margin: "12px 0 0 0" }} />
        <Button
          onClick={() =>
            this.setState({
              level: level
            })
          }
          style={this.nextButtonStyle}
        >
          Back
        </Button>
      </div>
    );
  }

  generateLevelIntro() {
    return (
      <div>
        <div className="level-title">Welcome to Jobhax!</div>
        <div className="level-body">
          Please confirm a few, quick details to activate your account.
        </div>
        <div>
          <Button
            type="primary"
            onClick={() => this.setState({ level: "basicInfo" })}
            style={this.nextButtonStyle}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  universityChoices(snippet, type, title, level) {
    return (
      <div>
        <div className="level-body">{snippet}</div>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            onClick={() =>
              this.setState({ level: level, user_type: USER_TYPES[type] })
            }
            style={this.nextButtonStyle}
          >
            {title}
          </Button>
        </div>
      </div>
    );
  }

  generateLevelEmployer() {
    return (
      <div>
        <div className="level-title">Connect with your Company</div>
        <div className="level-body">Please enter your Company:</div>
        <div>
          <AutoComplete
            style={this.currentStyle(this.state.college, "")}
            dataSource={this.state.companyAutoCompleteData}
            style={this.narrowInputStyle}
            onSearch={this.handleCompanySearch}
            placeholder="ex. Google"
            value={this.state.company && this.state.company}
            onSelect={value => this.setState({ company: value })}
          />
        </div>
        <div className="level-body">Please enter your Position:</div>
        <div>
          <AutoComplete
            style={this.narrowInputStyle}
            dataSource={this.state.positionAutoCompleteData}
            onSearch={value =>
              this.handleAutoCompleteSearch(value, "positions")
            }
            placeholder="ex. Human Resource Manager"
            value={this.state.job_title && this.state.job_title}
            onSelect={value => this.setState({ job_title: value })}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <Button
            type="primary"
            onClick={() =>
              this.checkMustInputs(
                [this.state.company, this.state.job_title],
                "linkedin"
              )
            }
            style={this.nextButtonStyle}
          >
            Next
          </Button>
        </div>
        <div>{this.generateBackButton("user_type")}</div>
      </div>
    );
  }

  setCountryOrStateList(event, state_type, id_type) {
    if (
      state_type == "country" &&
      this.state.country != "" &&
      this.state.country != event.item.props.children
    ) {
      let emptyList = [];
      this.setState({
        stateOrProvince: "",
        state_id: null,
        stateOrProvinceList: emptyList
      });
    }
    this.setState({
      [state_type]: event.item.props.children,
      [id_type]: parseInt(event.key)
    });
    if (state_type == "country") {
      this.handleAutoCompleteSearch(parseInt(event.key), "stateOrProvince");
    }
  }

  generateLevelBasicInfo() {
    const nextLevel = "employer";
    const mustInputsList =
      this.state.stateOrProvinceList.length > 0
        ? [
            this.state.first_name,
            this.state.last_name,
            this.state.country,
            this.state.stateOrProvince
          ]
        : [this.state.first_name, this.state.last_name, this.state.country];
    const menu = (state_type, id_type, data_list) => (
      <Menu
        onClick={event =>
          this.setCountryOrStateList(event, state_type, id_type)
        }
        style={{
          width: "240px",
          maxHeight: "260px",
          textAlign: "center",
          overflowX: "hidden"
        }}
      >
        {data_list.map(data => (
          <Menu.Item key={data.id}>{data.name}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <div>
        <div className="level-title">Tell Us More About Yourself</div>
        <div className="level-body">Please enter your First Name:</div>
        <div>
          <Input
            placeholder="John"
            value={this.state.first_name && this.state.first_name}
            style={this.currentStyle(this.state.first_name, "")}
            onChange={event =>
              this.setState({ first_name: event.target.value })
            }
          />
        </div>
        <div className="level-body">Please enter your Last Name:</div>
        <div>
          <Input
            placeholder="Doe"
            value={this.state.last_name && this.state.last_name}
            style={this.currentStyle(this.state.last_name, "")}
            onChange={event => this.setState({ last_name: event.target.value })}
          />
        </div>
        <div className="level-body">
          <div style={{ padding: "0 4px 8px 0" }}>Where do you live?</div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            {this.state.mustInputEmphasis === true &&
              this.state.country == "" && <div style={{ color: "red" }}>*</div>}
            <Dropdown
              overlay={menu("country", "country_id", this.state.countryList)}
              placement="bottomCenter"
            >
              <a
                className="ant-dropdown-link"
                style={{ color: "rgba(100, 100, 100, 0.9)" }}
                onMouseEnter={() =>
                  this.state.countryList.length == 0 &&
                  this.handleAutoCompleteSearch(null, "countries")
                }
              >
                {this.state.country != "" || null
                  ? this.state.country
                  : "Please Select a Country"}{" "}
                <Icon type="down" />
              </a>
            </Dropdown>
          </div>
          {this.state.country_id != null &&
            this.state.stateOrProvinceList.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "8px 0 8px 0"
                }}
              >
                {this.state.mustInputEmphasis === true &&
                  this.state.stateOrProvince === "" && (
                    <div style={{ color: "red" }}>*</div>
                  )}
                <Dropdown
                  overlay={menu(
                    "stateOrProvince",
                    "state_id",
                    this.state.stateOrProvinceList
                  )}
                  placement="bottomCenter"
                >
                  <a
                    className="ant-dropdown-link"
                    style={{
                      color: "rgba(100, 100, 100, 0.9)",
                      margin: "0 0 8px 0"
                    }}
                  >
                    {this.state.stateOrProvince != "" || null
                      ? this.state.stateOrProvince
                      : "Select a State/Province"}{" "}
                    <Icon type="down" />
                  </a>
                </Dropdown>
              </div>
            )}
        </div>
        <div style={{ marginTop: 8 }}>
          <Button
            type="primary"
            onClick={() => this.checkMustInputs(mustInputsList, nextLevel)}
            style={this.nextButtonStyle}
          >
            Next
          </Button>
        </div>
        <div>{this.generateBackButton("intro")}</div>
      </div>
    );
  }

  checkMustInputs(mustInputs, level) {
    let x = mustInputs.length;
    let y = 0;
    for (let i = 0; i < x; i++) {
      if (mustInputs[i] != null) {
        if (mustInputs[i].toString().trim() != "") {
          y = y + 1;
        }
      }
    }
    if (x == y) {
      this.setState({ level: level, mustInputEmphasis: false });
    } else {
      this.setState({ mustInputEmphasis: true });
      this.props.alert(3000, "error", "You have to fill out all form!");
    }
  }

  onAlumniEmploymentSwitch(checked) {
    this.setState({ alumniEmployment: checked });
  }

  handleCompanySearch(value) {
    this.setState({ company: value });
    let url =
      "https://autocomplete.clearbit.com/v1/companies/suggest?query=" + value;
    let config = {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      }
    };
    axiosCaptcha(url, config).then(response => {
      if (response.statusText === "OK") {
        let bufferList = [];
        response.data.forEach(company => bufferList.push(company.name));
        this.setState({
          companyAutoCompleteData: bufferList
        });
      }
    });
  }

  generateUrlForGetData(value, type) {
    if (type === "positions") {
      let newUrl = AUTOCOMPLETE(type) + "?q=" + value + "&count=5";
      this.setState({ job_title: value });
      return newUrl;
    } else if (type === "countries") {
      let newUrl = AUTOCOMPLETE(type);
      return newUrl;
    } else if (type === "stateOrProvince") {
      let newUrl = AUTOCOMPLETE("countries") + value + "/states/";
      return newUrl;
    }
  }

  async handleAutoCompleteSearch(value, type) {
    let config = { method: "GET" };
    let newUrl = await this.generateUrlForGetData(value, type);
    axiosCaptcha(newUrl, config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          let bufferList = [];
          if (type === "positions") {
            response.data.data.forEach(element =>
              bufferList.push(element.job_title)
            );
            this.setState({ positionAutoCompleteData: bufferList });
          } else if (type === "countries") {
            let countriesList = response.data.data;
            this.setState({ countryList: countriesList });
          } else if (type === "stateOrProvince") {
            let statesList = response.data.data;
            this.setState({ stateOrProvinceList: statesList });
          }
        }
      }
    });
  }

  linkedInOAuthRequest() {
    linkedInOAuth();
    this.setState({ level: "submit" });
  }

  generateLevelLinkedIn() {
    const level =
      this.state.user_type == USER_TYPES["public"]
        ? "user_type"
        : Object.assign(
            {},
            ...Object.entries(USER_TYPES).map(([a, b]) => ({ [b]: a }))
          )[this.state.user_type];
    return (
      <div>
        <div className="level-title">Welcome to Jobhax!</div>
        <div className="level-body">
          If you have a LinkedIn account, we can keep your information in sync,
          aggregate your work experience & build custom resumes.
        </div>
        <div>
          <Button
            type="primary"
            icon="linkedin"
            onClick={() => this.linkedInOAuthRequest()}
            style={this.nextButtonStyle}
          >
            {" "}
            Connect With LinkedIn
          </Button>
        </div>
        <div style={{ marginTop: 20 }}>
          <Button
            onClick={() => this.setState({ level: "submit" })}
            style={this.nextButtonStyle}
          >
            Skip
          </Button>
        </div>
        <div>{this.generateBackButton(level)}</div>
      </div>
    );
  }

  generateLevelSubmit() {
    return (
      <div>
        <div className="level-title" style={{ fontWeight: 500 }}>
          You're all set!
        </div>
        <div>
          <Button
            type="primary"
            onClick={() => this.handleFinish()}
            style={this.nextButtonStyle}
          >
            Finish
          </Button>
        </div>
        <div>{this.generateBackButton("linkedin")}</div>
      </div>
    );
  }

  generateAdditionalInfoForms() {
    switch (this.state.level) {
      case "intro":
        return this.generateLevelIntro();
      case "basicInfo":
        return this.generateLevelBasicInfo();
      case "employer":
        return this.generateLevelEmployer();
      case "linkedin":
        return this.generateLevelLinkedIn();
      case "submit":
        return this.generateLevelSubmit();
    }
  }

  render() {
    if (this.state.redirect != null) {
      return <Redirect to={this.state.redirect} />;
    }
    IS_CONSOLE_LOG_OPEN && console.log("level", this.state.level);
    history.pushState(null, null, location.href);
    window.onpopstate = function() {
      history.go(1);
    };
    return (
      <div>
        <div className="sign_up-vertical-container">
          <div className="sign_up-container">
            {this.state.level === "undefined" ? (
              this.generateSignUp()
            ) : (
              <div className="sign_up-form-container">
                <div className="content-container">
                  <div className="levels">
                    {this.generateAdditionalInfoForms()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bottom-fixed-footer-sign_up">
          <Footer />
        </div>
      </div>
    );
  }
}

const SignUp = Form.create({ name: "signup" })(SignUpPage);

export default SignUp;
