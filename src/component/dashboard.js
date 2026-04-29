import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/+$/, "");

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({
    oldTittle: '',
    tittle: '',
    link: '',
    paragraph: '',
    img: null
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/getPortfolio`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleInputChange = (e) => {
    if (e.target.name === 'img') {
      setFormData({ ...formData, img: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Append all form fields
    data.append('tittle', formData.tittle);
    data.append('link', formData.link);
    data.append('paragraph', formData.paragraph);
    
    // For updates, send the old title so backend can find the post to update
    if (isEditing && formData.oldTittle) {
      data.append('oldTittle', formData.oldTittle);
    }
    
    if (formData.img) {
      data.append('img', formData.img);
    }

    try {
      let url = `${API_URL}/addPost`;
      let method = 'POST';
      
      if (isEditing) {
        url = `${API_URL}/updatePost`;
      }

      const response = await fetch(url, {
        method: method,
        body: data,
        credentials: 'include',  // Include cookies for authentication
      });

      const result = await response.json();
      
      if (result.isPostAdded || result.isUpdated) {
        fetchPosts();
        setFormData({ oldTittle: '', tittle: '', link: '', paragraph: '', img: null });
        setIsEditing(false);
        alert(isEditing ? "Post updated successfully!" : "Post added successfully!");
      } else {
        alert(result.message || "Failed to save post");
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      alert("Error submitting post. Please try again.");
    }
  };

  const handleEdit = (post) => {
    setFormData({
      oldTittle: post.tittle,
      tittle: post.tittle,
      link: post.link,
      paragraph: post.paragraph,
      img: null
    });
    setIsEditing(true);
  };

  const handleDelete = async (tittle) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/deletePost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tittle }),
        credentials: 'include',  // Include cookies for authentication
      });

      const result = await response.json();
      if (result.isPostDeleted) {
        fetchPosts();
        alert('Post deleted successfully!');
      } else {
        alert(result.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert("Error deleting post. Please try again.");
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Manage Portfolio Posts</h1>
      
      <form onSubmit={handleSubmit} className="post-form">
        <h2>{isEditing ? 'Edit Post' : 'Add New Post'}</h2>
        
        {isEditing && (
          <input
            type="text"
            name="oldTittle"
            value={formData.oldTittle}
            hidden
            readOnly
          />
        )}

        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            name="tittle"
            value={formData.tittle}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Link:</label>
          <input
            type="url"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Image:</label>
          <input
            type="file"
            name="img"
            onChange={handleInputChange}
            accept="image/*"
            { ...!isEditing && { required: true } }
          />
          {isEditing && formData.imgLink && (
            <div className="current-image">
              <p>Current Image:</p>
              <img src={formData.imgLink} alt="Current" style={{ maxWidth: '200px' }} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Paragraph:</label>
          <textarea
            name="paragraph"
            value={formData.paragraph}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          {isEditing ? 'Update Post' : 'Add Post'}
        </button>
        {isEditing && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setIsEditing(false);
              setFormData({ oldTittle: '', tittle: '', link: '', paragraph: '', img: null });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="posts-list">
        <h2>Existing Posts</h2>
        {posts.map((post) => (
          <div key={post._id} className="post-item">
            <h3>{post.tittle}</h3>
            {post.imgLink && (
              <img src={post.imgLink} alt={post.tittle} className="post-image" />
            )}
            <p>{post.paragraph}</p>
            <div className="post-actions">
              <button className="edit-btn" onClick={() => handleEdit(post)}>
                Edit
              </button>
              <button className="delete-btn" onClick={() => handleDelete(post.tittle)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;