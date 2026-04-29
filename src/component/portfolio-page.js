import { React, useState, useEffect } from "react";
import './protfolio-page.css';
import { menuClose } from "./NavBar";  // Assuming you have a NavBar component
import fetchPortfolioData from "./fetchData/fetchPortfolio.js";


const webUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const Portfolio = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all projects
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const projectList = await fetchPortfolioData();
                
                // Set default project image fallback if not present
                projectList[0].Data.forEach((project) => {
                    const imageUrl = project.imgLink?.startsWith('http') 
                        ? project.imgLink 
                        : `${webUrl}${project.imgLink?.startsWith('/') ? project.imgLink.slice(1) : project.imgLink}`;
                });
                
                setProjects(projectList[0].Data);
            } catch (error) {
                console.error("Error in fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="portfolio-main-container" onClick={menuClose}>
            <div className="container">
                {isLoading ? (
                    <div className="loading-projects">
                        <div className="spinner"></div>
                        <p>Loading amazing projects...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="no-projects">
                        <div className="no-projects-content">
                            <h3>No Projects Found</h3>
                            <p>Check back soon for exciting new projects!</p>
                        </div>
                    </div>
                ) : (
                    projects.map((project, index) => (
                        <div 
                            key={index} 
                            className="element"
                            style={{
                                animationDelay: `${index * 0.1}s`
                            }}
                        >
                            <div className="image-container">
                                <img 
                                    src={(() => {
                                        if (project.imgLink?.startsWith('data:')) {
                                            return project.imgLink;
                                        }
                                        if (project.imgLink?.startsWith('http')) {
                                            return project.imgLink;
                                        }
                                        const cleanPath = project.imgLink?.startsWith('/') ? project.imgLink.slice(1) : project.imgLink;
                                        return `${webUrl}${cleanPath}`;
                                    })()} 
                                    alt={project.tittle || "Project"} 
                                    onError={(e) => {
                                        console.error('Portfolio image failed to load:', e.target.src);
                                        console.error('Original imgLink:', project.imgLink);
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                                    }}
                                    onLoad={(e) => {
                                        console.log('Portfolio image loaded successfully:', e.target.src);
                                    }}
                                    loading="lazy"
                                />
                                <div className="image-overlay"></div>
                            </div>
                            <div className="content">
                                <div className="content-inner">
                                    <h1 className="project_heading">{project.tittle}</h1>
                                    <p className="project_paragraph">{project.paragraph}</p>
                                    {project.link && (
                                        <a 
                                            href={project.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="project-link"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <span>View Project</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Portfolio;
