import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTransactions } from './TransactionContext';

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const { removeTransactionsByAccount } = useTransactions();

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

  const removeAccount = (accountId) => {
    // Remove transações associadas à conta
    removeTransactionsByAccount(accountId);

    // Remove a conta
    setAccounts(accounts.filter(account => account.id !== accountId));
  };

  const addAccount = (name, initialBalance, type, dueDate = null, debitAccountId = null) => {
    const newAccount = { id: Date.now().toString(), name, initialBalance, type, dueDate, debitAccountId };
    setAccounts([...accounts, newAccount]);
  };

  const updateAccount = (updatedAccount) => {
    setAccounts(prevAccounts =>
      prevAccounts.map(account => {
        if (account.id === updatedAccount.id) {
          // Atualiza a conta original
          return { ...account, ...updatedAccount };
        }
        // Verifica se a conta é um cartão de crédito associado e atualiza o nome
        if (account.debitAccountId === updatedAccount.id && account.type === 'Credito') {
          return { ...account, name: `Credito ${updatedAccount.name}` };
        }
        return account;
      })
    );
  };
  


  return (
    <AccountContext.Provider value={{ accounts, addAccount, removeAccount, updateAccount }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => useContext(AccountContext);
