// navigation/BottomTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import ExportScreen from '../screens/ExportScreen';
import OptionsScreen from '../screens/OptionsScreen';
import AddStackNavigator from './AddStackNavigator'; // Importar o StackNavigator
import PlusButton from '../components/PlusButton';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

const Tab = createBottomTabNavigator();

const TransactionsTabButton = (props) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      {...props}
      onPress={() => {
        navigation.navigate('Transactions', { paramKey: 'paramValue' });
      }}
    />
  );
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { height: 60 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Transactions') {
            iconName = 'clipboard-list';
          } else if (route.name === 'Export') {
            iconName = 'export';
          } else if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Options') {
            iconName = 'cog';
          } else if (route.name === 'AddTransactionScreen') {
            return <PlusButton />;
          }
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: { fontSize: 14 },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          headerShown: false,
          tabBarButton: (props) => <TransactionsTabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="AddTransactionScreen"
        component={AddTransactionScreen} // Usar o StackNavigator aqui
        options={{ tabBarLabel: '', headerShown: false }} // Remover o label do botão Add
      />
      <Tab.Screen
        name="Export"
        component={ExportScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Options"
        component={OptionsScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
