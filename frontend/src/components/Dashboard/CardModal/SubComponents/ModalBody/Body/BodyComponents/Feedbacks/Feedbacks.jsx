import React from "react";
import { Rate, Menu, Dropdown, Button, Icon } from "antd";

import { makeTimeBeautiful } from "../../../../../../../../utils/constants/constants.js";
import { axiosCaptcha } from "../../../../../../../../utils/api/fetch_api";
import { POS_FEEDBACKS } from "../../../../../../../../utils/constants/endpoints.js";
import { IS_CONSOLE_LOG_OPEN } from "../../../../../../../../utils/constants/constants.js";

import "./style.scss";

const desc = ["no hire", "weak", "average", "above average", "strong hire"];

class Feedbacks extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      feedbacksList: this.props.feedbacksList
    };
  }

  componentDidUpdate() {
    if (this.state.feedbacksList != this.props.feedbacksList) {
      this.setState({ feedbacksList: this.props.feedbacksList });
    }
  }

  mapReviews() {
    return this.state.feedbacksList.map(feedback => (
      <div key={feedback.id} className="review-container">
        <div className="review-header">
          <div className="reviewer-name">{feedback.interviewer}</div>
          <div className="header-bottom">
            <div className="date">
              {feedback.interview_round},
              {feedback.interview_date && makeTimeBeautiful(feedback.interview_date, "dateandtime")}
            </div>
            <div style={{ marginTop: "-16px" }}>
              <Rate tooltips={desc} disabled value={feedback.rate} />
            </div>
          </div>
        </div>
        <div className="review-body">
          <div className="review-body-interview">
            {feedback.description != null && feedback.description != "" && (
              <div className="interview-experience">
                <label style={{ margin: "10px 4px 6px 0px" }}>
                  Interview experience:
                </label>
                <div className="interview-notes">{feedback.description}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    ));
  }

  render() {
    IS_CONSOLE_LOG_OPEN && console.log(this.state.feedbacksList);

    return (
      <div className="reviews-big-container">
        <div className="reviews-container">{this.mapReviews()}</div>
      </div>
    );
  }
}

export default Feedbacks;
