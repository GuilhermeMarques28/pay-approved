import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as DocumentPicker from 'expo-document-picker';

const contractSchema = yup.object({
  contractName: yup.string().required('Nome do contrato é obrigatório'),
  totalAmount: yup.number().required('Valor total é obrigatório').positive('Valor deve ser positivo'),
  installments: yup.number().required('Quantidade de parcelas é obrigatória').integer('Deve ser um número inteiro').positive('Deve ser positivo'),
  dueDay: yup.number().required('Dia de vencimento é obrigatório').min(1).max(31),
});

type ContractFormData = yup.InferType<typeof contractSchema>;

interface ContractSigningScreenProps {
  onSign: (data: ContractFormData) => Promise<void>;
}

export function ContractSigningScreen({ onSign }: ContractSigningScreenProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContractFormData>({
    resolver: yupResolver(contractSchema),
    defaultValues: { contractName: '', totalAmount: 0, installments: 1, dueDay: 1 },
  });

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      Alert.alert('Documento selecionado', result.assets[0].name);
    }
  };

  const onSubmitForm = async (data: ContractFormData) => {
    await onSign(data);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Assinar Contrato</Text>
      <Text style={styles.subtitle}>Preencha os dados do contrato e assine digitalmente</Text>

      <TextInput style={styles.input} placeholder="Nome do contrato" value={control._formValues?.contractName ?? ''} onChangeText={(text) => control.setValue('contractName', text)} />
      {errors.contractName && <Text style={styles.error}>{errors.contractName.message}</Text>}

      <TextInput style={styles.input} placeholder="Valor total (R$)" keyboardType="numeric" value={control._formValues?.totalAmount?.toString() ?? ''} onChangeText={(text) => control.setValue('totalAmount', parseFloat(text) || 0)} />
      {errors.totalAmount && <Text style={styles.error}>{errors.totalAmount.message}</Text>}

      <TextInput style={styles.input} placeholder="Quantidade de parcelas" keyboardType="numeric" value={control._formValues?.installments?.toString() ?? ''} onChangeText={(text) => control.setValue('installments', parseInt(text) || 0)} />
      {errors.installments && <Text style={styles.error}>{errors.installments.message}</Text>}

      <TextInput style={styles.input} placeholder="Dia de vencimento (1-31)" keyboardType="numeric" value={control._formValues?.dueDay?.toString() ?? ''} onChangeText={(text) => control.setValue('dueDay', parseInt(text) || 1)} />
      {errors.dueDay && <Text style={styles.error}>{errors.dueDay.message}</Text>}

      <TouchableOpacity style={styles.documentButton} onPress={pickDocument}>
        <Text style={styles.documentButtonText}>📎 Anexar Documento</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signButton} onPress={handleSubmit(onSubmitForm)} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Assinando...' : 'Assinar Contrato'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#1e3a8a' },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 4, fontSize: 16 },
  error: { color: '#ef4444', fontSize: 12, marginBottom: 12 },
  documentButton: { backgroundColor: '#f3f4f6', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#d1d5db', borderStyle: 'dashed' },
  documentButtonText: { fontSize: 14, color: '#374151' },
  signButton: { backgroundColor: '#16a34a', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});