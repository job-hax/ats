import React, { Component } from "react";
import Footer from "../../Partials/Footer/Footer.jsx";
import parse from "html-react-parser";

import { axiosCaptcha } from "../../../utils/api/fetch_api.js";
import { AGREEMENTS } from "../../../utils/constants/endpoints.js";

class UserAgreement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user_agreement: ""
    };
  }

  componentDidMount() {
    let config = { method: "GET" };
    axiosCaptcha(AGREEMENTS, config).then(response => {
      if (response.statusText === "OK") {
        this.setState({ user_agreement: response.data.data.user_agreement });
      }
    });
  }

  generateHeaderArea() {
    return (
      <section className="header-area">
        <div>
          <h2>User Agreement</h2>
        </div>
      </section>
    );
  }

  generateInfo() {
    return (
      <div className="info-container">
        <div className="info-area">
          {this.state.user_agreement.is_html === true
            ? parse(`${this.state.user_agreement.value}`)
            : this.state.user_agreement.value}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="static-page-container">
        <div>
          {this.generateHeaderArea()}
          {this.generateInfo()}
        </div>
        <div>
          <Footer />
        </div>
      </div>
    );
  }
}

export default UserAgreement;
