// components/PlusButton.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PlusButton = () => {
    const navigation = useNavigation();

    return (
            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    navigation.navigate('AddTransactionScreen', { isEditing: false });
                    
                }}
            >
                <MaterialCommunityIcons name="plus" size={30} color="#fff" />
            </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
       
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ff5722',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default PlusButton;
