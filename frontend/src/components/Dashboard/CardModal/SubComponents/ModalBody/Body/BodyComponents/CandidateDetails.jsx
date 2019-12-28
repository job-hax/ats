import React from "react";

class CandidateDetails extends React.Component {
  constructor(props) {
    super(props);
  }

  generateInfo(label, data) {
    return (
      <div className="info">
        <label>
          <div>{label}</div>
        </label>
        <div className="text">{data}</div>
      </div>
    );
  }

  generateAllInfo() {
    const { card } = this.props;
    return (
      <div>
        {this.generateInfo('Email', card.email)}
        {this.generateInfo('Number', card.phone_number)}
        {this.generateInfo('Reference', card.reference)}
      </div>
    );
  }

  render() {
    return (
      <div className="data">
        <div>{this.generateAllInfo()}</div>
      </div>
    );
  }
}

export default CandidateDetails;
