import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Dimensions,
} from "react-native";
import Colors from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import { Course } from "../../types";

const { width } = Dimensions.get("window");

// Khai báo các file ảnh tĩnh từ assets
const IMAGES = {
  cacbaitap: require("../../assets/images/Course/Cacbaitap.png"),
  dinhduong: require("../../assets/images/Course/Dinhduong.png"),
  nguyenlieu: require("../../assets/images/Course/Nguyenlieu.png"),
  thucpham: require("../../assets/images/Course/thucphamboxung.png"),
  default: require("../../assets/images/Course/Cacbaitap.png"),
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/api/CourseController/courses");
      let coursesData = [];
      if (Array.isArray(response.data)) {
        coursesData = response.data;
      } else if (response.data && typeof response.data === "object") {
        coursesData = Object.values(response.data);
      }
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  // Hàm xử lý chọn ảnh thông minh dựa trên từ khóa trong tên khóa học
  const getCourseImage = (courseName: string) => {
    const name = courseName.toLowerCase();
    if (name.includes("bài tập")) return IMAGES.cacbaitap;
    if (name.includes("dinh dưỡng")) return IMAGES.dinhduong;
    if (name.includes("nguyên liệu")) return IMAGES.nguyenlieu;
    if (name.includes("thực phẩm")) return IMAGES.thucpham;
    return IMAGES.default;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Chào mừng,</Text>
          <Text style={styles.userName}>{user?.userName || "Học viên"}</Text>
        </View>
        {user?.isPremium && <Text style={styles.premiumBadge}>👑 Premium</Text>}
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Khóa học của bạn</Text>
        
        {courses.map((course) => (
          <TouchableOpacity
            key={course.id}
            activeOpacity={0.9}
            style={styles.courseCard}
            onPress={() => router.push(`/course/${course.id}`)}
          >
            <ImageBackground
              source={getCourseImage(course.name)}
              style={styles.cardImage}
              imageStyle={{ borderRadius: 15 }}
            >
              <View style={styles.overlay}>
                <View style={styles.cardHeader}>
                  <Text style={styles.courseName} numberOfLines={1}>{course.name}</Text>
                  <View style={styles.lessonBadge}>
                    <Text style={styles.lessonText}>📚 {course.lessonsCount} bài</Text>
                  </View>
                </View>



                <View style={styles.cardFooter}>
                  {course.canAccess ? (
                    <View style={styles.accessButton}>
                      <Text style={styles.accessButtonText}>Bắt đầu ngay</Text>
                    </View>
                  ) : (
                    <View style={styles.lockedContainer}>
                      <Text style={styles.accessMessage}>🔒 {course.accessMessage || "Chưa có quyền"}</Text>
                    </View>
                  )}
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcomeText: { color: "rgba(255,255,255,0.8)", fontSize: 16 },
  userName: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  premiumBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 12,
  },
  content: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#333" },
  courseCard: {
    marginBottom: 20,
    height: 145,
    borderRadius: 15,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardImage: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 15,
    borderRadius: 15,
    justifyContent: 'space-between',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courseName: { fontSize: 20, fontWeight: "bold", color: "#FFF", flex: 1, marginRight: 5 },
  lessonBadge: { backgroundColor: "#FFF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  lessonText: { fontSize: 11, fontWeight: "bold", color: Colors.primary },
  courseDescription: { fontSize: 14, color: "#DDD", marginTop: 5 },
  cardFooter: { marginTop: 'auto' },
  accessButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  accessButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  lockedContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 10,
  },
  accessMessage: { fontSize: 13, color: "#FFCDD2", textAlign: "center", fontWeight: "600" },
});