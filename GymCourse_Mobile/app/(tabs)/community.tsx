import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Colors from '../../constants/Colors';

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Trang cộng đồng đang phát triển</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
  },
  text: {
    fontSize: 16,
    color: Colors.gray,
  },
});