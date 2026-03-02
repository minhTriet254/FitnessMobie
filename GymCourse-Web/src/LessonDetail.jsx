import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./LessonDetail.css";

function LessonDetail() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5086/api/LessonController/${id}`)
      .then(res => res.json())
      .then(data => {
        setLesson(data);
        if (data.videos?.length > 0) {
          setSelectedVideo(data.videos[0]);
        }
      });
  }, [id]);

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";

    if (url.includes("watch?v=")) {
      const videoId = url.split("watch?v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    if (url.includes("shorts/")) {
      const videoId = url.split("shorts/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    if (!videoId) return url;

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}`;
  };

  if (!lesson) return <h2>Loading...</h2>;

  return (
    <div className="lesson-layout">
      <div className="lesson-sidebar">
        <button onClick={() => navigate(-1)}>← Back</button>

        <h2>{lesson.title}</h2>

        <h3>Videos</h3>

        {lesson.videos?.map(video => (
          <div
            key={video.id}
            className={`video-item ${
              selectedVideo?.id === video.id ? "active" : ""
            }`}
            onClick={() => setSelectedVideo(video)}
          >
            ▶ {video.description}
          </div>
        ))}
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
              allowFullScreen
            />
          </>
        ) : (
          <h3>Select a video</h3>
        )}
      </div>
    </div>
  );
}

export default LessonDetail;