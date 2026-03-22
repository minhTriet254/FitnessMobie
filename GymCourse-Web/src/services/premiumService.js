const API_URL = "http://localhost:5086";

export const premiumService = {
  // GET /api/Premium/packages - Lấy danh sách gói premium
  getPackages: async () => {
    try {
      console.log("📦 Fetching packages from:", `${API_URL}/api/Premium/packages`);
      
      const response = await fetch(`${API_URL}/api/Premium/packages`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Packages data:", data);

      // Xử lý response format
      let packages = [];
      if (data && data.success && data.data) {
        packages = data.data;
      } else if (Array.isArray(data)) {
        packages = data;
      } else {
        console.warn("⚠️ Unexpected response format");
        packages = getFallbackPackages();
      }

      return packages;
      
    } catch (error) {
      console.error("❌ Error fetching packages:", error);
      return getFallbackPackages();
    }
  },

  // POST /api/Premium/create-payment - Tạo thanh toán MoMo
  createPayment: async (packageId) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("Vui lòng đăng nhập để tiếp tục");
    }
    
    try {
      console.log("💳 Creating MoMo payment for package:", packageId);
      
      const response = await fetch(`${API_URL}/api/Premium/create-payment`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ packageId })
      });

      const data = await response.json();
      console.log("📥 Payment response:", data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
      
    } catch (error) {
      console.error("❌ Payment error:", error);
      throw error;
    }
  },

  // GET /api/Premium/check-status - Kiểm tra trạng thái premium
  checkStatus: async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      return { success: false, isPremium: false };
    }
    
    try {
      const response = await fetch(`${API_URL}/api/Premium/check-status`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to check premium status");
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error("❌ Error checking status:", error);
      return { success: false, isPremium: false };
    }
  },

  // GET /api/Premium/check-course-access/{courseId}
  checkCourseAccess: async (courseId) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      return { success: false, hasAccess: false };
    }
    
    try {
      const response = await fetch(`${API_URL}/api/Premium/check-course-access/${courseId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to check course access");
      }

      return response.json();
      
    } catch (error) {
      console.error("❌ Error checking course access:", error);
      return { success: false, hasAccess: false };
    }
  }
};

// Fallback data khi API chưa hoạt động
function getFallbackPackages() {
  return [
    {
      id: 1,
      name: "Premium 1 tháng",
      months: 1,
      price: 200000,
      finalPrice: 200000,
      discountPrice: null,
      description: "Nâng cấp tài khoản Premium 1 tháng"
    },
    {
      id: 2,
      name: "Premium 3 tháng",
      months: 3,
      price: 500000,
      discountPrice: 450000,
      finalPrice: 450000,
      description: "Tiết kiệm 10% khi mua 3 tháng"
    },
    {
      id: 3,
      name: "Premium 6 tháng",
      months: 6,
      price: 900000,
      discountPrice: 800000,
      finalPrice: 800000,
      description: "Tiết kiệm 11% khi mua 6 tháng"
    }
  ];
}