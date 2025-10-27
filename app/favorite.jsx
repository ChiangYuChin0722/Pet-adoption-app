import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import Shared from '../Shared/Shared'
import { useUser } from '@clerk/clerk-expo'
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';
import PetListItem from '../components/Home/PetListItem'
import LottieView from 'lottie-react-native'; 

export default function Favorite() {

  const navigation = useNavigation();

  const {user}=useUser();
  const [favIds,setFavIds]=useState([]);
  const [favPetList,setFavPetList]=useState([]);
  const [loader,setLoader]=useState(false);

  navigation.setOptions({
    headerTitle: '喜歡',
    headerBackTitle: '',
    headerBackTitleVisible: false,
  });  
  useEffect(()=>{
    user&&GetFavPetIds();
  },[user])
  // Fav Ids 
  const GetFavPetIds=async()=>{
    setLoader(true);
   const result= await Shared.GetFavList(user);
    setFavIds(result?.favorites); 
    setLoader(false)

    GetFavPetList(result?.favorites);
  }
  // Fetch Related Pet List 
  const GetFavPetList=async(favId_)=>{
    setLoader(true);
    setFavPetList([])
    const q=query(collection(db,'Pets'),where('id','in',favId_));
    const querySnapshot=await getDocs(q);

    querySnapshot.forEach((doc)=>{
      console.log(doc.data());
      setFavPetList(prev=>[...prev,doc.data()])
    })
    setLoader(false);
  }

  return (
    <View style={{ padding: 10, marginTop: 20, flex: 1 }}>
      {loader ? ( // 如果正在加載，顯示 Lottie 動畫
        <View style={styles.loaderContainer}>
          <LottieView
            source={require('../assets/animation/Animation.json')} // 替換為你的動畫路徑
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        </View>
      ) : (
        <FlatList
          data={favPetList}
          numColumns={2}
          onRefresh={GetFavPetIds}
          refreshing={loader}
          renderItem={({ item, index }) => (
            <View style={{ margin: 5 }}>
              <PetListItem pet={item} />
            </View>
          )}
          ListEmptyComponent={() => ( // 當沒有資料時顯示提示文字
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>暫時沒有收藏的寵物</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = {
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  emptyContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
};

