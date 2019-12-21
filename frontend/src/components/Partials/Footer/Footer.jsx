import React, { Component } from "react";
import { Link } from "react-router-dom";

import "./style.scss";

class Footer extends Component {
  render() {
    return (
      <div className="footer-container">
        <div className="footer-content footer-inside-links">
          <Link to="/aboutus">
            <span>About Us</span>
          </Link>
          <a href="https://docs.jobhax.com">
            <span>Docs</span>
          </a>
          <Link to="/privacypolicy">
            <span>Privacy Policy</span>
          </Link>
          <Link to="/faqs">
            <span>FAQ</span>
          </Link>
        </div>
        <div className="footer-content footer-notation">
          <span>JobHax 2019, All Rights Reserved</span>
        </div>
        <div className="footer-content footer-social-links">
          {/*<Link to="/blogs">
              <img
                src="../../../src/assets/icons/beta_flag_2.png"
                style={{
                  position: "absolute",
                  height: "24px",
                  width: "auto",
                  margin: "0px 0 0 38px"
                }}
              />
              <span>Blogs</span>
              </Link>*/}
          <a href="https://github.com/job-hax">
            <span>GitHub</span>
          </a>
          <a href="https://jobhax.slack.com">
            <span>Slack</span>
          </a>
          <a href="https://groups.google.com/forum/#!forum/jobhax">
            <span>Forum</span>
          </a>
        </div>
      </div>
    );
  }
}

export default Footer;
