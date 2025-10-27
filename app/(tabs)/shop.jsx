import React from 'react'; // 引入 React。
import { View, Text, StyleSheet, Linking, FlatList, TouchableOpacity } from 'react-native'; // 引入 React Native 的核心組件。
import Ionicons from '@expo/vector-icons/Ionicons'; // 引入 Ionicons 圖標庫。
import { useAuth, useUser } from '@clerk/clerk-expo'; // 引入 Clerk Expo 的身份驗證和用戶管理鉤子。
import { useRouter } from 'expo-router'; // 引入 Expo Router，用於導航。

import Colors from '../../constants/Colors'; // 引入應用的顏色常量。

/**
 * 寵物友善功能頁面。
 */
export default function Shop() {
  // 定義菜單項目數據，每個項目包含名稱、圖標和導航路徑。
  const menuItems = [
    { id: 1, name: '寵物用品', icon: 'paw', path: '/pet_supply/PetShop' },
    { id: 2, name: '寵物餐廳', icon: 'restaurant', path: '/pet_supply/PetResturant' },
    { id: 3, name: '寵物住宿', icon: 'bed', path: '/pet_supply/PetHotel' },
    { id: 4, name: '寵物觀光', icon: 'globe', path: '/pet_supply/PetOther' },
    { id: 5, name: '寵物交通', icon: 'bus', path: '/pet_supply/PetTransport' },
    { id: 6, name: '寵物醫院', icon: 'medkit', path: 'search-pet-hospitals' },
  ];

  const { user } = useUser(); // 獲取當前用戶資訊。
  const router = useRouter(); // 用於導航的路由器。
  const { signOut } = useAuth(); // 獲取登出功能。

  /**
   * 處理菜單項目的按下事件。
   * @param {Object} menuItem - 被點擊的菜單項目。
   */
  const handleMenuPress = (menuItem) => {
    if (menuItem.path === 'search-pet-hospitals') {
      // 如果是寵物醫院，打開 Google Maps 查詢。
      const searchQuery = encodeURIComponent('寵物醫院');
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`);
      return;
    }
    // 導航到其他指定路徑。
    router.push(menuItem.path);
  };

  return (
    <View style={styles.container}> {/* 主容器，設置頁面布局和樣式。 */}
      <Text style={styles.title}>寵物友善</Text> {/* 頁面標題。 */}

      <FlatList
        data={menuItems} // 提供菜單數據。
        keyExtractor={(item) => item.id.toString()} // 設定每個項目的唯一鍵值。
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleMenuPress(item)} // 綁定按鈕點擊事件。
            style={styles.menuItem} // 設定按鈕樣式。
          >
            <Ionicons name={item.icon} size={30} color={Colors.PRIMARY} style={styles.menuIcon} /> {/* 顯示圖標。 */}
            <Text style={styles.menuText}>{item.name}</Text> {/* 顯示菜單文字。 */}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.menuList} // 設定列表的容器樣式。
      />

      {/* Google AdMob 廣告區域（預留）。 */}
      <View style={styles.adContainer}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20, // 設置內邊距。
    marginTop: 20, // 設置頂部外邊距。
  },
  title: {
    fontFamily: 'outfit-medium', // 使用指定字體。
    fontSize: 30, // 設置字體大小。
    padding: 10, // 設置內邊距。
  },
  menuList: {
    paddingVertical: 10, // 設置列表的垂直內邊距。
  },
  menuItem: {
    flexDirection: 'row', // 水平排列。
    alignItems: 'center', // 垂直居中對齊。
    backgroundColor: Colors.WHITE, // 背景顏色。
    padding: 10, // 設置內邊距。
    borderRadius: 10, // 設置圓角。
    marginVertical: 10, // 設置垂直間距。
    gap: 10, // 子項之間的間距。
  },
  menuIcon: {
    padding: 10, // 設置圖標的內邊距。
    backgroundColor: Colors.LIGHT_PRIMARY, // 背景顏色。
    borderRadius: 10, // 圓角。
  },
  menuText: {
    fontFamily: 'outfit', // 使用指定字體。
    fontSize: 20, // 設置字體大小。
  },
  adContainer: {
    alignItems: 'center', // 水平居中對齊。
    marginVertical: 20, // 設置垂直間距。
  },
});
