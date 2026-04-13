import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { router } from "expo-router";
import api from "@/services/api";
import Colors from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Package {
  id: number;
  name: string;
  months: number;
  originalPrice: number;
  finalPrice: number;
  discountPercent: number;
  description: string;
}

export default function PremiumPackagesScreen() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await api.get("/api/Premium/packages");
      if (response.data.success) {
        setPackages(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching packages:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách gói Premium");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: Package) => {
    setSelectedPackage(pkg);
    setProcessing(true);

    try {
      const response = await api.post("/api/Premium/create-payment", {
        packageId: pkg.id,
        paymentMethod: "momo",
      });

      if (response.data.success) {
        if (response.data.isAlreadyPremium) {
          Alert.alert(
            "Thông báo",
            response.data.message,
            [{ text: "OK", onPress: () => router.back() }]
          );
        } else if (response.data.payUrl) {
          // Open MoMo payment URL
          const supported = await Linking.canOpenURL(response.data.payUrl);
          if (supported) {
            await Linking.openURL(response.data.payUrl);
          } else {
            Alert.alert("Lỗi", "Không thể mở trình duyệt");
          }
        }
      } else {
        Alert.alert("Lỗi", response.data.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      console.log("Error creating payment:", error);
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể tạo thanh toán");
    } finally {
      setProcessing(false);
      setSelectedPackage(null);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nâng cấp Premium</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>✨ Lợi ích Premium</Text>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>✅</Text>
          <Text style={styles.benefitText}>Truy cập tất cả bài tập chuyên sâu</Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>✅</Text>
          <Text style={styles.benefitText}>Video hướng dẫn chi tiết từ chuyên gia</Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>✅</Text>
          <Text style={styles.benefitText}>Giáo trình dinh dưỡng độc quyền</Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>✅</Text>
          <Text style={styles.benefitText}>Hỗ trợ 1-1 từ huấn luyện viên</Text>
        </View>
      </View>

      <Text style={styles.packagesTitle}>Chọn gói phù hợp với bạn</Text>

      {packages.map((pkg) => (
        <TouchableOpacity
          key={pkg.id}
          style={[
            styles.packageCard,
            selectedPackage?.id === pkg.id && styles.packageCardSelected,
          ]}
          onPress={() => handlePurchase(pkg)}
          disabled={processing}
        >
          {pkg.discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{pkg.discountPercent}%</Text>
            </View>
          )}
          <Text style={styles.packageName}>{pkg.name}</Text>
          <Text style={styles.packageMonths}>{pkg.months} tháng sử dụng</Text>
          <View style={styles.priceContainer}>
            {pkg.originalPrice > pkg.finalPrice && (
              <Text style={styles.originalPrice}>{formatPrice(pkg.originalPrice)}</Text>
            )}
            <Text style={styles.finalPrice}>{formatPrice(pkg.finalPrice)}</Text>
          </View>
          <Text style={styles.packageDescription}>{pkg.description}</Text>
          <View style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Mua ngay</Text>
          </View>
        </TouchableOpacity>
      ))}

      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={Colors.white} />
          <Text style={styles.processingText}>Đang xử lý...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.lightGray,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  placeholder: {
    width: 40,
  },
  benefitsCard: {
    backgroundColor: Colors.white,
    margin: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.darkGray,
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.gray,
  },
  packagesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.darkGray,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  packageCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: "relative",
  },
  packageCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  discountBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  discountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  packageName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.darkGray,
    marginBottom: 5,
  },
  packageMonths: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.gray,
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  finalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  packageDescription: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 15,
  },
  buyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buyButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    color: Colors.white,
    marginTop: 12,
    fontSize: 16,
  },
});