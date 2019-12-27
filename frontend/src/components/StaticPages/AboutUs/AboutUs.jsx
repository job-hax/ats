import React, { Component } from "react";
import Footer from "../../Partials/Footer/Footer.jsx";
import { apiRoot, jtsApiRoot } from "../../../utils/constants/endpoints.js";
import parse from "html-react-parser";
import { Carousel } from "antd";

import "./style.scss";

const team_first = [
  {
    name: "Suhas",
    title: "CEO,FOUNDDER",
    desc:
      "PM@Google & Microsoft with experience driving large enterprise B2B solutions from innovation to launch. Studied Computer Science, Business, & Mathematics in Virginia Tech. Enjoys being active, outdoors, & exploring new foods to eat!"
  },
  {
    name: "Sako",
    title: "CTO,FOUNDER",
    desc:
      "DevOps@OpenGov - a Cloud-based SaaS solution that helps governments to be more effective and accountable. Sako’s international experience is unbeatable - for the last 10 years he has worked for 7 tech companies in 6 different countries. While pursuing his third master’s degree, he was analyzing gaps in the job market and the education system which lead to the creation of JobHax."
  },
  {
    name: "Egemen",
    title: "FOUNDING ENGINEER",
    desc:
      "Frontend lead, currently studying M.S. in Computer Science, holds an LLM degree from UCLA with a specialization in Media, Entertainment and Technology Law & Policy, an LLM degree in Law & Economics, and a B.S. degree in Law from Bilkent University. He is interested in algorithm trading and deep learning."
  },
  {
    name: "Seyfo",
    title: "FOUNDING ENGINEER",
    desc:
      "Backend lead, experienced mobile developer with more than 4 years of development experience. Studied Computer Engineering in Turkey. Seyfo loves video games, like CSGO, FIFA."
  }
];

const team_second = [
  {
    name: "Yinan",
    title: "DESIGN LEAD",
    desc:
      "Former Interaction designer at wearable tech startup Motiv, Bachelor of Interaction Design from California College of the Arts. Yinan loves both design and programming, when not designing or coding, he plays snooker, poker, and hangs out with dogs at the SPCA"
  },
  {
    name: "Joy",
    title: "UX/UI DESINER",
    desc:
      "UI/UX designer, currently pursuing a Master's Degree in Digital Arts, her achievements include a M.S. in Education from UPenn and a B.S. in Psychology from Tsinghua University. She likes painting, designing, playing board games, cooking, swimming, and learning new things such as playing the violin and Go. Joy loves her cat."
  },
  {
    name: "Tali",
    title: "Marketing lead",
    desc:
      "Former Marketing Specialist@Publicis Groupe and Digital Marketing Manager@ZGallerie. Tali has been working in marketing for over 10 years, her past experience includes both global clients such as Coca Cola and L'Oréal and small businesses where she was a jack of all marketing trades. In her spare time Tali can be found riding a bicycle, taking dance workshops or learning Spanish."
  }
];

const videosList = [
  {
    embed_code: `<iframe width="560" height="315" src="https://www.youtube.com/embed/aFXZu-wopnw" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
    title: "0-to-jobhax / Session01 US",
    description:
      "Alumni Bridge for Requirement Elicitation class. Helping ITU to engage Alumni network"
  },
  {
    embed_code: `<iframe width="560" height="315" src="https://www.youtube.com/embed/QgZp2inTBig" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
    title: "0-to-jobhax / Session04 US",
    description: "The early journey of JobHax platform in ITU Presents"
  },
  {
    embed_code: `<iframe width="560" height="315" src="https://www.youtube.com/embed/LrMZbT8hA-Q" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
    title: "0-to-jobhax / Session03 US",
    description: "Spring 2019 ITU"
  },
  {
    embed_code: `<iframe width="560" height="315" src="https://www.youtube.com/embed/hb_Xjxp7qjQ" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
    title: "0-to-jobhax / Session02 US",
    description: "ITU Career Fair"
  },
  {
    embed_code: `<iframe width="560" height="315" src="https://www.youtube.com/embed/Ufir7EU27E0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
    title: "0-to-jobhax Job Posting",
    description: "Job Posting Presentation at ITU"
  }
];

class AboutUs extends Component {
  generateCarouselArea() {
    const list = [];
    for (let i = 1; i < 64; i++) {
      if (i < 10) {
        list.push("/media/aboutus00" + i.toString() + ".jpg");
      } else {
        list.push("/media/aboutus0" + i.toString() + ".jpg");
      }
    }
    const media = list.map(photo => {
      return (
        <div key={list.indexOf(photo)} className="carousel-image">
          <img src={jtsApiRoot + photo} />
        </div>
      );
    });

    return (
      <div>
        <div className="carousel-container">
          <Carousel autoplay={true}>{media}</Carousel>
        </div>
        <div className="carousel-area-height"></div>
      </div>
    );
  }

  generateIntro() {
    const quoteList = [
      {
        quote: `Do you want to join us?`,
        owner: ""
      },
      {
        quote: `“I’m passionate about disrupting the career advising market and building my brilliant team”.`,
        owner: "Sako, Founder"
      }
    ];

    const quotes = quoteList.map(quote => {
      return (
        <div key={quoteList.indexOf(quote)} className="quote-container">
          <div className="quote">{quote.quote}</div>
          <div className="quote">{quote.owner}</div>
        </div>
      );
    });

    const carousel = (
      <Carousel autoplay={true} dots={false}>
        {quotes}
      </Carousel>
    );

    return (
      <div className="intro-container">
        <div className="info-area">
          <div className="section-title">INTRO</div>
          <div className="header">Who are we?</div>
          <div className="emphasis">
            We are you. We studied. We dreamed. We worked hard. We went through
            the job application process ourselves and we were not so happy about
            it.
          </div>
          <div className="text">
            Messy spreadsheets, lost emails, lack of information - just a few
            struggles to mention. And our university career advising did not
            seem helpful or relevant to our needs.
          </div>
          <div className="text">
            So we decided to change it. We decided to make a job search simple
            and data-driven and career advising efficient.
          </div>
          <div className="text">
            Our journey started in Fall 2018 at the International Technological
            University in the heart of Silicon Valley and by December the very
            first version of JobHax was released. We kept our noses to the
            grindstone and on August 29th, 2019, the current version went live.
          </div>
          <div className="text">
            In a nutshell, JobHax is a platform that leverages data analytics,
            automation, and predictive insights for universities to help
            students land their dream job.
          </div>
        </div>
        <div className="quotes-area">
          <img src={"../../../src/assets/images/quote.png"} />
          {carousel}
        </div>
      </div>
    );
  }

  generateTeam() {
    const person = info => (
      <div className="person-container">
        <div className="person-photo">
          <img
            src={
              "../../../src/assets/images/" + info.name.toLowerCase() + ".png"
            }
          />
        </div>
        <div className="person-name">{info.name}</div>
        <div className="person-title">{info.title}</div>
        <div className="person-desc">{info.desc}</div>
      </div>
    );

    return (
      <div className="team-container">
        <div className="section-title">WE ARE</div>
        <div className="header">Our Team</div>
        <div className="team-members">
          {team_first.map(member => {
            return person(member);
          })}
        </div>
        <div
          className="team-members"
          style={{ marginTop: "-1px", paddingTop: 120 }}
        >
          {team_second.map(member => {
            return person(member);
          })}
        </div>
      </div>
    );
  }

  generateVideosArea() {
    const videos = videosList.map(video => (
      <div className="video-container">
        <div> {parse(`${video.embed_code}`)}</div>
        <div className="video-title">{video.title}</div>
        <div>{video.description}</div>
      </div>
    ));
    return <div className="videos-area">{videos}</div>;
  }

  render() {
    return (
      <div className="about-us-container">
        <div>
          {this.generateCarouselArea()}
          {this.generateIntro()}
          {this.generateTeam()}
          {this.generateVideosArea()}
        </div>
        <div style={{ marginTop: 100 }}>
          <Footer />
        </div>
      </div>
    );
  }
}

export default AboutUs;
