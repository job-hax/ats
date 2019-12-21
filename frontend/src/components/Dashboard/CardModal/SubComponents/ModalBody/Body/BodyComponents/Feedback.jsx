import React from "react";

import { IS_CONSOLE_LOG_OPEN } from "../../../../../../../utils/constants/constants.js";
import Feedbacks from "./Feedbacks/Feedbacks.jsx";
import FeedbackInput from "./FeedbackInput/FeedbackInput.jsx";
import { axiosCaptcha } from "../../../../../../../utils/api/fetch_api.js";
import { POS_FEEDBACKS } from "../../../../../../../utils/constants/endpoints.js";
import { Button, Icon } from "antd";

class Feedback extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEnteringReview: false,
      isAlreadySubmittedReview: false,
      isReviewsDisplaying: false,
      isUpdated: false,
      isFeedbackChanged: false,
      company: {},
      feedbacksList: [],
      feedback: {
        id: -1
      }
    };

    this.toggleReviewEdit = this.toggleReviewEdit.bind(this);
    this.getPositionsReviews = this.getPositionsReviews.bind(this);
    this.requestUpdate = this.requestUpdate.bind(this);
    this.setReview = this.setReview.bind(this);
  }

  componentDidMount() {
    this.getPositionsReviews();
    if (this.props.card.company_object.review_id) {
      //await this.props.handleTokenExpiration("cardModal componentDidMount"); //I am not checking if token expired here because getNotes from Notes.jsx is already checking right before this one is executed!!!
      let config = { method: "GET" };
      axiosCaptcha(POS_FEEDBACKS(this.props.card.id), config).then(response => {
        if (response.statusText === "OK") {
          this.setState({ review: response.data.data });
          IS_CONSOLE_LOG_OPEN &&
            console.log("reviews old review", response.data.data);
        }
      });
    }
  }

  async componentDidUpdate() {
    if (this.state.isFeedbackChanged === true) {
      IS_CONSOLE_LOG_OPEN && console.log("reviews componentDidUpdate");
      this.getPositionsReviews();
      this.setState({ isFeedbackChanged: false });
    }
  }

  requestUpdate() {
    this.setState({ isFeedbackChanged: true });
  }

  setReview(feedback) {
    this.setState({ feedback: feedback });
  }

  getPositionsReviews() {
    let config = { method: "GET" };
    axiosCaptcha(POS_FEEDBACKS(this.props.card.id), config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          this.setState({
            feedbacksList: response.data.data,
            isReviewsDisplaying: true
          });
        }
      }
    });
  }

  toggleReviewEdit() {
    this.setState({
      isReviewsDisplaying: !this.state.isReviewsDisplaying,
      isEnteringReview: !this.state.isEnteringReview
    });
  }

  render() {
    IS_CONSOLE_LOG_OPEN &&
      console.log("feedback render", this.state.feedbacksList);
    const { card } = this.props;
    const buttonText = this.props.card.company_object.review_id
      ? "Update Your Feedback"
      : "Add a Feedback";
    const iconType = this.props.card.company_object.review_id ? "edit" : "plus";
    return (
      <div style={{ height: "510px", overflow: "hidden" }}>
        <div className="modal-feedback-big-container">
          {!this.state.isEnteringReview && (
            <div className="feedback-entry-container">
              <div className="feedback-button">
                <Button type="primary" onClick={this.toggleReviewEdit}>
                  <Icon type={iconType} />
                  {buttonText}
                </Button>
              </div>
              <div>
                {this.state.feedbacksList.length == 0 && (
                  <div
                    className="no-data"
                    style={{ paddingTop: 80, textAlign: "center" }}
                  >
                    No feedbacks entered for {card.position.job} position
                    at {card.company_object.company}
                  </div>
                )}
                {this.state.isReviewsDisplaying === true && (
                  <div style={{ paddingTop: 40 }}>
                    <Feedbacks
                      feedbacksList={this.state.feedbacksList}
                      positionsList={[]}
                      post_app_id={this.props.card.id}
                      filterDisplay={false}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {this.state.isEnteringReview && (
            <div className="feedback-entry-container">
              <div className="modal-feedbacks-container">
                <FeedbackInput
                  toggleReview={this.toggleReviewEdit}
                  card={this.props.card}
                  setReview={this.setReview}
                  renewReviews={this.requestUpdate}
                  oldFeedback={this.state.feedback}
                  alert={this.props.alert}
                  handleTokenExpiration={this.props.handleTokenExpiration}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Feedback;
