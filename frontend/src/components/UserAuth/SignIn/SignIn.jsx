import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Modal, Form, Input, Icon, Button, Checkbox, Alert } from "antd";

import Footer from "../../Partials/Footer/Footer.jsx";
import {
  IS_CONSOLE_LOG_OPEN,
  USER_TYPES
} from "../../../utils/constants/constants.js";
import {
  googleClientId,
  jobHaxClientId,
  jobHaxClientSecret
} from "../../../config/config.js";
import { USERS } from "../../../utils/constants/endpoints.js";
import { axiosCaptcha } from "../../../utils/api/fetch_api";

import "./style.scss";

const ForgotPasswordModal = Form.create({ name: "form_in_modal" })(
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <div>
          <Modal
            visible={visible}
            centered
            title="Forgot Password"
            okText="Submit"
            onCancel={onCancel}
            onOk={onCreate}
          >
            <Form layout="vertical">
              <Form.Item label="Username or Email Address">
                {getFieldDecorator("username", {
                  rules: [
                    {
                      required: true,
                      message: "Please enter your username or email address!"
                    }
                  ]
                })(<Input />)}
              </Form.Item>
            </Form>
          </Modal>
        </div>
      );
    }
  }
);

class SignInPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      isVerificationReSendDisplaying: false,
      showModal: false
    };

    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleGoogleSignIn = this.handleGoogleSignIn.bind(this);
    this.generateSignInForm = this.generateSignInForm.bind(this);
    this.postUser = this.postUser.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.saveFormRef = this.saveFormRef.bind(this);
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  handleCreate() {
    const form = this.formRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      IS_CONSOLE_LOG_OPEN && console.log("Received values of form: ", values);
      let config = { method: "POST" };
      config["body"] = { username: values.username };
      axiosCaptcha(USERS("forgotPassword"), config, "forgotPassword").then(
        response => {
          if (response.statusText === "OK") {
            if (response.data.success === true) {
              this.toggleModal();
              this.props.alert(
                5000,
                "info",
                "A link to reset password has sent to your email!"
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
        }
      );
      form.resetFields();
    });
  }

  saveFormRef(formRef) {
    this.formRef = formRef;
  }

  postUser(type) {
    if (type === "sendActivationCode") {
      let config = { method: "POST" };
      config.body = {
        username: this.state.username,
        password: this.state.password
      };
      axiosCaptcha(USERS(type), config).then(response => {
        if (response.statusText === "OK") {
          if (response.data.success === true) {
            this.setState({
              isVerificationReSendDisplaying: false,
              username: "",
              password: ""
            });
            this.props.alert(
              5000,
              "info",
              "New activation link has sent to your email!"
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
  }

  handleSignIn(event) {
    IS_CONSOLE_LOG_OPEN && console.log("handle sign in first");
    event.preventDefault();
    let rememberMe = event.target[3].checked;
    let config = { method: "POST" };
    config.body = {
      client_id: jobHaxClientId,
      client_secret: jobHaxClientSecret
    };
    config.body.username = event.target[1].value;
    config.body.password = event.target[2].value;
    axiosCaptcha(USERS("login"), config, "signin").then(response => {
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
          //if signIn page opened because of reCapthcha fail; before setting isUserLoggedIn -> true I am changing location to /signin because otherwise App Router would return <spinner message=reCaptcha checking.../>//
          if (
            window.location.search.split("=")[1] === "reCapthcaCouldNotPassed"
          ) {
            window.location = "/signin";
          } else {
            if (!response.data.data.signup_flow_completed) {
              if (
                this.props.cookie("get", "user_type") &&
                this.props.cookie("get", "user_type").id ===
                  USER_TYPES["alumni"]
              ) {
                window.location = "/alumni-signup?=intro";
              } else {
                window.location = "/signup?=intro";
              }
            } else {
              this.props.passStatesToApp("isUserLoggedIn", true);
              this.props.passStatesToApp("isAuthenticationChecking", false);
            }
          }
        } else {
          if (response.data.error_code === 13) {
            this.setState({
              isVerificationReSendDisplaying: true,
              username: config.body.username,
              password: config.body.password
            });
          } else {
            this.props.alert(
              5000,
              "error",
              "Error: " + response.data.error_message
            );
          }
        }
      } else {
        this.props.alert(5000, "error", "Something went wrong!");
      }
    });
  }

  setCookies(response, googleAccessTokenExpiresOn) {
    this.token = `${
      response.data.data.token_type
    } ${response.data.data.access_token.trim()}`;
    IS_CONSOLE_LOG_OPEN && console.log(this.token);
    this.refresh_token = response.data.data.refresh_token;
    let date = new Date();
    date.setSeconds(date.getSeconds() + response.data.data.expires_in);
    this.props.cookie("set", "user_type", response.data.data.user_type, "/");
    this.props.cookie(
      "set",
      "signup_flow_completed",
      response.data.data.signup_flow_completed,
      "/"
    );
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
    this.props.cookie("set", "remember_me", true, "/");
  }

  handleGoogleSignIn() {
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
            IS_CONSOLE_LOG_OPEN && console.log("signIn response", response);
            if (response.Zi.token_type === "Bearer") {
              let photoUrl = response.w3.Paa;
              let googleAccessTokenExpiresOn = new Date();
              googleAccessTokenExpiresOn.setSeconds(
                googleAccessTokenExpiresOn.getSeconds() + response.Zi.expires_in
              );
              let config = { method: "POST" };
              config.body = {
                client_id: jobHaxClientId,
                client_secret: jobHaxClientSecret,
                provider: "google-oauth2"
              };
              config.body.token = this.googleAuth.currentUser
                .get()
                .getAuthResponse().access_token;
              axiosCaptcha(USERS("authSocialUser"), config, "signin")
                .then(response => {
                  if (response.statusText === "OK") {
                    if (response.data.success == true) {
                      this.setCookies(response, googleAccessTokenExpiresOn);
                    }
                  }
                  return response;
                })
                .then(response => {
                  if (response.statusText === "OK") {
                    if (response.data.success == true) {
                      this.postGoogleProfilePhoto(photoUrl);
                      IS_CONSOLE_LOG_OPEN &&
                        console.log(this.token, "profile updated?");
                      if (!response.data.data.signup_flow_completed) {
                        if (
                          this.props.cookie("get", "user_type") &&
                          this.props.cookie("get", "user_type").id ===
                            USER_TYPES["alumni"]
                        ) {
                          window.location = "/alumni-signup?=intro";
                        } else {
                          window.location = "/signup?=intro";
                        }
                      }
                      //if signIn page opened because of reCapthcha fail; before setting isUserLoggedIn -> true I am changing location to /signin because otherwise App Router would return <spinner message=reCaptcha checking.../>//
                      if (
                        window.location.search.split("=")[1] ===
                        "reCapthcaCouldNotPassed"
                      ) {
                        window.location = "/signin";
                      } else {
                        if (!response.data.data.signup_flow_completed) {
                          if (
                            this.props.cookie("get", "user_type") &&
                            this.props.cookie("get", "user_type").id ===
                              USER_TYPES["alumni"]
                          ) {
                            window.location = "/alumni-signup?=intro";
                          } else {
                            window.location = "/signup?=intro";
                          }
                        } else {
                          this.props.passStatesToApp("isUserLoggedIn", true);
                          this.props.passStatesToApp(
                            "isAuthenticationChecking",
                            false
                          );
                        }
                      }
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

  generateSignInForm() {
    const { getFieldDecorator } = this.props.form;
    const styleResendPassword = {
      fontSize: "90%",
      marginTop: -12,
      cursor: "pointer",
      textAlign: "end"
    };
    return (
      <Form onSubmit={this.handleSignIn} className="login-form">
        <div className="social-buttons-container">
          {/*<div>
            <div className="social-buttons-google">
              <img
                onClick={this.handleGoogleSignIn}
                src="../../../src/assets/icons/btn_google_signin_light_normal_web@2x.png"
              />
            </div>
          </div>*/}
          <div>
            <Button
              type="primary"
              icon="google"
              onClick={this.handleGoogleSignIn}
              style={{ width: "240px" }}
            >
              {" "}
              Sign In with Google
            </Button>
          </div>
        </div>
        <div className="separator">
          <div className="line" />
          <div> or </div>
          <div className="line" />
        </div>
        <Form.Item>
          {getFieldDecorator("username", {
            rules: [{ required: true, message: "Please enter your username!" }]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Username"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator("password", {
            rules: [{ required: true, message: "Please enter your Password!" }]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder="Password"
            />
          )}
        </Form.Item>
        <Form.Item>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {getFieldDecorator("remember", {
              valuePropName: "checked",
              initialValue: true
            })(<Checkbox>Remember me</Checkbox>)}
            <a
              className="login-form-forgot"
              style={{ fontSize: "90%" }}
              onClick={this.toggleModal}
            >
              Forgot password
            </a>
            <ForgotPasswordModal
              wrappedComponentRef={this.saveFormRef}
              visible={this.state.showModal}
              onCancel={this.toggleModal}
              onCreate={this.handleCreate}
            />
          </div>
          {this.state.isVerificationReSendDisplaying && (
            <div
              style={styleResendPassword}
              onClick={() => this.postUser("sendActivationCode")}
            >
              <a> Resend activation email? </a>
            </div>
          )}
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            style={{ width: "100%", borderRadius: 0 }}
          >
            Log in
          </Button>
          <div>
            Or{" "}
            <Link to="/signup" style={{ fontSize: "90%" }}>
              register now!
            </Link>
          </div>
        </Form.Item>
      </Form>
    );
  }

  generateReCaptchaAlert() {
    if (window.location.search.split("=")[1] === "reCapthcaCouldNotPassed") {
      return (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            zIndex: 100
          }}
        >
          <div>
            <Alert
              type="error"
              message="You could not pass the reCaptcha challenge! Please sign in again!"
              showIcon
            />
          </div>
        </div>
      );
    }
  }

  generateSignIn() {
    return (
      <div className="sign_in-form-container">
        <div className="content-container">
          <h1>Sign in</h1>
          {this.generateSignInForm()}
        </div>
      </div>
    );
  }

  render() {
    IS_CONSOLE_LOG_OPEN && console.log("signIn page render run");
    return (
      <div>
        {this.generateReCaptchaAlert()}
        <div className="sign_in-vertical-container">
          <div className="sign_in-container">{this.generateSignIn()}</div>
        </div>
        <div className="bottom-fixed-footer">
          <Footer />
        </div>
      </div>
    );
  }
}

const SignIn = Form.create({ name: "signin" })(SignInPage);

export default SignIn;
