import React from "react";
import { Rate, Modal, Button, Dropdown, Menu, Icon, Input } from "antd";
import classNames from "classnames";

import { axiosCaptcha } from "../../../utils/api/fetch_api";
import { IS_CONSOLE_LOG_OPEN } from "../../../utils/constants/constants.js";
import { USERS, FEEDBACKS } from "../../../utils/constants/endpoints.js";

import "./style.scss";

const desc = ["terrible", "bad", "normal", "good", "wonderful"];
const { TextArea } = Input;

class FeedBack extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      textValue: "",
      value: null,
      visible: this.props.visible || false,
      feedbackData: {},
      selectedFeedback: { value: "Please Select", id: 0, custom_input: false },
      loading: false
    };

    this.body = {};
    this.showModal = this.showModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleMenuClick = this.handleMenuClick.bind(this);
  }

  componentDidMount() {
    let config = { method: "GET" };
    axiosCaptcha(FEEDBACKS, config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          let feedbackData = response.data.data;
          this.setState({ feedbackData: feedbackData });
        }
      }
    });
  }

  showModal() {
    this.setState({
      visible: true
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.submit();
  }

  async submit() {
    await this.props.handleTokenExpiration("feedback submit");
    let url = this.props.isUserLoggedIn
      ? USERS("feedback")
      : FEEDBACKS + this.state.feedbackData.id + "/answer/";
    if (this.state.textValue.trim() !== ("" || null)) {
      this.props.isUserLoggedIn
        ? (this.body["text"] = this.state.textValue.trim())
        : (this.body["user_input"] = this.state.textValue.trim());
    }
    let config = { method: "POST" };
    config.body = this.body;
    const response = await axiosCaptcha(url, config, false);
    if (response.statusText === "OK") {
      if (response.data.success === true) {
        this.setState({ textValue: "", loading: false, visible: false });
        this.props.passStatesToApp("feedbackEmphasis", false);
        this.props.passStatesToApp("exitIntent", false);
        if (!this.body.item_id === 0 || this.props.isUserLoggedIn) {
          this.props.alert(
            2000,
            "success",
            "Your feedback has been submitted successfully!"
          );
        }
      } else {
        IS_CONSOLE_LOG_OPEN &&
          console.log(response, response.data.error_message);
        if (!this.body.item_id === 0 || this.props.isUserLoggedIn) {
          this.props.alert(
            5000,
            "error",
            "Error: " + response.data.error_message
          );
        }
      }
    } else {
      if (response.data === 500) {
        this.props.alert(
          5000,
          "error",
          "You have to fill the all feedback form!"
        );
      } else {
        this.props.alert(5000, "error", "Something went wrong!");
      }
    }
    this.body = {};
    this.setState({ value: null });
  }

  handleOk() {
    this.setState({ loading: true });
    this.submit();
    setTimeout(() => {}, 1000);
  }

  handleCancel() {
    this.setState({ visible: false, textValue: "" });
    if (!this.props.isUserLoggedIn) {
      this.body["item_id"] = 0;
      this.submit();
    }
    this.props.passStatesToApp("feedbackEmphasis", false);
    this.props.passStatesToApp("exitIntent", false);
  }

  handleChange(value) {
    this.setState({ value });
    this.body["star"] = value;
  }

  handleTextChange(event) {
    this.setState({ textValue: event.target.value });
  }

  handleMenuClick(event) {
    let custom = event.item.props.custom;
    let value = event.item.props.value;
    let id = event.key;
    this.body["item_id"] = id;
    this.setState({
      selectedFeedback: { value: value, id: id, custom_input: custom },
      textValue: ""
    });
  }

  generateFeedbackTypeOne() {
    const { visible } = this.state;

    const menuItems = this.state.feedbackData.items.map(question => (
      <Menu.Item
        key={question.id}
        value={question.value}
        custom={question.custom_input}
      >
        {question.value}
      </Menu.Item>
    ));

    const menu = <Menu onClick={this.handleMenuClick}>{menuItems}</Menu>;

    return (
      <Modal
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        centered
        confirmLoading={this.state.loading}
        title="We’ve created JobHax for you!"
      >
        <h4>Please share your feedback with us.</h4>
        <div>{this.state.feedbackData.title}</div>
        <Dropdown overlay={menu}>
          <Button
            className="ant-dropdown-link"
            style={{
              margin: "12px 0px 16px 0px",
              color: "rgb(34, 34, 34)",
              borderColor: "rgb(217, 217, 217)"
            }}
          >
            {this.state.selectedFeedback.value} <Icon type="down" />
          </Button>
        </Dropdown>
        {this.state.selectedFeedback.custom_input && (
          <TextArea
            value={this.state.textValue}
            onChange={this.handleTextChange}
            placeholder="Please enter"
            autosize={{ minRows: 3, maxRows: 8 }}
          />
        )}
      </Modal>
    );
  }

  generateModal() {
    const { value, visible } = this.state;
    const modalBoxStyle = {
      position: "fixed",
      marginTop: "10%",
      right: "20px",
      color: "black"
    };
    const textBoxStyle = {
      border: "1px solid rgb(239, 239, 239)",
      borderRadius: "4px",
      height: "140px",
      width: "100%",
      marginTop: "8px",
      maxHeight: "140px",
      minHeight: "140px",
      padding: 4
    };
    const quesitonContainerStyle = {
      marginTop: "12px"
    };
    const quesitonLabelStyle = {
      marginTop: "8px"
    };
    const buttonsContainerStyle = {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "16px",
      width: "300px"
    };
    const buttonStyle = {
      paddingTop: "0px",
      marginRight: "16px"
    };

    const feedbackButtonStyle =
      window.location.pathname == "/underconstruction"
        ? { display: "none" }
        : { bottom: "86px" };

    const feedbackButtonClass = classNames({
      "feedback-open-button": true,
      shake: this.props.feedbackEmphasis
    });

    const feedback_two = (
      <Modal
        visible={visible}
        title="Feedback"
        width="340px"
        style={modalBoxStyle}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={null}
      >
        <h4 style={{ color: "black" }}>Your feedback is important for us</h4>
        <form onSubmit={this.handleSubmit}>
          <div style={quesitonContainerStyle} className="question">
            <label style={quesitonLabelStyle} className="question-label">
              How do you like our platform?
            </label>
            <Rate
              tooltips={desc}
              onChange={value => this.handleChange(value)}
              value={value}
            />
            {value ? (
              <span className="ant-rate-text">{desc[value - 1]}</span>
            ) : (
              ""
            )}
          </div>
          <div style={quesitonContainerStyle} className="question">
            <label style={quesitonLabelStyle} className="question-label">
              Would you like to give us a feedback?
            </label>
            <textarea
              style={textBoxStyle}
              className="text-box"
              placeholder="+add feedback"
              value={this.state.textValue}
              onChange={this.handleTextChange}
            />
          </div>
          <div style={buttonsContainerStyle} className="buttons-container">
            <div key="submit" type="primary" onClick={this.handleOk}>
              <Button style={buttonStyle} type="primary" htmlType="submit">
                Submit
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    );

    return (
      <div>
        <div
          className={feedbackButtonClass}
          style={feedbackButtonStyle}
          type="primary"
          onClick={this.showModal}
        >
          <div>
            <img src="../../../../src/assets/icons/feedback_icon.png" />
          </div>
        </div>
        {this.props.isUserLoggedIn
          ? feedback_two
          : this.state.feedbackData.items && this.generateFeedbackTypeOne()}
      </div>
    );
  }

  render() {
    return <div className="feedback-container">{this.generateModal()}</div>;
  }
}

export default FeedBack;
