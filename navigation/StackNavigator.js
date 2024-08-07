// navigation/ManageAccountsStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OptionsScreen from '../screens/OptionsScreen';
import ManageAccountsScreen from '../screens/ManageAccountsScreen';

const Stack = createStackNavigator();

const ManageAccountsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }} // Ajuste conforme necessário
    >
      <Stack.Screen name="Options" component={OptionsScreen} />
      <Stack.Screen name="ManageAccounts" component={ManageAccountsScreen} />
    </Stack.Navigator>
  );
};

export default ManageAccountsStackNavigator;
