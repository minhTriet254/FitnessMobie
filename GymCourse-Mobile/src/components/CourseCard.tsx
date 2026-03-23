import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  lessonCount: number;
  duration: string;
  rating: number;
  isPremium: boolean;
}

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

export default function CourseCard({ course, onPress }: CourseCardProps) {
  const formatPrice = (price: number) => {
    if (!price || price === 0) return 'Miễn phí';
    return price.toLocaleString() + 'đ';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image
        source={{ uri: course.imageUrl || 'https://via.placeholder.com/400x200' }}
        style={styles.image}
        defaultSource={require('../../assets/images/default-course.png')}
      />
      
      {course.isPremium && (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>PREMIUM</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {course.description || 'Không có mô tả'}
        </Text>
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="book-outline" size={12} color={Colors.gray} />
            <Text style={styles.metaText}>{course.lessonCount || 0} bài</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={Colors.gray} />
            <Text style={styles.metaText}>{course.duration || '2h'}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="star" size={12} color={Colors.warning} />
            <Text style={styles.metaText}>{course.rating || '4.8'}</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(course.price)}</Text>
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>Xem chi tiết</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 1,
  },
  premiumText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.gray,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  viewButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});