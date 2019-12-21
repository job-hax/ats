import React from "react";
import { Redirect } from "react-router-dom";
import { Form, Input, Button } from "antd";

import { axiosCaptcha } from "../../../utils/api/fetch_api";
import { IS_CONSOLE_LOG_OPEN } from "../../../utils/constants/constants";
import { USERS } from "../../../utils/constants/endpoints";

import "./style.scss";

class ChangePassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.compareToFirstPassword = this.compareToFirstPassword.bind(this);
    this.validateToNextPassword = this.validateToNextPassword.bind(this);
    this.generateChangePassword = this.generateChangePassword.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        IS_CONSOLE_LOG_OPEN && console.log("Received values of form: ", values);
        let config = { method: "POST" };
        config.body = {
          code: this.props.code,
          password: values.password
        };
        axiosCaptcha(USERS("resetPassword"), config).then(response => {
          if (response.statusText === "OK") {
            if (response.data.success === true) {
              this.setState({ redirect: "signin" });
              this.props.alert(
                5000,
                "success",
                "Your password has changed successfully. You can sign in now!"
              );
            } else {
              this.props.alert(5000, "error", "Something went wrong!");
              this.setState({ redirect: "home" });
            }
          } else {
            this.props.alert(5000, "error", "Something went wrong!");
          }
        });
      }
    });
  }

  compareToFirstPassword(rule, value, callback) {
    const form = this.props.form;
    if (value && value !== form.getFieldValue("password")) {
      callback("Two passwords that you enter is inconsistent!");
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

  generateChangePassword() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 16,
          offset: 8
        }
      }
    };
    return (
      <Form {...formItemLayout} onSubmit={this.handleSubmit}>
        <Form.Item label="Password">
          {getFieldDecorator("password", {
            rules: [
              {
                required: true,
                message: "Please input your password!"
              },
              {
                validator: this.validateToNextPassword
              }
            ]
          })(<Input type="password" />)}
        </Form.Item>
        <Form.Item label="Confirm Password">
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
          })(<Input type="password" onBlur={this.handleConfirmBlur} />)}
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    );
  }

  render() {
    if (this.state.redirect === "home") {
      return <Redirect to="/home" />;
    } else if (this.state.redirect === "signin") {
      return <Redirect to="/signin" />;
    }
    return (
      <div className="change-password-container">
        <div className="change-password-form-container">
          {this.generateChangePassword()}
        </div>
      </div>
    );
  }
}

const ChangePasswordPage = Form.create({ name: "change_password" })(
  ChangePassword
);

export default ChangePasswordPage;
