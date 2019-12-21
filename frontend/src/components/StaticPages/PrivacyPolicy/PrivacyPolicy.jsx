import React, { Component } from "react";
import Footer from "../../Partials/Footer/Footer.jsx";
import parse from "html-react-parser";

import { axiosCaptcha } from "../../../utils/api/fetch_api.js";
import { AGREEMENTS } from "../../../utils/constants/endpoints.js";

import "../style.scss";

class PrivacyPolicy extends Component {
  constructor(props) {
    super(props);

    this.state = {
      privacy_policy: ""
    };
  }

  componentDidMount() {
    let config = { method: "GET" };
    axiosCaptcha(AGREEMENTS, config).then(response => {
      if (response.statusText === "OK") {
        this.setState({ privacy_policy: response.data.data.privacy });
      }
    });
  }

  generateHeaderArea() {
    return (
      <section className="header-area">
        <div>
          <h2>Privacy Policy</h2>
        </div>
      </section>
    );
  }

  generateInfo() {
    return (
      <div className="info-container">
        <div className="info-area">
          {this.state.privacy_policy.is_html === true
            ? parse(`${this.state.privacy_policy.value}`)
            : this.state.privacy_policy.value}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="static-page-container">
        <div>{this.generateHeaderArea()}</div>
        <div>{this.generateInfo()}</div>
        <div>
          <Footer />
        </div>
      </div>
    );
  }
}

export default PrivacyPolicy;
