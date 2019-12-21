import React, { PureComponent } from "react";
import ReactDOM from "react-dom";

import ModalHeader from "./SubComponents/ModalHeader/ModalHeader.jsx";
import ModalBody from "./SubComponents/ModalBody/ModalBody.jsx";
import { axiosCaptcha } from "../../../utils/api/fetch_api";
import { USERS } from "../../../utils/constants/endpoints.js";
import { IS_CONSOLE_LOG_OPEN } from "../../../utils/constants/constants.js";

import "./style.scss";

class CardModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      imageLoadError: true,
      whatIsDisplaying: "company",
      isUpdated: false,
      updateHeader: false
    };

    this.updateHeader = this.updateHeader.bind(this);
  }

  async componentDidMount() {
    let config = { method: "POST" };
    axiosCaptcha(USERS("verifyRecaptcha"), config, "card_modal").then(
      response => {
        if (response.statusText === "OK") {
          if (response.data.success != true) {
            this.setState({ isUpdating: false });
            IS_CONSOLE_LOG_OPEN &&
              console.log(response, response.data.error_message);
            this.props.alert(
              5000,
              "error",
              "Error: " + response.data.error_message
            );
          }
        }
      }
    );
  }

  updateHeader() {
    this.setState({ updateHeader: !this.state.updateHeader });
  }

  render() {
    const { toggleModal, card } = this.props;

    return ReactDOM.createPortal(
      <React.Fragment>
        <div className="modal" onClick={toggleModal}>
          <section
            className="modal-main"
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <div id="modal-header">
              <ModalHeader
                card={this.props.card}
                icon={this.props.icon}
                id={this.props.id}
                columnName={this.props.columnName}
                deleteJobFromList={this.props.deleteJobFromList}
                moveToRejected={this.props.moveToRejected}
                updateApplications={this.props.updateApplications}
                handleTokenExpiration={this.props.handleTokenExpiration}
                updateHeader={this.state.updateHeader}
                toggleModal={this.props.toggleModal}
              />
            </div>
            <div className="modal-body">
              <ModalBody
                card={card}
                handleTokenExpiration={this.props.handleTokenExpiration}
                setCompany={this.props.updateCompany}
                updateCard={this.props.updateCard}
                updateHeader={this.updateHeader}
                alert={this.props.alert}
              />
            </div>
          </section>
        </div>
      </React.Fragment>,
      document.querySelector("#modal")
    );
  }
}

export default CardModal;
