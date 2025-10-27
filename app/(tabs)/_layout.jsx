import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as SecureStore from 'expo-secure-store'
import Colors from './../../constants/Colors'
import Entypo from '@expo/vector-icons/Entypo';
export default function TabLayout() {
  return (
    <Tabs
    screenOptions={{
      tabBarActiveTintColor:Colors.PRIMARY
    }}
    >
        <Tabs.Screen name='home'
          options={{
            title:'主頁',
            headerShown:false,
            tabBarIcon:({color})=><Ionicons name="home" size={24} color={color} />
          }}
        />
         <Tabs.Screen name='find'
        options={{
          title:'尋找',
          headerShown:false,
          tabBarIcon:({color})=><FontAwesome name="map-marker" size={24} color={color} />
        }}/> 
        <Tabs.Screen name='miss'
        options={{
          title:'走失',
          headerShown:false,
          tabBarIcon:({color})=><FontAwesome name="search" size={24} color={color} />
        }}/> 
        
        <Tabs.Screen name='shop'
         options={{
          title:'商店',
          headerShown:false,
          tabBarIcon:({color})=><Entypo name="shop" size={24} color={color}  />
        }}
        />      

        <Tabs.Screen name='inbox'
        options={{
          title:'聊天室',
          headerShown:false,
          tabBarIcon:({color})=><Ionicons name="chatbubble" size={24} color={color} />
        }}/>
        <Tabs.Screen name='profile'
        options={{
          title:'個人介面',
          headerShown:false,
          tabBarIcon:({color})=><Ionicons name="people-circle" size={24} color={color} />
        }}/>

    </Tabs>
  )
}