import React, { PureComponent } from "react";
import classNames from "classnames";
import { AutoComplete, Input, Select, Icon, Menu, Button } from "antd";

import { IS_CONSOLE_LOG_OPEN } from "../../../utils/constants/constants";
import { axiosCaptcha } from "../../../utils/api/fetch_api";
import { GET_COMPANY_POSITIONS } from "../../../utils/constants/endpoints";

import "./style.scss";

const { Option } = AutoComplete;

class JobInput extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      first_name: "",
      last_name: "",
      job_title: "",
      position_id: "",
      autoCompletePositionsData: []
    };
    this.handlePositionsSearch = this.handlePositionsSearch.bind(this);
    this.handleAddNewApplication = this.handleAddNewApplication.bind(this);
    this.cancelJobInputEdit = this.cancelJobInputEdit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handlePositionSelect = this.handlePositionSelect.bind(this);
    this.renderOption = this.renderOption.bind(this);
  }

  handleInputChange(event, type) {
    event.preventDefault();
    if (type === "first_name") {
      this.setState({ first_name: event.target.value });
    }
    if (type === "last_name") {
      this.setState({ last_name: event.target.value });
    }
  }

  handlePositionSelect(value, option) {
    this.setState({ job_title: option.props.text, position_id: value });
  }

  async handlePositionsSearch(value) {
    this.setState({ job_title: value });
    await this.props.handleTokenExpiration("jobInput handlePositionsSearch");
    let config = { method: "GET" };
    let newUrl = GET_COMPANY_POSITIONS(this.props.company.id) + "&q=" + value + "&count=5";
    axiosCaptcha(newUrl, config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          IS_CONSOLE_LOG_OPEN && console.log(response.data);
          let bufferPositionsList = [];
          response.data.data.forEach(position => bufferPositionsList.push(position));
          this.setState({
            autoCompletePositionsData: bufferPositionsList
          });
        }
      }
    });
  }

  handleAddNewApplication() {
    const { columnName } = this.props;
    this.props.toggleJobInput();
    this.props
      .addNewApplication({
        columnName,
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        job_title: this.state.job_title,
        position_id: this.state.position_id
      })
      .then(response => {
        this.setState({
          first_name: "",
          last_name: "",
          job_title: "",
          position_id: ""
        });
      });
  }

  cancelJobInputEdit() {
    this.props.toggleJobInput();
    this.setState({
      first_name: "",
      last_name: "",
      job_title: "",
      position_id: ""
    });
  }

  renderOption(position) {
    return (
      <Option key={position.id} text={position.job}>
        <div className="global-search-item">
          <span className="global-search-item-count">id: {position.id} </span>
          <span className="global-search-item-desc">{position.job}</span>
        </div>
      </Option>
    );
  }

  render() {
    const { showInput, toggleJobInput } = this.props;
    const { first_name, last_name, job_title } = this.state;
    return (
      <div>
        <form className="column-addJob-form" onSubmit={this.handleAddNewApplication}>
          <Input
            placeholder="First Name"
            value={this.state.first_name}
            onChange={event => this.handleInputChange(event, "first_name")}
          />
          <Input
            placeholder="Last Name"
            value={this.state.last_name}
            onChange={event => this.handleInputChange(event, "last_name")}
          />
          <AutoComplete
            dataSource={this.state.autoCompletePositionsData.map(this.renderOption)}
            style={{ marginTop: "4px" }}
            className="input-addJob"
            value={job_title}
            onSearch={this.handlePositionsSearch}
            placeholder="Position"
            onSelect={this.handlePositionSelect}
          />
          <div className="column-addJob-form-buttons-container">
            <button className="column-addJob-form-button" type="reset" onClick={this.cancelJobInputEdit}>
              Cancel
            </button>
            <Button
              type="primary"
              disabled={first_name.trim().length < 1 || last_name.trim().length < 1 || job_title.trim().length < 1}
              onClick={this.handleAddNewApplication}
            >
              Add Candidate
            </Button>
          </div>
        </form>
      </div>
    );
  }
}

export default JobInput;
