import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTransactions } from './TransactionContext';

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const { transactions, setTransactions } = useTransactions();

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

  const addAccount = (name, initialBalance = 0) => { // Adicionando initialBalance como parâmetro
    const existingAccount = accounts.find(account => account.name === name);
    if (existingAccount) {
      return existingAccount.id; // Retorna a ID da conta existente
    }
    const newAccount = { id: Date.now().toString(), name, initialBalance }; // Inclui initialBalance na nova conta
    setAccounts(prevAccounts => [...prevAccounts, newAccount]);
    return newAccount.id;
  };
  
  const removeAccount = (accountId) => {
    const updatedTransactions = transactions.filter(
      (transaction) => transaction.accountId !== accountId
    );

    setTransactions(updatedTransactions);

    const updatedAccounts = accounts.filter((account) => account.id !== accountId);
    setAccounts(updatedAccounts);
  };

  const updateAccount = (accountId, newName) => {
    const updatedAccounts = accounts.map(account =>
      account.id === accountId ? { ...account, name: newName } : account
    );
    setAccounts(updatedAccounts);
  };
  
  return (
    <AccountContext.Provider value={{ accounts, addAccount, removeAccount, updateAccount }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => useContext(AccountContext);
