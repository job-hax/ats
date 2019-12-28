import React from "react";

import NavigationPanel from "./NavigationPanel/NavigationPanel.jsx";
import BodyComponents from "./Body/BodyComponents.jsx";

class ModalBody extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      displaying: "Contact"
    };

    this.setDisplaying = this.setDisplaying.bind(this);
  }

  setDisplaying(section) {
    this.setState({ displaying: section });
  }

  render() {
    return (
      <div className="modal-body">
        <NavigationPanel
          sections={["Contact", "Resume", "Position", "Feedbacks", "Notes"]}
          setDisplaying={this.setDisplaying}
          displaying={this.state.displaying}
        />
        <div className="modal-body main-container">
          <BodyComponents
            displaying={this.state.displaying}
            card={this.props.card}
            handleTokenExpiration={this.props.handleTokenExpiration}
            alert={this.props.alert}
            setCompany={this.props.setCompany}
            updateCard={this.props.updateCard}
            updateHeader={this.props.updateHeader}
          />
        </div>
      </div>
    );
  }
}

export default ModalBody;
