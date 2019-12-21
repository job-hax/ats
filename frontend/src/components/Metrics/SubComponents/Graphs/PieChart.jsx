import React from "react";
import ReactEchartsCore from "echarts-for-react/lib/core";
import echarts from "echarts/dist/echarts.min.js";

class PieChart extends React.Component {
  constructor(props) {
    super(props);
  }

  chartThemeCreator() {
    echarts.registerTheme("pie", {
      color: ["#F4EBC1", "#A0C1B8", "#709FB0", "#726A95", "#351F39"],
      backgroundColor: "white",
      textStyle: {
        fontType: "HelveticaNeue",
        color: "black"
      },
      title: {
        textStyle: {
          color: "black"
        }
      }
    });
  }

  buildPieChart() {
    this.chartThemeCreator();
    return {
      title: {
        text: this.props.metric.title,
        x: "left"
      },
      tooltip: {
        show: this.props.style.heigth > 180 ? true : false,
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      /*legend: {
        orient: "vertical",
        left: "right",
        data: this.props.metric.legend
      },*/
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: "save",
            iconStyle: { color: "black", emphasis: { color: "black" } }
          }
        }
      },
      series: [
        {
          name: "Stages",
          type: "pie",
          radius: "55%",
          center: ["50%", "60%"],
          label: {
            normal: { show: false }
          },
          data: this.props.metric.series,
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
        }
      ]
    };
  }

  render() {
    return (
      <div>
        <div id="pie">
          <div>
            <ReactEchartsCore
              echarts={echarts}
              notMerge={true}
              lazyUpdate={true}
              option={this.buildPieChart()}
              style={this.props.style}
              theme="pie"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default PieChart;
