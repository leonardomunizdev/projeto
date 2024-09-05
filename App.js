import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { TransactionProvider } from './src/context/TransactionContext';
import { AccountProvider } from './src/context/AccountContext';
import { CategoryProvider } from './src/context/CategoryContext';
import { CreditCardProvider } from './src/context/CreditCardContext';

const App = () => {
  return (
    <NavigationContainer>
      <TransactionProvider>
        <CategoryProvider>
          <AccountProvider>
            <CreditCardProvider>
              <BottomTabNavigator />
            </CreditCardProvider>
          </AccountProvider>
        </CategoryProvider>
      </TransactionProvider>
    </NavigationContainer>
  );
};

export default App;
