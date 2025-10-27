import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';

export default function Profile() {
  const Menu = [
    {
      id: 1,
      name: '新增寵物',
      icon: 'add-circle',
      path: '/add-new-pet',
    },
    {
      id: 5,
      name: '我的貼文',
      icon: 'bookmark',
      path: '/../user-post',
    },
    {
      id: 2,
      name: '我的喜好',
      icon: 'heart',
      path: '/favorite',
    },
    {
      id: 3,
      name: '問答機器人',
      icon: 'chatbubble',
      path: '/services/App',
    },
    {
      id: 4,
      name: '登出',
      icon: 'exit',
      path: 'logout',
    },
    {
      id: 6,
      name: '管理者介面',
      icon: 'settings',
      path: '/services/admin-support',
    },
  ];

  const { user } = useUser();
  const router = useRouter();
  const { signOut } = useAuth();

  const onPressMenu = (menu) => {
    if (menu.path === 'logout') {
      signOut();
      router.replace('/../login');
      return;
    }

    router.push(menu.path);
  };

  const contactSupport = () => {
    router.push('/chat/problem'); // 跳轉到 problem 頁面
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: Colors.LIGHT_GRAY,
      }}
    >
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontFamily: 'outfit-medium',
            fontSize: 30,
            padding: 10,
          }}
        >
          個人介面
        </Text>

        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            marginVertical: 25,
          }}
        >
          <Image
            source={{ uri: user?.imageUrl }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 99,
            }}
          />

          <Text
            style={{
              fontFamily: 'outfit-bold',
              fontSize: 20,
              marginTop: 6,
            }}
          >
            {user?.fullName}
          </Text>
          <Text
            style={{
              fontFamily: 'outfit',
              fontSize: 16,
              color: Colors.GRAY,
            }}
          >
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      </View>

      {/* 使用 FlatList 渲染選單，避免放在 ScrollView 中 */}
      <FlatList
        data={Menu}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          // 確認是否顯示此項目
          const isVisible =
            user?.primaryEmailAddress?.emailAddress === 'hebe4090409@gmail.com' ||
            item.name !== '管理者介面'; // 僅允許特定項目給管理者

          if (!isVisible) return null; // 如果不應顯示，返回 null

          return (
            <TouchableOpacity
              onPress={() => onPressMenu(item)}
              style={{
                marginVertical: 10,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor: Colors.WHITE,
                padding: 10,
                borderRadius: 10,
              }}
            >
              <Ionicons
                name={item?.icon}
                size={30}
                color={Colors.PRIMARY}
                style={{
                  padding: 10,
                  backgroundColor: Colors.LIGHT_PRIMARY,
                  borderRadius: 10,
                }}
              />
              <Text
                style={{
                  fontFamily: 'outfit',
                  fontSize: 20,
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <TouchableOpacity
            onPress={contactSupport}
            style={{
              marginTop: 20,
              backgroundColor: Colors.PRIMARY,
              padding: 15,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'outfit-bold',
                fontSize: 18,
                color: Colors.WHITE,
              }}
            >
              聯絡客服
            </Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}
