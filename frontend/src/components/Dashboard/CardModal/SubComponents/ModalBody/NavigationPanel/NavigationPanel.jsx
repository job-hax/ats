import React from "react";

class NavigationPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  generateNavigationPanel() {
    const subheaderFixedClassName = "modal-body navigation subheaders";
    return this.props.sections.map(section => (
      <div
        key={this.props.sections.indexOf(section)}
        className={
          this.props.displaying == section
            ? subheaderFixedClassName + " --selected"
            : subheaderFixedClassName
        }
        onClick={() => this.props.setDisplaying(section)}
      >
        {section}
      </div>
    ));
  }

  render() {
    return (
      <div className="modal-body navigation">
        {this.generateNavigationPanel()}
      </div>
    );
  }
}

export default NavigationPanel;
