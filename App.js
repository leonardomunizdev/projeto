import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Importe o GestureHandlerRootView
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator'; // Ajuste o caminho se necessário
import { TransactionProvider } from './src/context/TransactionContext'; // Ajuste o caminho se necessário
import { AccountProvider } from './src/context/AccountContext'; // Ajuste o caminho se necessário
import { CategoryProvider } from './src/context/CategoryContext'; // Ajuste o caminho se necessário

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
