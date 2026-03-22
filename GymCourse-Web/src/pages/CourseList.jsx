import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { premiumService } from "../services/premiumService";
import PremiumModal from "../components/PremiumModal";
import "./CourseList.css";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [premiumStatus, setPremiumStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }

    loadCourses();
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const status = await premiumService.checkStatus();
      setPremiumStatus(status);
    } catch (err) {
      console.error("Error checking premium:", err);
    }
  };

  const loadCourses = () => {
    const token = localStorage.getItem("token");
    
    fetch("http://localhost:5086/api/CourseController/courses", {
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
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load courses");
        setLoading(false);
      });
  };

  const handleCourseClick = (course) => {
    // Admin luôn được vào
    if (userRole === "Admin") {
      navigate(`/course/${course.id}`);
      return;
    }

    // Kiểm tra nếu là premium course
    if (course.price > 0) {
      // Nếu đã là premium thì cho vào
      if (premiumStatus?.isPremium) {
        navigate(`/course/${course.id}`);
      } else {
        // Chưa premium thì hiện modal
        setSelectedCourse(course);
        setShowPremiumModal(true);
      }
    } else {
      // Course free thì cho vào
      navigate(`/course/${course.id}`);
    }
  };

  const handlePremiumSuccess = () => {
    setShowPremiumModal(false);
    // Cập nhật lại premium status
    checkPremiumStatus();
    // Nếu có course được chọn, tự động vào course đó
    if (selectedCourse) {
      navigate(`/course/${selectedCourse.id}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) return <div className="loading">Loading courses...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <div className="courses-container">
        <div className="courses-header">
          <h1>Khóa học</h1>
          
          {/* Hiển thị trạng thái premium của user */}
          {userRole !== "Admin" && premiumStatus && (
            <div className="user-premium-status">
              {premiumStatus.isPremium ? (
                <span className="premium-badge">
                  ⭐ Premium • Còn {premiumStatus.daysRemaining} ngày
                </span>
              ) : (
                <span className="free-badge">
                  🔹 Tài khoản thường
                </span>
              )}
            </div>
          )}
        </div>

        {courses.length === 0 ? (
          <p className="no-courses">Chưa có khóa học nào</p>
        ) : (
          <div className="courses-grid">
            {courses.map(course => {
              const isPremiumCourse = course.price > 0;
              const canAccess = userRole === "Admin" || 
                               !isPremiumCourse || 
                               (isPremiumCourse && premiumStatus?.isPremium);
              
              return (
                <div
                  key={course.id}
                  className={`course-card ${isPremiumCourse ? 'premium' : 'free'} ${!canAccess ? 'locked' : ''}`}
                  onClick={() => handleCourseClick(course)}
                >
                  {/* Badge cho loại khóa học */}
                  <div className="course-badge">
                    {isPremiumCourse ? (
                      <span className="badge premium">🔒 Premium</span>
                    ) : (
                      <span className="badge free">🎁 Miễn phí</span>
                    )}
                  </div>

                  <h3 className="course-title">{course.name}</h3>
                  <p className="course-description">{course.description}</p>
                  
                  
                  {/* Hiển thị trạng thái khóa */}
                  {!canAccess && (
                    <div className="course-lock-overlay">
                      <span className="lock-icon">🔒</span>
                      <span className="lock-text">Premium</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => {
          setShowPremiumModal(false);
          setSelectedCourse(null);
        }}
        onSuccess={handlePremiumSuccess}
      />
    </>
  );
}

export default CourseList;