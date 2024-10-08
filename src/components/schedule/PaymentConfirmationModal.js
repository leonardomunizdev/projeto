import React, { useState } from "react";
import { TextInput, Modal, View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import * as ImagePicker from 'expo-image-picker';

const PaymentConfirmationModal = ({ visible, onClose, onConfirmPayment }) => {
  const [paymentType, setPaymentType] = useState('parcial');
  const [partialAmount, setPartialAmount] = useState('');
  const [attachment, setAttachment] = useState(null);

  const pickImage = async () => {
    // Solicitar permissão de acesso à galeria
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("É necessário conceder permissão para acessar a galeria!");
      return;
    }

    // Abrir a galeria e permitir ao usuário escolher uma imagem
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setAttachment(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    // Solicitar permissão de acesso à câmera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("É necessário conceder permissão para acessar a câmera!");
      return;
    }

    // Abrir a câmera para tirar uma foto
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setAttachment(result.assets[0]);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text>Confirmar pagamento?</Text>

          {/* Botões Parcial e Total */}
          <View style={styles.paymentTypeContainer}>
            <TouchableOpacity
              onPress={() => setPaymentType('parcial')}
              style={[
                styles.paymentTypeButton,
                paymentType === 'parcial' ? styles.activeButton : styles.inactiveButton,
              ]}
            >
              <Text style={styles.buttonText}>Parcial</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPaymentType('total')}
              style={[
                styles.paymentTypeButton,
                paymentType === 'total' ? styles.activeButton : styles.inactiveButton,
              ]}
            >
              <Text style={styles.buttonText}>Total</Text>
            </TouchableOpacity>
          </View>

          {/* Campo de entrada para valor parcial */}
          {paymentType === 'parcial' && (
            <TextInput
              style={styles.partialAmountInput}
              placeholder="Valor parcial"
              keyboardType="numeric"
              value={partialAmount}
              onChangeText={setPartialAmount}
            />
          )}

          {/* Botões para anexar comprovante e tirar foto */}
          <View style={styles.attachButtonsContainer}>
            <TouchableOpacity style={styles.smallAttachButton} onPress={pickImage}>
              <Text style={styles.buttonText}>Anexar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.largeCameraButton} onPress={takePhoto}>
              <Text style={styles.buttonText}>Tirar Foto</Text>
            </TouchableOpacity>
          </View>

          {/* Exibir imagem anexada, se existir */}
          {attachment && (
            <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
          )}

          {/* Botões Confirmar e Cancelar */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => onConfirmPayment(partialAmount, attachment)} // Passar valor parcial e anexo ao confirmar
              style={styles.confirmButton}
            >
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelButton}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  paymentTypeButton: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  activeButton: {
    backgroundColor: 'green',
  },
  inactiveButton: {
    backgroundColor: 'gray',
  },
  partialAmountInput: {
    marginTop: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: 'green',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
  attachButtonsContainer: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
    width: '100%',
  },
  smallAttachButton: {
    padding: 5,
    backgroundColor: 'blue',
    borderRadius: 5,
    width: '30%', // Botão pequeno
    alignItems: 'center',
  },
  largeCameraButton: {
    padding: 10,
    backgroundColor: 'orange',
    borderRadius: 5,
    width: '65%', // Botão maior
    alignItems: 'center',
  },
  attachmentImage: {
    width: 100,
    height: 100,
    marginTop: 15,
    borderRadius: 5,
  },
});

export default PaymentConfirmationModal;
