import { useState } from 'react'; // `useState` do React
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native'; // Outros componentes do React Native

import HomeStyles from "../../../styles/screens/HomeScreenStyles";
import { useCategories } from "../../../context/CategoryContext";
import { useTransactions } from '../../../context/TransactionContext';
import { useAccounts } from '../../../context/AccountContext';

const BalanceModal = ({ visible, onClose, selectedMonth, selectedYear }) => {
    const { categories } = useCategories();
    const { accounts } = useAccounts();
    const { transactions } = useTransactions();

    const [selectedCalculationType, setSelectedCalculationType] = useState("category");
    
    
    
    const formatToBRL = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
        }).format(value);
    };

    const getCategoryTotals = (type) => {
        const filteredCategories = categories.filter(
            (category) => category.type === type
        );
        const totals = filteredCategories.map((category) => {
            const total = transactions
                .filter(
                    (transaction) =>
                        transaction.categoryId === category.id &&
                        new Date(transaction.date).getMonth() === selectedMonth &&
                        new Date(transaction.date).getFullYear() === selectedYear
                )
                .reduce((total, transaction) => {
                    const amount = parseFloat(transaction.amount);
                    if (isNaN(amount)) {
                        console.warn(
                            `Valor inválido para a transação: ${transaction.amount}`
                        );
                        return total;
                    }
                    return total + amount;
                }, 0);
            return { ...category, total };
        });

        // Filtra categorias com total maior que zero
        const filteredTotals = totals.filter(category => category.total > 0);
        const totalSum = filteredTotals.reduce((sum, category) => sum + category.total, 0);
        return {
            totals: filteredTotals.map((category) => ({
                ...category,
                total: category.total.toFixed(2).replace(".", ","),
            })),
            totalSum: totalSum.toFixed(2).replace(".", ","),
        };
    };

    const getAccountTotals = (type) => {
        const totals = accounts.map((account) => {
            const total = transactions
                .filter(
                    (transaction) =>
                        transaction.accountId === account.id &&
                        transaction.type === type &&
                        new Date(transaction.date).getMonth() === selectedMonth  &&
                        new Date(transaction.date).getFullYear() === selectedYear
                )
                .reduce((total, transaction) => {
                    const amount = parseFloat(transaction.amount);
                    if (isNaN(amount)) {
                        console.warn(
                            `Valor inválido para a transação: ${transaction.amount}`
                        );
                        return total;
                    }
                    return total + amount;
                }, 0);
            return { ...account, total };
        });

        const filteredTotals = totals.filter(account => account.total > 0);

        const totalSum = filteredTotals.reduce((sum, account) => sum + account.total, 0);

        

        return {
            totals: filteredTotals.map((account) => ({
                ...account,
                total: account.total.toFixed(2).replace(".", ","),
            })),
            totalSum: totalSum.toFixed(2).replace(".", ","),
        };
    };

    const balanceColor = getCategoryTotals() < 0 ? 'red' : 'black';
    console.log(balanceColor);
    return (

        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={HomeStyles.modalContainer}>
                <View style={HomeStyles.modalContent}>
                    <View style={HomeStyles.modalBody}>
                        <View style={HomeStyles.buttonContainer}>
                            <TouchableOpacity
                                style={[
                                    HomeStyles.modalButton,
                                    selectedCalculationType === "category" &&
                                    HomeStyles.modalButtonSelected,
                                ]}
                                onPress={() => setSelectedCalculationType("category")}
                            >
                                <Text style={HomeStyles.modalButtonText}>Por Categoria</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    HomeStyles.modalButton,
                                    selectedCalculationType === "account" &&
                                    HomeStyles.modalButtonSelected,
                                ]}
                                onPress={() => setSelectedCalculationType("account")}
                            >
                                <Text style={HomeStyles.modalButtonText}>Por Conta</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {selectedCalculationType === "category" ? (
                                <View>
                                    <View style={HomeStyles.balanceContainer}>
                                        <View style={HomeStyles.column}>
                                            <Text style={HomeStyles.modalSectionTitle}>Receitas</Text>
                                            <Text style={HomeStyles.movementTextIncome}>
                                                {formatToBRL(parseFloat(getCategoryTotals("income").totalSum))}
                                            </Text>
                                            {getCategoryTotals("income").totals.map((category) => (
                                                <Text key={category.id}>
                                                    {category.name}
                                                    {"\n"}
                                                    <Text style={HomeStyles.incomeTotal}>
                                                        {formatToBRL(parseFloat(category.total))}
                                                    </Text>
                                                </Text>
                                            ))}
                                        </View>
                                        <View style={HomeStyles.column}>
                                            <Text style={HomeStyles.modalSectionTitle}>Despesas</Text>
                                            <Text style={HomeStyles.movementTextExpense}>
                                                {formatToBRL(parseFloat(getCategoryTotals("expense").totalSum))}
                                            </Text>
                                            {getCategoryTotals("expense").totals.map((category) => (
                                                <Text key={category.id}>
                                                    {category.name}
                                                    {"\n"}
                                                    <Text style={HomeStyles.expenseTotal}>
                                                        {formatToBRL(parseFloat(category.total))}
                                                    </Text>
                                                </Text>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <View style={HomeStyles.balanceContainer}>
                                        <View style={HomeStyles.column}>
                                            <Text style={HomeStyles.modalSectionTitle}>Receitas</Text>
                                            <Text style={HomeStyles.movementTextIncome}>
                                                {formatToBRL(parseFloat(getAccountTotals("income").totalSum))}
                                            </Text>
                                            {getAccountTotals("income").totals.map((account) => (
                                                <Text key={account.id}>
                                                    {account.name}
                                                    {"\n"}
                                                    <Text style={HomeStyles.incomeTotal}>
                                                        {formatToBRL(parseFloat(account.total))}
                                                    </Text>
                                                </Text>
                                            ))}
                                        </View>
                                        <View style={HomeStyles.column}>
                                            <Text style={HomeStyles.modalSectionTitle}>Despesas</Text>
                                            <Text style={HomeStyles.movementTextExpense}>
                                                {formatToBRL(parseFloat(getAccountTotals("expense").totalSum))}
                                            </Text>
                                            {getAccountTotals("expense").totals.map((account) => (
                                                <Text key={account.id}>
                                                    {account.name}
                                                    {"\n"}
                                                    <Text style={HomeStyles.expenseTotal}>
                                                        {formatToBRL(parseFloat(account.total))}
                                                    </Text>
                                                </Text>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                        <View style={HomeStyles.balanceRow}>
                            <Text style={HomeStyles.modalTitle}>Balanço</Text>
                            <Text style={[HomeStyles.modalBalanceTotal, {color: balanceColor }]}>
                                {formatToBRL(parseFloat(getCategoryTotals("income").totalSum) -
                                    parseFloat(getCategoryTotals("expense").totalSum))}
                            </Text>
                        </View>



                        <TouchableOpacity
                            onPress={onClose}
                            style={HomeStyles.modalCloseButton}
                        >
                            <Text style={HomeStyles.modalCloseText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>


    );
};

export default BalanceModal;
