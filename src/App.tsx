import { Container, Row, Col, Card, Badge, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ContactInfo from './ContactInfo';
import VisitorCount from './VisitorCount';
import awsLogo from './assets/aws-color-2499456018.png'; // You must add aws-logo.png in the same directory or adjust the path

function App() {
  return (
    <>
      {/* Navbar with AWS logo and text */}
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand className="d-flex align-items-center">
            <img
              alt="AWS Logo"
              src={awsLogo}
              width="30"
              height="30"
              className="d-inline-block align-top me-2"
            />
            Deployed on AWS using CloudFormation
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Container className="py-5">
        {/* Header Section */}
        <Card className="mb-5 shadow-sm">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-4 mb-0">Oussama Khalifeh</h1>
              <ContactInfo />
            </div>
            <VisitorCount />
          </Card.Body>
        </Card>

        {/* Education Section */}
        <SectionCard title="Education">
          <h3>Bachelor of Science in Mathematics and Computer Science</h3>
          <p className="text-muted">McGill University | 2018 - 2021</p>
          <p>Graduated with a 3.9 GPA</p>
          <p>Studied Algorithms, Software Design, Databases, and Modern Game Development</p>
        </SectionCard>

        {/* Work Experience */}
        <SectionCard title="Work Experience">
          <Job
            title="Full Stack Software Developer"
            company="Asset Science"
            duration="July 2021 – Present"
            bullets={[
              "Developed an ElectronJS + ReactJS desktop app",
              "Used C++ and libimobiledevice to communicate with mobile devices",
              "Built iOS/Android mobile apps and macOS desktop tools",
              "Worked closely with clients to meet business needs"
            ]}
          />
          <Job
            title="Full Stack Web API and App Developer"
            company="Solarex"
            duration="May 2021 – July 2021"
            bullets={[
              "Built reservation APIs with Laravel and ASP.NET",
              "Implemented Identity Server authentication",
              "Developed front-ends with Razor"
            ]}
          />
          <Job
            title="Research Intern"
            company="CRSNG at UQAM"
            duration="May 2019 – September 2019"
            bullets={[
              "Optimized packet scheduling algorithms",
              "Implemented Python versions of theoretical models",
              "Co-authored a research paper"
            ]}
          />
        </SectionCard>

        {/* Skills */}
        <SectionCard title="Skills">
          <Row>
            <Col md={6}>
              <h5>Programming & Tech</h5>
              <SkillList skills={["Java", "Python", "C#", "C++", ".NET", "JavaScript", "React", "Android", "Rust", "SQL", "Mongo", "Docker", "AWS", "Spring Boot"]} />
            </Col>
            <Col md={6}>
              <h5>Game Development</h5>
              <SkillList skills={["Unity", "Godot", "DirectX", "OpenGL"]} />
            </Col>
          </Row>
        </SectionCard>

        {/* Interests */}
        <SectionCard title="Interests & Hobbies">
          <p>Game development, automobile repair, fishing</p>
        </SectionCard>
      </Container>
    </>
  );
}

const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <Card className="mb-5 shadow-sm">
    <Card.Body>
      <h2 className="h4 border-bottom pb-2 mb-4">{title}</h2>
      {children}
    </Card.Body>
  </Card>
);

const Job = ({ title, company, duration, bullets }: { title: string, company: string, duration: string, bullets: string[] }) => (
  <div className="mb-4">
    <h4>{title}</h4>
    <p className="text-muted mb-1">{company} | {duration}</p>
    <ul className="mb-0">
      {bullets.map((b, i) => <li key={i}>{b}</li>)}
    </ul>
  </div>
);

const SkillList = ({ skills }: { skills: string[] }) => (
  <ul className="list-inline">
    {skills.map((skill, i) => (
      <li key={i} className="list-inline-item mb-2">
        <Badge bg="secondary" className="p-2">{skill}</Badge>
      </li>
    ))}
  </ul>
);

export default App;
