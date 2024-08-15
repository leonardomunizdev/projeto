import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Alert } from 'react-native';

export const generatePdf = async () => {
  const htmlContent = `
    <html>
    ...
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html: htmlContent });
  return uri;
};

export const sharePdf = async (pdfUri) => {
  try {
    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Compartilhar PDF',
    });
  } catch (error) {
    console.error("Erro ao compartilhar o PDF", error);
    Alert.alert("Erro", "Ocorreu um erro ao tentar compartilhar o PDF.");
  }
};
