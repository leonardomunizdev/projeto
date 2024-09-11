import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTransactions } from './TransactionContext';

const CreditCardContext = createContext();

export const CreditCardProvider = ({ children }) => {
  const [creditCards, setCreditCards] = useState([]);
  const { removeTransactionsByAccount } = useTransactions();

  useEffect(() => {
    const loadCreditCards = async () => {
      try {
        const storedCards = await AsyncStorage.getItem('creditCards');
        if (storedCards) {
          setCreditCards(JSON.parse(storedCards));
        }
      } catch (error) {
        console.error('Erro ao carregar cartões de crédito:', error);
      }
    };
    loadCreditCards();
  }, []);

  useEffect(() => {
    const saveCreditCards = async () => {
      try {
        await AsyncStorage.setItem('creditCards', JSON.stringify(creditCards));
      } catch (error) {
        console.error('Erro ao salvar cartões de crédito:', error);
      }
    };
    saveCreditCards();
  }, [creditCards]);

  const removeCreditCard = (cardId) => {
    // Remove transações associadas ao cartão
    removeTransactionsByAccount(cardId);

    // Remove o cartão de crédito
    setCreditCards(creditCards.filter(card => card.id !== cardId));
  };

  const addCreditCard = (accountId, limit, dueDate) => {
    const cardName = `Credito ${accountId}`;
    const newCard = { id: Date.now().toString(), name: cardName, limit, dueDate, accountId, usedLimit: 0 };
    setCreditCards([...creditCards, newCard]);
  };

  const updateCreditCard = (cardId, updatedCard) => {
    setCreditCards(creditCards.map(card => (card.id === cardId ? updatedCard : card)));
  };

  return (
    <CreditCardContext.Provider value={{ creditCards, addCreditCard, removeCreditCard, updateCreditCard }}>
      {children}
    </CreditCardContext.Provider>
  );
};

export const useCreditCards = () => useContext(CreditCardContext);
