import React from "react";

import SummaryMetricSingle from "./SummarySingleContainer.jsx";

class SummaryMetricsGroup extends React.Component {
  constructor(props) {
    super(props);
  }

  generateGroup() {
    return this.props.data.map(metric => (
      <div key={this.props.data.indexOf(metric)}>
        <SummaryMetricSingle metric={metric} />
      </div>
    ));
  }

  render() {
    return (
      <div>
        <div className="metric-group">{this.generateGroup()}</div>
      </div>
    );
  }
}

export default SummaryMetricsGroup;
