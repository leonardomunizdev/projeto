// components/PlusButton.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const PlusButton = ({ onCheckPress }) => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const handlePress = () => {
        if (isFocused) {
            if (onCheckPress) {
                onCheckPress();  // Chama o callback passado como prop
            }
        } else {
            navigation.navigate('AddTransactionScreen', {
                onSaveAndNavigate: () => {
                    // Aqui você pode chamar handleSaveAndNavigate ou qualquer função após a navegação
                    if (onCheckPress) {
                        onCheckPress(); // Exemplo, substitua pela função desejada
                    }
                },
            });
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={handlePress}
            >
                <MaterialCommunityIcons
                    name={isFocused ? "check" : "plus"}
                    size={30}
                    color="#fff"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        right: 10,
        height: 0,
        width: 60,
        borderRadius: 20,
        backgroundColor: 'purple',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'purple',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default PlusButton;
