// context/TransactionContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
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
        console.error('Erro ao carregar transações:', error);
      }
    };
    loadTransactions();
  }, []);

  useEffect(() => {
    const saveTransactions = async () => {
      try {
        await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
      } catch (error) {
        console.error('Erro ao salvar transações:', error);
      }
    };
    saveTransactions();
  }, [transactions]);


  // No TransactionsContext
  const updateTransaction = (updatedTransaction) => {
    setTransactions(transactions.map(transaction =>
      transaction.id === updatedTransaction.id ? updatedTransaction : transaction
    ));
    console.log(`Recurrence Count: ${updatedTransaction.recurrenceCount}`); // Acessando recurrenceCount aqui
  };


  // Dentro do TransactionContext.js
  const editTransaction = (updatedTransaction) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    );
  };

  const addTransaction = (transaction, recurrence) => {
    if (recurrence && recurrence.isRecurring) {
      const recurringTransactions = generateRecurringTransactions(transaction, recurrence);
      setTransactions(prevTransactions => [...prevTransactions, ...recurringTransactions]);
    } else {
      setTransactions(prevTransactions => [...prevTransactions, transaction]);
    }
  };

  const updateMultipleTransactions = (updatedTransactions) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        updatedTransactions.find((ut) => ut.id === transaction.id) || transaction
      )
    );
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
  // Dentro do TransactionContext.js

  const calculateAccountTransactionsTotal = (accountId, month, year) => {
    // Ajuste o índice do mês para zero-based
  
    return transactions
      .filter(transaction => {
        const transactionDate = moment(transaction.date);
        return (
          transaction.accountId === accountId &&
          transactionDate.month() === month && // Ajuste para o mês correto (0-based)
          transactionDate.year() === year
        );
      })
      .reduce((total, transaction) => {
        return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount;
      }, 0);
  };
  

  const generateRecurringTransactions = (baseTransaction, recurrence) => {
    const transactions = [];
    let nextDate = moment(baseTransaction.date);

    for (let i = 0; i < recurrence.count; i++) {
      transactions.push({
        ...baseTransaction,
        date: nextDate.format('YYYY-MM-DD'),
        id: `${baseTransaction.id}-${i}`,
        recurringId: baseTransaction.id,
        recurrenceCount: recurrence.count, // Adiciona o recurrenceCount à transação
      });

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

  const updateTransactionStatus = (transactionId) => {
    console.log("Atualizando transação com ID:", transactionId); // Verifique o ID
    setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
            transaction.id === transactionId
                ? { ...transaction, isScheduled: false }
                : transaction
        )
    );
};


  const saveAttachmentToTransaction = async (transactionId, attachmentPath) => {
    try {
      const updatedTransactions = transactions.map(transaction => {
        if (transaction.id === transactionId) {
          return {
            ...transaction,
            attachments: [...(transaction.attachments || []), attachmentPath]
          };
        }
        return transaction;
      });

      await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Failed to save attachment', error);
    }
  };
  const removeTransactionsByAccount = (accountId) => {
    setTransactions(prevTransactions =>
      prevTransactions.filter(transaction => transaction.accountId !== accountId)
    );
  };
  const clearTransactions = () => {
    setTransactions([]);
  };
  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      addMultipleTransactions,
      removeTransaction,
      calculateTotalBalance,
      generateRecurringTransactions,
      updateTransactionAttachments,
      saveAttachmentToTransaction,
      setTransactions,
      clearTransactions,
      updateTransaction,
      updateMultipleTransactions,
      calculateAccountTransactionsTotal,
      removeTransactionsByAccount,
      updateTransactionStatus
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);
