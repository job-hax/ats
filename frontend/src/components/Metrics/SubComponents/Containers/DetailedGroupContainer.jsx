import React from "react";

import DetailedSingleMetric from "./DetailedSingleContainer.jsx";

class DetailedMetricsGroup extends React.Component {
  constructor(props) {
    super(props);
  }

  generateGroup() {
    return this.props.data.map(metric => (
      <div key={this.props.data.indexOf(metric)}>
        <DetailedSingleMetric graph={metric.graph} list={metric.list} />
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

export default DetailedMetricsGroup;
