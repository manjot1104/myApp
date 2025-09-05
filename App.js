import { StatusBar } from 'expo-status-bar';
import React, {useEffect } from "react";
import { StyleSheet, Text, View } from 'react-native';
import StackNavigator from './navigation/StackNavigator';
import { io } from "socket.io-client";

export default function App() {

  const socket = io("http://10.0.2.2:8000");

  useEffect(() => {
    socket.on("connect",()=>{
      console.log("connected",socket.id)
    });

    return() =>{
      socket.disconnect();
    };
  },[])
  return (
    <StackNavigator/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
