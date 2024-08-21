import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, Button, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

const EditCategoryModal = ({ visible, onClose, category, updateCategory }) => {
    const [categoryName, setCategoryName] = useState('');

    // Use useEffect para atualizar o estado do categoryName sempre que a categoria mudar
    useEffect(() => {
        if (category) {
            setCategoryName(category.name);
        }
    }, [category]);

    const handleUpdateCategory = () => {
        if (categoryName.trim() === '') {
            Alert.alert('Erro', 'O nome da categoria não pode estar vazio.');
            return;
        }
        updateCategory(category.id, categoryName);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
            transparent={true}
        >
            <View style={styles.fullScreenModal}>
                <View style={styles.modalContent}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Editar Categoria</Text>
                    <TextInput
                        style={styles.input}
                        value={categoryName}
                        onChangeText={setCategoryName}
                        placeholder="Nome da categoria"
                    />
                    <Button title="Salvar Alterações" onPress={handleUpdateCategory} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullScreenModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    closeButton: {
        alignSelf: 'flex-end',
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 10,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
    },
});

export default EditCategoryModal;
