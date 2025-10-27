import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { db } from '../config/FirebaseConfig';
import Colors from '../constants/Colors';
import { useNavigation } from 'expo-router'

export default function EditPet() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [petData, setPetData] = useState(null);
  const [selectedBacterin, setSelectedBacterin] = useState(null);
  const [selectedSterilization, setSelectedSterilization] = useState(null);
  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedColour, setSelectedColour] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [animalRemark, setAnimalRemark] = useState('');
  const navigation=useNavigation();
  navigation.setOptions({
    headerTitle: '修改介面',
    headerBackTitle: '',
    headerBackTitleVisible: false,
  });

  useEffect(() => {
    const fetchPetData = async () => {
      const docRef = doc(db, 'Pets', params?.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPetData(data);
        setSelectedBacterin(data.bacterin);
        setSelectedSterilization(data.sterilization);
        setSelectedAge(data.age);
        setSelectedColour(data.colour);
        setSelectedCity(data.shelter_address);
        setAnimalRemark(data.animal_remark || '');
      } else {
        console.log('No such document!');
      }
    };
    fetchPetData();
  }, [params?.id]);

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, 'Pets', params?.id);

      const updatedData = {
        ...petData,
        bacterin: selectedBacterin || null,
        sterilization: selectedSterilization || null,
        age: selectedAge || null,
        colour: selectedColour || null,
        shelter_address: selectedCity || null,
        animal_remark: animalRemark || '',
      };

      Object.keys(updatedData).forEach((key) => {
        if (updatedData[key] === undefined) {
          delete updatedData[key];
        }
      });

      await updateDoc(docRef, updatedData);
      router.back();
    } catch (error) {
      console.error('更新失敗', error);
    }
  };

  if (!petData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>加載中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: petData.imageUrl }} style={styles.image} />
        <View style={styles.inputContainer}>
          <Text style={styles.label}>寵物名稱</Text>
          <TextInput
            style={styles.input}
            value={petData.name}
            onChangeText={(text) => setPetData({ ...petData, name: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>年紀</Text>
          <Picker
            selectedValue={selectedAge}
            style={styles.input}
            onValueChange={(value) => setSelectedAge(value)}
          >
            <Picker.Item label="不限" value={null} />
            <Picker.Item label="幼年" value="幼年" />
            <Picker.Item label="成年" value="成年" />
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>疫苗</Text>
          <Picker
            selectedValue={selectedBacterin}
            style={styles.input}
            onValueChange={(value) => setSelectedBacterin(value)}
          >
            <Picker.Item label="不限" value={null} />
            <Picker.Item label="是" value="是" />
            <Picker.Item label="否" value="否" />
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>結紮</Text>
          <Picker
            selectedValue={selectedSterilization}
            style={styles.input}
            onValueChange={(value) => setSelectedSterilization(value)}
          >
            <Picker.Item label="不限" value={null} />
            <Picker.Item label="是" value="是" />
            <Picker.Item label="否" value="否" />
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>顏色</Text>
          <TextInput
            style={styles.input}
            value={selectedColour}
            onChangeText={(text) => setSelectedColour(text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>縣市</Text>
          <Picker
            selectedValue={selectedCity}
            style={styles.input}
            onValueChange={(value) => setSelectedCity(value)}
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>備註</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            multiline
            numberOfLines={4}
            value={animalRemark}
            onChangeText={(text) => setAnimalRemark(text)}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
          <Text style={styles.saveButtonText}>保存修改</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  loadingText: {
    textAlign: 'center',
    fontFamily: 'outfit-medium',
    fontSize: 16,
    color: Colors.GRAY,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: 'cover',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontFamily: 'outfit-medium',
    fontSize: 16,
    color: Colors.GRAY,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 5,
    padding: 10,
    backgroundColor: Colors.LIGHT2_PRIMARY,
    fontFamily: 'outfit',
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.WHITE,
    fontFamily: 'outfit-medium',
    fontSize: 16,
  },
});
