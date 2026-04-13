import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Success() {
  const router = useRouter();
  const { amount, months, expiry, transactionNo } = useLocalSearchParams();
  const { refreshPremiumStatus } = useAuth();
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    const syncPremium = async () => {
      try {
        await refreshPremiumStatus();
      } finally {
        setRefreshing(false);
      }
    };

    syncPremium();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh toán thành công!</Text>

      <Text style={styles.text}>Số tiền: {amount || 0}đ</Text>
      <Text style={styles.text}>Gói: {months || 0} tháng</Text>
      <Text style={styles.text}>Hạn Premium: {expiry || '---'}</Text>
      <Text style={styles.text}>Mã giao dịch: {transactionNo || '---'}</Text>

      {refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="green" />
          <Text style={styles.loadingText}>Đang cập nhật trạng thái Premium...</Text>
        </View>
      ) : (
        <Text style={styles.successText}>Tài khoản đã được cập nhật Premium.</Text>
      )}

      <TouchableOpacity onPress={() => router.replace("/")} style={styles.button}>
        <Text style={styles.buttonText}>Về trang chủ</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/(tabs)")} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Tiếp tục học</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    color: "green",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  loadingBox: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  successText: {
    marginTop: 20,
    fontSize: 15,
    color: "green",
    textAlign: "center",
    fontWeight: "600",
  },
  button: {
    marginTop: 30,
    backgroundColor: "green",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "green",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "green",
    fontSize: 16,
    fontWeight: "bold",
  },
});