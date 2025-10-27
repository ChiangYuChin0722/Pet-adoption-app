import { useFonts } from "expo-font"; // 匯入 Expo 中的 useFonts，用來加載自定義字體。
import { Link, Stack } from "expo-router"; // 匯入 Expo Router 中的 Link 和 Stack，方便管理頁面導航結構。
import * as SecureStore from 'expo-secure-store'; // 匯入 Expo SecureStore，用於安全存儲敏感數據（如令牌）。
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'; // 匯入 Clerk Expo 庫的 ClerkProvider 和 ClerkLoaded，提供身份驗證功能。
import { Text } from "react-native"; // 匯入 React Native 的 Text 元件，用於顯示文字。

// 定義一個令牌快取（tokenCache），用來管理安全存儲中的令牌操作。
const tokenCache = {
  async getToken(key) { // 獲取存儲中的令牌。
    try {
      const item = await SecureStore.getItemAsync(key); // 從 SecureStore 中讀取指定 key 的值。
      if (item) {
        console.log(`${key} was used 🔐 \n`); // 如果找到值，打印使用訊息。
      } else {
        console.log('No values stored under key: ' + key); // 如果未找到值，打印提示訊息。
      }
      return item; // 返回找到的值（或 null）。
    } catch (error) {
      console.error('SecureStore get item error: ', error); // 捕捉錯誤並打印。
      await SecureStore.deleteItemAsync(key); // 如果有錯誤，刪除存儲中的該 key。
      return null; // 返回 null。
    }
  },
  async saveToken(key, value) { // 儲存令牌到存儲。
    try {
      return SecureStore.setItemAsync(key, value); // 使用 SecureStore 儲存值。
    } catch (err) {
      return; // 如果有錯誤，直接返回。
    }
  },
};

export default function RootLayout() { // 定義根布局元件。

  const publishableKey = 'pk_test_dG91Y2hlZC1zbmFrZS02MS5jbGVyay5hY2NvdW50cy5kZXYk'; // Clerk 的公開金鑰，用於配置 ClerkProvider。

  return (
    <ClerkProvider 
    tokenCache={tokenCache} // 傳入令牌快取，用於管理令牌存取。
    publishableKey={publishableKey} // 傳入 Clerk 的公開金鑰。
    >
      <Stack> {/* 使用 Stack 定義頁面導航結構。 */}
        <Stack.Screen name="(tabs)" 
        options={{
          headerShown: false // 隱藏頁面標題。
        }}
        />
        <Stack.Screen name="login/index"
        options={{
          headerShown: false // 隱藏頁面標題。
        }}
        />
      </Stack>

    </ClerkProvider>
  );
}
