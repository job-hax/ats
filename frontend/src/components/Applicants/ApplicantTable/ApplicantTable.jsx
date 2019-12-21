import React, { Component } from "react";
import { Table, Input, Button, Icon, message } from "antd";
import Highlighter from "react-highlight-words";
import { JOB_APPS } from "../../../utils/constants/endpoints.js";
import { axiosCaptcha } from "../../../utils/api/fetch_api";

import "./style.scss";

class ApplicantTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      searchText: "",
      searchedColumn: ""
    };

    this.handleDelete = this.handleDelete.bind(this);
  }

  getColumnSearchProps(dataIndex) {
    return {
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={node => {
              this.searchInput = node;
            }}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon="search"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />,
      onFilter: (value, record) =>
        record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase()),
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          setTimeout(() => this.searchInput.select());
        }
      },
      render: text =>
        this.state.searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[this.state.searchText]}
            autoEscape
            textToHighlight={text.toString()}
          />
        ) : (
          text
        )
    };
  }

  handleSearch(selectedKeys, confirm, dataIndex) {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex
    });
  }

  handleReset(clearFilters) {
    clearFilters();
    this.setState({ searchText: "" });
  }

  handleDelete(id) {
    const body = {
      jobapp_ids: [id]
    };
    let config = { method: "DELETE" };
    config.body = body;
    axiosCaptcha(JOB_APPS, config).then(response => {
      if (response.data.success == true) {
        message.info("The application has been deleted!");
        this.props.getData();
      } else {
        message.info(response.data.error_message);
        window.location.reload(true);
      }
    });
  }

  render() {
    const columns = [
      {
        title: "Full Name",
        dataIndex: "full_name",
        key: "full_name",
        ...this.getColumnSearchProps("full_name")
      },
      {
        title: "Position",
        dataIndex: "job_title",
        key: "job_title",
        ...this.getColumnSearchProps("job_title")
      },
      {
        title: "Applied On",
        dataIndex: "apply_date",
        key: "apply_date"
      },
      {
        title: "Status",
        dataIndex: "application_status",
        key: "application_status",
        ...this.getColumnSearchProps("application_status")
      },
      {
        title: "Action",
        key: "action",
        render: (text, record) => <Icon type="delete"  style={{ fontSize: 22 }} onClick={() => this.handleDelete(record.id)} />
      }
    ];

    const { applicants } = this.props;
    return <Table columns={columns} dataSource={applicants} pagination={{ pageSize: 20 }} />;
  }
}

export default ApplicantTable;
