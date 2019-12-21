import React from "react";
import classNames from "classnames";
import { Input, Button } from "antd";

import { axiosCaptcha } from "../../../../../../../utils/api/fetch_api";
import {
  IS_CONSOLE_LOG_OPEN,
  makeTimeBeautiful
} from "../../../../../../../utils/constants/constants.js";
import { NOTES } from "../../../../../../../utils/constants/endpoints";

const { TextArea } = Input;

class Notes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showNotePad: false,
      isEditing: false,
      imageLoadError: true,
      whatIsDisplaying: "company",
      addNoteForm: "",
      updateNoteForm: "",
      notes: []
    };
    this.notes = [];
    this.currentNote = null;
    this.toggleNotes = this.toggleNotes.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.setToDefault = this.setToDefault.bind(this);
    this.onAddNoteChange = this.onAddNoteChange.bind(this);
    this.addNote = this.addNote.bind(this);
    this.handleAddNote = this.handleAddNote.bind(this);
    this.saveNotes = this.saveNotes.bind(this);
    this.onEditNoteChange = this.onEditNoteChange.bind(this);
  }

  componentDidMount() {
    this.getNotes();
  }

  async getNotes() {
    await this.props.handleTokenExpiration("notes getNotes");
    const { card } = this.props;
    let config = { method: "GET" };
    axiosCaptcha(NOTES(card.id), config).then(response => {
      if (response.statusText === "OK") {
        if (response.data.success) {
          this.notes = response.data.data;
          this.setState({
            notes: this.notes
          });
        }
      }
    });
  }

  toggleNotes() {
    this.currentNote = null;
    IS_CONSOLE_LOG_OPEN && console.log("current note\n", this.currentNote);
    this.setState(state => ({
      showNotePad: !state.showNotePad
    }));
  }

  toggleEdit() {
    this.setState(state => ({
      isEditing: !state.isEditing
    }));
  }

  setToDefault() {
    this.toggleEdit();
    var resetValue = this.refs.addNoteFormDefault;
    resetValue.value = "";
    this.setState({
      addNoteForm: ""
    });
  }

  setCurrentNote(item) {
    this.currentNote = item;
    IS_CONSOLE_LOG_OPEN && console.log("set current note\n", this.currentNote);
    this.setState(state => ({
      showNotePad: !state.showNotePad
    }));
  }

  onAddNoteChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
    IS_CONSOLE_LOG_OPEN && console.log("value", event.target);
  }

  onEditNoteChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
    IS_CONSOLE_LOG_OPEN && console.log("value", event);
  }

  handleAddNote(e) {
    e.preventDefault();
    this.addNote(e.target.value);
  }

  async addNote(note) {
    IS_CONSOLE_LOG_OPEN && console.log("add note requested!", note);
    await this.props.handleTokenExpiration("notes addNote");
    const { card } = this.props;
    const { addNoteForm, updateNoteForm } = this.state;
    IS_CONSOLE_LOG_OPEN &&
      console.log(
        "addNote \n--add note form",
        addNoteForm,
        "\n--update note form",
        updateNoteForm,
        "\n--value",
        note
      );
    IS_CONSOLE_LOG_OPEN &&
      console.log("addnoteform currentNote", this.currentNote);
    if ((addNoteForm.trim().length == 0) & (updateNoteForm.trim().length == 0))
      return;
    const reqBody =
      this.currentNote == null
        ? {
            description: addNoteForm
          }
        : {
            jobapp_note_id: this.currentNote.id,
            description: updateNoteForm
          };
    let config =
      this.currentNote == null ? { method: "POST" } : { method: "PUT" };
    config.body = reqBody;
    axiosCaptcha(NOTES(card.id), config, "jobapp_note")
      .catch(error => console.error(error))
      .then(response => {
        if (response.statusText === "OK") {
          if (response.data.success) {
            this.saveNotes(response.data.data, reqBody, this.currentNote);
          }
        }
      });
  }

  async deleteNote(id) {
    await this.props.handleTokenExpiration("notes deleteNote");
    const body = {
      jobapp_note_id: id
    };
    let newNotes = this.state.notes.filter(note => note.id != id);
    this.setState({ notes: newNotes });
    let config = { method: "DELETE" };
    config.body = body;
    axiosCaptcha(NOTES(this.props.card.id), config).then(response => {
      if (response.statusText === "OK") {
        if (!response.data.success) {
          this.getNotes();
        }
      }
    });
  }

  saveNotes(noteData, request, createdDate) {
    if (this.state.showNotePad) {
      const noteUpdated = {
        id: request.jobapp_note_id,
        description: request.description,
        created_date: createdDate.created_date,
        update_date: new Date(
          new Date().toString().split("GMT")[0] + " UTC"
        ).toISOString()
      };
      const notesUpdated = this.state.notes.filter(note => {
        return note.id !== request.jobapp_note_id;
      });
      notesUpdated.unshift(noteUpdated);
      this.setState(() => ({
        notes: notesUpdated
      }));
      this.toggleNotes();
      this.setState({
        updateNoteForm: ""
      });
    } else {
      let notesAdded = this.state.notes;
      notesAdded.unshift(noteData);
      this.setState(() => ({
        notes: notesAdded
      }));
      this.setToDefault();
    }
    IS_CONSOLE_LOG_OPEN &&
      console.log(
        "after save \n--addNoteForm",
        this.state.addNoteForm,
        "\n--updateNoteForm",
        this.state.updateNoteForm
      );
  }

  noteContainerGenerate() {
    IS_CONSOLE_LOG_OPEN &&
      console.log("notecontainergenerator currentNote?", this.currentNote);
    if (this.state.notes.length == 0) {
      return (
        <p
          style={{
            color: "rgba(32,32,32,0.6)",
            marginTop: "16px",
            textAlign: "center"
          }}
        >
          You don't have any notes at the moment.
        </p>
      );
    } else {
      return this.state.notes.map(item => (
        <div key={item.id}>
          <div>
            {this.currentNote != item ? (
              <div className="note-container">
                <div
                  className="text-container"
                  value={item}
                  onClick={() => this.setCurrentNote(item)}
                >
                  <p className="note"> {item.description}</p>
                  {item.update_date == null ? (
                    <p className="date">
                      {" "}
                      {makeTimeBeautiful(item.created_date, "dateandtime")}
                    </p>
                  ) : (
                    <p className="date">
                      last updated{" "}
                      {makeTimeBeautiful(item.update_date, "dateandtime")}
                    </p>
                  )}
                </div>
                <div className="button-container-parent">
                  <div className="button-container-child">
                    <button
                      value={item.id}
                      onClick={() => this.deleteNote(item.id)}
                    >
                      <img src="../../src/assets/icons/DeleteIconInBtn@1x.png" />
                    </button>
                    <button
                      value={item}
                      onClick={() => this.setCurrentNote(item)}
                    >
                      <img src="../../src/assets/icons/edit.png" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form
                className="add-note-area"
                style={{ borderBottom: "1px solid rgba(32, 32, 32, 0.1)" }}
              >
                <div>
                  <TextArea
                    name="updateNoteForm"
                    onChange={this.onEditNoteChange}
                    defaultValue={item.description}
                    autosize={{ maxRows: 12 }}
                  />
                </div>
                <div className="notepad-buttons">
                  <button
                    className="notepad-buttons cancel"
                    type="reset"
                    onClick={this.toggleNotes}
                  >
                    cancel
                  </button>
                  <Button type="primary" onClick={this.handleAddNote}>
                    save
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      ));
    }
  }

  generateNotes() {
    const notesShowingClass = classNames({
      "notes-showing": true,
      "--short": this.state.isEditing
    });
    return (
      <div>
        <div>
          {this.state.isEditing ? (
            <form className="add-note-area">
              <div>
                <TextArea
                  name="addNoteForm"
                  placeholder="+ Add note"
                  onChange={this.onAddNoteChange}
                  ref="addNoteFormDefault"
                  autosize={{ maxRows: 12 }}
                />
              </div>
              <div className="notepad-buttons">
                <button
                  className="notepad-buttons cancel"
                  type="reset"
                  onClick={this.setToDefault}
                >
                  cancel
                </button>
                <Button type="primary" onClick={this.handleAddNote}>
                  save
                </Button>
              </div>
            </form>
          ) : (
            <div style={{ margin: "0 0 8px 0" }}>
              <TextArea
                className="add-note-area --height-min"
                placeholder="+ Add note"
                onClick={this.toggleEdit}
                ref="addNoteFormDefault"
                autosize={{ maxRows: 12 }}
              />
            </div>
          )}
          <div>
            <div className={notesShowingClass}>
              {this.noteContainerGenerate()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return <div>{this.generateNotes()}</div>;
  }
}

export default Notes;
