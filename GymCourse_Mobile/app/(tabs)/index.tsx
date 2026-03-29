import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { Course } from '../../types';
import Colors from '../../constants/Colors';
import { router } from 'expo-router';
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
      const response = await api.get('/api/CourseController/courses');
      let coursesData = [];
      if (Array.isArray(response.data)) {
        coursesData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        coursesData = Object.values(response.data);
      }
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Chào mừng,</Text>
        <Text style={styles.userName}>{user?.userName}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Khóa học</Text>
        {courses.map((course) => (
          <TouchableOpacity key={course.id} style={styles.courseCard} >
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseDescription}>{course.description}</Text>
            <View style={styles.courseDetails}>
              <Text>📚 {course.lessonsCount} bài học</Text>
              <Text>💰 {course.price?.toLocaleString()}đ</Text>
            </View>
            {course.canAccess ? (
              <TouchableOpacity style={styles.accessButton}>
                <Text style={styles.accessButtonText}>Bắt đầu học</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.accessMessage}>{course.accessMessage}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightGray },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    backgroundColor: Colors.primary, 
    padding: 20, 
    paddingTop: 20,
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20 
  },
  welcomeText: { color: Colors.white, fontSize: 16 },
  userName: { color: Colors.white, fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  courseCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 15, marginBottom: 15 },
  courseName: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  courseDescription: { fontSize: 14, color: Colors.gray, marginVertical: 10 },
  courseDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  accessButton: { backgroundColor: Colors.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  accessButtonText: { color: Colors.white, fontWeight: 'bold' },
  accessMessage: { fontSize: 12, color: Colors.danger, textAlign: 'center' },
});