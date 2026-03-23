import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

export default function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Đang tải...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.gray,
  },
});