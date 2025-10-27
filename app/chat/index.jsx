import { View, Alert, TouchableOpacity,Text  , ImageBackground,StyleSheet,TextInput} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { addDoc, collection, doc, getDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import moment from 'moment';
import { Menu, MenuItem } from 'react-native-material-menu';
import { MaterialIcons } from '@expo/vector-icons';
import { InputToolbar } from 'react-native-gifted-chat';

export default function ChatScreen() {
  const params = useLocalSearchParams(); // 獲取當前路徑的參數。
  const navigation = useNavigation(); // 獲取導航控制器。
  const { user } = useUser(); // 獲取當前用戶資訊。
  const [messages, setMessages] = useState([]); // 聊天訊息的狀態。
  const [menuVisible, setMenuVisible] = useState(false); // 控制選單顯示。

  const renderInputToolbar = (props) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="輸入你的訊息..."
        placeholderTextColor="#aaa"
        value={props.text}
        onChangeText={props.onTextChanged}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          { backgroundColor: props.text.trim() ? '#007bff' : '#ddd' }, // 如果未輸入內容，按鈕變灰。
        ]}
        onPress={() => {
          if (props.text.trim()) props.onSend({ text: props.text.trim() }, true);
        }}
        disabled={!props.text.trim()} // 禁用按鈕當沒有文字時。
      >
        <Text style={styles.sendButtonText}>發送</Text>
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    GetUserDetails(); // 獲取聊天對象的詳細資料。

    // 訂閱 Firestore 的訊息資料並按照時間排序。
    const unsubscribe = onSnapshot(
      query(collection(db, 'Chat', params?.id, 'Messages'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const messageData = snapshot.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
          createdAt: moment(doc.data().createdAt, 'MM-DD-YYYY HH:mm:ss').toDate(),
        }));
        console.log(" Messages:", messageData); // 確保資料載入。
        setMessages(messageData);
      }
    );
    return () => unsubscribe(); // 清理訂閱。
  }, []);
  //聊天室選單
  const renderMenu = () => (
    <View style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
      <TouchableOpacity
        onPress={() => setMenuVisible(!menuVisible)}
        style={{ backgroundColor: 'white', padding: 10, borderRadius: 20 }}
      >
        <MaterialIcons name="more-vert" size={24} color="black" />
      </TouchableOpacity>
      {menuVisible && (
        <View
          style={{
            position: 'absolute',
            top: 50, // 選單位置在按鈕下方。
            right: 10,
            backgroundColor: 'white',
            padding: 5,
            borderRadius: 4,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            zIndex: 20,
            width: 120,
          }}
        >
          <TouchableOpacity onPress={() => { setMenuVisible(false); deleteChat(); }}>
            <Text style={{ padding: 10, fontSize: 16 , textAlign: 'left'}}>刪除聊天室</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  //獲取聊天室另一個使用者
  const GetUserDetails = async () => {
    const docRef = doc(db, 'Chat', params?.id);
    const docSnap = await getDoc(docRef);

    const result = docSnap.data();
    const otherUser = result?.users.filter(item => item.email !== user?.primaryEmailAddress?.emailAddress);
    navigation.setOptions({
      headerTitle: otherUser[0]?.name || 'Chat',
      headerBackTitle: '', // 隱藏返回按鈕文字。
      headerBackTitleVisible: false, // 確保返回按鈕文字不顯示。
    });
  };
  //發送訊息
  const onSend = async (newMessage) => {
    setMessages((previousMessage) => GiftedChat.append(previousMessage, newMessage));
    newMessage[0].createdAt = moment().format('MM-DD-YYYY HH:mm:ss');
    await addDoc(collection(db, 'Chat', params.id, 'Messages'), newMessage[0]);
  };

  const deleteChat = async () => {
    Alert.alert(
      '刪除聊天室',
      '您確定要刪除此聊天室嗎？這將刪除所有消息記錄。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'Chat', params.id));
              Alert.alert('成功', '聊天室已刪除');
              navigation.goBack();
            } catch (error) {
              console.error('刪除聊天室失敗', error);
              Alert.alert('錯誤', '刪除聊天室時發生錯誤');
            }
          }
        },
      ]
    );
  };

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: '#0084ff' },
        left: { backgroundColor: '#fff' },
      }}
      textStyle={{
        right: { color: '#fff' },
        left: { color: '#000' },
      }}
    />
  );

  return (
    <ImageBackground
      source={require('./../../assets/images/chat-cat.png')} // 替換成背景圖片。
      style={{ flex: 1 }} // 背景充滿螢幕。
    >
    <View style={{ flex: 1 , paddingBottom: 0 }}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        showUserAvatar={true}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar} // 自訂輸入框樣式。
        user={{
          _id: user?.primaryEmailAddress?.emailAddress,
          name: user?.fullName,
          avatar: user?.imageUrl,
        }}
        minInputToolbarHeight={60} // 設置輸入框的最小高度。
      />
      {renderMenu()}
    </View></ImageBackground>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25, // 輕圓角設計。
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9', // 背景顏色。
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#007bff', // 按鈕顏色。
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
