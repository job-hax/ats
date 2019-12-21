import React, { PureComponent } from "react";
import CompanyGraphCard from "./CompanyGraphCard/CompanyGraphCard.jsx";
import Footer from "../Partials/Footer/Footer.jsx";
import { Table, Divider, Tag } from "antd";

import { axiosCaptcha } from "../../utils/api/fetch_api";
import { RESUME_PARSER_METRICS } from "../../utils/constants/endpoints.js";
import { IS_CONSOLE_LOG_OPEN, USER_TYPES, USER_TYPE_NAMES } from "../../utils/constants/constants.js";
import Map from "./SubComponents/Map/Map.jsx";
import IndividualMetrics from "./SubComponents/IndividualMetrics/IndividualMetrics.jsx";
import UniversityMetrics from "./SubComponents/UniversityMetrics/UniversityMetrics.jsx";

import "./style.scss";

// start of positions
const positionscolumns = [
  {
    title: "",
    dataIndex: "color",
    key: "color",
    render: text => <div className="colorcode"></div>
  },
  {
    title: "Value",
    dataIndex: "value",
    key: "value"
  },
  {
    title: "%",
    dataIndex: "percentage",
    key: "percentage"
  },
  {
    title: "Count",
    dataIndex: "count",
    key: "count"
  }
];

// end of positions

class Metrics extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      company: null,
      school: null,
      position: null,
      skills: null,
      languages: null,
      degree: null,
      certifications: null
    };
  }

  componentDidMount() {
    this.getMetrics();
  }

  getMetrics() {
    let config = { method: "GET" };
    axiosCaptcha(RESUME_PARSER_METRICS, config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          const data = response.data.data;
          this.setState({
            company: this.processResponse("company", data),
            skills: this.processResponse("skills", data),
            position: this.processResponse("position", data),
            school: this.processResponse("school", data),
            degree: this.processResponse("degree", data),
            languages: this.processResponse("languages", data),
            certifications: this.processResponse("certifications", data)
          });
        }
      }
    });
  }

  processResponse(attr, data) {
    let res = [];

    if (attr in data) {
      const keys = Object.keys(data[attr]);
      for (const key of keys) {
        const item = {
          ...data[attr][key],
          value: key,
          percentage: Number(data[attr][key]["percentage"]).toLocaleString(undefined, {
            style: "percent",
            minimumFractionDigits: 2
          })
        };
        res.push(item);
      }
    }

    return res;
  }

  generateCompanyGraphCard() {
    return;
    <div>
      <CompanyGraphCard />
    </div>;
  }

  render() {
    const { state } = this;
    return (
      <div>
        <div className="metrics-big-group-container">
          <div class="title" style={{ textAlign: "center" }}><h2>Metrics</h2></div>
          <div className="metrics-table">
            <div className="cdiv">
              <h3>Company</h3>
              {/* {this.generateCompanyGraphCard()} */}
              <Table columns={positionscolumns} dataSource={this.state.company} pagination={false} />
            </div>
            <div className="cdiv">
              <h3>Positions</h3>
              <Table columns={positionscolumns} dataSource={this.state.position} pagination={false} />
            </div>
            <div className="cdiv">
              <h3>Schools</h3>
              <Table columns={positionscolumns} dataSource={this.state.school} pagination={false} />
            </div>

          </div>
          <div className="metrics-table">
            <div className="cdiv">
              <h3>Degree</h3>
              <Table columns={positionscolumns} dataSource={this.state.degree} pagination={false} />
            </div>
            <div className="cdiv">
              <h3>Skills</h3>
              <Table columns={positionscolumns} dataSource={this.state.skills} pagination={false} />
            </div>
            <div className="cdiv">
              <h3>Certificates</h3>
              <Table columns={positionscolumns} dataSource={this.state.certifications} pagination={false} />
            </div>

          </div>
          <div className="metrics-table">
            <div className="cdiv">
              <h3>Spoken Languages</h3>
              <Table columns={positionscolumns} dataSource={this.state.languages} pagination={false} />
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

export default Metrics;
