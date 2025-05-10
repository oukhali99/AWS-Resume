import styled from 'styled-components';

const ResumeContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eaeaea;
`;

const Name = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
`;

const ContactInfo = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ContactItem = styled.p`
  margin: 0;
  color: #4a5568;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: #2d3748;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eaeaea;
`;

const Experience = styled.div`
  margin-bottom: 1.5rem;
`;

const ExperienceTitle = styled.h3`
  color: #2d3748;
  margin-bottom: 0.25rem;
`;

const Company = styled.p`
  color: #4a5568;
  font-style: italic;
  margin-bottom: 0.5rem;
`;

const ExperienceList = styled.ul`
  margin: 0;
  padding-left: 1.5rem;
`;

const ExperienceItem = styled.li`
  margin-bottom: 0.5rem;
`;

const Skills = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SkillCategory = styled.div`
  h3 {
    color: #2d3748;
    margin-bottom: 0.5rem;
  }
`;

const SkillList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SkillItem = styled.li`
  margin-bottom: 0.25rem;
  color: #4a5568;
`;

const Education = styled.div`
  h3 {
    color: #2d3748;
    margin-bottom: 0.25rem;
  }

  p {
    color: #4a5568;
    margin: 0;
  }
`;

function App() {
  return (
    <ResumeContainer>
      <Header>
        <Name>Oussama Khalifeh</Name>
        <ContactInfo>
          <ContactItem>📧 john.doe@email.com</ContactItem>
          <ContactItem>📱 (123) 456-7890</ContactItem>
          <ContactItem>📍 New York, NY</ContactItem>
        </ContactInfo>
      </Header>

      <Section>
        <SectionTitle>Professional Summary</SectionTitle>
        <p>
          Experienced software developer with a strong background in web development
          and a passion for creating efficient, scalable solutions. Skilled in
          React, TypeScript, and modern web technologies.
        </p>
      </Section>

      <Section>
        <SectionTitle>Work Experience</SectionTitle>
        <Experience>
          <ExperienceTitle>Senior Software Engineer</ExperienceTitle>
          <Company>Tech Company Inc. | 2020 - Present</Company>
          <ExperienceList>
            <ExperienceItem>Led development of key features using React and TypeScript</ExperienceItem>
            <ExperienceItem>Improved application performance by 40% through optimization</ExperienceItem>
            <ExperienceItem>Mentored junior developers and conducted code reviews</ExperienceItem>
          </ExperienceList>
        </Experience>
        <Experience>
          <ExperienceTitle>Software Developer</ExperienceTitle>
          <Company>Previous Company | 2018 - 2020</Company>
          <ExperienceList>
            <ExperienceItem>Developed and maintained multiple web applications</ExperienceItem>
            <ExperienceItem>Collaborated with cross-functional teams</ExperienceItem>
            <ExperienceItem>Implemented CI/CD pipelines</ExperienceItem>
          </ExperienceList>
        </Experience>
      </Section>

      <Section>
        <SectionTitle>Skills</SectionTitle>
        <Skills>
          <SkillCategory>
            <h3>Frontend</h3>
            <SkillList>
              <SkillItem>React</SkillItem>
              <SkillItem>TypeScript</SkillItem>
              <SkillItem>HTML/CSS</SkillItem>
              <SkillItem>JavaScript</SkillItem>
            </SkillList>
          </SkillCategory>
          <SkillCategory>
            <h3>Backend</h3>
            <SkillList>
              <SkillItem>Node.js</SkillItem>
              <SkillItem>Python</SkillItem>
              <SkillItem>SQL</SkillItem>
            </SkillList>
          </SkillCategory>
        </Skills>
      </Section>

      <Section>
        <SectionTitle>Education</SectionTitle>
        <Education>
          <h3>Bachelor of Science in Computer Science</h3>
          <p>University Name | 2014 - 2018</p>
        </Education>
      </Section>
    </ResumeContainer>
  );
}

export default App;
