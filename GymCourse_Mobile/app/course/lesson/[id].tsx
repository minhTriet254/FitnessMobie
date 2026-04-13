import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import api from "@/services/api";
import Colors from "@/constants/Colors";

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLesson();
  }, []);

  const fetchLesson = async () => {
    try {
      const res = await api.get(`/api/LessonController/${id}`);
      setLesson(res.data);
    } catch (error) {
      console.log("Error fetching lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy bài học</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.description}>{lesson.content}</Text>

      <Text style={styles.section}>Video hướng dẫn</Text>

      {lesson.videos?.map((video: any) => (
        <TouchableOpacity key={video.id} style={styles.videoCard} onPress={() => router.push(`/course/lesson/video/${video.id}`)}>
          <Text style={styles.videoDescription}>{video.description}</Text>
          <Text style={styles.rating}>⭐ {video.rating}/5</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 20, backgroundColor: Colors.lightGray },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: Colors.primary },
  description: { color: Colors.gray, marginBottom: 20 },
  section: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  videoCard: {
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: 15,
  },
  videoDescription: { fontSize: 16, marginBottom: 8 },
  videoLink: { color: "blue", fontSize: 16, marginBottom: 5 },
  rating: { fontSize: 14, color: Colors.gray },
});