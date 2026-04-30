import './home_container.css'
import { menuClose } from "./NavBar";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function HomeContainer(props) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [cvLink, setCvLink] = useState(null);

  const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/+$/, "");

  const skills = [
    { name: 'MongoDB', icon: 'Assets/logo/mongodb-svgrepo-com (1).png', level: 90, color: '#47A248' },
    { name: 'Express.js', icon: 'Assets/logo/express-svgrepo-com (2).png', level: 85, color: '#000000' },
    { name: 'React.js', icon: 'Assets/logo/react-svgrepo-com.png', level: 95, color: '#61DAFB' },
    { name: 'Node.js', icon: 'Assets/logo/node-js-svgrepo-com.png', level: 88, color: '#339933' },
    { name: 'Python', icon: 'Assets/logo/python-svgrepo-com.png', level: 80, color: '#3776AB' }
  ];

  const experiences = [
    { years: '3+', label: 'Years Experience', icon: '🏆' },
    { years: '50+', label: 'Projects Completed', icon: '💼' },
    { years: '100%', label: 'Client Satisfaction', icon: '😊' },
    { years: '24/7', label: 'Support Available', icon: '🚀' }
  ];

  const personalInfo = {
    name: props.name || 'ShreePrasad Das',
    title: 'Full Stack Developer',
    location: 'India',
    email: 'shreeprasad@example.com',
    phone: '+91 XXXXX XXXXX',
    languages: ['English', 'Hindi', 'Odia'],
    interests: ['Web Development', 'AI/ML', 'Mobile Apps', 'Cloud Computing']
  };

  // Typing animation effect
  useEffect(() => {
    const text = "I'm a passionate Full Stack Developer";
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setTypedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Fetch CV link from config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_URL}/config`);
        if (!response.ok) {
          console.warn(`[HOME] Config fetch failed with status ${response.status}`);
          return;
        }
        const data = await response.json();
        console.log('[HOME] Config fetched successfully');
        if (data.cvLink) {
          setCvLink(data.cvLink);
        }
      } catch (error) {
        console.warn('[HOME] Failed to fetch config:', error.message);
      }
    };
    
    fetchConfig();
  }, []);

  // Scroll animation trigger
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate skills highlight
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSkill((prev) => (prev + 1) % skills.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [skills.length]);

  return (
    <div className="about-main-container" onClick={menuClose}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <img src="Assets/images/home-page.png" alt="Background Portrait" />
          <div className="background-overlay"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text-glass">
            <h1 className="hero-title">
              <span className="greeting">Hello, I'm</span>
              <span className="name">
                Shree<span className="name-highlight">Prasad Das</span>
              </span>
              <span className="typing-text">
                {typedText}
                {isTyping && <span className="cursor">|</span>}
              </span>
            </h1>
            <p className="hero-description">{props.paragraph}</p>
            
            <div className="hero-buttons">
              <Link to="/contact" className="cta-button primary">
                <span>Get In Touch</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </Link>
              <Link to="/portfolio" className="cta-button secondary">
                <span>View Work</span>
              </Link>
              {cvLink && (
                <a href={cvLink} download="Shreeprasad Resume" className="cta-button cv">
                  <span>📄 Download CV</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {experiences.map((exp, index) => (
            <div key={index} className="stat-card" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="stat-icon">{exp.icon}</div>
              <div className="stat-number">{exp.years}</div>
              <div className="stat-label">{exp.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-info">
            <h2 className="section-title">About <span>Me</span></h2>
            <div className="about-text">
              <p>
                I'm a passionate full-stack developer with expertise in modern web technologies. 
                I love creating digital experiences that are not only functional but also beautiful 
                and user-friendly.
              </p>
              <p>
                With a strong foundation in both frontend and backend development, I bring ideas 
                to life with clean, efficient code and thoughtful design.
              </p>
            </div>
            
            <div className="personal-details">
              <div className="detail-row">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{personalInfo.location}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Languages:</span>
                <span className="detail-value">{personalInfo.languages.join(', ')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Interests:</span>
                <span className="detail-value">{personalInfo.interests.join(', ')}</span>
              </div>
            </div>
          </div>
          
          <div className="about-visual">
            <div className="floating-elements">
              <div className="float-element" style={{ animationDelay: '0s' }}>💻</div>
              <div className="float-element" style={{ animationDelay: '1s' }}>🚀</div>
              <div className="float-element" style={{ animationDelay: '2s' }}>⚡</div>
              <div className="float-element" style={{ animationDelay: '3s' }}>🎯</div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="skills-section">
        <h2 className="section-title">Technical <span>Skills</span></h2>
        
        <div className="skills-container">
          <div className="skills-grid">
            {skills.map((skill, index) => (
              <div 
                key={index} 
                className={`skill-card ${currentSkill === index ? 'active' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="skill-icon">
                  <img src={skill.icon} alt={skill.name} />
                </div>
                <div className="skill-info">
                  <h3 className="skill-name">{skill.name}</h3>
                  <div className="skill-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${skill.level}%`,
                          backgroundColor: skill.color
                        }}
                      ></div>
                    </div>
                    <span className="skill-percentage">{skill.level}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="journey-section">
        <h2 className="section-title">My <span>Journey</span></h2>
        
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>Started Programming</h3>
              <p>Began my journey with Python and discovered the world of coding</p>
              <span className="timeline-date">2020</span>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>Web Development</h3>
              <p>Dove into frontend development with React and modern JavaScript</p>
              <span className="timeline-date">2021</span>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>Full Stack Developer</h3>
              <p>Mastered backend development with Node.js and database management</p>
              <span className="timeline-date">2022</span>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>Professional Developer</h3>
              <p>Building amazing projects and helping clients achieve their goals</p>
              <span className="timeline-date">Present</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
