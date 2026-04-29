import { React, useState, useEffect } from "react";
import './solutions-page.css';
import { menuClose } from "./NavBar";

const webUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000/").replace(/\/+$/, "");

const Solutions = () => {
    const [solutions, setSolutions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Get unique categories and statuses for filters
    const categories = ['All', ...new Set(solutions.map(solution => solution.category))];
    const statuses = ['All', 'Active', 'Completed', 'In Progress'];

    useEffect(() => {
        fetchSolutions();
    }, []);

    const fetchSolutions = async () => {
        setIsLoading(true);
        try {
            console.log('[Solutions Page] Fetching from:', `${webUrl}/solutions`);
            
            const response = await fetch(`${webUrl}/solutions`, {
                method: 'GET',
                credentials: 'include'
            });
            
            console.log('[Solutions Page] Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('[Solutions Page] Data received:', data);
            
            if (data.success && data.data) {
                setSolutions(data.data);
                // Pre-calculate image URLs if needed
                data.data.forEach((solution) => {
                    const imageUrl = solution.imgLink?.startsWith('http') 
                        ? solution.imgLink 
                        : `${webUrl}${solution.imgLink?.startsWith('/') ? solution.imgLink.slice(1) : solution.imgLink}`;
                });
            } else {
                console.error('[Solutions Page] No solutions data found');
                setSolutions([]);
            }
        } catch (error) {
            console.error('[Solutions Page] Error fetching solutions:', error);
            setSolutions([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter solutions based on selected filters and search query
    const filteredSolutions = solutions.filter(solution => {
        const matchesCategory = selectedCategory === 'All' || solution.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All' || solution.status === selectedStatus;
        const matchesSearch = searchQuery === '' || 
            solution.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            solution.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            solution.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesCategory && matchesStatus && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return '#4caf50';
            case 'Completed':
                return '#1BB8B8';
            case 'In Progress':
                return '#ffc107';
            default:
                return '#ccc';
        }
    };

    return (
        <div className="solutions-main-container" onClick={menuClose}>
            <div className="solutions-header">
                <h1 className="solutions-title">Our <span>Solutions</span></h1>
                <p className="solutions-subtitle">Innovative solutions tailored to meet your business needs</p>
            </div>

            {/* Filters Section */}
            <div className="solutions-filters">
                <div className="filter-group">
                    <label>Search:</label>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search solutions..."
                        className="search-input"
                    />
                </div>
                
                <div className="filter-group">
                    <label>Category:</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="filter-select"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label>Status:</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="filter-select"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="solutions-container">
                {isLoading ? (
                    <div className="loading-solutions">
                        <div className="spinner"></div>
                        <p>Loading innovative solutions...</p>
                    </div>
                ) : filteredSolutions.length === 0 ? (
                    <div className="no-solutions">
                        <div className="no-solutions-content">
                            <h3>No Solutions Found</h3>
                            <p>Try adjusting your filters or check back soon for new solutions!</p>
                        </div>
                    </div>
                ) : (
                    filteredSolutions.map((solution, index) => (
                        <div 
                            key={solution._id || index} 
                            className="solution-card"
                            style={{
                                animationDelay: `${index * 0.1}s`
                            }}
                        >
                            <div className="solution-image-container">
                                <img 
                                    src={(() => {
                                        if (solution.imgLink?.startsWith('data:')) {
                                            return solution.imgLink;
                                        }
                                        if (solution.imgLink?.startsWith('http')) {
                                            return solution.imgLink;
                                        }
                                        const cleanPath = solution.imgLink?.startsWith('/') ? solution.imgLink.slice(1) : solution.imgLink;
                                        return `${webUrl}${cleanPath}`;
                                    })()} 
                                    alt={solution.title || "Solution"} 
                                    onError={(e) => {
                                        console.error('Solution image failed to load:', e.target.src);
                                        console.error('Original imgLink:', solution.imgLink);
                                        console.error('webUrl:', webUrl);
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                                    }}
                                    onLoad={(e) => {
                                        console.log('Solution image loaded successfully:', e.target.src);
                                    }}
                                    loading="lazy"
                                />
                                <div className="solution-image-overlay"></div>
                                <div className="solution-status" style={{backgroundColor: getStatusColor(solution.status)}}>
                                    {solution.status}
                                </div>
                            </div>
                            
                            <div className="solution-content">
                                <div className="solution-header-info">
                                    <h2 className="solution-title">{solution.title}</h2>
                                    <span className="solution-category">{solution.category}</span>
                                </div>
                                
                                <p className="solution-description">{solution.description}</p>
                                
                                {solution.features && solution.features.length > 0 && (
                                    <div className="solution-features">
                                        <h4>Key Features:</h4>
                                        <ul>
                                            {solution.features.map((feature, idx) => (
                                                <li key={idx}>{feature}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {solution.technologies && solution.technologies.length > 0 && (
                                    <div className="solution-technologies">
                                        <h4>Technologies:</h4>
                                        <div className="tech-tags">
                                            {solution.technologies.map((tech, idx) => (
                                                <span key={idx} className="tech-tag">{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {solution.link && (
                                    <div className="solution-actions">
                                        <a 
                                            href={solution.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="solution-link"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <span>Learn More</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                                            </svg>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Solutions;
