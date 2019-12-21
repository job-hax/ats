import React from "react";
import { AutoComplete, DatePicker, Select, Timeline } from "antd";
import moment from "moment";

import { makeTimeBeautiful, IS_CONSOLE_LOG_OPEN } from "../../../../../../../utils/constants/constants.js";
import { axiosCaptcha } from "../../../../../../../utils/api/fetch_api.js";
import { JOB_APPS, GET_SOURCES, AUTOCOMPLETE } from "../../../../../../../utils/constants/endpoints.js";
import CompanyStats from "../../../../../../Partials/CompanyStats/CompanyStats.jsx";

class JobDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isCompanyEditing: false,
      isPositionsEditing: false,
      isApplyDateEditing: false,
      companyName: this.props.card.company_object && this.props.card.company_object.company,
      jobTitle: this.props.card.position && this.props.card.position.job,
      apply_date: makeTimeBeautiful(this.props.card.apply_date, "date"),
      autoCompleteCompanyData: [],
      autoCompletePositionsData: []
    };

    this.body = { jobapp_id: this.props.card.id };

    this.handlePositionsSearch = this.handlePositionsSearch.bind(this);
    this.handleCompanySearch = this.handleCompanySearch.bind(this);
    this.handleApplyDate = this.handleApplyDate.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.toggleCompanyEdit = this.toggleCompanyEdit.bind(this);
    this.togglePositionsEdit = this.togglePositionsEdit.bind(this);
    this.toggleApplyDateEdit = this.toggleApplyDateEdit.bind(this);
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);

    this.inputStyle = { width: "400px", marginTop: "4px" };
  }

  componentDidMount() {
    // this.getApplicationSources();
  }

  async submitChanges() {
    if (this.state.jobTitle.trim() == (null || "")) {
      this.props.alert(3000, "error", "Position cannot be empty!");
      if (this.props.card.position) {
        this.setState({
          jobTitle: this.props.card.position.job
        });
      }
    } else {
      this.body["job_title"] = this.state.jobTitle.trim();
    }
    if (this.state.companyName.trim() == (null || "")) {
      this.props.alert(3000, "error", "Company name cannot be empty!");
      if (this.props.card.company_object) {
        this.setState({
          companyName: this.props.card.company_object.company
        });
      }
    } else {
      this.body["company"] = this.state.companyName.trim();
    }
    let config = { method: "PATCH" };
    config.body = this.body;
    const response = await axiosCaptcha(JOB_APPS, config);
    if (response.statusText === "OK") {
      if (response.data.success === true) {
        this.props.updateCard(
          response.data.data.company_object,
          response.data.data.position,
          response.data.data.apply_date
        );
        this.props.updateHeader();
      } else {
        IS_CONSOLE_LOG_OPEN && console.log(response, response.data.error_message);
        this.props.alert(5000, "error", "Error: " + response.data.error_message);
      }
    } else {
      this.props.alert(5000, "error", "Something went wrong!");
    }
  }

  //Toggle All When Click Outside their group div
  componentWillMount() {
    document.addEventListener("mousedown", this.handleClickOutside, false);
  }

  componentWillUnmount() {
    document.addEventListener("mousedown", this.handleClickOutside, false);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  async handleClickOutside(event) {
    if (
      this.state.isCompanyEditing == true ||
      this.state.isPositionsEditing == true ||
      this.state.isApplicationSourcesEditing == true
    ) {
      if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
        await setTimeout(() => {
          this.toggleAll();
        }, 500);
      }
    }
  }

  toggleAll() {
    this.setState({
      isCompanyEditing: false,
      isPositionsEditing: false,
      isApplyDateEditing: false
    });
    this.submitChanges();
  }

  //Company Info
  toggleCompanyEdit() {
    this.setState({
      isCompanyEditing: true,
      isPositionsEditing: false,
      isApplyDateEditing: false
    });
  }

  handleCompanySearch(value) {
    this.setState({ companyName: value });
    let url = "https://autocomplete.clearbit.com/v1/companies/suggest?query=" + value;
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

  generateCompanyInfo() {
    const { companyName, autoCompleteCompanyData, isCompanyEditing } = this.state;
    const infoClass = this.props.card.editable == true ? "text-editable" : "text";
    return (
      <div className="info">
        <label>
          <div>{"Company"}</div>
        </label>
        {isCompanyEditing == true ? (
          <AutoComplete
            dataSource={autoCompleteCompanyData}
            style={this.inputStyle}
            onSearch={this.handleCompanySearch}
            placeholder="Company Name"
            value={companyName && companyName}
            onSelect={value => this.setState({ companyName: value })}
          />
        ) : this.props.card.editable == true ? (
          <div className={infoClass} onClick={this.toggleCompanyEdit}>
            {companyName && companyName}
          </div>
        ) : (
          <div className={infoClass}>{companyName && companyName}</div>
        )}
      </div>
    );
  }

  //Position Info
  togglePositionsEdit() {
    this.setState({
      isPositionsEditing: true,
      isCompanyEditing: false,
      isApplyDateEditing: false
    });
  }

  handlePositionsSearch(value) {
    this.setState({ jobTitle: value });
    let config = { method: "GET" };
    let newUrl = AUTOCOMPLETE("positions") + "?q=" + value + "&count=5";
    axiosCaptcha(newUrl, config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          IS_CONSOLE_LOG_OPEN && console.log(response.data);
          let bufferPositionsList = [];
          response.data.data.forEach(position => bufferPositionsList.push(position.job));
          this.setState({
            autoCompletePositionsData: bufferPositionsList
          });
        }
      }
    });
  }

  generatePositionsInfo() {
    const { jobTitle, autoCompletePositionsData, isPositionsEditing } = this.state;
    const infoClass = this.props.card.editable == true ? "text-editable" : "text";
    return (
      <div className="info">
        <label>
          <div>{"Position"}</div>
        </label>
        {isPositionsEditing == true ? (
          <AutoComplete
            dataSource={autoCompletePositionsData}
            style={this.inputStyle}
            onSearch={this.handlePositionsSearch}
            placeholder="Job Title"
            value={jobTitle && jobTitle}
            onSelect={value => this.setState({ jobTitle: value })}
          />
        ) : this.props.card.editable == true ? (
          <div className={infoClass} onClick={this.togglePositionsEdit}>
            {jobTitle && jobTitle}
          </div>
        ) : (
          <div className={infoClass}>{jobTitle && jobTitle}</div>
        )}
      </div>
    );
  }

  //Application Date Info
  toggleApplyDateEdit() {
    this.setState({
      isCompanyEditing: false,
      isPositionsEditing: false,
      isApplyDateEditing: true
    });
  }

  handleApplyDate(date, dateString) {
    this.body["application_date"] = date.toISOString().split("T")[0];
    this.submitChanges();
    this.setState({ apply_date: dateString, isApplyDateEditing: false });
  }

  generateApplyDateInfo() {
    IS_CONSOLE_LOG_OPEN && console.log("date", this.props.card.apply_date);
    const dateFormat = "MM.DD.YYYY";
    const { apply_date, isApplyDateEditing } = this.state;
    const infoClass = this.props.card.editable == true ? "text-editable" : "text";
    return (
      <div className="info">
        <label>
          <div>{"Applied on"}</div>
        </label>
        {isApplyDateEditing == true ? (
          <DatePicker
            onChange={this.handleApplyDate}
            defaultValue={moment(new Date(this.props.card.apply_date.split("T")[0] + "T06:00:00"), dateFormat)}
            format={dateFormat}
            style={this.inputStyle}
          />
        ) : this.props.card.editable == true ? (
          <div className={infoClass} onClick={this.toggleApplyDateEdit}>
            {apply_date}
          </div>
        ) : (
          <div className={infoClass}>{apply_date}</div>
        )}
      </div>
    );
  }

  generatePositionDetail() {
    return (
      <div className="info">
        <label>
          <div>Detail</div>
        </label>
        <div className="text">
          <h4>RESPONSIBILITEIS:</h4>
          <p>{this.props.card.position.responsibilities}</p>
          <h4>REQUIREMENTS:</h4>
          <p>{this.props.card.position.requirements}</p>
        </div>
      </div>
    );
  }

  generateAllInfo() {
    return (
      <div>
        {this.generateCompanyInfo()}
        {this.generatePositionsInfo()}
        {this.generateApplyDateInfo()}
        {this.generatePositionDetail()}
      </div>
    );
  }

  render() {
    return (
      <div ref={this.setWrapperRef} className="data">
        <div>{this.generateAllInfo()}</div>
      </div>
    );
  }
}

export default JobDetails;
