import React from "react";

import DetailedMetricsGroup from "../Containers/DetailedGroupContainer.jsx";
import SummaryMetricsGroup from "../Containers/SummaryGroupContainer.jsx";
import { axiosCaptcha } from "../../../../utils/api/fetch_api.js";
import { METRICS } from "../../../../utils/constants/endpoints.js";

class IndividualMetrics extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      genericData: [],
      detailedData: [],
      isInitialRequest: "beforeRequest"
    };
  }

  componentDidMount() {
    if (this.props.cookie("get", "jobhax_access_token") != ("" || null)) {
      this.getData();
    }
  }

  getData() {
    if (
      this.props.cookie("get", "jobhax_access_token") != ("" || null) &&
      this.state.isInitialRequest === "beforeRequest"
    ) {
      this.setState({ isInitialRequest: true });
      let config = { method: "GET" };
      axiosCaptcha(METRICS("personal/generic/"), config).then(response => {
        if (response.statusText === "OK") {
          if (response.data.success) {
            this.data = response.data.data;
            this.setState({
              genericData: this.data
            });
          }
        }
      });
      axiosCaptcha(METRICS("personal/detailed/"), config).then(response => {
        if (response.statusText === "OK") {
          if (response.data.success) {
            this.data = response.data.data;
            this.setState({
              detailedData: this.data,
              isInitialRequest: false
            });
          }
        }
      });
    }
  }

  generateDetailedMetricsGroup() {
    return (
      <div style={{ margin: "20px 0px", width: "fit-content" }}>
        <div>
          <SummaryMetricsGroup
            cookie={this.props.cookie}
            data={this.state.genericData}
          />
        </div>
        <div>
          <DetailedMetricsGroup
            cookie={this.props.cookie}
            data={this.state.detailedData}
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div style={{ width: "100%", overflowY: "hidden" }}>
        {this.generateDetailedMetricsGroup()}
      </div>
    );
  }
}

export default IndividualMetrics;
