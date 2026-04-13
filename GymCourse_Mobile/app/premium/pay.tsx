import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import { createPayment  } from "../../services/premiumService";

export default function PayScreen() {
  const { packageId } = useLocalSearchParams();
  const router = useRouter();

  const [payUrl, setPayUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await createPayment (Number(packageId));

      if (res.success && res.payUrl) {
        setPayUrl(res.payUrl);
      }
    })();
  }, []);

  const handleRedirect = (nav: WebViewNavigation) => {
    const url = nav.url;
    console.log("➡️ Redirect:", url);

    if (url.includes("/api/Premium/momo-return")) {
      router.replace("/premium/success");
      return false;
    }

    if (url.includes("resultCode") && url.includes("9000") === false) {
      router.replace("/premium/failed");
      return false;
    }

    return true;
  };

  if (!payUrl) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: payUrl as string }}
      onNavigationStateChange={handleRedirect}
      javaScriptEnabled
      domStorageEnabled
    />
  );
}