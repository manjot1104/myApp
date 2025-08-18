import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import WholesalerScreen from '../screens/WholesalerScreen';
import RetailerScreen from '../screens/RetailerScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import ProductDetailsScreen from "../screens/ProductDetailsScreen";
import CartScreen from "../screens/CartScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";
import OrdersDashboard from '../screens/OrdersDashboard';

const StackNavigator = () => {

    const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen}  options={{ headerShown: false }}/>
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen
          name="OtpVerificationScreen"
          component={OtpVerificationScreen}
          options={{ title: "Verify OTP" }}
          />
        <Stack.Screen name="WholesalerPortal" component={WholesalerScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RetailerPortal" component={RetailerScreen} options={{ headerShown: false }} />

        <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: "Products" }}/>
        <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: "Add / Edit Product" }}/>
         <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
         <Stack.Screen name="Cart" component={CartScreen} />
         <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
         <Stack.Screen name="OrdersDashboard" component={OrdersDashboard} />
        </Stack.Navigator>
    </NavigationContainer>
  )
}

export default StackNavigator

const styles = StyleSheet.create({})