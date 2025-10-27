import { View, Text, Image, ScrollView, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from 'react-native'; // 引入 React Native 的核心組件。
import React, { useEffect, useState } from 'react'; // 引入 React 的基本功能和鉤子。
import { collection, getDocs, query, where } from 'firebase/firestore'; // 引入 Firebase Firestore 的查詢功能。
import { db } from '../../config/FirebaseConfig'; // 引入 Firebase 配置。
import PetListItem from '../../components/Home/PetListItem'; // 引入自訂的寵物清單項目元件。
import Colors from '../../constants/Colors'; // 引入應用程式的顏色常量。
import { Picker } from '@react-native-picker/picker'; // 引入下拉選單元件。
import LottieView from 'lottie-react-native'; // 引入 Lottie 動畫庫。

export default function Find() {
  // 定義狀態管理
  const [petList, setPetList] = useState([]); // 儲存寵物清單。
  const [loader, setLoader] = useState(false); // 控制是否顯示加載動畫。
  const [selectedCategory, setSelectedCategory] = useState(null); // 篩選條件：種類。
  const [selectedGender, setSelectedGender] = useState(null); // 篩選條件：性別。
  const [selectedAge, setSelectedAge] = useState(null); // 篩選條件：年齡。
  const [selectedBacterin, setSelectedBacterin] = useState(null); // 篩選條件：是否結紮。
  const [selectedBreed, setSelectedBreed] = useState(null); // 篩選條件：體型。
  const [selectedSterilization, setSelectedSterilization] = useState(null); // 篩選條件：是否接種疫苗。
  const [showFilters, setShowFilters] = useState(false); // 控制篩選條件視窗的顯示。
  const [selectedCity, setSelectedCity] = useState(null); // 篩選條件：縣市。
  const [selectedIsGovernmentData, setSelectedIsGovernmentData] = useState(null); // 篩選條件：是否為政府資料。
  const [isDataFetched, setIsDataFetched] = useState(false); // 標記資料是否已抓取完成。

  useEffect(() => {
    GetPetList(); // 在元件加載時抓取寵物清單。
  }, []);

  // 抓取寵物清單的函數
  const GetPetList = async () => {
    setLoader(true); // 顯示加載動畫。
    setPetList([]); // 清空現有清單。
    setIsDataFetched(false); // 重置資料抓取標記。

    try {
      let q = collection(db, 'Pets'); // 定義查詢基礎。
      const conditions = []; // 儲存篩選條件的陣列。

      // 根據選擇的篩選條件動態添加查詢條件。
      if (selectedCategory) conditions.push(where('category', '==', selectedCategory));
      if (selectedGender) conditions.push(where('sex', '==', selectedGender));
      if (selectedAge) conditions.push(where('age', '==', selectedAge));
      if (selectedBreed) conditions.push(where('breed', '==', selectedBreed));
      if (selectedBacterin) conditions.push(where('bacterin', '==', selectedBacterin));
      if (selectedSterilization) conditions.push(where('sterilization', '==', selectedSterilization));

      if (conditions.length > 0) {
        q = query(q, ...conditions); // 將篩選條件應用到查詢中。
      }

      const querySnapshot = await getDocs(q); // 執行查詢並獲取結果。
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // 整理查詢結果。

      // 根據是否為政府資料進行進一步篩選。
      let filteredData = data;
      if (selectedIsGovernmentData === "是") {
        filteredData = filteredData.filter(item => item.id.toString().length < 13);
      } else if (selectedIsGovernmentData === "否") {
        filteredData = filteredData.filter(item => item.id.toString().length >= 13);
      }

      // 根據選擇的縣市篩選資料。
      if (selectedCity && selectedCity !== "null") {
        filteredData = filteredData.filter(item => {
          const address = (item.shelter_address || "").replace(/\s+/g, "").toLowerCase();
          const city = selectedCity.toLowerCase();
          return address.includes(city);
        });
      }

      setPetList(filteredData); // 更新篩選後的寵物清單。
    } catch (error) {
      console.error('Error fetching pet list:', error); // 捕捉並顯示錯誤。
    } finally {
      setLoader(false); // 停止加載動畫。
      setIsDataFetched(true); // 資料抓取完成。
    }
  };

  // 切換篩選視窗的顯示狀態。
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // 渲染篩選條件的表單。
  const renderFilters = () => (
    <ScrollView>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>是否為政府資料:</Text>
        <Picker
          selectedValue={selectedIsGovernmentData}
          style={styles.input}
          onValueChange={(itemValue) => setSelectedIsGovernmentData(itemValue)}
        >
          <Picker.Item label="不限" value={null} />
          <Picker.Item label="是" value="是" />
          <Picker.Item label="否" value="否" />
        </Picker>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>縣市:</Text>
        <Picker
          selectedValue={selectedCity}
          style={styles.input}
          onValueChange={(itemValue) => setSelectedCity(itemValue)}
        >
          <Picker.Item label="不限" value={null} />
          <Picker.Item label="臺北" value="臺北" />
          <Picker.Item label="新北" value="新北" />
          <Picker.Item label="桃園" value="桃園" />
          <Picker.Item label="臺中" value="臺中" />
          <Picker.Item label="臺南" value="臺南" />
          <Picker.Item label="高雄" value="高雄" />
          <Picker.Item label="基隆" value="基隆" />
          <Picker.Item label="新竹" value="新竹" />
          <Picker.Item label="苗栗" value="苗栗" />
          <Picker.Item label="彰化" value="彰化" />
          <Picker.Item label="南投" value="南投" />
          <Picker.Item label="雲林" value="雲林" />
          <Picker.Item label="嘉義" value="嘉義" />
          <Picker.Item label="宜蘭" value="宜蘭" />
          <Picker.Item label="花蓮" value="花蓮" />
          <Picker.Item label="臺東" value="臺東" />
          <Picker.Item label="澎湖" value="澎湖" />
          <Picker.Item label="金門" value="金門" />
          <Picker.Item label="連江" value="連江" />
        </Picker>
      </View>
      {/* 其他篩選條件表單... */}
      <TouchableOpacity style={styles.button} onPress={() => { GetPetList(); toggleFilters(); }} disabled={loader}>
        {loader ? <ActivityIndicator size="small" color={Colors.WHITE} /> : <Text style={styles.buttonText}>篩選</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={toggleFilters}>
        <Text style={styles.buttonText}>取消</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={{ padding: 20, marginTop: 20 }}>
      <Text style={{ fontFamily: 'outfit-medium', fontSize: 30, padding: 10 }}>尋找</Text>
      <TouchableOpacity onPress={toggleFilters} style={styles.touchableContainer}>
        <Text style={{ fontFamily: 'outfit-medium', fontSize: 18, padding: 10 }}>篩選條件</Text>
        {!showFilters && (
          <Image source={require('./../../assets/images/look.png')} style={styles.lookImage} />
        )}
      </TouchableOpacity>
      <Modal visible={showFilters} animationType="slide" transparent={true} onRequestClose={toggleFilters}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>{renderFilters()}</View>
        </View>
      </Modal>
      {loader ? (
        <View style={styles.loaderContainer}>
          <LottieView
            source={require('./../../assets/animation/Animation.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        </View>
      ) : isDataFetched && petList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暫時沒有寵物可以領養</Text>
        </View>
      ) : (
        <FlatList
          data={petList}
          style={{ marginTop: 10 }}
          numColumns={2}
          refreshing={loader}
          showsVerticalScrollIndicator={false}
          onRefresh={GetPetList}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <PetListItem pet={item} />
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  inputContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  input: {
    padding: 10,
    backgroundColor: Colors.WHITE,
    borderRadius: 7,
  },
  label: {
    marginVertical: 5,
    fontSize: 15,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: Colors.WHITE,
  },
  list: {
    marginTop: 10,
  },
  itemContainer: {
    borderRadius: 10,
    flex: 1,
    backgroundColor: Colors.WHITE,
    margin: 5,
    maxWidth: '50%',
  },
  touchableContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 5,
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: Colors.LIGHT_PRIMARY,
    borderRadius: 20,
  },
  lookImage: {
    width: 30,
    height: 40,
    marginLeft: 210,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  loaderContainer: {
    flex: 1,
    paddingTop: 300,
    justifyContent: 'center',
    alignItems: 'center',
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
