import React from "react";
import ReactEchartsCore from "echarts-for-react/lib/core";
import echarts from "echarts/dist/echarts.min.js";
class LineGraph extends React.Component {
  constructor(props) {
    super(props);
  }

  chartThemeCreator() {
    echarts.registerTheme("line", {
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

  buildLineGraph() {
    this.chartThemeCreator();
    return {
      title: {
        show: this.props.style.height != "160px" ? true : false,
        text: this.props.metric.title,
        subtext: "",
        x: "left",
        top: "0px"
      },
      tooltip: {
        show: this.props.style.height != "160px" ? true : false,
        trigger: "axis"
      },
      /*legend: {
        data: this.props.metric.legend,
        textStyle: { color: "black" },
        x: "center",
        top: "28px"
      },*/
      toolbox: {
        show: this.props.style.height != "160px" ? true : false,
        title: "save",
        feature: {
          saveAsImage: {
            show: true,
            title: "save",
            iconStyle: { color: "black", emphasis: { color: "black" } }
          }
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: this.props.metric.xAxis
      },
      yAxis: {
        type: "value"
      },
      series: this.props.metric.series
    };
  }

  render() {
    return (
      <div id="applicationtrend">
        <div>
          <ReactEchartsCore
            echarts={echarts}
            notMerge={true}
            lazyUpdate={true}
            option={this.buildLineGraph()}
            style={this.props.style}
            theme="line"
          />
        </div>
      </div>
    );
  }
}

export default LineGraph;
