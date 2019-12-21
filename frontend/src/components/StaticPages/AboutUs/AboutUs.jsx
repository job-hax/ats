import React, { Component } from "react";
import Footer from "../../Partials/Footer/Footer.jsx";
import { Carousel } from "antd";

import "./style.scss";

class AboutUs extends Component {
  generateAnimation(question1, question2, question3, question4) {
    return (
      <div className="animation">
        <div className="content__container">
          <ul className="content__container__list">
            <li className="content__container__list__item">{question1}</li>
            <li className="content__container__list__item">{question2}</li>
            <li className="content__container__list__item">{question3}</li>
            <li className="content__container__list__item">{question4}</li>
          </ul>
        </div>
      </div>
    );
  }

  generateHeaderArea(questions) {
    return (
      <section className="header_area">
        {this.generateAnimation(questions[0], questions[1], questions[2], questions[3])}
      </section>
    );
  }

  generateInfo(title, body) {
    return (
      <div className="info-area">
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
    );
  }

  render() {
    return (
      <div className="about_us-container">
        {/* <div>
          {this.generateHeaderArea([
            "Are you actively looking for job?",
            "How you track your job application?",
            "What are challenges you face?",
            "Are you already part of fast growing Open Source world?"
          ])}
          {this.generateInfo(
            "Vision",
            "Build egoless, collaborative community who continuously track, learn from job application experience and succeed"
          )}
          {this.generateInfo(
            "Our Team",
            "Team of passioned engineers with same core values, driving for impact everyday"
          )}
        </div> */}
        <div>
          <Carousel autoplay>
            <div>
              <img src="https://backend.jobhax.com/media/aboutus001.jpg"></img>
            </div>
            <div>
              <img src="https://backend.jobhax.com/media/aboutus002.jpg"></img>
            </div>
            <div>
              <img src="https://backend.jobhax.com/media/aboutus003.jpg"></img>
            </div>
            <div>
              <img src="https://backend.jobhax.com/media/aboutus004.jpg"></img>
            </div>
            <div>
              <img src="https://backend.jobhax.com/media/aboutus041.jpg"></img>
            </div>
            <div>
              <img src="https://backend.jobhax.com/media/aboutus042.jpg"></img>
            </div>
            <div>
              <img src="https://backend.jobhax.com/media/aboutus043.jpg"></img>
            </div>
            <div>
              <img src="https://backend.jobhax.com/media/aboutus044.jpg"></img>
            </div>
          </Carousel>
        </div>

        <div className="team-container">
          <div className="header">Our Team</div>
          <div className="team-members">
            <div className="person-container">
              <div className="person-photo">
                <img src="https://jobhax.com/src/assets/images/sako.png"></img>
              </div>
              <div className="person-name">Sako</div>
              <div className="person-title">CTO,FOUNDER</div>
              <div className="person-desc">
                DevOps@OpenGov-a Cloud-based SaaS solution that helps governments to be more effective and accountable.
                Sako’s international experience is unbeatable-for the last 10 years he has worked for 7 tech companies
                in 6 different countries. While pursuing his third master’s degree, he was analyzing gaps in the job
                market and the education system which lead to the creation of JobHax.
              </div>
            </div>
            <div className="person-container">
              <div className="person-photo">
                <img src="https://media.licdn.com/dms/image/C5603AQEvDHp-qS0XCQ/profile-displayphoto-shrink_200_200/0?e=1580947200&v=beta&t=2AoZAMLU36G1HtD2bDmm34LZ0vpeJKTg-SDp4RqYZ_U"></img>
              </div>
              <div className="person-name">Yonglin Zhong</div>
              <div className="person-title">Fullstack Engineeer</div>
              <div className="person-desc">
                Fullstack developer | M.S in Software Engineering | 4 years experience as Frontend Software Developer
              </div>
            </div>
            <div className="person-container">
              <div className="person-photo">
                <img src="src\components\StaticPages\AboutUs\joon.png" style={{ height: 270 }}></img>
              </div>
              <div className="person-name">Joon Yi Koh</div>
              <div className="person-title">Backend Enginner</div>
              <div className="person-desc">Learning Django Web Framework and hopefully be able to apply in the real world!</div>
            </div>
            <div className="person-container">
              <div className="person-photo">
                <img src="https://media.licdn.com/dms/image/C4E03AQEjVytTTBzyBA/profile-displayphoto-shrink_200_200/0?e=1580947200&v=beta&t=QxTMh2EPgugqigMDGLGvAOC4jg-nOgukZkb79TCfuE0"></img>
              </div>
              <div className="person-name">Yathendra Pentakota</div>
              <div className="person-title">Frontend Enginner</div>
              <div className="person-desc">
                Frontend lead | M.S in Software Engineering | Cloud Application Developer | Experienced (7+ years)
                application developer.
              </div>
            </div>
          </div>
        </div>
        <div
          className="videos-area"
          style={{
            display: "flex",
            justifycontent: "flex-start",
            padding: "120px 0px 80px 80px",
            overflowy: "hidden",
            width: 100
          }}
        >
          <div className="video-container" style={{ padding: 50, boxShadow: "0 0.46875rem 2.1875rem rgba(4, 9, 20, 0.03), 0 0.9375rem 1.40625rem rgba(4, 9, 20, 0.03), 0 0.25rem 0.53125rem rgba(4, 9, 20, 0.05), 0 0.125rem 0.1875rem rgba(4, 9, 20, 0.03)" }}>
            <div style={{border: "1px solid grey"}}>
              {" "}
              <iframe width="800" height="415" src="https://www.youtube.com/embed/videoseries?list=PLR_cX7dHBN__F8q4WyicwStYxuFppwts3" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <div className="video-title" style={{ fontSize: 25, fontWeight: "bold", borderTop: "1px solid grey !important", paddingTop: 15 }}>
              JobHax Capstone Meeting Recording Playlist
            </div>
            {/* <div>Job Posting Presentation at ITU</div> */}
          </div>
        </div>
        <div style={{ marginTop: 100 }}>
          <Footer />
        </div>
      </div>
    );
  }
}

export default AboutUs;
