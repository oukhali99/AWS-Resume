import { Container, Row, Col, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ContactInfo from './ContactInfo';

function App() {
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col className="text-center">
          <h1 className="display-4 mb-3">Oussama Khalifeh</h1>
          <ContactInfo />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <h2 className="h3 mb-3 border-bottom pb-2">Education</h2>
              <h3 className="h4">Bachelor of Science in Mathematics and Computer Science</h3>
              <p className="text-muted">McGill University | 2018 - 2021</p>
              <p>Graduated with a 3.9 GPA</p>
              <p>Studied Algorithms and Data Structures, Software Design, Database Systems, Modern Computer Games</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <h2 className="h3 mb-3 border-bottom pb-2">Work Experience</h2>
              
              <div className="mb-4">
                <h3 className="h4">Full Stack Software Developer</h3>
                <p className="text-muted">Asset Science | July 15, 2021 - Present</p>
                <ul>
                  <li>Developed an ElectronJS + ReactJS desktop application for interfacing with mobile devices</li>
                  <li>Used C++ and libimobiledevice to communicate directly with mobile devices and extract information</li>
                  <li>Developed a mobile application for iOS and Android</li>
                  <li>Built a macOS desktop application using Python and Tkinter for automatic iOS device flashing</li>
                  <li>Communicated with customers to plan and implement their software business needs</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="h4">Full Stack Web API and App Developer</h3>
                <p className="text-muted">Solarex | May 5, 2021 - July 10, 2021</p>
                <ul>
                  <li>Developed a reservation API using Laravel and ASP.NET</li>
                  <li>Implemented web authentication using Identity Server</li>
                  <li>Designed and developed a front-end using Razor</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="h4">Research Intern</h3>
                <p className="text-muted">CRSNG at UQAM | May 1, 2019 - September 17, 2019</p>
                <ul>
                  <li>Optimized packet scheduling algorithms</li>
                  <li>Implemented pseudo-code in Python</li>
                  <li>Contributed to a research paper in collaboration with other researchers</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <h2 className="h3 mb-3 border-bottom pb-2">Skills</h2>
              <Row>
                <Col md={6} className="mb-3">
                  <h3 className="h4">Programming Languages & Technologies</h3>
                  <ul className="list-unstyled">
                    <li>Java</li>
                    <li>Python</li>
                    <li>C#</li>
                    <li>C++</li>
                    <li>.NET</li>
                    <li>JavaScript</li>
                    <li>React</li>
                    <li>Android</li>
                    <li>libimobiledevice</li>
                    <li>Rust</li>
                    <li>SQL</li>
                    <li>Mongo</li>
                    <li>Docker</li>
                    <li>AWS</li>
                    <li>WinForms</li>
                    <li>Spring Boot</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h3 className="h4">Game Development & Graphics</h3>
                  <ul className="list-unstyled">
                    <li>Unity</li>
                    <li>Godot</li>
                    <li>DirectX</li>
                    <li>OpenGL</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <h2 className="h3 mb-3 border-bottom pb-2">Interests and Hobbies</h2>
              <p>Hobby/Casual Game Development, Automobile Repair, Fishing</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
