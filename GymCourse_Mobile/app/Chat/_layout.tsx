import { Stack, router } from "expo-router";
import { TouchableOpacity, View, Text, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";

export default function ChatLayout() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", onPress: logout, style: "destructive" },
    ]);
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: styles.header,
        headerShadowVisible: false,
        headerTintColor: Colors.white,

        headerTitle: () => (
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Gym Course</Text>
          </View>
        ),

        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerSide}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
        ),

        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.headerSide}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="premiumChat"
        options={{
          headerShown: true,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },

  headerSide: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
});