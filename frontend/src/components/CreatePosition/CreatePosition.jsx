import React, { Component } from "react";
import { Pagination, Input, Switch, Icon, Select } from "antd";
import Footer from "../Partials/Footer/Footer.jsx";



const { Search } = Input;
const { Option } = Select;

class CreateJob extends Component {
  render() {
    return (
      <div>
        <div className="companies-big-container">
          <div className="companies-container">
            <div className="title">
              <h2>Create / Edit Position</h2>
            </div>
            <form>
              <div class="form-row">
                <div class="form-group col-md-6">
                  <label for="txtPositionTitle">Position Title</label>
                  <input type="text" class="form-control" id="txtPositionTitle" placeholder="Enter Position Title"></input>
                </div>
                
              </div>
              <div class="form-group">
                <label for="txtPositionCategory">Category</label>
                <select id="ddlCategory" class="form-control">
                    <option selected>Choose...</option>
                    <option>--Select--</option>
                    <option>Engineering</option>
                    <option>Dev Ops</option>
                  </select>
              </div><div class="form-group">
                <label for="txtPositionStatus">Position Status</label>
                <select id="ddlStatus" class="form-control">
                    <option selected>Choose...</option>
                    <option>--Select--</option>
                    <option>Open</option>
                    <option>Hold</option>
                    <option>Closed</option>
                  </select>
              </div>
              <div class="form-group">
                <label for="inputAbout">Job Description</label>
                <textarea rows="4" cols="50" class="form-control" id="inputAbout" placeholder="Describe about the company">
                </textarea>
              </div>
              <div class="form-row">
                <div class="form-group col-md-4">
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

              <button type="submit" class="ant-btn ant-btn-primary">Save</button>
              <button type="submit" class="vbtn">Delete</button>
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

export default CreateJob;
