import React from "react";
import { Rate, Input, Button, DatePicker, Select } from "antd";

import { axiosCaptcha } from "../../../../../../../../utils/api/fetch_api.js";
import { IS_CONSOLE_LOG_OPEN } from "../../../../../../../../utils/constants/constants.js";
import { POS_FEEDBACKS } from "../../../../../../../../utils/constants/endpoints.js";

const { Option } = Select;

import "./style.scss";

const descRating = [
  "no hire",
  "weak",
  "average",
  "above average",
  "strong hire"
];

class FeedbackInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      interviewer: "",
      interview_round: "",
      description: "",
      rate: null,
      interview_date: null
    };

    this.body = {
      company_id: this.props.card.company_object.id,
      position_id: this.props.card.position.id
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInterviewRatingChange = this.handleInterviewRatingChange.bind(
      this
    );
    this.handleInterviewDateChange = this.handleInterviewDateChange.bind(this);
  }

  async componentDidMount() {
    await this.props.handleTokenExpiration("feedbackInput componentDidMount");
    IS_CONSOLE_LOG_OPEN &&
      console.log("old feeback is", this.props.oldFeedback);
    if (this.props.oldFeedback.id != -1) {
      this.body["feedback_id"] = this.props.oldFeedback.id;
      if (this.props.oldFeedback.description != null) {
        this.setState({
          description: this.props.oldFeedback.description
        });
      }
      if (this.props.oldFeedback.rate != null) {
        this.setState({
          rate: this.props.oldFeedback.rate
        });
      }
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    await this.props.handleTokenExpiration("feedbackInput handleSubmit");
    this.props.toggleReview();
    let config = { method: "POST" };
    config.body = this.body;
    axiosCaptcha(POS_FEEDBACKS(this.props.card.id), config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success === true) {
          IS_CONSOLE_LOG_OPEN &&
            console.log("review Submit Request response", response.data.data);
          this.props.setReview(response.data.data.review);
          this.props.renewReviews();
          this.props.alert(
            5000,
            "success",
            "Your feedback has saved successfully!"
          );
        } else {
          this.setState({ isUpdating: false });
          this.props.alert(
            5000,
            "error",
            "Error: " + response.data.error_message
          );
        }
      } else {
        this.setState({ isUpdating: false });
        this.props.alert(5000, "error", "Something went wrong!");
      }
    });
    this.body = {
      company_id: this.props.card.company_object.id,
      position_id: this.props.card.position.id
    };
  }

  handleInputChange(event) {
    const newValue = event.target.value;
    const name = event.target.name;
    if (event.target.type === "dropdown") {
      this.body["interview_round"] = event.target.textContent;
      this.setState({ interview_round: event.target.textContent });
    } else {
      this.body[name] = newValue;
      this.setState({ [name]: newValue });
    }
  }

  handleInterviewRatingChange(value) {
    this.body["rate"] = value;
    this.setState({ rate: value });
  }

  handleInterviewDateChange(date, dateString) {
    this.body["interview_date"] = dateString;
    this.setState({ interview_date: date });
  }

  generateInterviewFeedbacksPart() {
    const interviewRatingStyle = { width: "200px" };
    return (
      <div>
        <div className="feedback-header">Interview Feedback</div>
        <div>
          <div className="label">Interviewer:</div>
          <Input
            name="interviewer"
            value={this.state.interviewer}
            onChange={this.handleInputChange}
          />
        </div>
        <div>
          <div className="label">Interview Round</div>
          <Select
            name="interview_round"
            value={this.state.interview_round}
            onChange={() => this.handleInputChange(event)}
            style={{ width: 212, position: "relative" }}
          >
            <Option
              id="1"
              title="interview_round"
              type="dropdown"
              key="1"
              value="HR"
            >
              HR
            </Option>
            <Option
              id="2"
              title="interview_round"
              type="dropdown"
              key="2"
              value="Phone"
            >
              Phone
            </Option>
            <Option
              id="3"
              title="interview_round"
              type="dropdown"
              key="3"
              value="Onsite"
            >
              Onsite
            </Option>
          </Select>
        </div>

        <div style={interviewRatingStyle} className="question">
          <div className="label">Overall Rating:</div>
          <Rate
            name="rate"
            value={this.state.rate}
            onChange={this.handleInterviewRatingChange}
            tooltips={descRating}
          />
        </div>
        <div>
          <div className="label">Interview experience:</div>
          <textarea
            id="interview-experience-text"
            name="description"
            type="text"
            className="text-box interview-experience"
            placeholder="+tell about your interview experience"
            value={this.state.description}
            onChange={this.handleInputChange}
          />
        </div>
        <div>
          <div className="label">Interview Date:</div>
          <DatePicker
            value={this.state.interview_date}
            onChange={this.handleInterviewDateChange}
          />
        </div>
      </div>
    );
  }

  generateReviewForm() {
    return (
      <div className="feedback-form-container">
        <form>
          <div className="feedback-form">
            <div className="interview-reviews">
              {this.generateInterviewFeedbacksPart()}
              <div className="feedback-button-container">
                <Button onClick={this.props.toggleReview}>Cancel</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: 12 }}
                  onClick={this.handleSubmit}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  render() {
    return <div>{this.generateReviewForm()}</div>;
  }
}

export default FeedbackInput;
