import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { DropTarget } from "react-dnd";
import Card from "../Card/Card.jsx";
import JobInput from "../JobInput/JobInput.jsx";
import { MIN_CARD_NUMBER_IN_COLUMN } from "../../../utils/constants/constants.js";

import "./style.scss";

const columnSpec = {
  drop(props) {
    return {
      name: props.name
    };
  }
};

let collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isCardOverColumn: monitor.isOver(),
    canDropCardInColumn: monitor.canDrop()
  };
};

class Column extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRejectedCards: false,
      showJobInput: false,
      ongoingsAmount: this.props.cards.length,
      rejectedsAmount: this.props.cardsRejecteds.length,
      isAmountChanged: false,
      amountChangeOngoings: 0,
      amountChangeRejecteds: 0
    };
    this.toggleLists = this.toggleLists.bind(this);
    this.toggleJobInput = this.toggleJobInput.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.cards.length !== this.state.ongoingsAmount) {
      this.setState({
        ongoingsAmount: this.props.cards.length,
        isAmountChanged: true,
        amountChangeOngoings:
          this.props.cards.length - this.state.ongoingsAmount
      });
    }
    if (this.props.cardsRejecteds.length !== this.state.rejectedsAmount) {
      this.setState({
        rejectedsAmount: this.props.cardsRejecteds.length,
        isAmountChanged: true,
        amountChangeRejecteds:
          this.props.cardsRejecteds.length - this.state.rejectedsAmount
      });
    }
    if (this.state.isAmountChanged != false) {
      setTimeout(
        () =>
          this.setState({
            isAmountChanged: false,
            amountChangeOngoings: 0,
            amountChangeRejecteds: 0
          }),
        500
      );
    }
  }

  toggleLists() {
    this.setState(state => ({
      showRejectedCards: !state.showRejectedCards
    }));
  }

  toggleJobInput() {
    this.setState(state => ({
      showJobInput: !state.showJobInput
    }));
  }

  renderCards(type) {
    const {
      cards,
      cardsRejecteds,
      name,
      updateApplications,
      deleteJobFromList,
      moveToRejected,
      handleTokenExpiration,
      icon,
      id,
      alert
    } = this.props;

    if (type == "rejected") {
      return (
        <div style={{ margin: "15px 0px 0px 0px" }}>
          {cardsRejecteds &&
            cardsRejecteds.map(card => (
              <Card
                handleTokenExpiration={handleTokenExpiration}
                key={card.id}
                card={card}
                columnName={name}
                deleteJobFromList={deleteJobFromList}
                moveToRejected={moveToRejected}
                updateApplications={updateApplications}
                icon={icon}
                id={id}
                alert={alert}
                addToSelectedJobApplicationsList={
                  this.props.addToSelectedJobApplicationsList
                }
                isSelected={card.isSelected}
              />
            ))}
        </div>
      );
    }
    return (
      cards &&
      cards.map(card => (
        <Card
          handleTokenExpiration={handleTokenExpiration}
          columnName={name}
          key={card.id}
          card={card}
          updateApplications={updateApplications}
          deleteJobFromList={deleteJobFromList}
          moveToRejected={moveToRejected}
          icon={icon}
          id={id}
          alert={alert}
          addToSelectedJobApplicationsList={
            this.props.addToSelectedJobApplicationsList
          }
          isSelected={card.isSelected}
        />
      ))
    );
  }

  generateColumnHeader() {
    const { addNewApplication, name, title } = this.props;

    const {
      showJobInput,
      ongoingsAmount,
      isAmountChanged,
      amountChangeOngoings
    } = this.state;

    const columnHeaderContainerClass = classNames({
      "column-header-container": true,
      "add-job-height": showJobInput
    });

    const columnHeaderTitleClass = classNames({
      "column-header": true,
      "column-title": true,
      "--animation-increase": isAmountChanged && amountChangeOngoings > 0,
      "--animation-decrease": isAmountChanged && amountChangeOngoings < 0
    });

    return (
      <div className={columnHeaderContainerClass}>
        <div className="column-header">
          <div className={columnHeaderTitleClass}>
            {title}
            {ongoingsAmount > MIN_CARD_NUMBER_IN_COLUMN && (
              <div style={{ marginLeft: "4px" }}>({ongoingsAmount})</div>
            )}
          </div>
        </div>
        {showJobInput && (
          <JobInput
            company={this.props.company}
            addNewApplication={addNewApplication}
            showInput={showJobInput}
            toggleJobInput={this.toggleJobInput}
            columnName={name}
            alert={this.props.alert}
            handleTokenExpiration={this.props.handleTokenExpiration}
          />
        )}
      </div>
    );
  }

  render() {
    const {
      showJobInput,
      showRejectedCards,
      rejectedsAmount,
      isAmountChanged,
      amountChangeRejecteds
    } = this.state;

    const {
      canDropCardInColumn,
      connectDropTarget,
      isCardOverColumn
    } = this.props;

    const columnCardContainerClass = classNames({
      "column-card-container": true,
      "--short": showJobInput
    });

    const ongoingsContainerClass = classNames({
      "column-ongoings-container": true,
      "--single": !showRejectedCards || rejectedsAmount == 0,
      "--double": showRejectedCards && rejectedsAmount,
      "--column-dropable": canDropCardInColumn && !isCardOverColumn,
      "--column-active": canDropCardInColumn && isCardOverColumn
    });

    const rejectedsContainerClass = classNames({
      "column-rejecteds-container": true,
      "--double": showRejectedCards
    });

    const columnContainerClass = classNames({
      "column-container": true
    });

    const expandArrowClass = classNames({
      "expand-arrow": true,
      "--horizontal-flip": showRejectedCards
    });

    const rejectedButtonTitleClass = classNames({
      "button-inside": true,
      "--animation-increase": isAmountChanged && amountChangeRejecteds > 0,
      "--animation-decrease": isAmountChanged && amountChangeRejecteds < 0
    });

    return connectDropTarget(
      <div className="column-big-container">
        <div className={ongoingsContainerClass}>
          <div className={columnContainerClass}>
            {this.generateColumnHeader()}
            <div className="column-body-container">
              <div className={columnCardContainerClass}>
                {this.renderCards("ongoing")}
              </div>
              {!showJobInput && (
                <div
                  onClick={() => this.setState({ showJobInput: !showJobInput })}
                  className="job-input-button"
                >
                  <div className="button-inside">+</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {rejectedsAmount > MIN_CARD_NUMBER_IN_COLUMN && (
          <div className={rejectedsContainerClass}>
            <div
              onClick={() =>
                this.setState({ showRejectedCards: !showRejectedCards })
              }
              className="rejecteds-button"
            >
              <div className={rejectedButtonTitleClass}>
                Rejected ({rejectedsAmount})
              </div>
              <div>
                <img
                  className={expandArrowClass}
                  src="../../src/assets/icons/ExpandArrow@3x.png"
                />
              </div>
            </div>
            {showRejectedCards && (
              <div className="column-container">
                <div className="column-body-container">
                  <div className="column-card-container">
                    {this.renderCards("rejected")}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

Column.propTypes = {
  connectDropTarget: PropTypes.func.isRequired,
  isCardOverColumn: PropTypes.bool.isRequired,
  canDropCardInColumn: PropTypes.bool.isRequired
};

export default DropTarget("item", columnSpec, collect)(Column);
