import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Removi ícones não usados
import HomeScreen from '../screens/HomeScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import OptionsScreen from '../screens/OptionsScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
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
        navigation.navigate('Transações', { paramKey: 'paramValue' });
      }}
    />
  );
};

const Animation = (teste) => {
  return (
    <TouchableOpacity {...teste} />
  );
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { 
          backgroundColor: 'white', // Fundo da barra de navegação
          height: 60 
        },
        tabBarActiveTintColor: '#ff5722', // Cor dos ícones e texto quando selecionados
        tabBarInactiveTintColor: 'gray', // Cor dos ícones e texto quando não selecionados
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Transações') {
            iconName = 'clipboard-list';
          } else if (route.name === 'Relatório') {
            iconName = 'export';
          } else if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Opções') {
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
        options={{ headerShown: false,
          tabBarButton: (teste) =>  <Animation {...teste} />,
        }}
      />
      <Tab.Screen
        name="Transações"
        component={TransactionsScreen}
        options={{
          headerShown: false,
          tabBarButton: (props) => <TransactionsTabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="AddTransactionScreen"
        component={AddTransactionScreen}  
        options={{ tabBarLabel: '', headerShown: false }}
      />
      <Tab.Screen
        name="Relatório"
        component={StatisticsScreen}
        options={{ 
          tabBarButton: (teste) => <Animation {...teste} />,
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Opções"
        component={OptionsScreen}
        options={{ 
          headerShown: false,  
          tabBarButton: (teste) => <Animation {...teste} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
