import React, {useState, useEffect} from 'react';
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
import Schedule from '../screens/Schedule';
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
  const [transactionType, setTransactionType] = useState('income');

  const handleChangeTransactionType = (type) => {
    setTransactionType(type);
  };

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
          } else if (route.name === 'Agenda') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Opções') {
            iconName = 'cog';
          } else if (route.name === 'AddTransactionScreen') {
            // Não renderize PlusButton como uma tela; apenas como um componente
            return <PlusButton transactionType={transactionType} />;
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
          tabBarButton: (props) => <Animation {...props} />,
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
        name="Agenda"
        component={Schedule}
        options={{ 
          tabBarButton: (props) => <Animation {...props} />,
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Opções"
        component={OptionsScreen}
        options={{ 
          headerShown: false,  
          tabBarButton: (props) => <Animation {...props} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
