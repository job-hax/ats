import React from "react";
import { Modal } from "antd";

import ContactCard from "../../../../../../Partials/ContactCards/ContactCard.jsx";
import ContactCardOnEdit from "../../../../../../Partials/ContactCards/ContactCardOnEdit.jsx";
import { axiosCaptcha } from "../../../../../../../utils/api/fetch_api";
import { IS_CONSOLE_LOG_OPEN } from "../../../../../../../utils/constants/constants.js";
import { CONTACTS } from "../../../../../../../utils/constants/endpoints.js";

class Contacts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contacts: [],
      alumni: [],
      isAddContactShowing: false
    };

    this.setAddContactDisplay = this.setAddContactDisplay.bind(this);
    this.addToContactsList = this.addToContactsList.bind(this);
    this.editContactsList = this.editContactsList.bind(this);
    this.deleteFromContactsList = this.deleteFromContactsList.bind(this);
  }

  componentDidMount() {
    this.getContacts();
  }

  async getContacts() {
    await this.props.handleTokenExpiration("contacts getContacts");
    const { card } = this.props;
    let config = { method: "GET" };
    axiosCaptcha(CONTACTS(card.id), config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success == true) {
          this.contacts = response.data.data.contacts;
          this.alumni = response.data.data.alumni.filter(
            each => each.job_position
          );
          this.setState({
            contacts: this.contacts,
            alumni: this.alumni
          });
        }
      }
    });
  }

  addToContactsList(contact) {
    let updatedContacts = this.state.contacts;
    updatedContacts.unshift(contact);
    this.setState(
      { contacts: updatedContacts },
      IS_CONSOLE_LOG_OPEN && console.log("added", this.state.contacts)
    );
  }

  editContactsList(editedContact) {
    let updatedContacts = this.state.contacts.filter(
      contact => contact.id != editedContact.id
    );
    updatedContacts.unshift(editedContact);
    this.setState(
      { contacts: updatedContacts },
      IS_CONSOLE_LOG_OPEN && console.log("updated", this.state.contacts)
    );
  }

  deleteFromContactsList(contactId) {
    let updatedContacts = this.state.contacts;
    this.setState(
      { contacts: updatedContacts.filter(contact => contact.id != contactId) },
      IS_CONSOLE_LOG_OPEN && console.log("edited", this.state.contacts)
    );
  }

  setAddContactDisplay(state) {
    this.setState({ isAddContactShowing: state });
  }

  generateContactCards() {
    return this.state.contacts.map(contact => (
      <div key={contact.id} style={{ cursor: "pointer", margin: 12 }}>
        <ContactCard
          contact={contact}
          card={this.props.card}
          handleTokenExpiration={this.props.handleTokenExpiration}
          editContactsList={this.editContactsList}
          deleteFromContactsList={this.deleteFromContactsList}
          isEditable={true}
        />
      </div>
    ));
  }

  render() {
    IS_CONSOLE_LOG_OPEN && console.log("contacts", this.state.contacts);
    return (
      <div className="contacts">
        <div className="add-contact-button-container">
          <div
            className="add-contact-button"
            onClick={() => this.setAddContactDisplay(true)}
          >
            Add Applicant
          </div>
          <div>
            <Modal
              visible={this.state.isAddContactShowing}
              footer={null}
              closable={false}
              bodyStyle={{ padding: 0, margin: 0 }}
            >
              <ContactCardOnEdit
                setContactEditDisplay={this.setAddContactDisplay}
                handleTokenExpiration={this.props.handleTokenExpiration}
                addToContactsList={this.addToContactsList}
                type="add"
                card={this.props.card}
              />
            </Modal>
          </div>
        </div>

        {this.state.contacts.length + this.state.alumni.length == 0 ? (
          <div className="no-data" style={{ margin: 160 }}>
            You do not have any contacts yet!
          </div>
        ) : (
          <div>
            {this.state.contacts.length > 0 && this.generateContactCards()}
          </div>
        )}
      </div>
    );
  }
}

export default Contacts;
