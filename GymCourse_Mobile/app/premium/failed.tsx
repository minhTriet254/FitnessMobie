import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function Failed() {
  const router = useRouter();
  const { message, code } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh toán thất bại!</Text>

      <Text style={styles.text}>
        {message ? String(message) : "Có lỗi xảy ra khi thanh toán"}
      </Text>

      {code ? <Text style={styles.text}>Mã lỗi: {String(code)}</Text> : null}

      <TouchableOpacity onPress={() => router.replace("/premium/packages")} style={styles.button}>
        <Text style={styles.buttonText}>Thử lại</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/")} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
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
    color: "red",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  button: {
    marginTop: 24,
    backgroundColor: "red",
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
    borderColor: "red",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
});