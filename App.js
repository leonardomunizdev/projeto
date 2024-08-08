import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Importe o GestureHandlerRootView
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './navigation/BottomTabNavigator'; // Ajuste o caminho se necessário
import { TransactionProvider } from './context/TransactionContext'; // Ajuste o caminho se necessário
import { AccountProvider } from './context/AccountContext'; // Ajuste o caminho se necessário
import { CategoryProvider } from './context/CategoryContext'; // Ajuste o caminho se necessário
import StackNavigator from './navigation/StackNavigator'; // Se necessário, ajuste o caminho

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <CategoryProvider>
          <TransactionProvider>
            <AccountProvider>
              <BottomTabNavigator />
            </AccountProvider>
          </TransactionProvider>
        </CategoryProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
