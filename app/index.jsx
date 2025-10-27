import { useUser } from "@clerk/clerk-expo"; // 引入 Clerk Expo 中的 useUser 鉤子，用於獲取當前用戶的狀態。
import { Link, Redirect, useNavigation, useRootNavigationState, useRouter } from "expo-router"; // 引入 Expo Router 的導航相關工具。
import { useEffect } from "react"; // 引入 React 的 useEffect 鉤子，用於處理副作用。
import { Pressable, Text, View } from "react-native"; // 引入 React Native 的核心 UI 元件。

export default function Index() {

  const { user } = useUser(); // 從 useUser 鉤子中提取當前用戶的資訊。

  const rootNavigationState = useRootNavigationState(); // 獲取根導航的狀態，用於檢查導航是否已初始化。
  const navigation = useNavigation(); // 獲取當前頁面的導航控制器。

  useEffect(() => {
    CheckNavLoaded(); // 檢查導航是否已加載。
    navigation.setOptions({
      headerShown: false // 隱藏頁面的標題。
    });
  }, []); // 僅在組件加載時執行一次。

  // 檢查根導航是否已初始化。
  const CheckNavLoaded = () => {
    if (!rootNavigationState.key) // 如果根導航的 key 尚未設置。
      return null; // 返回 null，表示導航尚未加載。
  };

  return (
    <View
      style={{
        flex: 1, // 設置容器的彈性屬性，讓其佔滿整個屏幕。
      }}
    >
      {/* 根據用戶的登入狀態決定重定向的目標頁面。 */}
      {user ? (
        <Redirect href={'/(tabs)/home'} /> // 如果用戶已登入，重定向到主頁。
      ) : (
        <Redirect href={'/login'} /> // 如果用戶未登入，重定向到登入頁。
      )}
    </View>
  );
}
