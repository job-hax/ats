import React from "react";
import ReactEchartsCore from "echarts-for-react/lib/core";
import echarts from "echarts/dist/echarts.min.js";

class Radar extends React.Component {
  constructor(props) {
    super(props);
  }

  chartThemeCreator() {
    echarts.registerTheme("radar", {
      color: [
        "#E82F3A",
        "#0077B5",
        "#2164f4",
        "rgb(64,151,219)",
        "black",
        "rgb(0,0,0)"
      ],
      backgroundColor: "white",
      textStyle: {
        fontType: "HelveticaNeue",
        color: "black"
      },
      title: {
        textStyle: {
          color: "black"
        }
      },
      splitLine: {
        lineStyle: {
          color: "black"
        }
      },
      line: {
        smooth: true,
        symbol: "emptyCircle",
        symbolSize: 3
      }
    });
  }

  buildRadar() {
    this.chartThemeCreator();
    return {
      title: {
        show: false,
        text: this.props.metric.title
      },
      tooltip: {
        trigger: "item"
      },
      /*legend: {
        orient: "vertical",
        left: "right",
        data: this.props.metric.legend && this.props.metric.legend
      },*/
      toolbox: {
        show: false,
        feature: {
          saveAsImage: {
            show: true,
            title: "save",
            iconStyle: { color: "black", emphasis: { color: "black" } }
          }
        }
      },
      radar: this.props.metric.polar,
      calculable: true,
      series: [
        {
          name: this.props.metric.title,
          type: "radar",
          data: this.props.metric.series
        }
      ]
    };
  }

  render() {
    return (
      <div>
        <div id="radar">
          <div
            style={{
              width: 260,
              height: 40,
              margin: "10px 0 -40px 16px",
              display: "flex",
              justifyContent: "left"
            }}
          >
            <div
              style={{ fontWeight: "bold", color: "black", fontSize: "130%" }}
            >
              {this.props.metric.title}
            </div>
            <img
              style={{
                width: 40,
                height: 40,
                margin: "-12px 0 0px 100px",
                zIndex: "20"
              }}
              src="../../../../src/assets/icons/beta_flag_2.png"
            />
          </div>
          <div>
            <ReactEchartsCore
              echarts={echarts}
              notMerge={true}
              lazyUpdate={true}
              option={this.buildRadar()}
              style={this.props.style}
              theme="radar"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Radar;
