import api from "./api";

export const getPremiumPackages = async () => {
  const res = await api.get("/api/Premium/packages");
  return res.data;
};

export const getPaymentMethods = async () => {
  const res = await api.get("/api/Premium/payment-methods");
  return res.data;
};

// HÀM QUAN TRỌNG — GỌI TỚI /api/Premium/create-payment
export const createPayment = async (data: any) => {
  console.log("📤 Sending payment payload:", data);
  const res = await api.post("/api/Premium/create-payment", data);
  return res.data;
};

export const manualUpgrade = async (userId: string) => {
  const res = await api.post(`/api/Premium/manual-upgrade/${userId}`);
  return res.data;
};

export const checkPremiumStatus = async () => {
  try {
    const res = await api.get("/api/Premium/check-status");
    console.log('📡 API check-status response:', res.data);
    return res.data;
  } catch (error) {
    console.error("Error checking premium status:", error);
    return { isPremium: false };
  }
};