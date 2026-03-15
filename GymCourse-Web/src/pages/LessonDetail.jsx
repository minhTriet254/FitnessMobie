import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./LessonDetail.css";

function LessonDetail() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    fetch(`http://localhost:5086/api/LessonController/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        return res.json();
      })
      .then(data => {
        setLesson(data);
        if (data.videos?.length > 0) {
          setSelectedVideo(data.videos[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load lesson");
        setLoading(false);
      });
  }, [id, navigate]);

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";

    // Handle different YouTube URL formats
    if (url.includes("watch?v=")) {
      const videoId = url.split("watch?v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }

    if (url.includes("shorts/")) {
      const videoId = url.split("shorts/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }

    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }

    if (url.includes("embed/")) {
      return url + "?autoplay=1&rel=0";
    }

    return url;
  };

  if (loading) return <div className="loading">Loading lesson...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!lesson) return <div className="error">Lesson not found</div>;

  return (
    <div className="lesson-layout">
      <div className="lesson-sidebar">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h2>{lesson.title}</h2>

        <h3>Videos</h3>

        {lesson.videos?.length > 0 ? (
          lesson.videos.map(video => (
            <div
              key={video.id}
              className={`video-item ${
                selectedVideo?.id === video.id ? "active" : ""
              }`}
              onClick={() => setSelectedVideo(video)}
            >
              ▶ {video.description}
            </div>
          ))
        ) : (
          <p>No videos available for this lesson</p>
        )}
      </div>

      <div className="video-content">
        {selectedVideo ? (
          <>
            <h2>{selectedVideo.description}</h2>
            <iframe
              width="100%"
              height="500"
              src={getYoutubeEmbedUrl(selectedVideo.url)}
              title="YouTube player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </>
        ) : (
          <h3>Select a video to start learning</h3>
        )}
      </div>
    </div>
  );
}

export default LessonDetail;