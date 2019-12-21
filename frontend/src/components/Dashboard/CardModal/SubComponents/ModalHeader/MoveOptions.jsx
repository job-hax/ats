import React from "react";

import {
  APPLICATION_STATUSES_IN_ORDER,
  IS_CONSOLE_LOG_OPEN
} from "../../../../../utils/constants/constants.js";
import { axiosCaptcha } from "../../../../../utils/api/fetch_api";
import { JOB_APPS } from "../../../../../utils/constants/endpoints.js";
import { Button, Icon } from "antd";

class MoveOptions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showOptions: false
    };

    this.toggleOptions = this.toggleOptions.bind(this);
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentWillMount() {
    document.addEventListener("mousedown", this.handleClickOutside, false);
  }

  componentWillUnmount() {
    document.addEventListener("mousedown", this.handleClickOutside, false);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ showOptions: false });
    }
  }

  toggleOptions() {
    this.setState({
      showOptions: !this.state.showOptions
    });
  }

  async deleteJobFunction() {
    await this.props.handleTokenExpiration("moveOptions deleteJobFunction");
    const { card, deleteJobFromList, columnName } = this.props;
    const body = {
      jobapp_id: card.id
    };
    let config = { method: "DELETE" };
    config.body = body;
    axiosCaptcha(JOB_APPS, config).then(response => {
      IS_CONSOLE_LOG_OPEN &&
        console.log("delete job request response\n", response, card);
      if (response.statusText === "OK") {
        IS_CONSOLE_LOG_OPEN && console.log("function ", columnName, card.id);
        deleteJobFromList(columnName, card.id, card.is_rejected);
      }
    });
  }

  async updateAsRejected() {
    await this.props.handleTokenExpiration("moveOptions updateAsRejected");
    const { card, moveToRejected, columnName } = this.props;
    var is_rejected = !card.is_rejected;
    const body = {
      jobapp_id: card.id,
      status_id: card.application_status.id,
      rejected: is_rejected
    };
    moveToRejected(columnName, card, is_rejected);
    this.props.toggleModal();
    let config = { method: "PUT" };
    config.body = body;
    axiosCaptcha(JOB_APPS, config).then(response => {
      IS_CONSOLE_LOG_OPEN &&
        console.log("update to rejected request response\n", response, card);
      if (response.statusText === "OK") {
        if (!response.data.success) {
          window.location = "/dashboard";
        }
      }
    });
  }

  updateCardStatusToOtherStatuses(insertedColumnName) {
    const { card, columnName, updateApplications } = this.props;
    updateApplications(card, columnName, insertedColumnName);
  }

  otherApplicationStatusesGenerator() {
    const { columnName } = this.props;
    var statuses = APPLICATION_STATUSES_IN_ORDER.filter(
      item => item.id !== columnName
    );
    if (this.props.card.is_rejected === true) {
      statuses = statuses.filter(status => status.id !== "toApply");
    }
    return statuses.map(item => (
      <div
        key={item.id}
        className="options"
        value={item.id}
        onClick={() => this.updateCardStatusToOtherStatuses(item.id)}
      >
        <img src={item.icon.toString().split("@")[0] + "InBtn@1x.png"} />
        <p>{item.name}</p>
      </div>
    ));
  }

  moveToOptionsGenerator() {
    const { card, icon } = this.props;
    let optionsContainerHeight =
      this.props.card.is_rejected == true ? { height: 198 } : { height: 228 };
    if (this.state.showOptions) {
      return (
        <div className="options-container" style={optionsContainerHeight}>
          <div className="explanation">MOVE TO:</div>
          {card.application_status.id != 2 ? (
            <div className="options" onClick={() => this.updateAsRejected()}>
              {card.is_rejected ? (
                <div className="ongoing-option">
                  <img src={icon.toString().split("@")[0] + "InBtn@1x.png"} />
                  <p>Ongoing</p>
                </div>
              ) : (
                <div className="rejected-option">
                  <img
                    src={"../../src/assets/icons/RejectedIconInBtn@1x.png"}
                  />
                  <p>Rejected</p>
                </div>
              )}
            </div>
          ) : (
            <div className="unable">
              <img src={"../../src/assets/icons/RejectedIconInBtn@1x.png"} />
              Rejected
            </div>
          )}
          {this.otherApplicationStatusesGenerator()}
          <div
            className="delete-option"
            onClick={() => this.deleteJobFunction()}
          >
            <img src="../../src/assets/icons/DeleteIconInBtn@1x.png" />
            <p>Delete</p>
          </div>
        </div>
      );
    } else {
      return;
    }
  }

  render() {
    const iconType = this.state.showOptions ? "up" : "down";
    return (
      <div className="modal-header options" ref={this.setWrapperRef}>
        <Button
          className="current-status"
          onClick={this.toggleOptions}
          style={{ justifyContent: "space-between" }}
        >
          {/*<img src={this.props.icon.toString().split("@")[0] + "@1x.png"} />*/}
          <p>
            {APPLICATION_STATUSES_IN_ORDER[parseInt(this.props.id) - 1]["name"]}
          </p>
          <Icon type={iconType} style={{ margin: "3px 0px 0px 4px" }} />
        </Button>
        {this.moveToOptionsGenerator()}
      </div>
    );
  }
}

export default MoveOptions;
