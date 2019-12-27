import React, { Component } from "react";
import { DragDropContext } from "react-dnd";
import classNames from "classnames";
import HTML5Backend from "react-dnd-html5-backend";
import { Input, DatePicker, Checkbox, Menu, Dropdown, Icon, Button, message } from "antd";

import Column from "./Column/Column.jsx";
import Spinner from "../Partials/Spinner/Spinner.jsx";
import { axiosCaptcha } from "../../utils/api/fetch_api";
import { IS_MOCKING } from "../../config/config.js";
import { mockJobApps } from "../../utils/api/mockResponses.js";
import { IS_CONSOLE_LOG_OPEN } from "../../utils/constants/constants.js";
import { JOB_APPS, GET_NEW_JOBAPPS, USERS } from "../../utils/constants/endpoints.js";
import { generateCurrentDate } from "../../utils/helpers/helperFunctions.js";

import "./style.scss";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { SubMenu } = Menu;

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      is_demo_user:
        this.props.cookie("get", "is_demo_user") != ("" || null) ? this.props.cookie("get", "is_demo_user") : false,
      company: "",
      allApplications: [],
      toApply: [],
      applied: [],
      phoneScreen: [],
      onsiteInterview: [],
      offer: [],
      appliedRejected: [],
      phoneScreenRejected: [],
      onsiteInterviewRejected: [],
      offerRejected: [],
      isInitialRequest: "beforeRequest",
      selectedJobApplications: [],
      displayingList: [],
      isSycnhingJobApps: false,
      multipleOperationsContainerAnimate: false
    };

    this.toApply = [];
    this.applied = [];
    this.phoneScreen = [];
    this.onsiteInterview = [];
    this.offer = [];
    this.appliedRejected = [];
    this.phoneScreenRejected = [];
    this.onsiteInterviewRejected = [];
    this.offerRejected = [];
    this.selectedJobApplications = [];

    this.updateApplications = this.updateApplications.bind(this);
    this.addNewApplication = this.addNewApplication.bind(this);
    this.deleteJobFromList = this.deleteJobFromList.bind(this);
    this.moveToRejected = this.moveToRejected.bind(this);
    this.onDateQuery = this.onDateQuery.bind(this);
    this.addToSelectedJobApplicationsList = this.addToSelectedJobApplicationsList.bind(this);
    this.onSelectAll = this.onSelectAll.bind(this);
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.moveMultipleOperation = this.moveMultipleOperation.bind(this);
    this.moveMultipleToSpecificRejectedOperation = this.moveMultipleToSpecificRejectedOperation.bind(this);
    this.waitAndTriggerComponentDidUpdate = this.waitAndTriggerComponentDidUpdate.bind(this);
  }

  async componentDidMount() {
    if (this.props.cookie("get", "jobhax_access_token") != ("" || null)) {
      if (this.props.cookie("get", "google_login_first_instance") != ("" || null)) {
        IS_CONSOLE_LOG_OPEN && console.log("first instance sync gmail requested");
        this.props.cookie("remove", "google_login_first_instance");
        this.setState({ isSycnhingJobApps: true });
      }
      await this.getData();
      let config = { method: "POST" };
      axiosCaptcha(USERS("verifyRecaptcha"), config, "dashboard").then(response => {
        if (response.statusText === "OK") {
          if (response.data.success != true) {
            this.setState({ isUpdating: false });
            IS_CONSOLE_LOG_OPEN && console.log(response.data.error_message);
            this.props.alert(5000, "error", "Error: " + response.data.error_message);
          }
        }
      });
      axiosCaptcha(USERS("profile"), { method: "GET" }).then(response => {
        if (response.statusText === "OK") {
          if (response.data.success) {
            this.data = response.data.data;
            this.setState({
              company: this.data.company
            });
          }
        }
      });
    }
  }

  componentDidUpdate(prevProps) {
    this.getData();
    if (prevProps.syncResponseTimestamp != this.props.syncResponseTimestamp || this.state.isSycnhingJobApps == true) {
      this.setState({ isSycnhingJobApps: false });
      let config = { method: "GET" };
      axiosCaptcha(GET_NEW_JOBAPPS(`${new Date().getTime() - 5000}`), config).then(response => {
        if (response.statusText === "OK") {
          if (response.data.success == true) {
            IS_CONSOLE_LOG_OPEN && console.log("sync loop", response);
            if (response.data.data.synching == true) {
              let updatedList = this.state.allApplications;
              response.data.data.data.forEach(newJobApp => {
                const found = updatedList.some(jobApp => jobApp.id === newJobApp.id);
                if (!found) {
                  updatedList.push(newJobApp);
                }
              });
              this.setState({ allApplications: updatedList });
              this.sortJobApplications(updatedList);
              this.waitAndTriggerComponentDidUpdate(3);
            } else {
              this.setState({ isSycnhingJobApps: false });
              this.props.passStatesToApp("isSynchingGmail", false);
              this.props.alert(3000, "success", "Sync completed!");
            }
          }
        }
      });
    }
    if (this.state.multipleOperationsContainerAnimate) {
      setTimeout(() => {
        this.setState({ multipleOperationsContainerAnimate: false });
      }, 100);
    }
  }

  waitAndTriggerComponentDidUpdate(seconds) {
    setTimeout(() => {
      this.setState(
        { isSycnhingJobApps: true },
        IS_CONSOLE_LOG_OPEN && console.log("after wait", this.state.isSycnhingJobApps)
      );
    }, seconds * 1000);
  }

  async getData() {
    if (IS_MOCKING) {
      this.sortJobApplications(mockJobApps.data);
      return;
    }
    if (this.state.isInitialRequest === "beforeRequest") {
      this.setState({ isInitialRequest: true });
      IS_CONSOLE_LOG_OPEN && console.log("dashboard token", this.props.cookie("get", "jobhax_access_token"));
      await this.props.handleTokenExpiration("dashboard getData");
      let config = { method: "GET" };
      axiosCaptcha(JOB_APPS, config).then(response => {
        if (response.statusText === "OK") {
          if (response.data.success == true) {
            let updatedData = response.data.data;
            updatedData.forEach(
              jobApp => (
                (jobApp.isSelected = false),
                (jobApp.timeline = [
                  { id: 1, name: "applied", time: jobApp.apply_date },
                  {
                    id: 2,
                    name: "interview",
                    time: "2019-09-24T00:05:00-07:00"
                  }
                ])
              )
            );
            this.setState({
              isInitialRequest: false,
              allApplications: updatedData,
              displayingList: updatedData
            });
            this.sortJobApplications(updatedData);
            IS_CONSOLE_LOG_OPEN && console.log("dashboard response.data data", response.data.data);
          }
        } else {
          this.setState({
            isInitialRequest: false,
            allApplications: [],
            displayingList: []
          });
        }
      });
    }
  }

  sortJobApplications(applications) {
    this.toApply = [];
    this.applied = [];
    this.phoneScreen = [];
    this.onsiteInterview = [];
    this.offer = [];
    this.appliedRejected = [];
    this.phoneScreenRejected = [];
    this.onsiteInterviewRejected = [];
    this.offerRejected = [];
    for (let application of applications) {
      if (!application.is_changed) {
        application["is_changed"] = false;
      }
      switch (application.application_status.id) {
        case 2:
          this.toApply.push(application);
          break;
        case 1:
          if (application.is_rejected) {
            this.appliedRejected.push(application);
          } else {
            this.applied.push(application);
          }
          break;
        case 6:
          if (application.is_rejected) {
            this.appliedRejected.push(application);
          } else {
            this.applied.push(application);
          }
          break;
        case 3:
          if (application.is_rejected) {
            this.phoneScreenRejected.push(application);
          } else {
            this.phoneScreen.push(application);
          }
          break;
        case 4:
          if (application.is_rejected) {
            this.onsiteInterviewRejected.push(application);
          } else {
            this.onsiteInterview.push(application);
          }
          break;
        case 5:
          if (application.is_rejected) {
            this.offerRejected.push(application);
          } else {
            this.offer.push(application);
          }
          break;
        default:
      }
    }
    this.refreshJobs();
  }

  refreshJobs() {
    this.setState({
      toApply: this.toApply,
      applied: this.applied,
      phoneScreen: this.phoneScreen,
      onsiteInterview: this.onsiteInterview,
      offer: this.offer,
      appliedRejected: this.appliedRejected,
      offerRejected: this.offerRejected,
      onsiteInterviewRejected: this.onsiteInterviewRejected,
      phoneScreenRejected: this.phoneScreenRejected
    });
  }

  addToSelectedJobApplicationsList(command, card) {
    if (command === "add") {
      if (this.selectedJobApplications.length === 0) {
        this.setState({ multipleOperationsContainerAnimate: true });
      }
      this.selectedJobApplications.push({
        jobApp_id: card.id,
        application_status: card.application_status
      });
    }
    if (command === "delete") {
      this.selectedJobApplications = this.selectedJobApplications.filter(job => {
        return job.jobApp_id !== card.id;
      });
    }
    this.setState({ selectedJobApplications: this.selectedJobApplications });
    IS_CONSOLE_LOG_OPEN && console.log(this.selectedJobApplications);
  }

  async updateApplications(card, dragColumnName, dropColumnName) {
    const statuses = {
      applied: {
        id: 1,
        value: "APPLIED"
      },
      toApply: {
        id: 2,
        value: "TO APPLY"
      },
      phoneScreen: {
        id: 3,
        value: "PHONE SCREEN"
      },
      onsiteInterview: {
        id: 4,
        value: "ONSITE INTERVIEW"
      },
      offer: {
        id: 5,
        value: "OFFER"
      }
    };
    if (dragColumnName === dropColumnName) {
      return;
    }
    //IS_CONSOLE_LOG_OPEN && console.log(statuses);
    let newDisplayingJobappsList = this.state.displayingList.filter(jobapp => jobapp.id != card.id);
    let updatedCard = card;
    let newStatus = statuses[dropColumnName];
    updatedCard.application_status = newStatus;
    updatedCard.is_changed = "added";
    newDisplayingJobappsList.unshift(updatedCard);
    this.sortJobApplications(newDisplayingJobappsList);
    await this.props.handleTokenExpiration("dashboard updateApplications");
    IS_CONSOLE_LOG_OPEN && console.log("ok? after", dropColumnName, statuses);
    let config = { method: "PUT" };
    config.body = {
      jobapp_id: card.id,
      status_id: card.application_status.id,
      rejected: card.is_rejected
    };
    axiosCaptcha(JOB_APPS, config).then(response => {
      if (response.data.success != true) {
        window.location.reload(true);
      }
    });
  }

  async addNewApplication({ first_name, last_name, position_id, job_title, columnName }) {
    const statuses = {
      applied: {
        id: 1,
        value: "APPLIED"
      },
      toApply: {
        id: 2,
        value: "TO APPLY"
      },
      phoneScreen: {
        id: 3,
        value: "PHONE SCREEN"
      },
      onsiteInterview: {
        id: 4,
        value: "ONSITE INTERVIEW"
      },
      offer: {
        id: 5,
        value: "OFFER"
      }
    };
    await this.props.handleTokenExpiration("dashboard addNewApplication");
    let config = { method: "POST" };
    config.body = {
      position_id: position_id,
      status_id: statuses[columnName].id,
      first_name: first_name,
      last_name: last_name,
      company: this.state.company.company,
      application_date: generateCurrentDate(),
      source: "N/A"
    };
    let jobCardFirstInstance = {
      id: -1,
      first_name: first_name,
      last_name: last_name,
      application_status: { id: statuses[columnName].id },
      company_object: { company: name },
      is_rejected: false,
      position: job_title,
      is_changed: "added"
    };
    let insertedItemColumn = this.state[columnName].slice();
    insertedItemColumn.unshift(jobCardFirstInstance);
    this.setState(() => ({
      [columnName]: insertedItemColumn
    }));
    axiosCaptcha(JOB_APPS, config, "add_job").then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          let allList = this.state.allApplications.filter(jobapp => jobapp.id != -1);
          let newDisplayingList = this.state.displayingList.filter(jobapp => jobapp.id != -1);
          allList.unshift(response.data.data);
          newDisplayingList.unshift(response.data.data);
          this.sortJobApplications(newDisplayingList);
          this.setState(() => ({
            allApplications: allList,
            displayingList: newDisplayingList
          }));
        }
      }
    });
  }

  moveToRejected(columnName, card, is_rejected) {
    if (is_rejected) {
      var listToAdd = columnName + "Rejected";
      var listToRemove = columnName;
    } else {
      var listToAdd = columnName;
      var listToRemove = columnName + "Rejected";
    }
    card.is_rejected = !card.is_rejected;
    const removedItemColumn = this.state[listToRemove].filter(job => {
      return job.id !== card.id;
    });
    let insertedItemColumn = this.state[listToAdd].slice();
    let updatedCard = card;
    updatedCard.is_changed = "added";
    insertedItemColumn.unshift(updatedCard);
    this.setState(() => ({
      [listToRemove]: removedItemColumn,
      [listToAdd]: insertedItemColumn
    }));
  }

  deleteJobFromList(columnName, cardId, is_rejected) {
    if (is_rejected) {
      columnName = columnName + "Rejected";
    }
    const removedItemColumn = this.state[columnName].filter(job => {
      return job.id !== cardId;
    });
    this.setState(() => ({
      [columnName]: removedItemColumn
    }));
  }

  onSearch(event) {
    let value = event.target.value;
    if (value == "") {
      console.log("query removed");
      this.setState({ displayingList: this.state.allApplications });
      this.sortJobApplications(this.state.allApplications);
    } else {
      let queriedList = this.state.allApplications;
      queriedList = queriedList.filter(application => {
        return (
          application.company_object.company.toLowerCase().match(value.trim().toLowerCase()) ||
          application.position.job.toLowerCase().match(value.trim().toLowerCase())
        );
      });
      IS_CONSOLE_LOG_OPEN && console.log(queriedList);
      this.sortJobApplications(queriedList);
      this.setState({ displayingList: queriedList });
    }
  }

  onDateQuery(date, dateString) {
    IS_CONSOLE_LOG_OPEN && console.log(date, dateString);
    if (date.length == 0) {
      console.log("date filter removed");
      this.setState({ displayingList: this.state.allApplications });
      this.sortJobApplications(this.state.allApplications);
    } else {
      let mainList = this.state.allApplications;
      let filteredList = [];
      mainList.forEach(application => {
        if (date[0] <= new Date(application.apply_date) && new Date(application.apply_date) <= date[1]) {
          filteredList.push(application);
        }
      });
      IS_CONSOLE_LOG_OPEN && console.log(filteredList);
      this.sortJobApplications(filteredList);
      this.setState({ displayingList: filteredList });
    }
  }

  async onSelectAll(event) {
    let isSelected = event.target.checked;
    IS_CONSOLE_LOG_OPEN && console.log(`checkedAll = `, isSelected);
    if (isSelected === true) {
      let selectedDisplayingList = this.state.displayingList;
      selectedDisplayingList.forEach(jobApp => (jobApp.isSelected = true));
      await this.setState({ displayingList: selectedDisplayingList });
      IS_CONSOLE_LOG_OPEN && console.log(this.state.displayingList);
      this.selectedJobApplications = [];
      this.state.displayingList.forEach(jobApp =>
        this.selectedJobApplications.push({
          jobApp_id: jobApp.id,
          application_status: jobApp.application_status
        })
      );
      await this.setState({
        selectedJobApplications: this.selectedJobApplications
      });
      IS_CONSOLE_LOG_OPEN && console.log("selecteds List after select all", this.state.selectedJobApplications);
      this.sortJobApplications(this.state.displayingList);
    }
    if (isSelected === false) {
      let selectedDisplayingList = this.state.displayingList;
      selectedDisplayingList.forEach(jobApp => (jobApp.isSelected = false));
      await this.setState({ displayingList: selectedDisplayingList });
      IS_CONSOLE_LOG_OPEN && console.log(this.state.displayingList);
      this.selectedJobApplications = [];
      await this.setState({
        selectedJobApplications: this.selectedJobApplications
      });
      IS_CONSOLE_LOG_OPEN && console.log("selecteds List after deselect all", this.state.selectedJobApplications);
      this.sortJobApplications(this.state.displayingList);
    }
  }

  moveMultipleOperation(status_id, status_name, requestList) {
    let newList = this.state.displayingList;
    this.state.selectedJobApplications.forEach(selectedJobApp =>
      newList.forEach(displayingJobApp => {
        if (displayingJobApp.id == selectedJobApp.jobApp_id) {
          displayingJobApp.application_status.id = status_id;
          displayingJobApp.application_status.value = status_name;
          displayingJobApp.is_changed = "added";
        }
      })
    );
    let newAllList = this.state.allApplications;
    this.state.selectedJobApplications.forEach(selectedJobApp =>
      newAllList.forEach(jobApp => {
        if (jobApp.id == selectedJobApp.jobApp_id) {
          jobApp.application_status.id = status_id;
          jobApp.application_status.value = status_name;
          jobApp.is_changed = "added";
        }
      })
    );
    const body = {
      jobapp_ids: requestList,
      status_id: status_id
    };
    let config = { method: "PUT" };
    config.body = body;
    axiosCaptcha(JOB_APPS, config).then(response => {
      if (response.data.success == true) {
        message.info("Its done!");
      } else {
        message.info(response.data.error_message);
        window.location.reload(true);
      }
    });
    this.setState({ displayingList: newList, allApplications: newAllList });
    this.sortJobApplications(newList);
  }

  moveMultipleToSpecificRejectedOperation(status_id, status_name, requestList) {
    let newList = this.state.displayingList;
    this.state.selectedJobApplications.forEach(selectedJobApp =>
      newList.forEach(displayingJobApp => {
        if (displayingJobApp.id == selectedJobApp.jobApp_id) {
          displayingJobApp.application_status.id = status_id;
          displayingJobApp.application_status.value = status_name;
          displayingJobApp.is_rejected = true;
          displayingJobApp.is_changed = "added";
        }
      })
    );
    let newAllList = this.state.allApplications;
    this.state.selectedJobApplications.forEach(selectedJobApp =>
      newAllList.forEach(jobApp => {
        if (jobApp.id == selectedJobApp.jobApp_id) {
          jobApp.application_status.id = status_id;
          jobApp.application_status.value = status_name;
          jobApp.is_rejected = true;
          jobApp.is_changed = "added";
        }
      })
    );
    const body = {
      jobapp_ids: requestList,
      status_id: status_id,
      rejected: true
    };
    let config = { method: "PUT" };
    config.body = body;
    axiosCaptcha(JOB_APPS, config).then(response => {
      if (response.data.success == true) {
        message.info("Its done!");
      } else {
        message.info(response.data.error_message);
        window.location.reload(true);
      }
    });
    this.setState({ displayingList: newList, allApplications: newAllList });
    this.sortJobApplications(newList);
  }

  async handleMenuClick(event) {
    await this.props.handleTokenExpiration("moveMultipleOptions");
    IS_CONSOLE_LOG_OPEN && console.log("click", event);
    let requestList = [];
    this.state.selectedJobApplications.forEach(selectedJobApp => requestList.unshift(selectedJobApp.jobApp_id));
    if (event.key === "deleteAll") {
      let newList = this.state.displayingList;
      this.state.selectedJobApplications.forEach(selectedJobApp =>
        newList.forEach(displayingJobApp => {
          if (displayingJobApp.id == selectedJobApp.jobApp_id) {
            newList.splice(newList.indexOf(displayingJobApp), 1);
          }
        })
      );
      let newAllList = this.state.allApplications;
      this.state.selectedJobApplications.forEach(selectedJobApp =>
        newAllList.forEach(jobApp => {
          if (jobApp.id == selectedJobApp.jobApp_id) {
            newAllList.splice(newAllList.indexOf(jobApp), 1);
          }
        })
      );
      this.setState({ displayingList: newList, allApplications: newAllList });
      this.sortJobApplications(newList);
      const body = {
        jobapp_ids: requestList
      };
      let config = { method: "DELETE" };
      config.body = body;
      axiosCaptcha(JOB_APPS, config).then(response => {
        if (response.data.success == true) {
          message.info("Its done!");
        } else {
          message.info(response.data.error_message);
          window.location.reload(true);
        }
      });
    } else if (event.key === "currentR") {
      let newList = this.state.displayingList;
      this.state.selectedJobApplications.forEach(selectedJobApp =>
        newList.forEach(displayingJobApp => {
          if (displayingJobApp.id == selectedJobApp.jobApp_id && selectedJobApp.application_status.id != 2) {
            displayingJobApp.is_rejected = true;
            displayingJobApp.is_changed = "added";
          }
        })
      );
      let newAllList = this.state.allApplications;
      this.state.selectedJobApplications.forEach(selectedJobApp =>
        newAllList.forEach(jobApp => {
          if (jobApp.id == selectedJobApp.jobApp_id && selectedJobApp.application_status.id != 2) {
            jobApp.is_rejected = true;
            jobApp.is_changed = "added";
          }
        })
      );
      const body = {
        jobapp_ids: requestList,
        rejected: true
      };
      let config = { method: "PUT" };
      config.body = body;
      axiosCaptcha(JOB_APPS, config).then(response => {
        if (response.data.success == true) {
          message.info("Its done!");
        } else {
          message.info(response.data.error_message);
          window.location.reload(true);
        }
      });
      this.setState({ displayingList: newList, allApplications: newAllList });
      this.sortJobApplications(newList);
    } else if (event.key === "toApply") {
      let newList = this.state.displayingList;
      let toApplyList = [];
      this.state.selectedJobApplications.forEach(selectedJobApp =>
        newList.forEach(displayingJobApp => {
          if (displayingJobApp.id == selectedJobApp.jobApp_id && displayingJobApp.is_rejected == false) {
            displayingJobApp.application_status.id = 2;
            displayingJobApp.application_status.value = "TO APPLY";
            displayingJobApp.is_changed = "added";
            toApplyList.unshift(selectedJobApp.jobApp_id);
          }
        })
      );
      let newAllList = this.state.allApplications;
      this.state.selectedJobApplications.forEach(selectedJobApp =>
        newAllList.forEach(jobApp => {
          if (jobApp.id == selectedJobApp.jobApp_id && jobApp.is_rejected == false) {
            jobApp.application_status.id = 2;
            jobApp.application_status.value = "TO APPLY";
            jobApp.is_changed = "added";
          }
        })
      );
      const body = {
        jobapp_ids: toApplyList,
        status_id: 2
      };
      let config = { method: "PUT" };
      config.body = body;
      axiosCaptcha(JOB_APPS, config).then(response => {
        if (response.data.success == true) {
          message.info("Its done!");
        } else {
          message.info(response.data.error_message);
          window.location.reload(true);
        }
      });
      this.setState({ displayingList: newList, allApplications: newAllList });
      this.sortJobApplications(newList);
    } else if (event.key === "applied") {
      this.moveMultipleOperation(1, "Applied", requestList);
    } else if (event.key === "phoneScreen") {
      this.moveMultipleOperation(3, "PHONE SCREEN", requestList);
    } else if (event.key === "onsiteInterview") {
      this.moveMultipleOperation(4, "ONSITE INTERVIEW", requestList);
    } else if (event.key === "offers") {
      this.moveMultipleOperation(5, "OFFER", requestList);
    } else if (event.key === "appliedR") {
      this.moveMultipleToSpecificRejectedOperation(1, "Applied", requestList);
    } else if (event.key === "phoneScreenR") {
      this.moveMultipleToSpecificRejectedOperation(3, "PHONE SCREEN", requestList);
    } else if (event.key === "onsiteInterviewR") {
      this.moveMultipleToSpecificRejectedOperation(4, "ONSITE INTERVIEW", requestList);
    } else if (event.key === "offersR") {
      this.moveMultipleToSpecificRejectedOperation(5, "OFFER", requestList);
    }
    this.onSelectAll({ target: { checked: false } });
  }

  render() {
    const { multipleOperationsContainerAnimate } = this.state;
    const multipleOperationsContainerClass = classNames({
      "multiple-operation-container": true,
      " --animation-from-zoom": multipleOperationsContainerAnimate
    });

    const dashboardContainerClass = classNames({
      "dashboard-container": true,
      " --demo-height": this.state.is_demo_user
    });

    const moveSelectedStyle = multipleOperationsContainerAnimate
      ? {
          margin: "0px 0px 0px 16px",
          width: "140px",
          height: "32px"
        }
      : {
          margin: "0px 0px 0px 16px",
          color: "rgba(0, 0, 0, 0.4)",
          borderColor: "rgb(217, 217, 217)",
          width: "140px",
          height: "32px",
          top: "-1px"
        };

    const selectAllStyle = {
      padding: "6px 0px 0px 6px",
      color: "rgba(0, 0, 0, 0.4)",
      boxShadow: "inset 0px 0px 1px rgba(0,0,0,0.5)",
      backgroundColor: "white",
      borderRadius: 4,
      width: "102px",
      height: "32px"
    };

    const dashboardBigContainerHeight = this.state.is_demo_user ? window.innerHeight - 110 : window.innerHeight - 60;

    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <SubMenu title="Rejected">
          <Menu.Item key="currentR">
            <img className="icon" src="../../src/assets/icons/RejectedIconInBtn@1x.png" />
            Current Stages
          </Menu.Item>
          <Menu.Item key="appliedR">
            <img className="icon" src="../../src/assets/icons/AppliedIcon@3x.png" />
            Applied
          </Menu.Item>
          <Menu.Item key="phoneScreenR">
            <img className="icon" src="../../src/assets/icons/PhoneScreenIcon@3x.png" />
            Phone Screen
          </Menu.Item>
          <Menu.Item key="onsiteInterviewR">
            <img className="icon" src="../../src/assets/icons/OnsiteInterviewIcon@3x.png" />
            Onsite Interview
          </Menu.Item>
          <Menu.Item key="offersR">
            <img className="icon" src="../../src/assets/icons/OffersIcon@3x.png" />
            Offer
          </Menu.Item>
        </SubMenu>
        <Menu.Item key="toApply">
          <img className="icon" src="../../src/assets/icons/ToApplyIcon@3x.png" />
          To Apply
        </Menu.Item>
        <Menu.Item key="applied">
          <img className="icon" src="../../src/assets/icons/AppliedIcon@3x.png" />
          Applied
        </Menu.Item>
        <Menu.Item key="phoneScreen">
          <img className="icon" src="../../src/assets/icons/PhoneScreenIcon@3x.png" />
          Phone Screen
        </Menu.Item>
        <Menu.Item key="onsiteInterview">
          <img className="icon" src="../../src/assets/icons/OnsiteInterviewIcon@3x.png" />
          Onsite Interview
        </Menu.Item>
        <Menu.Item key="offers">
          <img className="icon" src="../../src/assets/icons/OffersIcon@3x.png" />
          Offer
        </Menu.Item>
        <Menu.Item key="deleteAll">
          <img className="icon" src="../../src/assets/icons/DeleteIconInBtn@1x.png" />
          Delete All
        </Menu.Item>
      </Menu>
    );

    IS_CONSOLE_LOG_OPEN && console.log("Dashboard opened!");
    if (this.state.isInitialRequest === "beforeRequest") return <Spinner message="Reaching your account..." />;
    if (this.state.isInitialRequest && !IS_MOCKING) return <Spinner message="Preparing your dashboard..." />;
    return (
      <div style={{ height: dashboardBigContainerHeight }}>
        {window.screen.availWidth > 980 && (
          <div
            style={{
              position: "fixed",
              margin: "-45px 0 0 80px",
              display: "flex",
              justifyContent: "space-between",
              zIndex: 52,
              width: this.state.selectedJobApplications.length > 0 ? 718 : 440
            }}
          >
            <Search placeholder="" onChange={event => this.onSearch(event)} style={{ width: 200 }} />
            <RangePicker onChange={this.onDateQuery} style={{ width: 220 }} />
            {this.state.selectedJobApplications.length > 0 && (
              <div className={multipleOperationsContainerClass}>
                <Checkbox
                  style={selectAllStyle}
                  onChange={this.onSelectAll}
                  checked={multipleOperationsContainerAnimate}
                >
                  Select All
                </Checkbox>
                <Dropdown overlay={menu}>
                  <Button className="ant-dropdown-link" style={moveSelectedStyle}>
                    Move Selected <Icon type="down" />
                  </Button>
                </Dropdown>
              </div>
            )}
          </div>
        )}
        <div className={dashboardContainerClass}>
          <Column
            name="toApply"
            id="2"
            updateApplications={this.updateApplications}
            addNewApplication={this.addNewApplication}
            deleteJobFromList={this.deleteJobFromList}
            icon="../../src/assets/icons/ToApplyIcon@3x.png"
            title="TO APPLY"
            totalCount={this.state.toApply.length}
            cards={this.state.toApply}
            cardsRejecteds={[]}
            handleTokenExpiration={this.props.handleTokenExpiration}
            alert={this.props.alert}
            addToSelectedJobApplicationsList={this.addToSelectedJobApplicationsList}
            company={this.state.company}
          />
          <Column
            name="applied"
            id="1"
            updateApplications={this.updateApplications}
            addNewApplication={this.addNewApplication}
            deleteJobFromList={this.deleteJobFromList}
            moveToRejected={this.moveToRejected}
            icon="../../src/assets/icons/AppliedIcon@3x.png"
            title="APPLIED"
            totalCount={this.state.applied.length + this.state.appliedRejected.length}
            cards={this.state.applied}
            cardsRejecteds={this.state.appliedRejected}
            message="rejected without any interview"
            handleTokenExpiration={this.props.handleTokenExpiration}
            alert={this.props.alert}
            addToSelectedJobApplicationsList={this.addToSelectedJobApplicationsList}
            company={this.state.company}
          />
          <Column
            name="phoneScreen"
            id="3"
            updateApplications={this.updateApplications}
            addNewApplication={this.addNewApplication}
            deleteJobFromList={this.deleteJobFromList}
            moveToRejected={this.moveToRejected}
            icon="../../src/assets/icons/PhoneScreenIcon@3x.png"
            title="PHONE SCREEN"
            totalCount={this.state.phoneScreen.length + this.state.phoneScreenRejected.length}
            cards={this.state.phoneScreen}
            cardsRejecteds={this.state.phoneScreenRejected}
            message="rejected after phone screens"
            handleTokenExpiration={this.props.handleTokenExpiration}
            alert={this.props.alert}
            addToSelectedJobApplicationsList={this.addToSelectedJobApplicationsList}
            company={this.state.company}
          />
          <Column
            name="onsiteInterview"
            id="4"
            updateApplications={this.updateApplications}
            addNewApplication={this.addNewApplication}
            deleteJobFromList={this.deleteJobFromList}
            moveToRejected={this.moveToRejected}
            icon="../../src/assets/icons/OnsiteInterviewIcon@3x.png"
            title="ONSITE INTERVIEW"
            totalCount={this.state.onsiteInterview.length + this.state.onsiteInterviewRejected.length}
            cards={this.state.onsiteInterview}
            cardsRejecteds={this.state.onsiteInterviewRejected}
            message="rejected after interviews"
            handleTokenExpiration={this.props.handleTokenExpiration}
            alert={this.props.alert}
            addToSelectedJobApplicationsList={this.addToSelectedJobApplicationsList}
            company={this.state.company}
          />
          <Column
            name="offer"
            id="5"
            updateApplications={this.updateApplications}
            addNewApplication={this.addNewApplication}
            deleteJobFromList={this.deleteJobFromList}
            moveToRejected={this.moveToRejected}
            icon="../../src/assets/icons/OffersIcon@3x.png"
            title="OFFERS"
            totalCount={this.state.offer.length + this.state.offerRejected.length}
            cards={this.state.offer}
            cardsRejecteds={this.state.offerRejected}
            message="you rejected their offer"
            handleTokenExpiration={this.props.handleTokenExpiration}
            isLastColumn={true}
            alert={this.props.alert}
            addToSelectedJobApplicationsList={this.addToSelectedJobApplicationsList}
            company={this.state.company}
          />
        </div>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Dashboard);
