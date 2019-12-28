import React from "react";

import JobDetails from "./BodyComponents/JobDetails.jsx";
import Contacts from "./BodyComponents/Contacts.jsx";
import Notes from "./BodyComponents/Notes.jsx";
import Feedback from "./BodyComponents/Feedback.jsx";
import Resume from "./BodyComponents/Resume/Resume.jsx";
import CandidateDetails from "./BodyComponents/CandidateDetails.jsx";

class BodyComponents extends React.Component {
  constructor(props) {
    super(props);
  }

  displaySelector() {
    switch (this.props.displaying) {
      case "Contact":
        return (
          <CandidateDetails
            card={this.props.card}
            alert={this.props.alert}
          />
        );
      case "Position":
        return (
          <JobDetails
            card={this.props.card}
            alert={this.props.alert}
            updateCard={this.props.updateCard}
            updateHeader={this.props.updateHeader}
          />
        );
      case "Resume":
        return (
          <Resume
            card={this.props.card}
            handleTokenExpiration={this.props.handleTokenExpiration}
            alert={this.props.alert}
          />
        );
      case "Feedbacks":
        return (
          <Feedback
            card={this.props.card}
            handleTokenExpiration={this.props.handleTokenExpiration}
            alert={this.props.alert}
            setCompany={this.props.setCompany}
          />
        );
      case "Notes":
        return (
          <div className="notes">
            <Notes card={this.props.card} handleTokenExpiration={this.props.handleTokenExpiration} />
          </div>
        );
    }
  }

  render() {
    return <div className="main">{this.displaySelector()}</div>;
  }
}

export default BodyComponents;
