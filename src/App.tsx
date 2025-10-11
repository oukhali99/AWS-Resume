import { Container, Row, Col, Card, Badge, Navbar, Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ContactInfo from './ContactInfo';
import VisitorCount from './VisitorCount';
import awsLogo from './assets/aws-color-2499456018.png'; // You must add aws-logo.png in the same directory or adjust the path
import { version } from '../package.json';
import { useState } from 'react';

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
            Deployed on AWS using CDK with Full CodePipeline CI/CD
            <Badge bg="primary" className="ms-2">v{version}</Badge>
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

        {/* Projects Section */}
        <SectionCard title="Projects">
          <Project 
            title="JWT OAuth2 Spring Boot + React"
            description="Full-stack authentication system with OAuth2 and JWT tokens using Spring Boot and React."
            technologies={["Spring Boot", "React", "OAuth2", "AWS", "CDK", "CI/CD"]}
            link="https://jwt-oauth-frontend.oussamakhalifeh.com"
            githubLink="https://github.com/oukhali99/JWT-OAuth2-Spring-Boot-React"
            image="https://raw.githubusercontent.com/oukhali99/JWT-OAuth2-Spring-Boot-React/refs/heads/main/docs/AWS%20Architecture.drawio.svg"
          />
          <Project 
            title="AWS Resume"
            description="This resume website, built with React and deployed on AWS with a serverless backend."
            technologies={["React", "AWS Lambda", "DynamoDB", "API Gateway", "S3", "CloudFront"]}
            link="https://resume.oussamakhalifeh.com"
            githubLink="https://github.com/oukhali99/AWS-Resume"
            image="https://raw.githubusercontent.com/oukhali99/AWS-Resume/refs/heads/main/docs/AWS%20Architecture.drawio.svg"
          />
        </SectionCard>

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
              "Develop an ElectronJS + ReactJS desktop app",
              "Use C++ and libimobiledevice to communicate with mobile devices",
              "Build iOS/Android mobile apps and macOS desktop tools",
              "Work closely with clients to meet business needs"
            ]}
          />
          <Job
            title="Full Stack Web API and App Developer"
            company="Solarex"
            duration="May 2021 – July 2021"
            bullets={[
              "Build reservation APIs with Laravel and ASP.NET",
              "Implement Identity Server authentication",
              "Develop front-ends with Razor"
            ]}
          />
          <Job
            title="Research Intern"
            company="CRSNG at UQAM"
            duration="May 2019 – September 2019"
            bullets={[
              "Optimize packet scheduling algorithms",
              "Implement Python versions of theoretical models",
              "Co-author a research paper"
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

const Project = ({ 
  title, 
  description, 
  technologies, 
  link, 
  githubLink,
  image
}: { 
  title: string, 
  description: string, 
  technologies: string[], 
  link?: string, 
  githubLink?: string,
  image?: string
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="mb-4">
      <Row>
        <Col md={image ? 8 : 12}>
          <h4>{title}</h4>
          <p>{description}</p>
          <div className="mb-2">
            {technologies.map((tech, i) => (
              <Badge key={i} bg="primary" className="me-2 mb-2">{tech}</Badge>
            ))}
          </div>
          <div>
            {link && (
              <Button variant="success" href={link} target="_blank" className="me-2" size="sm">
                Live Demo
              </Button>
            )}
            {githubLink && (
              <Button variant="outline-secondary" href={githubLink} target="_blank" size="sm">
                GitHub Repository
              </Button>
            )}
          </div>
        </Col>
        {image && (
          <Col md={4} className="d-flex align-items-center justify-content-center">
            <Card 
              className="shadow-sm" 
              style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
              onClick={() => setShowModal(true)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Card.Body className="p-2">
                <img 
                  src={image}
                  alt={`${title} screenshot`}
                  className="img-fluid rounded"
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
              </Card.Body>
            </Card>
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
              <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
              </Modal.Header>
              <Modal.Body className="text-center">
                <img 
                  src={image}
                  alt={`${title} screenshot`}
                  className="img-fluid"
                  style={{ maxHeight: '80vh' }}
                />
              </Modal.Body>
            </Modal>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default App;
