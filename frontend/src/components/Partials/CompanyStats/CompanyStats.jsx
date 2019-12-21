import React from "react";
import { Rate } from "antd";
import { IS_CONSOLE_LOG_OPEN } from "../../../utils/constants/constants";

import "./style.scss";

class CompanyStats extends React.Component {
  constructor(props) {
    super(props);
  }

  generateCompanyRatings() {
    const { company } = this.props;
    let ratingTotal = 0;
    let countTotal = 0;
    let details = [];
    company.ratings.forEach(
      rating => (
        (ratingTotal += Number(rating.id) * Number(rating.count)),
        (countTotal += Number(rating.count)),
        details.push(
          rating.count.toString() + " user voted " + rating.id.toString()
        )
      )
    );
    const averageRating =
      ratingTotal == 0 ? 0 : Math.round(ratingTotal / countTotal);
    IS_CONSOLE_LOG_OPEN && console.log("average rating", averageRating);
    return (
      <div>
        <Rate tooltips={details} disabled value={averageRating} />
      </div>
    );
  }

  generateEmploymentAuthStats() {
    const { company } = this.props;
    return company.supported_employment_auths.map(stat => (
      <div className="authorization-stat-container" key={stat.id}>
        <div
          style={
            stat.id == 1 || window.screen.availWidth < 800
              ? { fontWeight: "normal", marginRight: "5px" }
              : {
                  fontWeight: "normal",
                  marginRight: 5,
                  paddingLeft: 10,
                  borderLeft: "1px solid rgb(239, 239, 239)"
                }
          }
        >
          {stat.value}
        </div>
        <div style={{ display: "flex", justifyContent: "left" }}>
          <div style={{ marginRight: "5px", color: "#3db900" }}>
            {stat.yes == 0
              ? 0
              : Math.round((stat.yes / (stat.yes + stat.no)) * 100)}
            %
          </div>
          <div style={{ marginRight: "10px", color: "#e02020" }}>
            {stat.no == 0
              ? 0
              : Math.round((stat.no / (stat.yes + stat.no)) * 100)}
            %
          </div>
        </div>
      </div>
    ));
  }

  generateCompanyStatistics() {
    return (
      <div>
        {this.props.ratings && this.generateCompanyRatings()}
        {this.props.stats && (
          <div className="statistics-container">
            {this.generateEmploymentAuthStats()}
          </div>
        )}
      </div>
    );
  }

  render() {
    return <div>{this.generateCompanyStatistics()}</div>;
  }
}

export default CompanyStats;
