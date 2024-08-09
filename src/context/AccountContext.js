import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const storedAccounts = await AsyncStorage.getItem('accounts');
        if (storedAccounts) {
          setAccounts(JSON.parse(storedAccounts));
        }
      } catch (error) {
        console.error('Erro ao carregar contas:', error);
      }
    };
    loadAccounts();
  }, []);

  useEffect(() => {
    const saveAccounts = async () => {
      try {
        await AsyncStorage.setItem('accounts', JSON.stringify(accounts));
      } catch (error) {
        console.error('Erro ao salvar contas:', error);
      }
    };
    saveAccounts();
  }, [accounts]);

  const addAccount = (name) => {
    setAccounts((prevAccounts) => [
      ...prevAccounts,
      { id: Date.now().toString(), name },
    ]);
  };

  const removeAccount = (id) => {
    setAccounts((prevAccounts) => prevAccounts.filter(account => account.id !== id));
  };

  return (
    <AccountContext.Provider value={{ accounts, addAccount, removeAccount }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => useContext(AccountContext);
