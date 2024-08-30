import React, { useState, useCallback } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAccounts } from '../../../context/AccountContext';
import { useTransactions } from '../../../context/TransactionContext';
import { Ionicons } from '@expo/vector-icons';

const CardsModal = ({ visible, onClose }) => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const { accounts } = useAccounts();
    const { transactions } = useTransactions();

    const formatToBRL = (value) => {
        const numberValue = parseFloat(value);
        if (isNaN(numberValue)) {
            return "R$ 0,00";
        }
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(numberValue);
    };

    const calculateCurrentBalance = (accountId) => {
        const currentDate = new Date();
        return transactions
            .filter(transaction => transaction.accountId === accountId && new Date(transaction.date) <= currentDate)
            .reduce((total, transaction) => {
                return transaction.type === 'income'
                    ? total + transaction.amount
                    : total - transaction.amount;
            }, 0);
    };

    const calculateForecastedBalance = (accountId) => {
        return transactions
            .filter(transaction => transaction.accountId === accountId)
            .reduce((total, transaction) => {
                return transaction.type === 'income'
                    ? total + transaction.amount
                    : total - transaction.amount;
            }, 0);
    };

    const swipeGesture = Gesture.Pan()
        .onUpdate(event => {
            // Não usamos a atualização do gesto, apenas para detectar o fim
        })
        .onEnd(event => {
            if (event.translationX > 50) {
                handleSwipeRight();
            } else if (event.translationX < -50) {
                handleSwipeLeft();
            }
        });

    const handleSwipeLeft = useCallback(() => {
        setCurrentCardIndex(prevIndex => {
            const newIndex = Math.min(prevIndex + 1, accounts.length - 1);
            return newIndex;
        });
    }, [accounts.length]);

    const handleSwipeRight = useCallback(() => {
        setCurrentCardIndex(prevIndex => {
            const newIndex = Math.max(prevIndex - 1, 0);
            return newIndex;
        });
    }, []);

    const currentAccount = accounts[currentCardIndex];

    if (!currentAccount) {
        // Tratar o caso onde currentAccount é indefinido
        return null; // Ou renderizar uma mensagem de erro apropriada
    }

    const currentBalance = calculateCurrentBalance(currentAccount.id);
    const forecastedBalance = calculateForecastedBalance(currentAccount.id);

    return (
        <Modal
            visible={visible}
            onRequestClose={onClose}
            transparent
            animationType="fade"
        >
            <GestureHandlerRootView style={styles.modalContainer}>
                {accounts.length > 0 && (
                    <GestureDetector gesture={swipeGesture}>
                        <View style={styles.card}>
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Ionicons name="close" size={24} color="black" />
                            </TouchableOpacity>
                            <Text style={styles.cardTitle}>Conta {currentAccount.name}</Text>
                            <View style={styles.cardBalanceContainer}>
                                <Text style={styles.cardBalanceLabel}>Saldo:</Text>
                                <Text style={[styles.cardBalanceValue, { color: 'red' }]}>
                                    {formatToBRL(currentBalance)}
                                </Text>
                            </View>
                            <View style={styles.cardBalanceContainer}>
                                <Text style={styles.cardBalanceLabel}>Saldo Previsto:</Text>
                                <Text style={[styles.cardBalanceValue, { color: 'blue' }]}>
                                    {formatToBRL(forecastedBalance)}
                                </Text>
                            </View>
                        </View>
                    </GestureDetector>
                )}
            </GestureHandlerRootView>
        </Modal>
    );
};


const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 20,
    },
    card: {
        width: 320,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,

        marginVertical: 15,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    cardBalanceContainer: {
        flexDirection: 'row',
        justifyContent: "space-between",
        marginTop: 5,
    },
    cardBalanceLabel: {
        fontSize: 18,
        color: '#333',
        textAlign: 'left'
    },
    cardBalanceValue: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'left'
    },

    closeButton: {
        position: 'absolute',
        top: '15%',
        right: 10,
        zIndex: 1,
    },
});

export default CardsModal;
