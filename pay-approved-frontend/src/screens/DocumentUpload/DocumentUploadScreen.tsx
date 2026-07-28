import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { useQuery } from '@tanstack/react-query';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function DocumentUploadScreen() {
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => [],
  });

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      Alert.alert('Documento selecionado', `Arquivo: ${result.assets[0].name}\nTipo: ${result.assets[0].mimeType}`);
    }
  };

  const shareDocument = async (document: Document) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(document.id);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Documentos</Text>
      <Text style={styles.subtitle}>Envie documentos para análise e acompanhe o status</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
        <Text style={styles.uploadButtonText}>📤 Enviar Documento</Text>
      </TouchableOpacity>

      {isLoading ? (
        <Text style={styles.loading}>Carregando documentos...</Text>
      ) : (
        documents.map((doc) => (
          <View key={doc.id} style={styles.documentCard}>
            <View style={styles.documentInfo}>
              <Text style={styles.documentName}>{doc.name}</Text>
              <Text style={styles.documentMeta}>
                Tipo: {doc.type} | Status: {doc.status}
              </Text>
            </View>
            <View style={styles.documentActions}>
              <TouchableOpacity onPress={() => shareDocument(doc)}>
                <Text style={styles.actionButton}>Compartilhar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#1e3a8a' },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  uploadButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 24 },
  uploadButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loading: { textAlign: 'center', color: '#6b7280', marginTop: 20 },
  documentCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentInfo: { flex: 1 },
  documentName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  documentMeta: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  documentActions: { flexDirection: 'row', gap: 8 },
  actionButton: { color: '#2563eb', fontSize: 13, fontWeight: '600' },
});
