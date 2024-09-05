import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import optionsStyles from '../../../styles/screens/OptionsScreenStyles';
import { useAccounts } from '../../../context/AccountContext';
import { useTransactions } from '../../../context/TransactionContext';
import moment from 'moment';
import { Picker } from '@react-native-picker/picker';
import { useCreditCards } from '../../../context/CreditCardContext';

const CreditCardModal = ({ visible, onClose }) => {
    const { accounts, addAccount } = useAccounts();
    const { addTransaction } = useTransactions();
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [initialLimit, setInitialLimit] = useState('');
    const [dueDate, setDueDate] = useState('');
    const { creditCards, addCreditCard } = useCreditCards();
    const [usedLimit, setUsedLimit] = useState('');


    
    const handleAddCard = () => {
        if (selectedAccountId === null) {
            Alert.alert('Erro', 'Por favor, selecione uma conta vinculada.');
            return;
        }
    
        if (!dueDate) {
            Alert.alert('Erro', 'Por favor, defina a data de vencimento.');
            return;
        }
    
        if (isNaN(parseFloat(initialLimit)) || parseFloat(initialLimit) <= 0) {
            Alert.alert('Erro', 'O limite do cartão deve ser um número positivo.');
            return;
        }
    
        if (isNaN(parseFloat(usedLimit)) || parseFloat(usedLimit) < 0) {
            Alert.alert('Erro', 'O limite usado deve ser um número positivo.');
            return;
        }
    
        const selectedAccount = accounts.find(account => account.id === selectedAccountId);
        if (!selectedAccount) return;
    
        addCreditCard(
            selectedAccount.id, 
            parseFloat(initialLimit), 
            moment().date(parseInt(dueDate)).format('YYYY-MM-DD'),
            parseFloat(usedLimit) // Passa usedLimit aqui
        );
    
        setSelectedAccountId(null);
        setInitialLimit('');
        setDueDate('');
        setUsedLimit(''); // Limpa o campo após a adição
    };
    


    const addPaymentTransaction = (accountId, cardName, dueDate) => {
        // Cria a transação de pagamento da fatura
        const paymentTransaction = {
            id: Date.now().toString(),
            type: 'expense',
            accountId,
            amount: 0, // Defina o valor conforme necessário
            date: dueDate,
            description: `Pgt Fatura ${cardName}`,
            cardId: `card-${Date.now()}`,
        };

        // Adiciona a transação no contexto de transações
        addTransaction(paymentTransaction);
    };

    const renderItem = ({ item }) => (
        <View style={optionsStyles.accountItem}>
            <Text style={optionsStyles.accountName}>
                Crédito {getAccountNameById(item.accountId)} {'\n'}
                Limite: {item.limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} {'\n'}
                Limite Usado: {(item.usedLimit || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} {'\n'}
                Vencimento: {`Dia ${moment(item.dueDate).format('D')}`}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                    <Ionicons name="create" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openConfirmModal(item.id)} style={{ marginLeft: 10 }}>
                    <Ionicons name="trash" size={24} color="red" />
                </TouchableOpacity>
            </View>
        </View>
    );
    
    

    <FlatList
        data={creditCards}
        keyExtractor={item => item.id}
        renderItem={renderItem}
    />

    const getAccountNameById = (id) => {
        const account = accounts.find(acc => acc.id === id);
        return account ? account.name : '';
    };

    return (
        <View style={optionsStyles.container}>
            <Modal
                visible={visible}
                animationType="slide"
                onRequestClose={onClose}
                transparent={true}
            >
                <View style={optionsStyles.fullScreenModal}>
                    <View style={optionsStyles.modalContent}>
                        <TouchableOpacity
                            style={optionsStyles.closeButton}
                            onPress={onClose}
                        >
                            <Ionicons name="close" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={optionsStyles.modalTitle}>Gerir Cartões de Crédito</Text>

                        <Picker
                            selectedValue={selectedAccountId}
                            onValueChange={itemValue => setSelectedAccountId(itemValue)}
                            style={optionsStyles.picker}
                        >
                            <Picker.Item label="Selecione a conta vinculada" value={null} />
                            {accounts.map(account => (
                                <Picker.Item key={account.id} label={account.name} value={account.id} />
                            ))}
                        </Picker>

                        <TextInput
                            style={optionsStyles.input}
                            value={initialLimit}
                            onChangeText={setInitialLimit}
                            placeholder="Limite inicial"
                            keyboardType="numeric"
                        />

                        <TextInput
                            style={optionsStyles.input}
                            value={dueDate}
                            onChangeText={setDueDate}
                            placeholder="Data de Vencimento (DD)"
                            keyboardType="numeric"
                            maxLength={2}
                        />
                        <TextInput
                            style={optionsStyles.input}
                            value={usedLimit}
                            onChangeText={setUsedLimit}
                            placeholder="Limite já usado"
                            keyboardType="numeric"
                        />
                        <Button title="Adicionar Cartão" onPress={handleAddCard} />

                        <FlatList
                            data={creditCards}
                            keyExtractor={item => item.id}
                            renderItem={renderItem}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CreditCardModal;
