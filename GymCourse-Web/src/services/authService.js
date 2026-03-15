const API_URL = "http://localhost:5086";

export const authService = {
  async register(userData) {
    const url = new URL(`${API_URL}/Account/register`);
    url.searchParams.append("UserName", userData.userName);
    url.searchParams.append("Email", userData.email);
    url.searchParams.append("Password", userData.password);
    url.searchParams.append("ConfirmPassword", userData.confirmPassword);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "*/*",
      },
    });

    if (!response.ok) {
      let errorMessage = "Registration failed";
      try {
        const errorData = await response.text();
        if (errorData) {
          try {
            const jsonError = JSON.parse(errorData);
            if (jsonError.errors) {
              const errors = [];
              Object.keys(jsonError.errors).forEach(key => {
                errors.push(`${key}: ${jsonError.errors[key].join(", ")}`);
              });
              errorMessage = errors.join("\n");
            } else if (jsonError.title) {
              errorMessage = jsonError.title;
            } else {
              errorMessage = jsonError.message || errorData;
            }
          } catch {
            errorMessage = errorData;
          }
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async login(credentials) {
    const url = new URL(`${API_URL}/Account/login`);
    url.searchParams.append("UserName", credentials.userName);
    url.searchParams.append("Password", credentials.password);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "*/*",
      },
    });

    if (!response.ok) {
      let errorMessage = "Login failed";
      try {
        errorMessage = await response.text();
      } catch (e) {
        console.error("Error parsing error response:", e);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Logout function
  logout() {
    // Xóa tất cả dữ liệu trong localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("theme");
    
    // Có thể gọi API logout nếu backend hỗ trợ
    // this.callLogoutAPI();
    
    console.log("User logged out successfully");
  },

  // Optional: Gọi API logout nếu backend hỗ trợ
  async callLogoutAPI() {
    const token = this.getToken();
    if (!token) return;

    try {
      await fetch(`${API_URL}/Account/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "accept": "*/*",
        },
      });
    } catch (error) {
      console.error("Logout API error:", error);
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  getToken() {
    return localStorage.getItem("token");
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === "Admin";
  },

  // Thêm hàm để kiểm tra token còn hạn không
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Giải mã token để kiểm tra thời hạn
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const { exp } = JSON.parse(jsonPayload);
      const expirationTime = exp * 1000; // Convert to milliseconds
      
      return Date.now() < expirationTime;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }
};