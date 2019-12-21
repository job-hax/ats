import React, { Component } from "react";
import Footer from "../../Partials/Footer/Footer.jsx";

class UnderConstruction extends Component {
  generateHeaderArea() {
    return (
      <section className="header-area">
        <div>
          <h2>sorry</h2>
        </div>
      </section>
    );
  }

  generateInfo() {
    return (
      <div className="info-area">
        <h2>This page is under construction!</h2>
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
        <div className="footer-bottom">
          <Footer />
        </div>
      </div>
    );
  }
}

export default UnderConstruction;
