import React from "react";

import defaultLogo from "../../../../../assets/icons/JobHax-logo-black.svg";
import MoveOptions from "./MoveOptions.jsx";

class ModalHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      updateHeader: this.props.updateHeader,
      card: this.props.card,
      companyLogoError: false
    };
  }

  componentDidUpdate() {
    this.state.updateHeader &&
      this.setState({
        card: this.props.card,
        updateHeader: !this.props.updateHeader
      });
  }

  generateModalHeader() {
    const { card } = this.state;
    return (
      <div className="modal-header-container">
        <div className="modal-header">
          <div className="job-card-info-container">
            <div className="modal-company-icon">
              {card.company_object.cb_company_logo == null ||
              this.state.companyLogoError ? (
                <img src={card.company_object.company_logo || defaultLogo} />
              ) : (
                <img
                  onError={() => this.setState({ companyLogoError: true })}
                  src={card.company_object.cb_company_logo}
                />
              )}
            </div>
            <div className="header-text">
              {card.company_object && (
                <div className="header-text company-name">
                  {card.first_name + " " + card.last_name}
                </div>
              )}
              {card.position && (
                <div className="header-text job-title">
                  {
                    card.position.job
                      .split(",")[0]
                      .split("-")[0]
                      .split("(")[0]
                  }
                </div>
              )}
            </div>
          </div>
          <MoveOptions
            card={this.props.card}
            icon={this.props.icon}
            id={this.props.id}
            columnName={this.props.columnName}
            deleteJobFromList={this.props.deleteJobFromList}
            moveToRejected={this.props.moveToRejected}
            toggleModal={this.props.toggleModal}
            updateApplications={this.props.updateApplications}
            handleTokenExpiration={this.props.handleTokenExpiration}
          />
        </div>
      </div>
    );
  }

  render() {
    return <div>{this.generateModalHeader()}</div>;
  }
}

export default ModalHeader;
