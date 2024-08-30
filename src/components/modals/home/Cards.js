// src/components/Cards.js

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import HomeStyles from '../../../styles/screens/HomeScreenStyles';
import { useNavigation } from '@react-navigation/native';
import { PanGestureHandler } from 'react-native-gesture-handler';

export const BalanceCard = ({ balance, balanceColor, formatToBRL, label }) => (
    <View style={HomeStyles.balanceContainer}>
      <View style={HomeStyles.textContainer}>
        <Text style={HomeStyles.balanceText}>{label}</Text>
        <Text style={[HomeStyles.balanceAmount, { color: balanceColor }]}>
          {formatToBRL(balance)}
        </Text>
      </View>
    </View>
  );
  

export const AbstractCard = ({ totalIncome, totalExpense, formatToBRL, onLongPress }) => {
    const navigation = useNavigation();
    
    const navigateToTransactions = (type) => {
        navigation.navigate("Transações", { filterType: type });
      };
    return(

    <View style={HomeStyles.summaryContainer}>
        <Card style={HomeStyles.card} onPress={() => navigateToTransactions("income")} onLongPress={onLongPress}>
            <Card.Content>

                <View style={HomeStyles.summaryItemContainer}>
                    <Text style={HomeStyles.summaryItemTitle}>Receitas</Text>
                    <Text style={[HomeStyles.summaryItemAmount, { color: 'blue' }]}>
                        {formatToBRL(totalIncome)}
                    </Text>
                </View>
            </Card.Content>
        </Card>
        <Card style={HomeStyles.card} onPress={() => navigateToTransactions("expense")} onLongPress={onLongPress}>

            <Card.Content>
                <View style={HomeStyles.summaryItemContainer}>
                    <Text style={HomeStyles.summaryItemTitle}>Despesas</Text>
                    <Text style={[HomeStyles.summaryItemAmount, { color: 'red' }]}>
                        {formatToBRL(totalExpense)}
                    </Text>
                </View>
            </Card.Content>
        </Card>



    </View>
);

};

export const SpendingLimitCard = ({
    savedGoal,
    monthlyExpense,

    amountLeft,
    goalColor,
    formatToBRL,
    visible,
    onLongPress
}) => {

    const calculateBarColor = (percentage) => {
        if (percentage < 50) {
            return "blue";
        } else if (percentage < 75) {
            return "orange";
        } else {
            return "red";
        }
    };


    const renderProgressBar = () => {
        const spendingGoalValue = parseFloat(savedGoal) || 0;
        const percentage = (monthlyExpense / spendingGoalValue) * 100;
        const barColor = calculateBarColor(percentage);

        return (
            <View style={HomeStyles.progressBarContainer}>
                <View style={[HomeStyles.progressBar, { width: `${percentage}%`, backgroundColor: barColor }]} />
            </View>
        );
    };

    return (
        <Card style={HomeStyles.accountsCard} onPress={visible} onLongPress={onLongPress}>
            <Card.Content>
                <Text style={HomeStyles.cardTitle}>Limite de Gastos Mensais</Text>
                <View style={HomeStyles.monthlyBalanceItem}>
                    <Text style={{ fontSize: 16 }}>Limite:</Text>
                    <Text>{formatToBRL(parseFloat(savedGoal))}</Text>
                </View>
                <View style={HomeStyles.monthlyBalanceItem}>
                    <Text style={{ fontSize: 16 }}>Gasto Mensal:</Text>
                    <Text style={{ color: 'red' }}>{formatToBRL(monthlyExpense)}</Text>
                </View>
                {renderProgressBar()}
                <Text style={{ color: goalColor, fontSize: 16 }}>
                    {amountLeft < 0
                        ? `O limite foi excedido em ${formatToBRL(Math.abs(amountLeft))}`
                        : `Falta ${formatToBRL(amountLeft)} para alcançar o limite`}
                </Text>
            </Card.Content>
        </Card>
    );

};

export const AccountsCard = ({
    accounts,
    accountValues,
    formatToBRL,
    HomeStyles,
    onLongPress
}) => {
    const navigation = useNavigation();

    const navigateToAddTransactionsAccount = (accountId) => {
        navigation.navigate('AddTransactionScreen', { accountId });
    };

    return (
        <Card style={HomeStyles.accountsCard} onLongPress={onLongPress}>
            <Card.Content>
                <Text style={HomeStyles.accountsTitle}>Contas</Text>
                {accounts.map((account) => (
                    <View key={account.id} style={HomeStyles.accountItem}>
                        
                        <Text style={HomeStyles.accountName}>
                            {account.name}{'\n'}
                            <Text
                                style={[
                                    HomeStyles.accountAmount,
                                    { color: accountValues[account.id] < 0 ? 'red' : 'blue' },
                                ]}
                            >
                                {formatToBRL(parseFloat((accountValues[account.id] || 0)))}
                                
                            </Text>
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigateToAddTransactionsAccount(account.id)}
                            style={HomeStyles.addButton}
                        >
                            <MaterialIcons name="add" size={30} color="blue" />
                        </TouchableOpacity>
                        
                    </View>
                    
                ))}
                <View style={HomeStyles.accountDivider} />
                <View style={HomeStyles.totalContainer}>
                    <Text style={HomeStyles.totalText}>Total:</Text>
                    <Text
                        style={[
                            HomeStyles.totalAmount,
                            {
                                color: Object.values(accountValues).reduce((a, b) => a + b, 0) < 0 ? 'red' : 'blue',
                            },
                        ]}
                    >
                        {formatToBRL(parseFloat(Object.values(accountValues).reduce((a, b) => a + b, 0)))}
                        
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );
};

export const MonthlyBalanceCard = ({
    monthlyIncome,
    monthlyExpense,
    monthlyBalance,
    formatToBRL,
    HomeStyles,
    visible,
    onLongPress
}) => (

    <Card style={HomeStyles.monthlyBalanceCard} onPress={visible} onLongPress={onLongPress}>
        <Card.Content>
            <Text style={HomeStyles.monthlyBalanceTitle}>Balanço Mensal</Text>
            <View style={HomeStyles.accountDivider} />
            <View style={HomeStyles.monthlyBalanceContent}>
                <View style={HomeStyles.monthlyBalanceItem}>
                    <Text style={HomeStyles.monthlyBalanceLabel}>Receitas:</Text>
                    <Text style={[HomeStyles.monthlyBalanceValue, { color: 'blue' }]}>
                        {formatToBRL(parseFloat(monthlyIncome.toFixed(2)))}
                    </Text>
                </View>
                <View style={HomeStyles.monthlyBalanceItem}>
                    <Text style={HomeStyles.monthlyBalanceLabel}>Despesas:</Text>
                    <Text style={[HomeStyles.monthlyBalanceValue, { color: 'red' }]}>
                        {formatToBRL(parseFloat(monthlyExpense.toFixed(2)))}
                    </Text>
                </View>
                <View style={HomeStyles.accountDivider} />
                <View style={HomeStyles.monthlyBalanceItem}>
                    <Text style={HomeStyles.monthlyBalanceLabel}>Balanço:</Text>
                    <Text
                        style={[
                            HomeStyles.monthlyBalanceValue,
                            { color: monthlyBalance < 0 ? 'red' : 'blue' },
                        ]}
                    >
                        {formatToBRL(parseFloat(monthlyBalance.toFixed(2)))}
                    </Text>
                </View>
            </View>
        </Card.Content>
    </Card>
);
