import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { collection, doc, addDoc, getDocs, query, setDoc, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import Colors from '../../constants/Colors';
import moment from 'moment';

export default function CustomerSupport() {
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useUser();
  const params = useLocalSearchParams(); // 獲取傳遞的參數

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  // 聊天室 ID 與文件路徑
  const customerSupportEmail = 'hebe4090409@gmail.com'; // 客服郵箱
  const chatDocId = `${user?.primaryEmailAddress?.emailAddress}_${customerSupportEmail}`; // 文件 ID
  const chatDocRef = doc(db, 'Support', chatDocId); // 聊天室文件路徑
  const messagesCollection = collection(chatDocRef, 'Messages'); // 訊息子集合

  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: '',
      headerBackTitleVisible: false,
    });

    initializeChat(); // 初始化聊天室
    subscribeToMessages(); // 訂閱聊天訊息
  }, []);

  // 初始化聊天室文件
  const initializeChat = async () => {
    const q = query(collection(db, 'Support'), where('id', '==', chatDocId));
    const querySnapshot = await getDocs(q);

    // 如果聊天室文件不存在，創建新的
    if (querySnapshot.empty) {
      await setDoc(chatDocRef, {
        id: chatDocId,
        users: [
          {
            email: user?.primaryEmailAddress?.emailAddress,
            name: user?.fullName,
            imageUrl: user?.imageUrl,
          },
          {
            email: customerSupportEmail,
            name: '客服管理員',
            imageUrl: '', // 可選：默認客服圖片
          },
        ],
        userIds: [user?.primaryEmailAddress?.emailAddress, customerSupportEmail],
      });
    }
  };

  // 訂閱聊天訊息
  const subscribeToMessages = () => {
    const q = query(messagesCollection, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: moment(doc.data().createdAt).toDate(),
      }));
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  };

  // 發送訊息
  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await addDoc(messagesCollection, {
        text: message.trim(),
        createdAt: new Date().toISOString(),
        sender: user?.primaryEmailAddress?.emailAddress,
        receiver: customerSupportEmail,
      });
      setMessage(''); // 清空輸入框
    } catch (error) {
      console.error('發送訊息失敗:', error);
      Alert.alert('錯誤', '無法發送訊息，請稍後再試');
    }
  };

  // 分組訊息按日期顯示
  const groupMessagesByDate = () => {
    return messages.reduce((groups, message) => {
      const date = moment(message.createdAt).format('YYYY-MM-DD');
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
      return groups;
    }, {});
  };

  const groupedMessages = groupMessagesByDate();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS 使用 padding，Android 使用 height
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0} // 根據需求調整偏移量
    >
      <ScrollView style={{ marginTop: 50 }}>
        <Text style={styles.header}>客服訊息</Text>
        {Object.keys(groupedMessages).map((date) => (
          <View key={date}>
            <Text style={styles.dateSeparator}>{moment(date).format('YYYY年MM月DD日')}</Text>
            {groupedMessages[date].map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageContainer,
                  message.sender === user?.primaryEmailAddress?.emailAddress
                    ? styles.myMessage
                    : styles.otherMessage,
                ]}
              >
                <Text style={styles.messageText}>{message.text}</Text>
                <Text style={styles.messageTime}>
                  {moment(message.createdAt).format('HH:mm')}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="輸入訊息..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>發送</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.LIGHT_GRAY,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontFamily: 'outfit-medium',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateSeparator: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
    color: Colors.GRAY,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '75%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.PRIMARY,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.PRIMARY2,
  },
  messageText: {
    fontSize: 16,
    color: Colors.WHITE,
  },
  messageTime: {
    fontSize: 12,
    color: Colors.GRAY,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: Colors.LIGHT_PRIMARY,
  },
  sendButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 10,
  },
  sendButtonText: {
    color: Colors.WHITE,
    fontFamily: 'outfit-medium',
    fontSize: 16,
  },
});
