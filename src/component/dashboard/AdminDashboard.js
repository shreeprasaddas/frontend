import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardProvider, useDashboard } from './DashboardContext';
import './admin.css';

// API URL configuration
const webUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");

// Login Component
function LoginForm() {
  const { state, actions } = useDashboard();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    const result = await actions.login(credentials);
    if (!result.success) {
      setLocalError(result.error);
    }
  };

  const handleChange = (e) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <h2>Admin <span>Portal</span></h2>
        {(localError || state.error) && (
          <div className="error-message">{localError || state.error}</div>
        )}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={state.loading} className="login-btn">
            {state.loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Need an admin account?</p>
          <Link to="/admin/register" className="register-link">
            Register with Secret Key
          </Link>
        </div>
      </div>
    </div>
  );
}

// Overview Component
function OverviewSection() {
  const { state } = useDashboard();
  const { stats } = state;

  return (
    <div className="overview-section">
      <h2>Dashboard Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalProjects}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalAdmins}</div>
          <div className="stat-label">Admin Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalContactForms}</div>
          <div className="stat-label">Contact Submissions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">Active</div>
          <div className="stat-label">System Status</div>
        </div>
      </div>
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <ul>
          {stats.recentActivity.map((activity, index) => (
            <li key={index}>{activity}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Solutions Management Component
function SolutionsSection() {
  // const { state, actions } = useDashboard(); // Not needed for this section
  const [solutions, setSolutions] = useState([]);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [solutionsError, setSolutionsError] = useState('');

  const [solutionForm, setSolutionForm] = useState({
    title: '',
    description: '',
    features: '',
    technologies: '',
    imgLink: '',
    link: '',
    category: '',
    status: 'Active'
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch solutions on component mount
  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    setSolutionsLoading(true);
    setSolutionsError('');
    try {
      const response = await fetch(`${webUrl}solutions`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setSolutions(data.data);
      } else {
        setSolutions([]);
      }
    } catch (error) {
      console.error('Error fetching solutions:', error);
      setSolutionsError(error.message);
      setSolutions([]);
    } finally {
      setSolutionsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', solutionForm.title || '');
      formData.append('description', solutionForm.description || '');
      formData.append('features', solutionForm.features || '');
      formData.append('technologies', solutionForm.technologies || '');
      formData.append('link', solutionForm.link || '');
      formData.append('category', solutionForm.category || '');
      formData.append('status', solutionForm.status || 'Active');
      
      console.log('Frontend Solution Form Data:', {
        title: solutionForm.title,
        description: solutionForm.description,
        features: solutionForm.features,
        technologies: solutionForm.technologies,
        category: solutionForm.category,
        status: solutionForm.status,
        hasFile: !!selectedFile
      });
      
      // Add file or imgLink
      if (selectedFile) {
        formData.append('image', selectedFile);
        console.log('Adding file:', selectedFile.name);
      } else if (solutionForm.imgLink && !solutionForm.imgLink.startsWith('data:')) {
        formData.append('imgLink', solutionForm.imgLink);
        console.log('Adding imgLink:', solutionForm.imgLink);
      }

      const url = editId 
        ? `${webUrl}solutions/${editId}`
        : `${webUrl}solutions`;
      
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setSolutionForm({ 
          title: '', 
          description: '', 
          features: '', 
          technologies: '', 
          imgLink: '', 
          link: '', 
          category: '', 
          status: 'Active' 
        });
        setSelectedFile(null);
        setEditId(null);
        fetchSolutions(); // Refresh the list
        alert(editId ? 'Solution updated successfully!' : 'Solution created successfully!');
      } else {
        alert(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Operation failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (solution) => {
    setSolutionForm({
      title: solution.title,
      description: solution.description,
      features: Array.isArray(solution.features) ? solution.features.join(', ') : solution.features,
      technologies: Array.isArray(solution.technologies) ? solution.technologies.join(', ') : solution.technologies,
      imgLink: solution.imgLink,
      link: solution.link || '',
      category: solution.category,
      status: solution.status
    });
    setEditId(solution._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this solution?')) {
      try {
        const response = await fetch(`${webUrl}solutions/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          fetchSolutions(); // Refresh the list
          alert('Solution deleted successfully!');
        } else {
          alert(result.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Delete failed: ' + error.message);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSolutionForm(prev => ({
          ...prev,
          imgLink: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredSolutions = solutions.filter(solution =>
    solution.title?.toLowerCase().includes(search.toLowerCase()) ||
    solution.description?.toLowerCase().includes(search.toLowerCase()) ||
    solution.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (solutionsLoading) {
    return <div className="loading">Loading solutions...</div>;
  }

  if (solutionsError) {
    return <div className="error-message">Error: {solutionsError}</div>;
  }

  return (
    <div className="solutions-section">
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>{editId ? 'Edit Solution' : 'Add New Solution'}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Solution Title</label>
            <input
              name="title"
              placeholder="Enter solution title"
              value={solutionForm.title}
              onChange={(e) => setSolutionForm(prev => ({...prev, title: e.target.value}))}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              name="category"
              placeholder="e.g., Web Development, Mobile App, AI/ML"
              value={solutionForm.category}
              onChange={(e) => setSolutionForm(prev => ({...prev, category: e.target.value}))}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            placeholder="Enter solution description"
            value={solutionForm.description}
            onChange={(e) => setSolutionForm(prev => ({...prev, description: e.target.value}))}
            required
            rows="3"
          />
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Features (comma-separated)</label>
            <textarea
              name="features"
              placeholder="Feature 1, Feature 2, Feature 3..."
              value={solutionForm.features}
              onChange={(e) => setSolutionForm(prev => ({...prev, features: e.target.value}))}
              rows="2"
            />
          </div>
          <div className="form-group">
            <label>Technologies (comma-separated)</label>
            <textarea
              name="technologies"
              placeholder="React, Node.js, MongoDB..."
              value={solutionForm.technologies}
              onChange={(e) => setSolutionForm(prev => ({...prev, technologies: e.target.value}))}
              rows="2"
            />
          </div>
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Solution Link (optional)</label>
            <input
              name="link"
              placeholder="Enter solution URL"
              value={solutionForm.link}
              onChange={(e) => setSolutionForm(prev => ({...prev, link: e.target.value}))}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={solutionForm.status}
              onChange={(e) => setSolutionForm(prev => ({...prev, status: e.target.value}))}
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Solution Image</label>
          <div className="file-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <div className={`file-label ${selectedFile ? 'has-file' : ''}`}>
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose image file or drag & drop'}
            </div>
          </div>
          {solutionForm.imgLink && (
            <img src={solutionForm.imgLink} alt="Preview" className="image-preview" style={{maxWidth: '200px', marginTop: '10px', borderRadius: '8px'}} />
          )}
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? 'Processing...' : (editId ? 'Update Solution' : 'Add Solution')}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setSolutionForm({ 
                  title: '', 
                  description: '', 
                  features: '', 
                  technologies: '', 
                  imgLink: '', 
                  link: '', 
                  category: '', 
                  status: 'Active' 
                });
                setSelectedFile(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="data-table">
        <div className="table-header">
          <h3>Solutions ({filteredSolutions.length})</h3>
          <input
            type="text"
            placeholder="Search solutions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="solutions-grid">
          {filteredSolutions.map((solution, index) => (
            <div key={solution._id || index} className="solution-card">
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
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                }}
              />
              <div className="solution-info">
                <div className="solution-header">
                  <h4>{solution.title}</h4>
                  <span className="solution-status" style={{
                    backgroundColor: solution.status === 'Active' ? '#4caf50' : 
                                   solution.status === 'Completed' ? '#1BB8B8' : '#ffc107'
                  }}>
                    {solution.status}
                  </span>
                </div>
                <p className="solution-category">{solution.category}</p>
                <p className="solution-desc">{solution.description}</p>
                {solution.technologies && solution.technologies.length > 0 && (
                  <div className="solution-tech">
                    <strong>Tech:</strong> {solution.technologies.join(', ')}
                  </div>
                )}
                {solution.link && (
                  <a href={solution.link} target="_blank" rel="noopener noreferrer" className="solution-link">
                    View Solution
                  </a>
                )}
                <div className="solution-actions">
                  <button onClick={() => handleEdit(solution)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(solution._id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Projects Management Component
function ProjectsSection() {
  const { state, actions } = useDashboard();
  const { projects, projectsLoading, projectsError } = state;

  const [projectForm, setProjectForm] = useState({
    tittle: '',
    link: '',
    imgLink: '',
    paragraph: ''
  });
  const [editTitle, setEditTitle] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      // Add text fields (ensure they're not empty strings)
      formData.append('tittle', projectForm.tittle || '');
      formData.append('link', projectForm.link || '');
      formData.append('paragraph', projectForm.paragraph || '');
      
      console.log('Frontend Form Data:', {
        tittle: projectForm.tittle,
        link: projectForm.link,
        paragraph: projectForm.paragraph,
        hasFile: !!selectedFile,
        imgLink: projectForm.imgLink ? 'Has imgLink' : 'No imgLink'
      });
      
      // Only add imgLink if no file is selected (for URL-based images)
      if (selectedFile) {
        formData.append('image', selectedFile);
        console.log('Adding file:', selectedFile.name);
      } else if (projectForm.imgLink && !projectForm.imgLink.startsWith('data:')) {
        // Only add imgLink if it's a URL, not base64
        formData.append('imgLink', projectForm.imgLink);
        console.log('Adding imgLink:', projectForm.imgLink);
      }
      
      // Debug: Log FormData contents
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key + ':', value);
      }

      const result = editTitle 
        ? await actions.updateProject(editTitle, formData)
        : await actions.createProject(formData);

      if (result.success) {
        setProjectForm({ tittle: '', link: '', imgLink: '', paragraph: '' });
        setSelectedFile(null);
        setEditTitle(null);
      } else {
        alert(result.error || 'Operation failed');
      }
    } catch (error) {
      alert('Operation failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (project) => {
    setProjectForm({
      tittle: project.tittle,
      link: project.link || '',
      imgLink: project.imgLink,
      paragraph: project.paragraph
    });
    setEditTitle(project.tittle);
  };

  const handleDelete = async (title) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const result = await actions.deleteProject(title);
      if (!result.success) {
        alert(result.error || 'Delete failed');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProjectForm(prev => ({
          ...prev,
          imgLink: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.tittle?.toLowerCase().includes(search.toLowerCase()) ||
    project.paragraph?.toLowerCase().includes(search.toLowerCase())
  );

  if (projectsLoading) {
    return <div className="loading">Loading projects...</div>;
  }

  if (projectsError) {
    return <div className="error-message">Error: {projectsError}</div>;
  }

  return (
    <div className="projects-section">
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>{editTitle ? 'Edit Project' : 'Add New Project'}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Project Title</label>
            <input
              name="tittle"
              placeholder="Enter project title"
              value={projectForm.tittle}
              onChange={(e) => setProjectForm(prev => ({...prev, tittle: e.target.value}))}
              required
            />
          </div>
          <div className="form-group">
            <label>Project Link (optional)</label>
            <input
              name="link"
              placeholder="Enter project URL"
              value={projectForm.link}
              onChange={(e) => setProjectForm(prev => ({...prev, link: e.target.value}))}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Project Image</label>
          <div className="file-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <div className={`file-label ${selectedFile ? 'has-file' : ''}`}>
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose image file or drag & drop'}
            </div>
          </div>
          {projectForm.imgLink && (
            <img src={projectForm.imgLink} alt="Preview" className="image-preview" style={{maxWidth: '200px', marginTop: '10px', borderRadius: '8px'}} />
          )}
        </div>
        
        <div className="form-group">
          <label>Project Description</label>
          <textarea
            name="paragraph"
            placeholder="Enter project description"
            value={projectForm.paragraph}
            onChange={(e) => setProjectForm(prev => ({...prev, paragraph: e.target.value}))}
            required
            rows="4"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? 'Processing...' : (editTitle ? 'Update Project' : 'Add Project')}
          </button>
          {editTitle && (
            <button
              type="button"
              onClick={() => {
                setEditTitle(null);
                setProjectForm({ tittle: '', link: '', imgLink: '', paragraph: '' });
                setSelectedFile(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="data-table">
        <div className="table-header">
          <h3>Projects ({filteredProjects.length})</h3>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="projects-grid">
          {filteredProjects.map((project, index) => (
            <div key={index} className="project-card">
              <img 
                src={(() => {
                  if (project.imgLink?.startsWith('data:')) {
                    return project.imgLink;
                  }
                  if (project.imgLink?.startsWith('http')) {
                    return project.imgLink;
                  }
                  // For local paths, ensure proper URL construction with /uploads/
                  const cleanPath = project.imgLink?.startsWith('/uploads/') 
                    ? project.imgLink 
                    : (project.imgLink?.startsWith('/') ? `/uploads${project.imgLink}` : `/uploads/${project.imgLink}`);
                  return `${webUrl}${cleanPath}`;
                })()} 
                alt={project.tittle || "Project"} 
                onError={(e) => {
                  console.error('Admin dashboard image failed to load:', e.target.src);
                  console.error('Original imgLink:', project.imgLink);
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                }}
                onLoad={() => {
                  console.log('Admin dashboard image loaded:', project.imgLink);
                }}
              />
              <div className="project-info">
                <h4>{project.tittle}</h4>
                <p>{project.paragraph}</p>
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer">
                    View Project
                  </a>
                )}
                <div className="project-actions">
                  <button onClick={() => handleEdit(project)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(project.tittle)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Admin Users Management Component
function AdminUsersSection() {
  const { state, actions } = useDashboard();
  const { adminUsers, adminUsersLoading, adminUsersError } = state;

  const [newAdminForm, setNewAdminForm] = useState({ email: '', password: '' });
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await actions.createAdminUser(newAdminForm);
    
    if (result.success) {
      setNewAdminForm({ email: '', password: '' });
      alert('Admin user created successfully!');
    } else {
      alert(result.error || 'Failed to create admin user');
    }
    
    setIsSubmitting(false);
  };

  const filteredAdmins = adminUsers.filter(admin =>
    admin.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (adminUsersLoading) {
    return <div className="loading">Loading admin users...</div>;
  }

  if (adminUsersError) {
    return <div className="error-message">Error: {adminUsersError}</div>;
  }

  return (
    <div className="admins-section">
      <h2>Admin User Management</h2>
      
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>Add New Admin</h3>
        <div className="form-row">
          <input
            type="email"
            placeholder="Email"
            value={newAdminForm.email}
            onChange={(e) => setNewAdminForm(prev => ({...prev, email: e.target.value}))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newAdminForm.password}
            onChange={(e) => setNewAdminForm(prev => ({...prev, password: e.target.value}))}
            required
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Admin'}
        </button>
      </form>

      <div className="admins-list">
        <input
          type="text"
          placeholder="Search admins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map((admin, index) => (
              <tr key={index}>
                <td>{admin.email}</td>
                <td>
                  <button className="danger-btn">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Contact Forms Component
function ContactFormsSection() {
  const { state } = useDashboard();
  const { contactForms, contactFormsLoading, contactFormsError } = state;

  const [search, setSearch] = useState('');

  const filteredContacts = contactForms.filter(contact =>
    contact.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    contact.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    contact.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (contactFormsLoading) {
    return <div className="loading">Loading contact forms...</div>;
  }

  if (contactFormsError) {
    return <div className="error-message">Error: {contactFormsError}</div>;
  }

  return (
    <div className="contacts-section">
      <h2>Contact Form Submissions</h2>
      
      <input
        type="text"
        placeholder="Search contacts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      
      <div className="contacts-grid">
        {filteredContacts.map((contact, index) => (
          <div key={index} className="contact-card">
            <h4>{contact.firstName} {contact.lastName}</h4>
            <p><strong>Email:</strong> {contact.email}</p>
            <p><strong>Phone:</strong> {contact.phone}</p>
            <p><strong>Message:</strong> {contact.message}</p>
            <p><strong>Date:</strong> {new Date(contact.date).toLocaleDateString()}</p>
            <div className="contact-actions">
              <button className="reply-btn">Reply</button>
              <button className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// File Management Component
function FileManagementSection() {
  const [uploadedFiles] = useState([]);

  const handleFileUpload = (e) => {
    // Implementation for file upload
    console.log('File upload:', e.target.files);
  };

  return (
    <div className="files-section">
      <h2>File Management</h2>
      <div className="upload-section">
        <input type="file" multiple onChange={handleFileUpload} />
        <button>Upload Files</button>
      </div>
      <div className="files-grid">
        {uploadedFiles.map((file, index) => (
          <div key={index} className="file-card">
            <img src={file.url} alt={file.name} />
            <p>{file.name}</p>
            <button className="delete-btn">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Site Config Section
// ────────────────────────────────────────────────────────────────
function SiteConfigSection() {
  const { state, actions } = useDashboard();
  const cfg = state.siteConfig || {};
  const [activeConfigTab, setActiveConfigTab] = useState('contact');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [form, setForm] = useState({
    email: '',
    phone: '',
    location: '',
    name: '',
    tagline: '',
    bio: '',
    cvLink: '',
    github: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    youtube: '',
    facebook: ''
  });

  // Populate form when config loads
  useEffect(() => {
    if (cfg && cfg.email !== undefined) {
      setForm({
        email: cfg.email || '',
        phone: cfg.phone || '',
        location: cfg.location || '',
        name: cfg.name || '',
        tagline: cfg.tagline || '',
        bio: cfg.bio || '',
        cvLink: cfg.cvLink || '',
        github: (cfg.socialLinks && cfg.socialLinks.github) || '',
        linkedin: (cfg.socialLinks && cfg.socialLinks.linkedin) || '',
        twitter: (cfg.socialLinks && cfg.socialLinks.twitter) || '',
        instagram: (cfg.socialLinks && cfg.socialLinks.instagram) || '',
        youtube: (cfg.socialLinks && cfg.socialLinks.youtube) || '',
        facebook: (cfg.socialLinks && cfg.socialLinks.facebook) || ''
      });
    }
  }, [state.siteConfig]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    const payload = {
      email: form.email,
      phone: form.phone,
      location: form.location,
      name: form.name,
      tagline: form.tagline,
      bio: form.bio,
      cvLink: form.cvLink,
      socialLinks: {
        github: form.github,
        linkedin: form.linkedin,
        twitter: form.twitter,
        instagram: form.instagram,
        youtube: form.youtube,
        facebook: form.facebook
      }
    };
    const result = await actions.updateSiteConfig(payload);
    setSaving(false);
    setSaveMsg(result.success ? '✅ Saved successfully!' : `❌ ${result.error}`);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(39,205,205,0.3)', borderRadius: '8px',
    color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  };
  const labelStyle = { display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const groupStyle = { marginBottom: '18px' };
  const configTabs = ['contact', 'personal', 'cv', 'socials'];

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>⚙️ Site Configuration</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '4px 0 0' }}>
          Update your public contact details, bio, CV link and social media URLs.
        </p>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {configTabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveConfigTab(t)}
            style={{
              padding: '8px 18px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
              border: activeConfigTab === t ? 'none' : '1px solid rgba(39,205,205,0.3)',
              background: activeConfigTab === t ? 'linear-gradient(135deg,#27CDCD,#667eea)' : 'transparent',
              color: activeConfigTab === t ? '#000' : 'rgba(255,255,255,0.7)',
              fontWeight: activeConfigTab === t ? '700' : '400'
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px', border: '1px solid rgba(39,205,205,0.15)' }}>
        {activeConfigTab === 'contact' && (
          <>
            <div style={groupStyle}>
              <label style={labelStyle}>Email Address</label>
              <input name="email" style={inputStyle} value={form.email} onChange={handleChange} placeholder="your@email.com" />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Phone Number</label>
              <input name="phone" style={inputStyle} value={form.phone} onChange={handleChange} placeholder="+977 98XXXXXXXX" />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Location</label>
              <input name="location" style={inputStyle} value={form.location} onChange={handleChange} placeholder="Nepal" />
            </div>
          </>
        )}

        {activeConfigTab === 'personal' && (
          <>
            <div style={groupStyle}>
              <label style={labelStyle}>Full Name</label>
              <input name="name" style={inputStyle} value={form.name} onChange={handleChange} placeholder="Your Name" />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Tagline / Title</label>
              <input name="tagline" style={inputStyle} value={form.tagline} onChange={handleChange} placeholder="Full Stack Developer..." />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Bio / Description</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                placeholder="A short description about yourself..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </>
        )}

        {activeConfigTab === 'cv' && (
          <>
            <div style={groupStyle}>
              <label style={labelStyle}>CV / Resume PDF Link</label>
              <input name="cvLink" style={inputStyle} value={form.cvLink} onChange={handleChange} placeholder="https://drive.google.com/your-cv.pdf" />
            </div>
            {form.cvLink && (
              <a href={form.cvLink} target="_blank" rel="noopener noreferrer" style={{ color: '#27CDCD', fontSize: '13px' }}>
                🔗 Preview CV Link
              </a>
            )}
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '12px' }}>
              Tip: Upload your CV to Google Drive and paste the shareable link here.
            </p>
          </>
        )}

        {activeConfigTab === 'socials' && (
          <>
            {[['github','GitHub'],['linkedin','LinkedIn'],['twitter','Twitter / X'],['instagram','Instagram'],['youtube','YouTube'],['facebook','Facebook']].map(([key, label]) => (
              <div key={key} style={groupStyle}>
                <label style={labelStyle}>{label} URL</label>
                <input name={key} style={inputStyle} value={form[key]} onChange={handleChange} placeholder={`https://${key}.com/your-profile`} />
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 28px', background: 'linear-gradient(135deg,#27CDCD,#667eea)',
            border: 'none', borderRadius: '8px', color: '#000', fontWeight: '700',
            fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {saveMsg && <span style={{ fontSize: '14px', color: saveMsg.startsWith('✅') ? '#27CDCD' : '#ff6b6b' }}>{saveMsg}</span>}
      </div>
    </div>
  );
}

// Main Dashboard Component
function DashboardContent() {
  const { state, actions } = useDashboard();

  const renderActiveSection = () => {
    switch (state.activeTab) {
      case 'overview':
        return <OverviewSection />;
      case 'projects':
        return <ProjectsSection />;
      case 'solutions':
        return <SolutionsSection />;
      case 'admins':
        return <AdminUsersSection />;
      case 'contacts':
        return <ContactFormsSection />;
      case 'files':
        return <FileManagementSection />;
      case 'config':
        return <SiteConfigSection />;
      default:
        return <OverviewSection />;
    }
  };

  if (!state.isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="admin-container">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>Admin <span>Dashboard</span></h1>
        </div>
        <div className="dashboard-actions">
          <span>Welcome, Admin</span>
          <button onClick={actions.logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <ul className="nav-tabs">
          {['overview', 'projects', 'solutions', 'admins', 'contacts', 'files', 'config'].map(tab => (
            <li
              key={tab}
              className={state.activeTab === tab ? 'nav-tab active' : 'nav-tab'}
              onClick={() => actions.setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </li>
          ))}
        </ul>
      </nav>

      <main className="dashboard-content">
        {renderActiveSection()}
      </main>
    </div>
  );
}

// Main Export Component with Provider
function AdminDashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

export default AdminDashboard;
