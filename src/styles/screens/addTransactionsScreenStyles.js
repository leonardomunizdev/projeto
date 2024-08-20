import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    scrollViewContent: {
      flexGrow: 1,
    },
    formContainer: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      marginBottom: 16,
      fontWeight: "bold",
    },
    input: {
      height: 40,
      borderColor: "#ccc",
      borderWidth: 1,
      marginBottom: 12,
      paddingLeft: 8,
      borderRadius: 5,
    },
    datePickerButton: {
      backgroundColor: "#2196F3",
      padding: 10,
      borderRadius: 5,
      marginBottom: 12,
    },
    datePickerInput: {
      color: "#fff",
      fontSize: 16,
    },
    transactionTypeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    transactionButton: {
      flex: 1,
      padding: 10,
      marginHorizontal: 5,
      borderRadius: 5,
      alignItems: "center",
    },
    transactionButtonText: {
      color: "#fff",
      fontWeight: "bold",
    },
    switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    switchText: {
      marginRight: 8,
      fontSize: 16,
    },
    recurrenceContainer: {
      flexDirection: "column",
      marginBottom: 16,
    },
    recurrenceLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    recurrenceLabel: {
      fontSize: 16,
      marginRight: 8,
    },
    recurrenceControls: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
    },
    recurrenceButton: {
      backgroundColor: "#ddd",
      padding: 10,
      borderRadius: 5,
      marginHorizontal: 5,
    },
    recurrenceButtonText: {
      fontSize: 20,
      fontWeight: "bold",
    },
    recurrenceInput: {
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
      width: 80,
      textAlign: "center",
      fontSize: 16,
      marginHorizontal: 10,
    },
    periodContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    recurrencePicker: {
      width: 150,
    },
    attachmentContainer: {
      marginTop: 20,
    },
    addAttachmentButton: {
      backgroundColor: "#2196F3",
      padding: 10,
      borderRadius: 5,
    },
    addAttachmentButtonText: {
      color: "#fff",
      textAlign: "center",
    },
    attachmentList: {
      marginTop: 10,
    },
    attachmentItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    attachmentImage: {
      width: 100,
      height: 100,
      marginRight: 10,
    },
    picker: {
      marginBottom: 12,
    },
    footer: {
      padding: 16,
      backgroundColor: "#f1f1f1",
      marginTop: 'auto',
  
    },
  });

  export default styles;