import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { TransactionProvider } from './src/context/TransactionContext';
import { AccountProvider } from './src/context/AccountContext';
import { CategoryProvider } from './src/context/CategoryContext';

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
