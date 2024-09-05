import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTransactions } from './TransactionContext';
import moment from 'moment';

const CreditCardContext = createContext();

export const CreditCardProvider = ({ children }) => {
    const [creditCards, setCreditCards] = useState([]);
    const { transactions, addTransaction } = useTransactions();

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

    const transactionExists = (accountId, date) => {
        return transactions.some(transaction =>
            transaction.accountId === accountId && moment(transaction.date).isSame(date, 'day')
        );
    };

    const addCreditCard = (accountId, limit, dueDate, usedLimit) => {
        const cardName = `Credito ${accountId}`;
        const newCard = { 
            id: Date.now().toString(), 
            name: cardName, 
            limit, 
            dueDate, 
            accountId, 
            usedLimit: usedLimit || 0 
        };
        setCreditCards(prevCards => [...prevCards, newCard]);
    
        const today = moment().format('YYYY-MM-DD');
        if (moment(dueDate).isSame(today, 'day') && !transactionExists(accountId, dueDate)) {
            addTransaction({
                id: Date.now().toString(),
                accountId,
                date: dueDate,
                amount: usedLimit,
                type: 'expense',
                description: `Pgt Fatura ${accountId}`
            });
        }
    };
    
    const removeCreditCard = (cardId) => {
        setCreditCards(prevCards => prevCards.filter(card => card.id !== cardId));
    };

    const updateCreditCard = (cardId, newLimit, newDueDate) => {
        setCreditCards(prevCards =>
            prevCards.map(card =>
                card.id === cardId
                    ? { ...card, limit: newLimit, dueDate: newDueDate }
                    : card
            )
        );
    };

    useEffect(() => {
        const checkDueDates = async () => {
            const today = moment().startOf('day');
            
            creditCards.forEach(card => {
                const dueDate = moment(card.dueDate).startOf('day');
                
                if (dueDate.isSameOrBefore(today) && !transactionExists(card.accountId, dueDate)) {
                    addTransaction({
                        id: Date.now().toString(),
                        accountId: card.accountId,
                        date: card.dueDate,
                        amount: card.usedLimit,
                        type: 'expense',
                        description: `Pgt Fatura ${card.accountId}`
                    });
                }
            });
        };
    
        checkDueDates();
    
        const intervalId = setInterval(checkDueDates, 24 * 60 * 60 * 1000);
    
        return () => clearInterval(intervalId);
    }, [creditCards, transactions]);
    
    return (
        <CreditCardContext.Provider value={{ creditCards, addCreditCard, removeCreditCard, updateCreditCard }}>
            {children}
        </CreditCardContext.Provider>
    );
};

export const useCreditCards = () => useContext(CreditCardContext);
