import React, { Component } from "react";
import {
  AutoComplete,
  Pagination,
  Input,
  Switch,
  Icon,
  Select,
  Modal,
  Dropdown,
  Menu
} from "antd";
import Spinner from "../Partials/Spinner/Spinner.jsx";
import PositionCards from "./PositionCards/PositionCards.jsx";
import Footer from "../Partials/Footer/Footer.jsx";
import { axiosCaptcha } from "../../utils/api/fetch_api";
import { IS_CONSOLE_LOG_OPEN } from "../../utils/constants/constants.js";
import {
  COMPANY_POSITIONS,
  GET_COMPANY_POSITIONS,
  USERS,
  AUTOCOMPLETE
} from "../../utils/constants/endpoints.js";

import "./style.scss";

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const inputWidth =
  window.screen.availWidth < 350 ? window.screen.availWidth - 182 : 168;

class Positions extends Component {
  constructor(props) {
    super(props);

    this.showModal = this.showModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.deletePosition = this.deletePosition.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePositionsSearch = this.handlePositionsSearch.bind(this);
    this.handleJobTitleSearch = this.handleJobTitleSearch.bind(this);
    this.editPosition = this.editPosition.bind(this);
    this.setCountryOrStateList = this.setCountryOrStateList.bind(this);
    this.generateUrlForGetData = this.generateUrlForGetData.bind(this);
    this.handleFilterChagne = this.handleFilterChagne.bind(this);

    this.state = {
      isWaitingResponse: false,
      isInitialRequest: "beforeRequest",
      isNewPageRequested: false,
      isDetailsRequested: false,
      isQueryRequested: false,
      countryList: [],
      stateOrProvinceList: [],
      company_id: null,
      positions: {
        data: [],
        pagination: {}
      },
      pageNo: 1,
      pageSize: 10,
      q: "",
      fitlerDepartment: "",
      filterType: "",
      mine: true,
      searchClicked: false,
      modalVisible: false,
      autoCompletePositionsData: [],
      position_id: "",
      job_title: null,
      responsibilities: "",
      requirements: "",
      city: "",
      stateOrProvince: "",
      state_id: "",
      country: "",
      country_id: "",
      department: "",
      job_type: ""
    };
  }

  async componentDidMount() {
    this.setState({ isInitialRequest: true });

    axiosCaptcha(USERS("profile"), { method: "GET" }).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          this.data = response.data.data;
          this.setState({
            company_id: this.data.company.id
          });

          this.getPositions("initialRequest");
        }
      }
    });
  }

  componentDidUpdate() {
    if (this.props.cookie("get", "jobhax_access_token") != ("" || null)) {
      if (this.state.isNewPageRequested === true) {
        this.getPositions("newPageRequest");
        this.setState({ isNewPageRequested: false });
      }
      if (this.state.isQueryRequested === true) {
        this.getPositions("queryRequest");
        this.setState({ isQueryRequested: false });
      }
    }
  }

  getPositions(requestType) {
    let requestURL = `${this.state.company_id}&page_size=${this.state.pageSize}&page=${this.state.pageNo}`;
    if (this.state.q.length !== 0) {
      requestURL = `${requestURL}&q=${this.state.q}`;
    }
    if (this.state.fitlerDepartment.length !== 0) {
      requestURL = `${requestURL}&department=${this.state.fitlerDepartment}`;
    }
    if (this.state.filterType.length !== 0) {
      requestURL = `${requestURL}&type=${this.state.filterType}`;
    }
    axiosCaptcha(GET_COMPANY_POSITIONS(requestURL), {
      method: "GET"
    }).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          this.data = response.data;
          if (requestType === "initialRequest") {
            this.setState({
              positions: {
                data: this.data.data,
                pagination: this.data.pagination
              },
              isWaitingResponse: false,
              isInitialRequest: false
            });
          } else if (requestType === "newPageRequest") {
            this.setState({
              positions: {
                data: this.data.data,
                pagination: this.data.pagination
              },
              isWaitingResponse: false,
              isNewPageRequested: false
            });
          } else if (requestType === "queryRequest") {
            this.setState({
              positions: {
                data: this.data.data,
                pagination: this.data.pagination
              },
              isWaitingResponse: false,
              isQueryRequested: false
            });
          }
        }
      }
    });
  }

  handleJobTitleSearch(value) {
    this.setState({ ...this.state, q: value, isQueryRequested: true });
  }

  handleFilterChagne(type, value) {
    if (type === "department") {
      this.setState({
        ...this.state,
        fitlerDepartment: value,
        isQueryRequested: true
      });
    }
    if (type === "type") {
      this.setState({
        ...this.state,
        filterType: value,
        isQueryRequested: true
      });
    }
  }

  deletePosition(id) {
    axiosCaptcha(COMPANY_POSITIONS, {
      method: "DELETE",
      body: { position_id: id }
    }).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          this.getPositions("newPageRequest");
        }
      }
    });
  }

  editPosition(position) {
    this.setState({
      ...this.state,
      position_id: position.id,
      job_title: position.job.job_title,
      department: position.department,
      job_type: position.job.job_title_type,
      responsibilities: position.responsibilities,
      requirements: position.requirements,
      city: position.city,
      stateOrProvince: position.state.name,
      state_id: position.state.id,
      country: position.country.name,
      country_id: position.country.id,
      modalVisible: true
    });
  }

  async handlePositionsSearch(value) {
    this.setState({ job_title: value });
    await this.props.handleTokenExpiration("jobInput handlePositionsSearch");
    let config = { method: "GET" };
    let newUrl = AUTOCOMPLETE("positions") + "?q=" + value + "&count=5";
    axiosCaptcha(newUrl, config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          IS_CONSOLE_LOG_OPEN && console.log(response.data);
          let bufferPositionsList = [];
          response.data.data.forEach(position =>
            bufferPositionsList.push(position.job.job_title_title)
          );
          this.setState({
            autoCompletePositionsData: bufferPositionsList
          });
        }
      }
    });
  }

  handlePageChange(page) {
    this.setState({ pageNo: page, isNewPageRequested: true });
  }

  generatePositions() {
    return this.state.positions.data.map(position => (
      <div key={position.id}>
        <PositionCards
          position={position}
          deletePosition={this.deletePosition}
          editPosition={this.editPosition}
          handleTokenExpiration={this.props.handleTokenExpiration}
        />
      </div>
    ));
  }

  setCountryOrStateList(event, state_type, id_type) {
    if (
      state_type == "country" &&
      this.state.country != "" &&
      this.state.country != event.item.props.children
    ) {
      let emptyList = [];
      this.setState({
        stateOrProvince: "",
        state_id: null,
        stateOrProvinceList: emptyList
      });
    }
    this.setState({
      [state_type]: event.item.props.children,
      [id_type]: parseInt(event.key)
    });
    if (state_type == "country") {
      this.handleAutoCompleteSearch(parseInt(event.key), "stateOrProvince");
    }
  }

  generateUrlForGetData(value, type) {
    if (type === "positions") {
      let newUrl = AUTOCOMPLETE(type) + "?q=" + value + "&count=5";
      this.setState({ job_title: value });
      return newUrl;
    } else if (type === "countries") {
      let newUrl = AUTOCOMPLETE(type);
      return newUrl;
    } else if (type === "stateOrProvince") {
      let newUrl = AUTOCOMPLETE("countries") + value + "/states/";
      return newUrl;
    }
  }

  async handleAutoCompleteSearch(value, type) {
    let config = { method: "GET" };
    let newUrl = await this.generateUrlForGetData(value, type);
    axiosCaptcha(newUrl, config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          let bufferList = [];
          if (type === "positions") {
            response.data.data.forEach(element =>
              bufferList.push(element.job_title)
            );
            this.setState({ positionAutoCompleteData: bufferList });
          } else if (type === "countries") {
            let countriesList = response.data.data;
            this.setState({ countryList: countriesList });
          } else if (type === "stateOrProvince") {
            let statesList = response.data.data;
            this.setState({ stateOrProvinceList: statesList });
          }
        }
      }
    });
  }

  showModal() {
    this.setState({ ...this.state, modalVisible: true });
  }

  handleOk() {
    let config = {};
    let post_body = {
      job_title: this.state.job_title,
      department: this.state.department,
      job_type: this.state.job_type,
      responsibilities: this.state.responsibilities,
      requirements: this.state.requirements,
      city: this.state.city,
      state_id: this.state.state_id,
      country_id: this.state.country_id,
      company_id: this.state.company_id
    };

    if (this.state.position_id) {
      post_body.position_id = this.state.position_id;
      config.method = "PATCH";
      config.body = post_body;
    } else {
      config.method = "POST";
      config.body = post_body;
    }

    axiosCaptcha(COMPANY_POSITIONS, config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          this.setState({
            ...this.state,
            modalVisible: false,
            job_title: null,
            responsibilities: "",
            requirements: "",
            city: "",
            state_id: "",
            stateOrProvince: "",
            country_id: "",
            country: "",
            department: "",
            job_type: ""
          });
          this.getPositions("newPageRequest");
        }
      }
    });
  }

  handleCancel() {
    this.setState({
      ...this.state,
      modalVisible: false,
      position_id: "",
      job_title: null,
      responsibilities: "",
      requirements: "",
      city: "",
      state_id: "",
      stateOrProvince: "",
      country_id: "",
      country: "",
      department: "",
      job_type: ""
    });
  }

  render() {
    if (this.state.isInitialRequest === "beforeRequest")
      return <Spinner message="Reaching your account..." />;
    else if (this.state.isInitialRequest === true)
      return <Spinner message="Preparing positions..." />;
    if (this.state.isNewPageRequested === true)
      return <Spinner message={"Preparing page " + this.state.pageNo} />;
    if (this.state.isInitialRequest === false) {
      const { job_title } = this.state;
      const menu = (state_type, id_type, data_list) => (
        <Menu
          onClick={event =>
            this.setCountryOrStateList(event, state_type, id_type)
          }
          style={{
            width: "240px",
            maxHeight: "260px",
            textAlign: "center",
            overflowX: "hidden"
          }}
        >
          {data_list.map(data => (
            <Menu.Item key={data.id}>{data.name}</Menu.Item>
          ))}
        </Menu>
      );
      return (
        <div>
          <div className="positions-big-container">
            <div className="positions-container">
              <div className="title">
                <h2>Positions</h2>
              </div>
              <div className="positions-card-container">
                <Search
                  placeholder="search"
                  onSearch={this.handleJobTitleSearch}
                  enterButton
                />
                <div className="positions-filter">
                  <div className="positions-filter-options">
                    Filter by:
                    <Select
                      defaultValue=""
                      onChange={value =>
                        this.handleFilterChagne("department", value)
                      }
                    >
                      <Option value="">Department</Option>
                      <Option value="Business">Business</Option>
                      <Option value="Engineering">Engineering</Option>
                      <Option value="Finance">Finance</Option>
                      <Option value="Marketing">Marketing</Option>
                      <Option value="Legal">Legal</Option>
                    </Select>
                    <Select
                      defaultValue=""
                      onChange={value => this.handleFilterChagne("type", value)}
                    >
                      <Option value="">Type</Option>
                      <Option value="Full Time">Full Time</Option>
                      <Option value="Part Time">Part Time</Option>
                      <Option value="Contractor">Contractor</Option>
                    </Select>
                  </div>

                  <button
                    type="submit"
                    class="ant-btn ant-btn-primary positions-filter-button"
                    onClick={this.showModal}
                  >
                    Create Position
                  </button>

                  <Modal
                    title="Create Position"
                    visible={this.state.modalVisible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                  >
                    <AutoComplete
                      dataSource={this.state.autoCompletePositionsData}
                      style={{ marginTop: "4px" }}
                      className="input-addJob"
                      onSearch={this.handlePositionsSearch}
                      placeholder="Job Title"
                      value={job_title}
                      onSelect={value => this.setState({ job_title: value })}
                    />
                    <div class="form-group">
                      <Select
                        value={this.state.department}
                        onChange={value => this.setState({ department: value })}
                      >
                        <Option value="">Department</Option>
                        <Option value="Business">Business</Option>
                        <Option value="Engineering">Engineering</Option>
                        <Option value="Finance">Finance</Option>
                        <Option value="Marketing">Marketing</Option>
                        <Option value="Legal">Legal</Option>
                      </Select>
                    </div>
                    <div class="form-group">
                      <Select
                        value={this.state.job_type}
                        onChange={value => this.setState({ job_type: value })}
                      >
                        <Option value="">Job Type</Option>
                        <Option value="Full Time">Full Time</Option>
                        <Option value="Part Time">Part Time</Option>
                        <Option value="Contractor">Contractor</Option>
                      </Select>
                    </div>
                    <div class="form-group">
                      <div className="info-content-body-item-label">
                        Job Description
                      </div>
                      <TextArea
                        rows={4}
                        value={this.state.responsibilities}
                        onChange={event =>
                          this.setState({
                            responsibilities: event.target.value
                          })
                        }
                      />
                    </div>
                    <div class="form-group">
                      <div className="info-content-body-item-label">
                        Requirements
                      </div>
                      <TextArea
                        rows={4}
                        value={this.state.requirements}
                        onChange={event =>
                          this.setState({ requirements: event.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Dropdown
                        overlay={menu(
                          "country",
                          "country_id",
                          this.state.countryList
                        )}
                        placement="bottomCenter"
                      >
                        <a
                          className="ant-dropdown-link"
                          style={{ color: "rgba(100, 100, 100, 0.9)" }}
                          onMouseEnter={() =>
                            this.state.countryList.length == 0 &&
                            this.handleAutoCompleteSearch(null, "countries")
                          }
                        >
                          {this.state.country != "" || null
                            ? this.state.country
                            : "Please Select a Country"}{" "}
                          <Icon type="down" />
                        </a>
                      </Dropdown>
                      {this.state.country_id != "" && (
                        <div>
                          <Dropdown
                            overlay={menu(
                              "stateOrProvince",
                              "state_id",
                              this.state.stateOrProvinceList
                            )}
                            placement="bottomCenter"
                          >
                            <a
                              className="ant-dropdown-link"
                              style={{
                                color: "rgba(100, 100, 100, 0.9)",
                                margin: "0 0 8px 0"
                              }}
                            >
                              {this.state.stateOrProvince != "" || null
                                ? this.state.stateOrProvince
                                : "Select a State/Province"}{" "}
                              <Icon type="down" />
                            </a>
                          </Dropdown>
                        </div>
                      )}
                      {this.state.state_id !== "" && (
                        <div>
                          <div class="form-group">
                            <Input
                              style={{
                                width: inputWidth
                              }}
                              placeholder="City"
                              value={this.state.city}
                              onChange={event =>
                                this.setState({ city: event.target.value })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Modal>
                </div>
                {this.state.positions.pagination.total_count == 0 ? (
                  <div
                    className="no-data"
                    style={{ textAlign: "center", margin: "24px 0 24px 0" }}
                  >
                    No positions found based on your criteria!
                  </div>
                ) : (
                  this.generatePositions()
                )}
                <div className="pagination-container">
                  <Pagination
                    onChange={this.handlePageChange}
                    defaultCurrent={
                      this.state.positions.pagination.current_page
                    }
                    current={this.state.positions.pagination.current_page}
                    total={this.state.positions.pagination.total_count}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bottom-fixed-footer">
            <Footer />
          </div>
        </div>
      );
    }
  }
}

export default Positions;
