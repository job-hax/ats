import React from "react";
import { Icon, Modal } from "antd";

import ContactCardOnEdit from "./ContactCardOnEdit.jsx";

import "./style.scss";

class ContactCardDetailed extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditContactShowing: false
    };

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.setEditContactDisplay = this.setEditContactDisplay.bind(this);
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
      this.props.setDetailedDisplay(false);
    }
  }

  setEditContactDisplay(state) {
    this.setState({ isEditContactShowing: state });
  }

  generateHeader() {
    const { contact } = this.props;
    return (
      <div className="header">
        <div className="header-left">
          <div className="avatar">
            <img src="../../../src/assets/icons/SeyfoIcon@2x.png" />
          </div>
          <div>
            <div className="name">
              {contact.first_name + " " + contact.last_name}
            </div>
            <div className="job-info">
              {contact.position && (
                <div className="position">{contact.position + " at "}</div>
              )}
              {contact.company && (
                <div className="company">{contact.company}</div>
              )}
            </div>
          </div>
        </div>

        {this.props.isEditable && (
          <div className="header-right">
            <div
              onClick={() => this.setState({ isEditContactShowing: true })}
              style={{ cursor: "pointer" }}
            >
              <Icon
                type="edit"
                style={{ color: "rgba(0,0,0,.25)", margin: "4px 12px 0 0" }}
              />
            </div>
            <div>
              <Modal
                visible={this.state.isEditContactShowing}
                footer={null}
                closable={false}
                bodyStyle={{
                  padding: 0,
                  margin: 0
                }}
              >
                <ContactCardOnEdit
                  setContactEditDisplay={this.setEditContactDisplay}
                  handleTokenExpiration={this.props.handleTokenExpiration}
                  editContactsList={this.props.editContactsList}
                  deleteFromContactsList={this.props.deleteFromContactsList}
                  contact={this.props.contact}
                  type="update"
                  card={this.props.card}
                />
              </Modal>
            </div>
          </div>
        )}
      </div>
    );
  }

  generateBody() {
    const { contact } = this.props;
    return (
      <div className="body">
        <div className="body-component">
          <div className="component-title">Contact Details</div>
          {contact.email && (
            <div className="component-info">
              <Icon
                type="mail"
                style={{ color: "rgba(0,0,0,.25)", margin: "4px 12px 0 0" }}
              />
              <div>{contact.email}</div>
            </div>
          )}
          {contact.phone_number && (
            <div className="component-info">
              <Icon
                type="phone"
                style={{ color: "rgba(0,0,0,.25)", margin: "4px 12px 0 0" }}
              />
              <div>{contact.phone_number}</div>
            </div>
          )}
          {contact.linkedin_url && (
            <div
              className="component-info"
              style={{ cursor: "pointer" }}
              onClick={() => window.open(contact.linkedin_url)}
            >
              <Icon
                type="linkedin"
                theme="filled"
                style={{ color: "rgba(0,0,0,.25)", margin: "4px 12px 0 0" }}
              />
              <div>{contact.first_name + " " + contact.last_name}</div>
            </div>
          )}
        </div>
        {contact.description && (
          <div className="body-component">
            <div className="component-title">Description</div>
            <div className="component-info">{contact.description}</div>
          </div>
        )}
      </div>
    );
  }

  generateContactCard() {
    return (
      <div className="contact-card">
        <div>{this.generateHeader()}</div>
        <div>{this.generateBody()}</div>
      </div>
    );
  }

  render() {
    return <div ref={this.setWrapperRef}>{this.generateContactCard()}</div>;
  }
}

export default ContactCardDetailed;
