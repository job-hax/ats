import React from "react";
import { message, Upload, Button, Icon } from "antd";

import { axiosCaptcha } from "../../../../../../../../utils/api/fetch_api";
import { RESUME_PARSER } from "../../../../../../../../utils/constants/endpoints.js";

import "./style.scss";

class Resume extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      files: null,
      resumes: []
    };

    this.handleUpload = this.handleUpload.bind(this);
    this.getFiles = this.getFiles.bind(this);
  }

  componentDidMount() {
    this.getFiles();
  }

  async getFiles() {
    await this.props.handleTokenExpiration("files getNotes");
    const { card } = this.props;
    let config = { method: "GET" };
    axiosCaptcha(RESUME_PARSER(card.id), config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          this.setState({ resumes: response.data.data });
        }
      }
    });
  }

  handleUpload(file) {
    const { card } = this.props;
    let bodyFormData = new FormData();
    let config = { method: "POST" };
    config.headers = {};
    config.headers["Content-Type"] = "multipart/form-data";
    bodyFormData.append("resume", file);
    bodyFormData.append("pos_app_id", card.id);
    config.body = bodyFormData;
    const postURl = RESUME_PARSER();
    axiosCaptcha(postURl, config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          message.info("This resume has been uploaded");
          this.getFiles();
        } else {
          message.error("Upload failed");
        }
      } else {
        message.error("Something went wrong");
      }
    });
  }

  generateFiles() {
    return (
      <div>
        <Upload
          action={file => this.handleUpload(file)}
          fileList={this.state.files}
          showUploadList={{ showRemoveIcon: true, showDownloadIcon: true }}
        >
          <Button>
            <Icon type="upload" /> Upload
          </Button>
        </Upload>
        {this.state.resumes.map(item => (
          <div id={item.id} className="resume-wrapper">
            <div className="resume-item">
              <div className="resume-item-label">SUMMARY:</div>
              <div className="resume-item-text">{item.summary}</div>
            </div>
            <div className="resume-item">
              <div className="resume-item-label">SKILLS:</div>
              <div className="resume-item-text">{item.skills.join(", ")}</div>
            </div>
            <div className="resume-item">
              <div className="resume-item-label">CONTACT:</div>
              <div className="resume-item-text">{item.contact.join(", ")}</div>
            </div>
            <div className="resume-item">
              <div className="resume-item-label">COMPANY:</div>
              <div className="resume-item-text">
                {item.company} - {item.position}
              </div>
            </div>
            <div className="resume-item">
              <div className="resume-item-label">CERTIFICATIONS:</div>
              <div className="resume-item-text">{item.certifications.join(", ")}</div>
            </div>
            <div className="resume-item">
              <div className="resume-item-label">LANGUAGES:</div>
              <div className="resume-item-text">{item.languages.join(", ")}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  render() {
    return <div className="card-resume-container">{this.generateFiles()}</div>;
  }
}

export default Resume;
