import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTransactions } from './TransactionContext';

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {

  const [accounts, setAccounts] = useState([]);
  const {transactions, setTransactions} = useTransactions();

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
    // Verifica se a conta já existe
    const existingAccount = accounts.find((account) => account.name === name);
    if (existingAccount) {
      return existingAccount.id; // Retorna o ID existente
    }
  
    // Adiciona uma nova conta se não existir
    const newAccount = { id: Date.now().toString(), name };
    setAccounts((prevAccounts) => [...prevAccounts, newAccount]);
    return newAccount.id;
  };
  

  const removeAccount = (accountId) => {
    //Filtra todas as transações que não estão ligadas à conta a ser removida
    const updatedTransactions = transactions.filter(
      (transaction) => transaction.accountId !== accountId
    );

    setTransactions(updatedTransactions);

    //Remove a conta
    const updatedAccounts = accounts.filter((account) => account.id !== accountId);
    setAccounts(updatedAccounts);
  };

  return (
    <AccountContext.Provider value={{ accounts, addAccount, removeAccount }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => useContext(AccountContext);
