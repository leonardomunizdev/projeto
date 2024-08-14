// context/TransactionContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [attachments, setAttachments] = useState([]);
  
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const storedTransactions = await AsyncStorage.getItem('transactions');
        if (storedTransactions) {
          setTransactions(JSON.parse(storedTransactions));
        }
      } catch (error) {
        console.error('Failed to load transactions', error);
      }
    };

    loadTransactions();
  }, []);

  useEffect(() => {
    const saveTransactions = async () => {
      try {
        await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
      } catch (error) {
        console.error('Failed to save transactions', error);
      }
    };
  
    saveTransactions();
  }, [transactions]);
  

  
  const addTransaction = (transaction, recurrence) => {
    if (recurrence && recurrence.isRecurring) {
      const recurringTransactions = generateRecurringTransactions(transaction, recurrence);
      setTransactions(prevTransactions => [...prevTransactions, ...recurringTransactions]);
    } else {
      setTransactions(prevTransactions => [...prevTransactions, transaction]);
    }
  };
  
  const addMultipleTransactions = (transactions) => {
    setTransactions(prevTransactions => [...prevTransactions, ...transactions]);
  };

  const removeTransaction = (id) => {
    setTransactions(prevTransactions =>
      prevTransactions.filter(transaction => transaction.id !== id)
    );
  };

  const calculateTotalBalance = () => {
    const currentDate = moment().format('YYYY-MM-DD');
    return transactions.reduce((total, transaction) => {
      if (moment(transaction.date).isBefore(currentDate, 'day') || moment(transaction.date).isSame(currentDate, 'day')) {
        return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount;
      }
      return total;
    }, 0);
  };

  const generateRecurringTransactions = (baseTransaction, recurrence) => {
    const transactions = [];
    let nextDate = moment(baseTransaction.date);
  
    for (let i = 0; i < recurrence.count; i++) {
      transactions.push({
        ...baseTransaction,
        date: nextDate.format('YYYY-MM-DD'),
        id: `${baseTransaction.id}-${i}`, // Adiciona um identificador único para cada transação
        recurringId: baseTransaction.id,  // Adiciona um identificador recorrente comum
      });
  
      // Incrementa a data com base na unidade de recorrência
      if (recurrence.unit === 'month') {
        nextDate = nextDate.add(1, 'month');
      } else if (recurrence.unit === 'week') {
        nextDate = nextDate.add(1, 'week');
      }
    }
  
    return transactions;
  };

  // Atualiza uma transação existente com novos anexos
  const updateTransactionAttachments = (id, attachments) => {
    setTransactions(prevTransactions =>
      prevTransactions.map(transaction =>
        transaction.id === id
          ? { ...transaction, attachments }
          : transaction
      )
    );
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      addMultipleTransactions,
      removeTransaction,
      calculateTotalBalance,
      generateRecurringTransactions,
      updateTransactionAttachments
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);
