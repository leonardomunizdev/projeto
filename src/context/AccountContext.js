import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTransactions } from './TransactionContext';
import moment from 'moment';
const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const { transactions, setTransactions } = useTransactions();

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const storedAccounts = await AsyncStorage.getItem('accounts');
        if (storedAccounts) {
          const parsedAccounts = JSON.parse(storedAccounts);
          
          // Verifica se alguma conta não tem tipo definido e atribui "Debito"
          const updatedAccounts = parsedAccounts.map(account => {
            if (!account.type) {
              return { ...account, type: 'Debito' };
            }
            return account;
          });
  
          setAccounts(updatedAccounts);
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

  const addAccount = (name, initialBalance = 0, type = 'Debito', dueDate = 1, debitAccountId = null) => {
    const existingAccount = accounts.find(account => account.name === name);
    if (existingAccount) {
      return existingAccount.id; // Retorna a ID da conta existente
    }
  
    // Se for uma conta de crédito, vincula a uma conta de débito
    const newAccount = {
      id: Date.now().toString(),
      name,
      initialBalance,
      type,
      dueDate: type === 'Credito' ? dueDate : undefined,
      debitAccountId: type === 'Credito' ? debitAccountId : null, // Subconta de débito
    };
    
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

  const updateAccount = (accountId, newName, newType, newDueDate) => {
    const updatedAccounts = accounts.map(account =>
      account.id === accountId
        ? { ...account, name: newName, type: newType, dueDate: newType === 'Credito' ? newDueDate : undefined }
        : account
    );
    setAccounts(updatedAccounts);
  };
  
  const calculateAccountBalance = (accountId) => {
    const currentDate = moment().format('YYYY-MM-DD');
  
    // Calcula o saldo da conta de débito
    let accountBalance = transactions
      .filter(transaction =>
        transaction.accountId === accountId &&
        (moment(transaction.date).isBefore(currentDate, 'day') || moment(transaction.date).isSame(currentDate, 'day'))
      )
      .reduce((total, transaction) => {
        return transaction.type === 'income'
          ? total + transaction.amount
          : total - transaction.amount;
      }, 0);
  
    // Se a conta for de débito, soma os limites de crédito usados das subcontas de crédito
    const subAccounts = accounts.filter(account => account.debitAccountId === accountId);
    subAccounts.forEach(subAccount => {
      accountBalance += subAccount.initialBalance; // Adiciona o limite da subconta de crédito
    });
  
    return accountBalance;
  };
  
  
  
  return (
    <AccountContext.Provider value={{ accounts, addAccount, removeAccount, updateAccount, calculateAccountBalance  }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => useContext(AccountContext);
