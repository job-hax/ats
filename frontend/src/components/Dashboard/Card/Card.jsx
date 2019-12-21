import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { DragSource } from "react-dnd";
import classNames from "classnames";
import { Checkbox } from "antd";

import defaultLogo from "../../../assets/icons/JobHax-logo-black.svg";
import linkedInLogo from "../../../assets/icons/linkedInLogo.png";
import hiredComLogo from "../../../assets/icons/hiredComLogo.png";
import indeedLogo from "../../../assets/icons/indeedLogo.png";
import vetteryLogo from "../../../assets/icons/vetteryLogo.jpg";
import glassdoorLogo from "../../../assets/icons/glassdoorLogo.png";
import leverLogo from "../../../assets/icons/leverLogo.png";
import jobviteLogo from "../../../assets/icons/jobviteLogo.jpg";
import smartRecruiterLogo from "../../../assets/icons/smartRecruiterLogo.png";
import greenHouseLogo from "../../../assets/icons/greenHouseLogo.png";
import zipRecruiterLogo from "../../../assets/icons/zipRecruiterLogo.png";
import CardModal from "../CardModal/CardModal.jsx";

import "./style.scss";
import { IS_CONSOLE_LOG_OPEN } from "../../../utils/constants/constants";

const cardSpec = {
  beginDrag(props) {
    return props.card;
  },

  endDrag(props, monitor) {
    if (monitor.didDrop()) {
      return props.updateApplications(
        props.card,
        props.columnName,
        monitor.getDropResult().name
      );
    }
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
}

class Card extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      imageLoadError: true,
      showSelect: false,
      isSelected: this.props.isSelected,
      animate: false,
      companyLogoError: false,
      clickbox: false
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.updateCompany = this.updateCompany.bind(this);
    this.updateCard = this.updateCard.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
  }

  async componentDidMount() {
    if (this.props.is_changed != false) {
      await this.setState({ animate: true });
      setTimeout(
        () =>
          this.setState({
            animate: false
          }),
        100
      );
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isSelected !== this.props.isSelected) {
      this.setState({ isSelected: this.props.isSelected });
    }
  }

  toggleModal() {
    this.state.clickbox && this.setState({ clickbox: false });
    !this.state.clickbox &&
      this.setState({
        showModal: !this.state.showModal,
        showSelect: false
      });
  }

  onSelectChange(event) {
    let isSelected = event.target.checked;
    IS_CONSOLE_LOG_OPEN && console.log(`checked = `, isSelected);
    this.setState({ isSelected: isSelected, clickbox: true });
    if (isSelected === true) {
      this.props.addToSelectedJobApplicationsList("add", this.props.card);
    }
    if (isSelected === false) {
      this.props.addToSelectedJobApplicationsList("delete", this.props.card);
    }
  }

  updateCompany(newCompanyObject) {
    this.props.card.company_object = newCompanyObject;
  }

  updateCard(company_object, position, apply_date, app_source) {
    this.props.card.company_object = company_object;
    this.props.card.position = position;
    this.props.card.apply_date = apply_date;
    this.props.card.app_source = app_source;
  }

  sourceLogoSelector(source) {
    if (source == null) return;
    if (source.value == "Hired.com") {
      return <img src={hiredComLogo} />;
    } else if (source.value == "LinkedIn") {
      return <img src={linkedInLogo} />;
    } else if (source.value == "Indeed") {
      return <img src={indeedLogo} />;
    } else if (source.value == "Vettery") {
      return <img src={vetteryLogo} />;
    } else if (source.value == "glassdoor") {
      return <img src={glassdoorLogo} />;
    } else if (source.value == "jobvite.com") {
      return <img src={jobviteLogo} />;
    } else if (source.value == "smartrecruiters.com") {
      return <img src={smartRecruiterLogo} />;
    } else if (source.value == "greenhouse.io") {
      return <img src={greenHouseLogo} />;
    } else if (source.value == "lever.co") {
      return <img src={leverLogo} />;
    } else if (source.value == "ziprecruiter.com") {
      return <img src={zipRecruiterLogo} />;
    }
  }

  renderCard() {
    const {
      card: {
        first_name,
        last_name,
        company_object,
        position,
        is_rejected,
        app_source,
        columnName,
        icon,
        id,
        is_changed
      },
      alert,
      handleTokenExpiration,
      deleteJobFromList,
      moveToRejected,
      updateApplications,
      card,
      isDragging
    } = this.props;

    const { showModal, animate, clickbox } = this.state;

    const cardClass = classNames({
      "card-container": true,
      "rejected-cards": is_rejected,
      "--is_dragging": isDragging,
      "--animation-from-zero": animate && is_changed == "added"
    });

    return (
      <div
        className={cardClass}
        onMouseEnter={() => this.setState({ showSelect: true })}
        onMouseLeave={() => this.setState({ showSelect: false })}
        onClick={this.toggleModal}
      >
        {showModal && !clickbox && (
          <CardModal
            handleTokenExpiration={handleTokenExpiration}
            columnName={columnName}
            toggleModal={this.toggleModal}
            deleteJobFromList={deleteJobFromList}
            moveToRejected={moveToRejected}
            updateApplications={updateApplications}
            icon={icon}
            id={id}
            updateCompany={this.updateCompany}
            updateCard={this.updateCard}
            alert={alert}
            {...this.props}
          />
        )}
        <div className="card-company-icon">
          {company_object.logo === null || this.state.companyLogoError ? (
            <img src={defaultLogo} />
          ) : (
            <img
              onError={() => this.setState({ companyLogoError: true })}
              src={company_object.logo}
            />
          )}
        </div>
        <div className="card-company-info">
          <div id="company" className="card-company-name">
            {first_name + " " + last_name}
          </div>
          {position && (
            <div id="jobTitle" className="card-job-position">
              {position.job}
            </div>
          )}
        </div>
        <div className="card-job-details">
          {(this.state.showSelect || this.state.isSelected) && (
            <Checkbox
              checked={this.state.isSelected}
              onChange={this.onSelectChange}
            />
          )
          /*this.sourceLogoSelector(app_source)*/
          }
        </div>
      </div>
    );
  }

  render() {
    const {
      card: { is_rejected },
      connectDragSource
    } = this.props;

    if (is_rejected) {
      return this.renderCard();
    }
    return connectDragSource(this.renderCard());
  }
}

Card.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired
};

export default DragSource("item", cardSpec, collect)(Card);
