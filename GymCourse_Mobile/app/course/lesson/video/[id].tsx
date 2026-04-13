import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import api from "@/services/api";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";

interface Review {
  id: number;
  videoId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user, isAdmin } = useAuth();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const commentInputRef = useRef<TextInput>(null);

  useEffect(() => {
    fetchVideo();
    fetchReviews();
  }, []);

  const fetchVideo = async () => {
    try {
      const res = await api.get(`/api/VideoController/${id}`);
      setVideo(res.data);
      setFeedbackText(res.data.feedback || "");
    } catch (err) {
      console.log("Error fetching video:", err);
      Alert.alert("Lỗi", "Không thể tải video");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/api/VideoReview/video/${id}`);
      setReviews(res.data.reviews);
      setAverageRating(res.data.averageRating);
      setReviewCount(res.data.reviewCount);
      
      if (user) {
        const userReview = res.data.reviews.find(
          (r: Review) => r.userName === user.userName
        );
        if (userReview) {
          setUserRating(userReview.rating);
          setUserComment(userReview.comment || "");
          setEditingReview(userReview);
        }
      }
    } catch (err) {
      console.log("Error fetching reviews:", err);
    }
  };

  const submitReview = async () => {
    if (userRating === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn số sao đánh giá");
      return;
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        await api.put(`/api/VideoReview/${editingReview.id}`, {
          rating: userRating,
          comment: userComment,
        });
        Alert.alert("Thành công", "Đã cập nhật đánh giá");
      } else {
        await api.post("/api/VideoReview", {
          videoId: Number(id),
          rating: userRating,
          comment: userComment,
        });
        Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá");
      }
      
      setShowReviewModal(false);
      fetchReviews();
      setUserComment("");
      setEditingReview(null);
      Keyboard.dismiss();
    } catch (err: any) {
      console.log("Error submitting review:", err);
      if (err.response?.status === 401) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để đánh giá");
      } else if (err.response?.data === "Bạn đã đánh giá video này rồi") {
        Alert.alert("Lỗi", "Bạn đã đánh giá video này rồi");
      } else {
        Alert.alert("Lỗi", "Không thể gửi đánh giá");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId: number) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa đánh giá này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/VideoReview/${reviewId}`);
              Alert.alert("Thành công", "Đã xóa đánh giá");
              fetchReviews();
              if (editingReview?.id === reviewId) {
                setUserRating(0);
                setUserComment("");
                setEditingReview(null);
              }
            } catch (err) {
              Alert.alert("Lỗi", "Không thể xóa đánh giá");
            }
          },
        },
      ]
    );
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập feedback");
      return;
    }

    setSubmittingFeedback(true);
    try {
      await api.post(`/api/VideoController/${id}/feedback`, {
        feedback: feedbackText,
      });
      setVideo({ ...video, feedback: feedbackText });
      Alert.alert("Thành công", "Đã cập nhật feedback");
      setShowFeedbackModal(false);
      Keyboard.dismiss();
    } catch (err) {
      console.log("Error submitting feedback:", err);
      Alert.alert("Lỗi", "Không thể cập nhật feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false, onPress?: (rating: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => interactive && onPress && onPress(i)}
          disabled={!interactive}
          style={interactive ? styles.starButton : undefined}
        >
          <Text
            style={[
              styles.star,
              { fontSize: size },
              i <= rating ? styles.starFilled : styles.starEmpty,
            ]}
          >
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderReviewItem = ({ item }: { item: Review }) => {
    const isOwner = user?.userName === item.userName;
    const isAdminUser = isAdmin;
    
    return (
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewUserName}>{item.userName}</Text>
          {renderStars(item.rating, 14)}
          <Text style={styles.reviewDate}>
            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
          </Text>
        </View>
        {item.comment ? (
          <Text style={styles.reviewComment}>{item.comment}</Text>
        ) : null}
        {(isOwner || isAdminUser) && (
          <View style={styles.reviewActions}>
            {isOwner && (
              <TouchableOpacity
                onPress={() => {
                  setUserRating(item.rating);
                  setUserComment(item.comment || "");
                  setEditingReview(item);
                  setShowReviewModal(true);
                }}
              >
                <Text style={styles.reviewActionText}>Sửa</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => deleteReview(item.id)}>
              <Text style={[styles.reviewActionText, styles.deleteText]}>
                Xóa
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const getVideoId = (url: string) => {
    if (!url) return "";
    if (url.includes("shorts/")) {
      return url.split("shorts/")[1].split("?")[0];
    }
    if (url.includes("watch?v=")) {
      return url.split("watch?v=")[1].split("&")[0];
    }
    if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1].split("?")[0];
    }
    if (url.includes("embed/")) {
      return url.split("embed/")[1].split("?")[0];
    }
    return url;
  };

  const getYouTubeHtml = (videoId: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
          <style>
            body { margin: 0; padding: 0; background: #000; }
            #player { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <div id="player"></div>
          <script>
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            var player;
            function onYouTubeIframeAPIReady() {
              player = new YT.Player('player', {
                videoId: '${videoId}',
                playerVars: {
                  'autoplay': 1,
                  'loop': 1,
                  'playlist': '${videoId}',
                  'controls': 1,
                  'rel': 0,
                  'modestbranding': 1
                },
                events: {
                  'onReady': onPlayerReady,
                  'onStateChange': onPlayerStateChange
                }
              });
            }
            
            function onPlayerReady(event) {
              event.target.playVideo();
            }
            
            function onPlayerStateChange(event) {
              if (event.data === YT.PlayerState.ENDED) {
                player.playVideo();
              }
            }
          </script>
        </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy video</Text>
      </View>
    );
  }

  const videoId = getVideoId(video.url);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView 
        style={styles.container}
        keyboardShouldPersistTaps="handled"
      >


        <View style={styles.videoContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: getYouTubeHtml(videoId) }}
            style={styles.webview}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
          />
        </View>

        {/* Phần feedback từ giảng viên */}
        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackHeader}>
            <Text style={styles.feedbackLabel}>Hướng dẫn từ huấn luyện viên:</Text>
            {isAdmin && (
              <TouchableOpacity
                onPress={() => setShowFeedbackModal(true)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>
                  {video.feedback ? "Sửa" : "Thêm"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {video.feedback ? (
            <Text style={styles.feedbackText}>{video.feedback}</Text>
          ) : (
            <Text style={styles.noFeedbackText}>
              {isAdmin
                ? "Chưa có phản hồi. Nhấn 'Thêm' để tạo phản hồi."
                : "Chưa có phản hồi từ giảng viên."}
            </Text>
          )}
        </View>

        {/* Phần hiển thị đánh giá tổng quan */}
        <View style={styles.ratingSummary}>
          <View style={styles.averageRating}>
            <Text style={styles.averageRatingText}>
              {averageRating > 0 ? averageRating.toFixed(1) : "0"}
            </Text>
            {renderStars(Math.round(averageRating), 20)}
            <Text style={styles.reviewCountText}>
              ({reviewCount} đánh giá)
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => {
              if (editingReview) {
                setUserRating(editingReview.rating);
                setUserComment(editingReview.comment || "");
              } else {
                setUserRating(0);
                setUserComment("");
              }
              setShowReviewModal(true);
            }}
          >
            <Text style={styles.reviewButtonText}>
              {editingReview ? "Sửa đánh giá của bạn" : "Viết đánh giá"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Phần danh sách đánh giá từ users */}
        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsTitle}>
            💬 Đánh giá từ học viên ({reviewCount})
          </Text>
          {reviews.length === 0 ? (
            <Text style={styles.noReviewsText}>
              Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
            </Text>
          ) : (
            <FlatList
              data={reviews}
              renderItem={renderReviewItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Modal viết/sửa đánh giá - ĐÃ FIX */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowReviewModal(false);
          Keyboard.dismiss();
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <ScrollView 
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.modalTitle}>
                    {editingReview ? "Sửa đánh giá" : "Viết đánh giá"}
                  </Text>
                  
                  <Text style={styles.modalLabel}>Đánh giá sao:</Text>
                  <View style={styles.modalStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setUserRating(star)}
                      >
                        <Text
                          style={[
                            styles.modalStar,
                            star <= userRating ? styles.starFilled : styles.starEmpty,
                            { fontSize: 40 },
                          ]}
                        >
                          ★
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <Text style={styles.modalLabel}>Nhận xét (không bắt buộc):</Text>
                  <TextInput
                    ref={commentInputRef}
                    style={styles.commentInput}
                    placeholder="Chia sẻ cảm nhận của bạn về video này..."
                    value={userComment}
                    onChangeText={setUserComment}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    blurOnSubmit={true}
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                      commentInputRef.current?.blur();
                    }}
                  />
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      onPress={() => {
                        setShowReviewModal(false);
                        setEditingReview(null);
                        setUserRating(0);
                        setUserComment("");
                        Keyboard.dismiss();
                      }}
                      style={[styles.modalButton, styles.cancelButton]}
                    >
                      <Text style={styles.cancelButtonText}>Hủy</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                        setTimeout(() => submitReview(), 150);
                      }}
                      disabled={submitting}
                      style={[styles.modalButton, styles.submitButton]}
                    >
                      <Text style={styles.submitButtonText}>
                        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal feedback cho admin - ĐÃ FIX */}
      <Modal
        visible={showFeedbackModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowFeedbackModal(false);
          Keyboard.dismiss();
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <ScrollView keyboardShouldPersistTaps="handled">
                  <Text style={styles.modalTitle}>
                    {video.feedback ? "Sửa phản hồi" : "Thêm phản hồi"}
                  </Text>
                  
                  <TextInput
                    style={styles.feedbackInput}
                    placeholder="Nhập phản hồi cho học viên..."
                    value={feedbackText}
                    onChangeText={setFeedbackText}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    blurOnSubmit={true}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      onPress={() => {
                        setShowFeedbackModal(false);
                        Keyboard.dismiss();
                      }}
                      style={[styles.modalButton, styles.cancelButton]}
                    >
                      <Text style={styles.cancelButtonText}>Hủy</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                        setTimeout(() => submitFeedback(), 150);
                      }}
                      disabled={submittingFeedback}
                      style={[styles.modalButton, styles.submitButton]}
                    >
                      <Text style={styles.submitButtonText}>
                        {submittingFeedback ? "Đang lưu..." : "Lưu"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 20, backgroundColor: Colors.lightGray },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 15, color: Colors.text },
  
  videoContainer: {
    height: 250,
    backgroundColor: "#000",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  
  ratingSummary: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  averageRating: {
    alignItems: "center",
  },
  averageRatingText: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
  },
  reviewCountText: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 5,
  },
  reviewButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  reviewButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  
  starsContainer: {
    flexDirection: "row",
    marginVertical: 5,
  },
  star: {
    marginHorizontal: 2,
  },
  starFilled: {
    color: "#FFD700",
  },
  starEmpty: {
    color: "#ccc",
  },
  starButton: {
    paddingHorizontal: 4,
  },
  
  feedbackContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  feedbackText: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
  noFeedbackText: {
    fontSize: 14,
    color: Colors.lightGray,
    fontStyle: "italic",
  },
  
  reviewsSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 15,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  reviewDate: {
    fontSize: 11,
    color: Colors.gray,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
    marginTop: 5,
  },
  reviewActions: {
    flexDirection: "row",
    gap: 15,
    marginTop: 8,
  },
  reviewActionText: {
    fontSize: 12,
    color: Colors.primary,
  },
  deleteText: {
    color: Colors.error,
  },
  noReviewsText: {
    fontSize: 14,
    color: Colors.gray,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: Colors.text,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
    marginTop: 10,
  },
  modalStars: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  modalStar: {
    marginHorizontal: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 20,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: Colors.lightGray,
  },
  cancelButtonText: {
    color: Colors.gray,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});