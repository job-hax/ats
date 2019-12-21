import React from "react";
import { Collapse } from "antd";
import axios from "axios";

import { FAQS } from "../../../utils/constants/endpoints.js";
import Footer from "../../Partials/Footer/Footer.jsx";
import Spinner from "../../Partials/Spinner/Spinner.jsx";

const Panel = Collapse.Panel;

class FAQ extends React.Component {
  constructor(props) {
    super(props);

    this.state = { isRequested: false, faqList: [] };
  }

  async componentDidMount() {
    let config = { method: "GET" };
    const response = await axios.get(FAQS, config);
    this.setState({ faqList: response.data.data });
  }

  generateHeaderArea() {
    return (
      <section className="header-area">
        <div>
          <h2>Frequently Asked Questions</h2>
        </div>
      </section>
    );
  }

  generateAccordion() {
    return (
      <Collapse accordion>
        {this.state.faqList.map(faq => (
          <Panel key={faq.id} header={faq.title}>
            <p>{faq.description}</p>
          </Panel>
        ))}
      </Collapse>
    );
  }

  render() {
    if (this.state.faqList.length == 0)
      return <Spinner message="Reaching the FAQs..." />;
    return (
      <div className="static-page-container">
        <div>{this.generateHeaderArea()}</div>
        <div>{this.generateAccordion()}</div>
        <div>
          <Footer />
        </div>
      </div>
    );
  }
}

export default FAQ;
