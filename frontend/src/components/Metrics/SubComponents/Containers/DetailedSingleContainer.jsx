import React from "react";

import LineGraph from "../Graphs/LineGraph.jsx";
import PieChart from "../Graphs/PieChart.jsx";
import BarGraph from "../Graphs/BarGraph.jsx";
import Radar from "../Graphs/Radar.jsx";

class DetailedMetricSingle extends React.Component {
  constructor(props) {
    super(props);
  }

  generateList() {
    let total = this.props.list.total;
    return this.props.list.data.map(source => (
      <div key={this.props.list.data.indexOf(source)}>
        <div>{source.id}</div>
        <div
          style={{
            display: "flex",
            justifyContent: "left"
          }}
        >
          <div>
            <div
              style={{
                height: 16,
                width: 180,
                border: "1px solid grey",
                margin: "0 28px 0 0"
              }}
            >
              <div
                style={{
                  height: 14,
                  width: (source.value / total) * 180,
                  backgroundColor: "black"
                }}
              />
            </div>
          </div>
          <div style={{ margin: "0 12px 0 0", fontWeight: 450 }}>
            {source.value}
          </div>
        </div>
      </div>
    ));
  }

  graphSelector() {
    const style = {
      height: "240px",
      width: "240px",
      margin: "10px"
    };
    const radarStyle = {
      height: "216px",
      width: "246px",
      margin: "24px 0 0 10px"
    };
    switch (this.props.graph.type) {
      case "line":
        return <LineGraph metric={this.props.graph} style={style} />;
      case "pie":
        return <PieChart metric={this.props.graph} style={style} />;
      case "bar":
        return <BarGraph metric={this.props.graph} style={style} />;
      case "radar":
        return <Radar metric={this.props.graph} style={radarStyle} />;
    }
  }

  render() {
    return (
      <div className="metric-detailed-container">
        <div className="metric">
          <div>{this.graphSelector()}</div>
          <div
            style={{
              margin: "10px 0 0 20px",
              color: "black",
              fontWeight: "bold"
            }}
          >
            {this.props.list.title}
          </div>
          <div className="list-container">
            <div className="list">{this.generateList()}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default DetailedMetricSingle;
