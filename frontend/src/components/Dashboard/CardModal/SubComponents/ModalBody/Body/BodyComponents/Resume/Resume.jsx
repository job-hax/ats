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

  generateInfo({label, keys, resume}) {
    console.log(label, keys, resume, typeof resume[keys[0]])
    if(keys.length === 1 && resume[keys[0]] === (null || '' || undefined)){return null}
    return (
      <div className="info">
        <div className="label">{label}</div>
        {keys.map(field => (
          typeof resume[field] === 'string' ?
        <div className="text">{resume[field]}</div>
        : typeof resume[field] === 'object' ?
        resume[field].map(item => (
          <div className="text">{item}</div>
        )) : null
        ))}
      </div>
    );
  }

  generateResumeDetails(resume){

    const display_dict = {
      'summary': ['summary'],
      'skills': ['skills'],
      'experience': ['position','company'],
      'education': ['school', 'degree'],
      'certification': ['certification'],
      'language': ['language'],
      'contacts': ['contact', 'linkedin']
    }

    return Object.keys(display_dict).map((key, index) => (
      <div id={index}>{this.generateInfo({label:key, keys:display_dict[key], resume:resume})}</div>
    ))
  }

  generateFiles() {    
    return (
      <div>
        {this.state.resumes.map(resume => (
          <div id={resume.id} style={{marginBottom:20}}>
            {this.generateResumeDetails(resume)}
          </div>
        ))}
        <div >
         <Upload
          action={file => this.handleUpload(file)}
          fileList={this.state.files}
          showUploadList={{ showRemoveIcon: true, showDownloadIcon: true }}
        >
          <Button>
            <Icon type="upload" /> Upload
          </Button>
        </Upload>
        </div>

      </div>
    );
  }

  render() {
    return <div className="card-resume-container">{this.generateFiles()}</div>;
  }
}

export default Resume;
