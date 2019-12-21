import React from "react";
import { Icon, Input, AutoComplete } from "antd";
import ReactTelInput from "react-telephone-input";

import { axiosCaptcha } from "../../../utils/api/fetch_api";
import { CONTACTS, AUTOCOMPLETE } from "../../../utils/constants/endpoints";
import { IS_CONSOLE_LOG_OPEN } from "../../../utils/constants/constants.js";

import "./style.scss";

const { TextArea } = Input;

class ContactCardOnEdit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: this.props.contact ? this.props.contact.first_name : "",
      lastName: this.props.contact ? this.props.contact.last_name : "",
      position: this.props.contact ? this.props.contact.position : "",
      company: this.props.contact ? this.props.contact.company : "",
      email: this.props.contact ? this.props.contact.email : "",
      linkedinUrl: this.props.contact ? this.props.contact.linkedin_url : "",
      description: this.props.contact ? this.props.contact.description : "",
      phoneNumber: this.props.contact ? this.props.contact.phone_number : "",
      contactId: this.props.contact && this.props.contact.id,
      autoCompleteCompanyData: [],
      autoCompletePositionsData: [],
      isClickOutsideActive: true,
      inputWidth:
        window.screen.availWidth > 800 ? 224 : window.screen.availWidth > 400 ? 168 : 128
    };

    this.onChange = this.onChange.bind(this);
    this.handlePhoneNumberChange = this.handlePhoneNumberChange.bind(this);
    this.resetAll = this.resetAll.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleCompanySearch = this.handleCompanySearch.bind(this);
    this.handlePositionsSearch = this.handlePositionsSearch.bind(this);
    this.setIsClickOutsideActive = this.setIsClickOutsideActive.bind(this);
  }

  resetAll() {
    this.setState({
      firstName: this.props.contact ? this.props.contact.name : "",
      lastName: "",
      position: this.props.contact ? this.props.contact.position : "",
      company: this.props.contact ? this.props.contact.company : "",
      email: this.props.contact ? this.props.contact.email : "",
      linkedinUrl: this.props.contact ? this.props.contact.linkedin_url : "",
      description: this.props.contact ? this.props.contact.description : "",
      phoneNumber: this.props.contact ? this.props.contact.phone_number : ""
    });
    this.props.setContactEditDisplay(false);
  }

  async handleSubmit() {
    let body = {
      jobapp_id: this.props.card.id,
      first_name: this.state.firstName,
      last_name: this.state.lastName,
      job_title: this.state.position,
      company: this.state.company,
      email: this.state.email,
      linkedin_url: this.state.linkedinUrl,
      description: this.state.description,
      phone_number: this.state.phoneNumber
    };
    if (this.state.contactId != (null || "")) {
      body["contact_id"] = this.state.contactId;
    }
    await this.props.handleTokenExpiration("contacts add/edit handleSubmit");
    let config = { body: body };
    config.method = this.props.type == "add" ? "POST" : "PUT";
    axiosCaptcha(CONTACTS(this.props.card.id), config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success === true) {
          let contact = response.data.data;
          this.props.type === "add" && this.props.addToContactsList(contact);
          this.props.type === "update" && this.props.editContactsList(contact);
          IS_CONSOLE_LOG_OPEN && console.log("contact added", contact);
          this.props.setContactEditDisplay(false);
        }
      }
    });
  }

  async handleDelete() {
    let body = {
      contact_id: this.state.contactId
    };
    await this.props.handleTokenExpiration("contacts edit deleteSubmit");
    let config = { method: "DELETE" };
    config.body = body;
    axiosCaptcha(CONTACTS(this.props.card.id), config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success === true) {
          this.props.deleteFromContactsList(this.state.contactId);
          IS_CONSOLE_LOG_OPEN &&
            console.log("contact deleted", this.state.contactId);
          this.props.setContactEditDisplay(false);
        }
      }
    });
  }

  onChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
    IS_CONSOLE_LOG_OPEN && console.log("value", event.target.value);
  }

  setIsClickOutsideActive(state) {
    this.setState({ isClickOutsideActive: state });
  }

  handleCompanySearch(value) {
    this.setState({ company: value });
    this.setIsClickOutsideActive(false);
    let url =
      "https://autocomplete.clearbit.com/v1/companies/suggest?query=" + value;
    let config = {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      }
    };
    axiosCaptcha(url, config).then(response => {
      if (response.statusText === "OK") {
        IS_CONSOLE_LOG_OPEN && console.log(response);
        let bufferList = [];
        response.data.forEach(company => bufferList.push(company.name));
        this.setState({
          autoCompleteCompanyData: bufferList
        });
      }
    });
  }

  handlePositionsSearch(value) {
    this.setState({ position: value });
    this.setIsClickOutsideActive(false);
    let config = { method: "GET" };
    let newUrl = AUTOCOMPLETE("positions") + "?q=" + value + "&count=5";
    axiosCaptcha(newUrl, config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          IS_CONSOLE_LOG_OPEN && console.log(response.data);
          let bufferPositionsList = [];
          response.data.data.forEach(position =>
            bufferPositionsList.push(position.job_title)
          );
          this.setState({
            autoCompletePositionsData: bufferPositionsList
          });
        }
      }
    });
  }

  handlePhoneNumberChange(telNumber) {
    this.setState({ phoneNumber: telNumber });
    IS_CONSOLE_LOG_OPEN && console.log("number", telNumber);
  }

  generateHeader() {
    const margin =
      window.screen.availWidth < 400 ? "0px 12px 0px 0px" : "0px 26px 0px 0px";
    return (
      <div className="header" style={{ display: "table" }}>
        <div className="name" style={{ margin: "0px 0px 12px 0px" }}>
          Name
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start"
          }}
        >
          <div>
            <Input
              name="firstName"
              value={this.state.firstName}
              onChange={this.onChange}
              placeholder="First Name"
              style={{ width: this.state.inputWidth, margin: margin }}
            />
          </div>
          <div>
            <Input
              name="lastName"
              value={this.state.lastName}
              onChange={this.onChange}
              placeholder="Last Name"
              style={{ width: this.state.inputWidth }}
            />
          </div>
        </div>
      </div>
    );
  }

  generateBody() {
    return (
      <div className="body">
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div className="body-component">
            <div className="component-title">Contact Details</div>
            <div className="component-info">
              <Input
                prefix={
                  <Icon type="mail" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                name="email"
                value={this.state.email}
                onChange={this.onChange}
                placeholder="E-mail"
                style={{ width: this.state.inputWidth }}
              />
            </div>
            <div
              style={{
                padding: "8px 8px 0px 24px",
                width: this.state.inputWidth + 32,
                height: "40px"
              }}
            >
              <ReactTelInput
                defaultCountry="us"
                preferredCountries={["us"]}
                value={this.state.phoneNumber}
                flagsImagePath={require("../../../assets/icons/flags.png")}
                onChange={this.handlePhoneNumberChange}
              />
            </div>
            <div className="component-info">
              <Input
                prefix={
                  <Icon
                    type="linkedin"
                    theme="filled"
                    style={{ color: "rgba(0,0,0,.25)" }}
                  />
                }
                name="linkedinUrl"
                value={this.state.linkedinUrl}
                onChange={this.onChange}
                placeholder="LinkedIn URL"
                style={{ width: this.state.inputWidth }}
              />
            </div>
          </div>
          <div className="body-component" style={{ margin: "0 0 0 -28px" }}>
            <div className="component-title">Employment Details</div>
            <div className="component-info">
              <AutoComplete
                name="company"
                dataSource={this.state.autoCompleteCompanyData}
                style={{ width: this.state.inputWidth }}
                onSearch={this.handleCompanySearch}
                placeholder="Company"
                value={this.state.company}
                onSelect={value => this.setState({ company: value })}
              />
            </div>
            <div className="component-info">
              <AutoComplete
                name="position"
                dataSource={this.state.autoCompletePositionsData}
                style={{ width: this.state.inputWidth }}
                onSearch={this.handlePositionsSearch}
                placeholder="Job Title"
                value={this.state.position}
                onSelect={value => this.setState({ position: value })}
              />
            </div>
          </div>
        </div>
        <div className="body-component">
          <div className="component-title">Description</div>
          <div className="component-info" style={{ margin: "0 16px 0 0" }}>
            <TextArea
              name="description"
              placeholder="+ Add Description"
              value={this.state.description}
              onChange={this.onChange}
              autosize={{ maxRows: 9 }}
            />
          </div>
        </div>
      </div>
    );
  }

  generateButtons() {
    return (
      <div className="buttons-container">
        <div>
          {this.props.type === "update" && (
            <div className="delete" onClick={this.handleDelete}>
              Delete
            </div>
          )}
        </div>
        <div className="right-buttons-container">
          <div className="cancel" onClick={this.resetAll}>
            Cancel
          </div>
          <div className="save" onClick={this.handleSubmit}>
            Save
          </div>
        </div>
      </div>
    );
  }

  generateContactCard() {
    return (
      <div className="contact-card">
        <div>{this.generateHeader()}</div>
        <div>{this.generateBody()}</div>
        <div>{this.generateButtons()}</div>
      </div>
    );
  }

  render() {
    return <div ref={this.setWrapperRef}>{this.generateContactCard()}</div>;
  }
}

export default ContactCardOnEdit;
