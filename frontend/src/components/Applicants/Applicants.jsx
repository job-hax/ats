import React, { Component } from "react";
import ApplicantTable from "./ApplicantTable/ApplicantTable.jsx";
import Footer from "../Partials/Footer/Footer.jsx";
import { JOB_APPS } from "../../utils/constants/endpoints.js";
import { axiosCaptcha } from "../../utils/api/fetch_api";
import { makeTimeBeautiful, TRENDING_STATUS_OPTIONS } from "../../utils/constants/constants.js";

import "./style.scss";

class Applicant extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isWaitingResponse: false,
      isInitialRequest: "beforeRequest",
      isNewPageRequested: false,
      isDetailsRequested: false,
      applicants: []
    };

    this.getData = this.getData.bind(this);
  }

  async componentDidMount() {
    await this.getData();
  }

  getApplicationStatus(id) {
    let val = "";
    TRENDING_STATUS_OPTIONS.forEach(element => {
      if (element.id == id) {
        val = element.value;
      }
    });
    return val;
  }

  async getData() {
    let config = { method: "GET" };
    axiosCaptcha(JOB_APPS, config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success == true) {
          const data = response.data.data.map(item => {
            return {
              ...item,
              full_name: `${item.first_name} ${item.last_name}`,
              job_title: item.position.job.job_title,
              apply_date: makeTimeBeautiful(item.apply_date),
              application_status: this.getApplicationStatus(item.application_status.value)
            };
          });
          this.setState({
            isInitialRequest: false,
            applicants: data
          });
        }
      } else {
        this.setState({
          isInitialRequest: false,
          applicants: []
        });
      }
    });
  }

  render() {
    return (
      <div>
        <div className="applicants-big-container">
          <div className="applicants-container">
            <div className="title">
              <h2>Applicants</h2>
            </div>

            <div className="applicants-card-container">
              <div>
                <ApplicantTable
                  applicants={this.state.applicants}
                  handleTokenExpiration={this.props.handleTokenExpiration}
                  getData={this.getData}
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

export default Applicant;
