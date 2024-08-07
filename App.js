import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './navigation/BottomTabNavigator'; // Ajuste o caminho se necessário
import { TransactionProvider } from './context/TransactionContext'; // Ajuste o caminho se necessário
import { AccountProvider } from './context/AccountContext'; // Certifique-se de que este caminho está correto
import { CategoryProvider } from './context/CategoryContext'; // Ajuste o caminho se necessário
import StackNavigator from './navigation/StackNavigator'; 

const App = () => {
  return (
    <NavigationContainer>
      <CategoryProvider>
        <TransactionProvider>
          <AccountProvider>
            <BottomTabNavigator />
          </AccountProvider>
        </TransactionProvider>
      </CategoryProvider>
    </NavigationContainer>
  );
};

export default App;
