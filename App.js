import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { TransactionProvider } from './src/context/TransactionContext';
import { AccountProvider } from './src/context/AccountContext';
import { CategoryProvider } from './src/context/CategoryContext';

const App = () => {
  return (
    <NavigationContainer>
      <TransactionProvider>
        <CategoryProvider>
          <AccountProvider>
            <BottomTabNavigator />
          </AccountProvider>
        </CategoryProvider>
      </TransactionProvider>
    </NavigationContainer>
  );
};

export default App;
