import { View, Text, Image, TextInput, StyleSheet, ScrollView, TouchableOpacity, Pressable, ToastAndroid, ActivityIndicator, Alert, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import Colors from './../../constants/Colors';
import { Picker } from '@react-native-picker/picker';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db, storage } from '../../config/FirebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useUser } from '@clerk/clerk-expo';

// 定義新增寵物頁面的主函數
export default function AddNewPet() {
    const navigation = useNavigation(); // 使用導航
    const [formData, setFormData] = useState({}); // 定義表單資料的狀態
    const [gender, setGender] = useState(null); // 定義性別的狀態
    const [breed, setBreed] = useState(null); // 定義體型的狀態
    const [age, setAge] = useState(null); // 定義年紀的狀態
    const [sterilization, setSterilization] = useState(null); // 定義結紮的狀態
    const [bacterin, setBacterin] = useState(null); // 定義疫苗接種的狀態
    const [categoryList, setCategoryList] = useState([]); // 定義寵物種類列表的狀態
    const [selectedCategory, setSelectedCategory] = useState(); // 定義選擇的寵物種類的狀態
    const [image, setImage] = useState(); // 定義圖片的狀態
    const [loader, setLoader] = useState(false); // 定義加載狀態
    const { user } = useUser(); // 獲取當前用戶資料
    const router = useRouter(); // 使用路由器

    // 在組件加載時執行初始化邏輯
    useEffect(() => {
        navigation.setOptions({
            headerTitle: '新增寵物', // 設定標題
            headerBackTitle: '', // 隱藏返回按鈕文字
            headerBackTitleVisible: false, // 確保返回按鈕文字不顯示
        });
        GetCategories(); // 獲取寵物種類資料
    }, []);

    // 獲取寵物種類資料的函數
    const GetCategories = async () => {
        setCategoryList([]); // 清空種類列表
        const snapshot = await getDocs(collection(db, 'Category')); // 從 Firebase 獲取資料
        snapshot.forEach((doc) => {
            setCategoryList(categoryList => [...categoryList, doc.data()]); // 更新種類列表
        });
    };

    // 圖片選擇器函數
    const imagePicker = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // 僅允許選擇圖片
            allowsEditing: true, // 允許編輯圖片
            aspect: [4, 3], // 設定圖片比例
            quality: 1, // 設定圖片品質
        });

        console.log(result); // 打印選擇結果

        if (!result.canceled) {
            setImage(result.assets[0].uri); // 設定選擇的圖片
        }
    };
    // 處理表單輸入變化的函數
    const handleInputChange = (fieldName, fieldValue) => {
        setFormData(prev => ({
            ...prev, // 保留原始表單資料
            [fieldName]: fieldValue // 更新指定欄位的值
        }));
    };
    // 提交表單的函數
    const onSubmit = () => {
        if (Object.keys(formData).length !== 10) { // 檢查表單是否完整
            ToastAndroid.show('輸入所有資料', ToastAndroid.SHORT); // 顯示錯誤訊息
            return;
        }
        UploadImage(); // 上傳圖片
    };
    // 上傳圖片的函數
    const UploadImage = async () => {
        setLoader(true); // 顯示加載狀態

        const resp = await fetch(image); // 獲取圖片數據
        const blobImage = await resp.blob(); // 將圖片轉換為 Blob
        const storageRef = ref(storage, Date.now() + '.jpg'); // 設定存儲路徑
        console.log(storageRef); // 打印存儲路徑
        uploadBytes(storageRef, blobImage).then((snapshot) => {
            console.log('File Uploaded'); // 打印上傳成功
        }).then(resp => {
            getDownloadURL(storageRef).then(async (downloadUrl) => {
                console.log(downloadUrl); // 打印圖片下載 URL
                SaveFormData(downloadUrl); // 保存表單資料
            });
        });
    };

    // 保存表單資料的函數
    const SaveFormData = async (imageUrl) => {
        const docId = Date.now().toString(); // 生成唯一 ID
        await setDoc(doc(db, 'Pets', docId), {
            ...formData, // 合併表單資料
            imageUrl: imageUrl, // 添加圖片 URL
            username: user?.fullName, // 添加用戶名
            email: user?.primaryEmailAddress?.emailAddress, // 添加用戶郵件
            userImage: user?.imageUrl, // 添加用戶頭像
            id: docId // 添加唯一 ID
        });
        setLoader(false); // 隱藏加載狀態
        setTimeout(() => { // 延遲顯示成功提示
            Alert.alert(
                '成功', // 提示標題
                '寵物資料已成功上傳!', // 提示內容
                [{ text: '確定', onPress: () => router.replace('/(tabs)/home') }] // 提示按鈕
            );
        }, 0);
    };


    return (    
        <ScrollView style={{ padding: 20 }}>
            <Text style={{ fontFamily: 'outfit-medium', fontSize: 20 }}>新增領養寵物</Text>

            <Pressable onPress={imagePicker}>
                {!image ? (
                    <Image source={require('./../../assets/images/placeholder.png')}
                        style={{ width: 100, height: 100, borderRadius: 15, borderWidth: 1, borderColor: Colors.GRAY }} />
                ) : (
                    <Image source={{ uri: image }}
                        style={{ width: 100, height: 100, borderRadius: 15 }} />
                )}
            </Pressable>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>名稱 *</Text>
                <TextInput style={styles.input} onChangeText={(value) => handleInputChange('name', value)} />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>種類 *</Text>
                <Picker
                    selectedValue={selectedCategory}
                    style={styles.input}
                    onValueChange={(itemValue) => {
                    setSelectedCategory(itemValue);
                    handleInputChange('category', itemValue);
                    }}
                >
                    <Picker.Item label="請選擇種類" value={null} />
                    {categoryList.map((category, index) => (
                    <Picker.Item key={index} label={category.name} value={category.name} />
                    ))}
                </Picker>
            </View>


            <View style={styles.inputContainer}>
                <Text style={styles.label}>性別 *</Text>
                <Picker selectedValue={gender} style={styles.input}
                    onValueChange={(itemValue) => {
                        setGender(itemValue);
                        handleInputChange('sex', itemValue);
                    }}>
                    <Picker.Item label="請選擇性別" value={null} />
                    <Picker.Item label="男" value="男" />
                    <Picker.Item label="女" value="女" />
                </Picker>
            </View>


            <View style={styles.inputContainer}>
                <Text style={styles.label}>體型 *</Text>
                <Picker selectedValue={breed} style={styles.input}
                    onValueChange={(itemValue) => {
                        setBreed(itemValue);
                        handleInputChange('breed', itemValue);
                    }}>
                    <Picker.Item label="請選擇體型" value={null} />
                    <Picker.Item label="大型" value="大型" />
                    <Picker.Item label="中型" value="中型" />
                    <Picker.Item label="小型" value="小型" />
                </Picker>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>年紀 *</Text>
                <Picker selectedValue={age} style={styles.input}
                    onValueChange={(itemValue) => {
                        setAge(itemValue);
                        handleInputChange('age', itemValue);
                    }}>
                    <Picker.Item label="請選擇年紀" value={null} />
                    <Picker.Item label="成年" value="成年" />
                    <Picker.Item label="幼年" value="幼年" />
                </Picker>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>結紮 *</Text>
                <Picker selectedValue={sterilization} style={styles.input}
                    onValueChange={(itemValue) => {
                        setSterilization(itemValue);
                        handleInputChange('sterilization', itemValue);
                    }}>
                    <Picker.Item label="請選擇結紮" value={null} />
                    <Picker.Item label="是" value="是" />
                    <Picker.Item label="否" value="否" />
                </Picker>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>疫苗 *</Text>
                <Picker selectedValue={bacterin} style={styles.input}
                    onValueChange={(itemValue) => {
                        setBacterin(itemValue);
                        handleInputChange('bacterin', itemValue);
                    }}>
                    <Picker.Item label="請選擇疫苗" value={null} />
                    <Picker.Item label="是" value="是" />
                    <Picker.Item label="否" value="否" />
                </Picker>
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>顏色 *</Text>
                <TextInput style={[styles.input, { height: 100 }]}  
                    numberOfLines={5}
                    multiline={true}
                    onChangeText={(value) => handleInputChange('colour', value)} />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>地址 *</Text>
                <TextInput style={[styles.input, { height: 100 }]}  
                    numberOfLines={5}
                    multiline={true}
                    onChangeText={(value) => handleInputChange('shelter_address', value)} />
            </View>



            <View style={styles.inputContainer}>
                <Text style={styles.label}>備註 *</Text>
                <TextInput style={[styles.input, { height: 100 }]}  
                    numberOfLines={5}
                    multiline={true}
                    onChangeText={(value) => handleInputChange('animal_remark', value)} />
            </View>

            <TouchableOpacity style={styles.button} disabled={loader} onPress={onSubmit}>
                {loader ? <ActivityIndicator size={'large'} /> : <Text style={{ fontFamily: 'outfit-medium', textAlign: 'center' }}>送出</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        marginVertical: 5
    },
    input: {
        padding: 10,
        backgroundColor: Colors.WHITE,
        borderRadius: 7,
        fontFamily: 'outfit'
    },
    label: {
        marginVertical: 5,
        fontFamily: 'outfit'
    },
    button: {
        padding: 15,
        backgroundColor: Colors.PRIMARY,
        borderRadius: 7,
        marginVertical: 10,
        marginBottom: 50
    }
});
