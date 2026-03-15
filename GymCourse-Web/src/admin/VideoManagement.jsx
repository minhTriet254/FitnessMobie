import { useState, useEffect } from "react";
import "./AdminDashboard.css";

function VideoManagement({ lesson, onBack, token }) {
  const [videos, setVideos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({ 
    description: "", 
    url: "",
    image: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (lesson) {
      fetchVideos();
    }
  }, [lesson]);

  // Fetch videos for this lesson
  const fetchVideos = async () => {
    try {
      const response = await fetch(`http://localhost:5086/api/LessonController/${lesson.id}`, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Failed to load videos");
    }
  };

  // Extract YouTube video ID from URL (supports both regular videos and shorts)
  const getYoutubeVideoId = (url) => {
    // Match YouTube shorts
    const shortsRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/;
    let match = url.match(shortsRegex);
    if (match && match[1]) {
      return match[1];
    }
    
    // Match youtu.be shorts
    const youtubeShortRegex = /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/;
    match = url.match(youtubeShortRegex);
    if (match && match[1]) {
      return match[1];
    }
    
    // Match regular YouTube videos
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    match = url.match(regExp);
    if (match && match[2]) {
      return match[2];
    }
    
    return null;
  };

  // Create new video
  const createVideo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5086/api/VideoController?LessonId=${lesson.id}`, {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: formData.url,
          description: formData.description,
          image: formData.image || "",
          rating: 5
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to create video");
      }

      await fetchVideos();
      setShowForm(false);
      setFormData({ description: "", url: "", image: "" });
      setError("");
      
    } catch (error) {
      console.error("Error creating video:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update video
  const updateVideo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5086/api/VideoController?id=${editingVideo.id}`, {
        method: "PUT",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: formData.url,
          description: formData.description,
          image: formData.image || "",
          rating: editingVideo.rating || 5
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to update video");
      }

      await fetchVideos();
      setShowForm(false);
      setEditingVideo(null);
      setFormData({ description: "", url: "", image: "" });
      setError("");
      
    } catch (error) {
      console.error("Error updating video:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete video
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      const response = await fetch(`http://localhost:5086/api/VideoController?id=${videoId}`, {
        method: "DELETE",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      await fetchVideos();
      
    } catch (error) {
      console.error("Error deleting video:", error);
      setError("Failed to delete video");
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      setError("Video description is required");
      return;
    }

    if (!formData.url.trim()) {
      setError("Video URL is required");
      return;
    }

    const videoId = getYoutubeVideoId(formData.url);
    if (!videoId) {
      setError("Invalid YouTube URL");
      return;
    }

    setLoading(true);
    setError("");

    if (editingVideo) {
      await updateVideo();
    } else {
      await createVideo();
    }

    setLoading(false);
  };

  // Handle edit button click
  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({ 
      description: video.description, 
      url: video.url,
      image: video.image || ""
    });
    setShowForm(true);
    setError("");
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingVideo(null);
    setFormData({ description: "", url: "", image: "" });
    setError("");
  };

  // Get embed URL for YouTube
  const getEmbedUrl = (url) => {
    const videoId = getYoutubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <div className="video-management">
      <div className="section-header">
        <h3>
          <button onClick={onBack} className="back-button-small">
            ← Back to Lessons
          </button>
          <span>Videos for: {lesson.title}</span>
        </h3>
        <button 
          onClick={() => { 
            setShowForm(true); 
            setEditingVideo(null); 
            setFormData({ description: "", url: "", image: "" }); 
            setError("");
          }} 
          className="btn-primary"
        >
          + Add New Video
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <h3>{editingVideo ? "Edit Video" : "Add New Video"}</h3>
          
          <div className="form-group">
            <label htmlFor="description">Video Description <span className="required">*</span></label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter video description"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="url">YouTube URL <span className="required">*</span></label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            <small className="form-text">
              Supports: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="image">Thumbnail Image URL (Optional)</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <small className="form-text">
              Image URL for video thumbnail
            </small>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? "Saving..." : (editingVideo ? "Update Video" : "Add Video")}
            </button>
            <button 
              type="button" 
              onClick={handleCancel} 
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="videos-list">
        <h4>All Videos ({videos.length})</h4>
        
        {videos.length === 0 ? (
          <p className="no-data">No videos found. Click "Add New Video" to create one.</p>
        ) : (
          <div className="video-grid">
            {videos.map(video => (
              <div key={video.id} className="video-card">
                <div className="video-preview">
                  <iframe
                    src={getEmbedUrl(video.url)}
                    title={video.description}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                
                <div className="video-info">
                  <h5>{video.description}</h5>
                  <p className="video-url">
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                    </a>
                  </p>
                </div>
                
                <div className="video-actions">
                  <button 
                    onClick={() => handleEdit(video)} 
                    className="btn-edit btn-small"
                    title="Edit video"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteVideo(video.id)} 
                    className="btn-delete btn-small"
                    title="Delete video"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoManagement;