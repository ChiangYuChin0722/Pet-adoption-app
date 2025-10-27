import { View, Text, FlatList, StyleSheet, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { query, collection, getDocs, where } from 'firebase/firestore';
import { db } from './../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';
import UserItem from '../../components/Inbox/UserItem';
import LottieView from 'lottie-react-native';
import Colors from '../../constants/Colors';

export default function Inbox() {
  const { user } = useUser();
  const [userList, setUserList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [searchText, setSearchText] = useState(''); // 搜尋框的輸入值
  const [filteredList, setFilteredList] = useState([]); // 篩選後的聊天室列表

  useEffect(() => {
    user && GetUserList();
  }, [user]);

  useEffect(() => {
    filterUserList(); // 當搜尋文本變化時過濾列表
  }, [searchText, userList]);

  // 獲取聊天室列表
  const GetUserList = async () => {
    setLoader(true);
    setUserList([]);
    const q = query(
      collection(db, 'Chat'),
      where('userIds', 'array-contains', user?.primaryEmailAddress?.emailAddress)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
      setUserList(prevList => [...prevList, { id: doc.id, ...doc.data() }]);
    });
    setLoader(false);
  };

  // 過濾聊天室列表
  const filterUserList = () => {
    if (searchText === '') {
      setFilteredList(userList);
    } else {
      const filtered = userList.filter((record) => {
        const otherUser = record.users?.filter(u => u?.email !== user?.primaryEmailAddress?.emailAddress)[0];
        return otherUser?.name.toLowerCase().includes(searchText.toLowerCase());
      });
      setFilteredList(filtered);
    }
  };

  // 將聊天室列表映射為只有其他用戶的訊息
  const MapOtherUserList = () => {
    const list = [];
    filteredList.forEach(record => {
      const otherUser = record.users?.filter(u => u?.email !== user?.primaryEmailAddress?.emailAddress);
      const result = {
        docId: record.id,
        ...otherUser[0],
      };
      list.push(result);
    });
    return list;
  };

  return (
    <View style={{ padding: 20, marginTop: 20, flex: 1 }}>
      <Text style={{ fontFamily: 'outfit-medium', fontSize: 30, padding: 10 }}>聊天室</Text>
  
      {/* 搜尋框 */}
      <TextInput
        style={styles.searchInput}
        placeholder="搜尋聊天室..."
        value={searchText}
        onChangeText={setSearchText}
      />
  
      {loader ? ( // 如果正在加載，顯示 Lottie 動畫
        <View style={styles.loaderContainer}>
          <LottieView
            source={require('./../../assets/animation/Animation.json')} // 替換為你的動畫路徑
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        </View>
      ) : (
        <FlatList
          data={MapOtherUserList()} // 確保這個函數返回的是一個陣列
          refreshing={loader}
          onRefresh={GetUserList}
          style={{ marginTop: 0 }}
          keyExtractor={(item, index) => index.toString()} // 設定 keyExtractor 以避免警告
          renderItem={({ item }) => (
            <View>
              <View style={styles.separator} />
              <UserItem userInfo={item} />
            </View>
          )}
          ListEmptyComponent={() => ( // 當沒有資料時顯示提示文字
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>暫時沒有聊天室</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 20,
    fontSize: 16,
  },
  separator: {
    height: 1, // 分隔線的高度
    backgroundColor: '#ddd', // 分隔線的顏色
    marginVertical: 10 // 線條上下的間距
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  loaderContainer: {
    flex: 1, // 讓容器占滿可用空間
    paddingTop :100,
    justifyContent: 'center', // 垂直置中
    alignItems: 'center', // 水平置中
  },
  emptyContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 30,
    fontFamily: 'outfit-medium',
    fontSize: 16,
    color: Colors.GRAY,
  },
});
