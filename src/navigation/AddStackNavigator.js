// navigation/AddStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AddTransactionScreen from '../screens/AddTransactionScreen';

const AddStack = createStackNavigator();

const AddStackNavigator = () => {
  return (
    <AddStack.Navigator>
      <AddStack.Screen
        name="AddTransactionScreen"
        component={AddTransactionScreen}
        options={{ headerShown: false }} // Customize o cabeçalho se necessário
      />
      {/* Adicione outras telas ao StackNavigator, se necessário */}
    </AddStack.Navigator>
  );
};

export default AddStackNavigator;
