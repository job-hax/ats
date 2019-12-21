import React, { Component } from "react";
import { Pagination, Input, Switch, Icon, Select } from "antd";
import Footer from "../Partials/Footer/Footer.jsx";

import "./style.scss";
import { axiosCaptcha } from "../../utils/api/fetch_api.js";

const { Search } = Input;
const { Option } = Select;

class CreateProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      companyName: "",
      address:"",
    }

    this.handleInputChange=this.handleInputChange.bind(this);
  }

  handleInputChange(event, state_name){
    event.preventDefault();
    console.log("event",event, `value`, event.target.value, )
    this.setState({[state_name]: event.target.value})
  }

  handleSubmit(){
    let body = {};
    body.address = this.state.address;
    body.companyName = this.state.companyName;
    console.log("body", body)
    axiosCaptcha(url, config).then((response) =>{
      
    })
  }

  render() {
    return (
      <div>
        <div className="companies-big-container">
          <div className="companies-container">
            <div className="title">
              <h2>Create / Edit Company</h2>
                    <Input 
                    placeholder="Enter Company Name"
                    value={this.state.companyName}
                    onChange={(event) => this.handleInputChange(event, "companyName")} ></Input>
            </div>
            <form>
              <div class="form-row">
                <div class="form-group col-md-6">
                  <label for="txtCompanyName">Company Logo</label><br></br>
                  <img src="https://cdn2.iconfinder.com/data/icons/pittogrammi/142/32-512.png" alt="..." class="img-thumbnail"></img>
                </div>
                <div class="form-group col-md-6">
                  <div class="custom-file">
                    <input type="file" class="custom-file-input" id="customFile"></input>
                    <label class="custom-file-label" for="customFile">Choose logo file</label>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group col-md-6">
                  <label for="txtCompanyName">Company Name</label>
                  <input type="text" class="form-control" id="txtCompanyName" placeholder="Company Name"></input>
                </div>
                <div class="form-group col-md-6">
                  <label for="txtWebsite">Website</label>
                  <input type="text" class="form-control" id="txtWebsite" placeholder="Website"></input>
                </div>
              </div>
              <div class="form-group">
                <label for="inputAddress">Address</label>
                    <Input 
                    placeholder="Enter Adress Here"
                    value={this.state.address}
                    onChange={(event) => this.handleInputChange(event, "address")} ></Input>
                <input type="text" class="form-control" id="inputAddress" placeholder="1234 Main St"></input>
              </div>
              <div class="form-group">
                <label for="inputAbout">About Company</label>
                <textarea rows="4" cols="50" class="form-control" id="inputAbout" placeholder="Describe about the company">
                </textarea>
              </div>
              <div class="form-row">
                <div class="form-group col-md-6">
                  <label for="inputCity">City</label>
                  <input type="text" class="form-control" id="inputCity"></input>
                </div>
                <div class="form-group col-md-4">
                  <label for="inputState">State</label>
                  <select id="inputState" class="form-control">
                    <option selected>Choose...</option>
                    <option>...</option>
                  </select>
                </div>
                <div class="form-group col-md-2">
                  <label for="inputZip">Zip</label>
                  <input type="text" class="form-control" id="inputZip"></input>
                </div>
              </div>

              <button type="submit" class="ant-btn ant-btn-primary" onClick={() => this.handleSubmit()}>Save</button>
            </form>
          </div>
        </div>
        <div className="bottom-fixed-footer">
          <Footer />
        </div>
      </div>
    );
  }

}

export default CreateProfile;
