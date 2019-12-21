import React from "react";
import ReactEchartsCore from "echarts-for-react/lib/core";
import echarts from "echarts/dist/echarts.min.js";

class BarGraph extends React.Component {
  constructor(props) {
    super(props);
  }

  chartThemeCreator() {
    echarts.registerTheme("bar", {
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

  buildBarGraph() {
    this.chartThemeCreator();
    return {
      title: {
        text: this.props.metric.title,
        subtext: "",
        x: "left",
        top: "0px"
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      /*legend: {
        data: this.props.metric.legend,
        x: "center",
        top: "28px"
      },*/
      toolbox: {
        show: true,
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
      xAxis: [
        {
          type: "category",
          axisLabel: {
            show: this.props.metric.xAxis.length > 12 ? false : true
          },
          data: this.props.metric.xAxis
        }
      ],
      yAxis: [
        {
          type: "value"
        }
      ],
      series: this.props.metric.series
    };
  }

  render() {
    return (
      <div id="monthlyapplication">
        <div>
          <ReactEchartsCore
            echarts={echarts}
            notMerge={true}
            lazyUpdate={true}
            option={this.buildBarGraph()}
            style={this.props.style}
            theme="bar"
          />
        </div>
      </div>
    );
  }
}

export default BarGraph;
