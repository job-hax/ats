import React from "react";
import { Modal } from "antd";

import ContactCardDetailed from "./ContactCardDetailed.jsx";
import "./style.scss";

class ContactCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDetailedModalShowing: false
    };

    this.setDetailedDisplay = this.setDetailedDisplay.bind(this);
  }

  setDetailedDisplay(state) {
    this.setState({ isDetailedModalShowing: state });
  }

  generateCard() {
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
                <div className="position">{contact.position}</div>
              )}
              {contact.company && (
                <div className="company">{" at " + contact.company}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div
          className="contact-card"
          onClick={() =>
            this.setState({
              isDetailedModalShowing: !this.state.isDetailedModalShowing
            })
          }
        >
          {this.generateCard()}
        </div>
        <div>
          <Modal
            visible={this.state.isDetailedModalShowing}
            footer={null}
            closable={false}
            bodyStyle={{
              padding: 0,
              margin: 0
            }}
          >
            <ContactCardDetailed
              contact={this.props.contact}
              setDetailedDisplay={this.setDetailedDisplay}
              handleTokenExpiration={this.props.handleTokenExpiration}
              editContactsList={this.props.editContactsList}
              deleteFromContactsList={this.props.deleteFromContactsList}
              card={this.props.card}
              isEditable={this.props.isEditable}
            />
          </Modal>
        </div>
      </div>
    );
  }
}

export default ContactCard;
