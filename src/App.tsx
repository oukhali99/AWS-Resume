import { useState } from 'react';
import { version } from '../package.json';
import ContactInfo from './ContactInfo';
import { useVisitorCount } from './VisitorCount';
import ArchitectureDiagram from './ArchitectureDiagram';

const PROJECTS = [
  {
    title: 'Gig demo',
    description:
      'Serverless gig marketplace — job posts, bookings, and payments on AWS. TypeScript Lambdas behind HTTP API Gateway and Cognito JWT auth, DynamoDB tables, S3 images with Rekognition/Comprehend moderation and CloudFront delivery, Stripe Payment Intents for hold-and-capture billing, Terraform infra and CodePipeline deploys.',
    tags: ['TypeScript', 'React', 'Lambda', 'API Gateway', 'DynamoDB', 'Stripe', 'Terraform', 'CI/CD'],
    link: 'https://gig-demo.oussamakhalifeh.com',
    github: 'https://github.com/oukhali99/gig-demo',
    image: 'https://raw.githubusercontent.com/oukhali99/gig-demo/refs/heads/main/docs/AWS%20Architecture.drawio.svg',
    linkLabel: 'live demo →',
  },
  {
    title: 'AWS Resume',
    description:
      "This site. React SPA on S3 + CloudFront, contact form via SES, visitor counter on Lambda + DynamoDB, ACM cert and Route 53 records managed in Terraform, CodePipeline on every push.",
    tags: ['React', 'Lambda', 'DynamoDB', 'API Gateway', 'S3', 'CloudFront', 'Terraform'],
    link: 'https://resume.oussamakhalifeh.com',
    github: 'https://github.com/oukhali99/AWS-Resume',
    image: 'https://raw.githubusercontent.com/oukhali99/AWS-Resume/refs/heads/main/docs/AWS%20Architecture.drawio.svg',
    linkLabel: "you're on it",
  },
];

const JOBS = [
  {
    title: 'Full Stack Software Developer',
    company: 'Asset Science',
    when: 'Jul 2021 — present',
    bullets: [
      'Deploy enterprise applications via Azure Intune',
      'Build an Electron + React desktop app for device management',
      'Use C++ and libimobiledevice to talk to iOS devices over USB',
      'Ship iOS, Android, and macOS tools alongside',
      'Work closely with clients to match shipped behavior to business needs',
    ],
  },
  {
    title: 'Full Stack Web API and App Developer',
    company: 'Solarex',
    when: 'May 2021 — Jul 2021',
    bullets: [
      'Built reservation APIs with Laravel and ASP.NET',
      'Implemented Identity Server authentication',
      'Developed Razor-based front-ends',
    ],
  },
  {
    title: 'Research Intern',
    company: 'CRSNG @ UQAM',
    when: 'May 2019 — Sep 2019',
    bullets: [
      'Optimized packet scheduling algorithms',
      'Implemented Python ports of theoretical models',
      'Co-authored a research paper',
    ],
  },
];

const SKILLS = {
  languages: ['Java', 'Python', 'C#', 'C++', 'JavaScript', 'TypeScript', 'Rust', 'SQL'],
  platforms: ['AWS', 'Lambda', 'DynamoDB', 'API Gateway', 'CloudFront', 'S3', 'Terraform', 'CodePipeline', 'Docker', 'React', 'Spring Boot', '.NET'],
  gamedev: ['Unity', 'Godot', 'DirectX', 'OpenGL'],
};

function App() {
  const visitorCount = useVisitorCount();
  const [zoomed, setZoomed] = useState<string | null>(null);

  return (
    <div className="frame">
      <div className="topstrip">
        <div>
          <span className="pulse" aria-hidden="true" />
          live · served via cloudfront · region us-east-1
        </div>
        <div className="region">v{version} · main</div>
      </div>

      <header className="hero">
        <h1>Oussama Khalifeh</h1>
        <p className="tagline">
          Full-stack engineer in Montréal. I ship cloud systems end-to-end —{' '}
          <em>the page you're reading is a working Lambda + DynamoDB + CloudFront stack</em>,
          deployed on every push via Terraform and CodePipeline.
        </p>
        <div className="meta">
          <ContactInfo />
        </div>
      </header>

      <ArchitectureDiagram visitorCount={visitorCount} />

      <section className="s">
        <div className="label">
          [ projects ]<span className="count">{String(PROJECTS.length).padStart(2, '0')}</span>
        </div>
        <div>
          {PROJECTS.map((p) => (
            <div className="project" key={p.title}>
              <div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <ul className="tags">
                  {p.tags.map((t) => <li key={t}>{t}</li>)}
                </ul>
                <div className="actions">
                  <a className="signal" href={p.link} target="_blank" rel="noopener noreferrer">
                    {p.linkLabel}
                  </a>
                  <a href={p.github} target="_blank" rel="noopener noreferrer">source</a>
                </div>
              </div>
              <div className="thumb" onClick={() => setZoomed(p.image)} role="button" tabIndex={0}
                   onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setZoomed(p.image)}>
                <img src={p.image} alt={`${p.title} architecture diagram`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="s">
        <div className="label">[ experience ]</div>
        <div>
          {JOBS.map((j) => (
            <div className="job" key={j.title + j.company}>
              <h4>{j.title}</h4>
              <div className="when">{j.company} · {j.when}</div>
              <ul>{j.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <section className="s edu">
        <div className="label">[ education ]</div>
        <div>
          <h4>B.Sc. Mathematics &amp; Computer Science</h4>
          <div className="school">McGill University · 2018 — 2021 · 3.9 GPA</div>
          <p>Algorithms, software design, databases, modern game development.</p>
        </div>
      </section>

      <section className="s">
        <div className="label">[ stack ]</div>
        <div>
          <div className="skill-cluster">
            <h5>languages</h5>
            <ul className="skills">{SKILLS.languages.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
          <div className="skill-cluster">
            <h5>platforms · infra</h5>
            <ul className="skills">{SKILLS.platforms.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
          <div className="skill-cluster">
            <h5>game dev</h5>
            <ul className="skills">{SKILLS.gamedev.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="s interests">
        <div className="label">[ off-hours ]</div>
        <div>
          <p>Game development, automobile repair, fishing.</p>
        </div>
      </section>

      <footer className="foot">
        <span>v{version} · deployed via terraform + codepipeline</span>
        <span>resume.oussamakhalifeh.com</span>
      </footer>

      {zoomed && (
        <div className="lightbox" onClick={() => setZoomed(null)}>
          <img src={zoomed} alt="" />
        </div>
      )}
    </div>
  );
}

export default App;
