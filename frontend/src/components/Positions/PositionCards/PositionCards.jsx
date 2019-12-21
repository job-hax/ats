import React, { Component } from "react";
import { Modal, Button, Icon } from "antd";

import "./style.scss";

class PositionCards extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false
    };

    this.showModal = this.showModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleDeletePosition = this.handleDeletePosition.bind(this);
    this.handleEditPosition = this.handleEditPosition.bind(this);
  }

  handleDeletePosition() {
    this.props.deletePosition(this.props.position.id);
  }

  handleEditPosition() {
    this.props.editPosition(this.props.position);
  }

  formateDate(str) {
    let date = new Date(str);
    return date.toLocaleDateString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true
    });
  }

  showModal() {
    this.setState({ ...this.state, modalVisible: true });
  }

  handleOk() {
    this.setState({ ...this.state, modalVisible: false });
  }

  handleCancel() {
    this.setState({ ...this.state, modalVisible: false });
  }

  render() {
    const { position } = this.props;
    return (
      <div className="position-card">
        <div className="position-card-img">
          <img src="https://logo.clearbit.com/testout.com"></img>
        </div>
        <div className="position-card-detail">
          <h3>{position.job.job_title}</h3>
          <div className="small-text all-caps">
            {position.city}, {position.state.name}, {position.country.name} -{" "}
            {position.department} - {position.job_type}
          </div>
          <div className="small-text">
            Posted at: {this.formateDate(position.created_date)}
          </div>
        </div>
        <div className="position-card-button">
          <Button
            style={{borderColor: "green"}}
            onClick={this.showModal}
            // className="btn-view-edit"
          >
            LEARN MORE
          </Button>
          <Button
            className="btn-view-edit"
            onClick={this.handleEditPosition}
          >
            <Icon type="edit" style={{fontSize: 22, color: "steelblue"}} />
          </Button>
          <Button
            className="btn-delete"
            onClick={this.handleDeletePosition}
          >
            <Icon type="delete" style={{fontSize: 22, color: "red"}} />
          </Button>
        </div>
        <Modal
          title={position.job.job_title}
          visible={this.state.modalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <p className="small-text all-caps">
            {position.city}, {position.state.name}, {position.country.name} -{" "}
            {position.department} - {position.job_type}
            <br />
            Posted at: {this.formateDate(position.created_date)}
          </p>
          <h4>RESPONSIBILITES:</h4>
          <p>{position.responsibilities}</p>
          <h4>REQUIREMENTS:</h4>
          <p>{position.requirements}</p>
        </Modal>
      </div>
    );
  }
}

export default PositionCards;
