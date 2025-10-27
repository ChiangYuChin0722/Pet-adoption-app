import { View, Text, StyleSheet, FlatList } from 'react-native'
import React from 'react'
import { useAuth } from '@clerk/clerk-expo'
import Header from '../../components/Home/Header'
import Slider from '../../components/Home/Slider'
import PetListByMiss from '../../components/Miss/PetListByMiss'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Colors from '../../constants/Colors'
import { Link } from 'expo-router'

export default function Home() {



  return (
    
    <View style={styles.container}>
            <Text style={{
        fontFamily: 'outfit-medium',
        fontSize: 30,
        padding :10
      }}>走失介面</Text>
      <FlatList
        data={[]} // 空數據，只是用來顯示標頭和其他內容
        renderItem={null} // 沒有列表項目
        ListHeaderComponent={() => (
          <>

             <PetListByMiss /> 
          </>
        )}
        contentContainerStyle={styles.scrollViewContent}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 20,
    //backgroundColor: Colors.WHITE, // 確保背景顏色一致
  },
  scrollViewContent: {
    paddingBottom: 20, // 確保滾動內容的底部不會被遮擋
  },
  addNewPetContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
    backgroundColor: Colors.LIGHT_PRIMARY,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 15,
    borderStyle: 'dashed',
    justifyContent: 'center',
     textAlign: 'center'
  },
  addNewPetText: {
    fontFamily: 'outfit-bold',
    color: Colors.PRIMARY,
    textAlign: 'center',
    fontSize: 18,
  },
});
