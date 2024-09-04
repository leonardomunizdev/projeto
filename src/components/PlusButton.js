import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlusButton = () => {
    const [transactionType, setTransactionType] = useState(null);
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const route = useRoute();

    useEffect(() => {
        const loadLastTransactionType = async () => {
            try {
                const lastType = await AsyncStorage.getItem("lastTransactionType");
                if (lastType) {
                    setTransactionType(lastType);
                }
            } catch (error) {
                console.error("Failed to load last transaction type", error);
            }
        };

        loadLastTransactionType();
    }, []);

    useEffect(() => {
        if (route.params?.transactionType) {
            setTransactionType(route.params.transactionType);
            AsyncStorage.setItem("lastTransactionType", route.params.transactionType);
        }
    }, [route.params?.transactionType]);

    const handlePress = () => {
        if (isFocused) {
            navigation.navigate('AddTransactionScreen', { handleSaveAndNavigate: true });
        } else {
            navigation.navigate('AddTransactionScreen', { isEditing: false });
        }
    };

    // Define a cor do botão com base no tipo de transação
    const buttonColor = isFocused
        ? (transactionType === 'income' ? 'blue' : (transactionType === 'expense' ? 'red' : '#ff5722'))
        : '#ff5722';

    return (
        <TouchableOpacity style={[styles.button, { backgroundColor: buttonColor }]} onPress={handlePress}>
            <MaterialCommunityIcons 
                name={isFocused ? "check" : "plus"} 
                size={30} 
                color="#fff" 
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({  
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default PlusButton;
