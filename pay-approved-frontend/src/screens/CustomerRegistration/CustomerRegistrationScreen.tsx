import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as Location from 'expo-location';

const customerSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  cpf: yup.string().required('CPF é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório'),
  address: yup.string().required('Endereço é obrigatório'),
  city: yup.string().required('Cidade é obrigatória'),
  state: yup.string().required('Estado é obrigatório'),
  zipCode: yup.string().required('CEP é obrigatório'),
});

type CustomerFormData = yup.InferType<typeof customerSchema>;

interface CustomerRegistrationScreenProps {
  onSubmit: (data: CustomerFormData) => Promise<void>;
}

export function CustomerRegistrationScreen({ onSubmit }: CustomerRegistrationScreenProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: yupResolver(customerSchema),
    defaultValues: { name: '', email: '', cpf: '', phone: '', address: '', city: '', state: '', zipCode: '' },
  });

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão de localização', 'A localização é necessária para enviar alertas de pagamento.');
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    return location;
  };

  const onSubmitForm = async (data: CustomerFormData) => {
    await requestLocation();
    await onSubmit(data);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro do Cliente</Text>
      <Text style={styles.subtitle}>Preencha seus dados para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={control._formValues?.name ?? ''}
        onChangeText={(text) => control.setValue('name', text)}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={control._formValues?.email ?? ''}
        onChangeText={(text) => control.setValue('email', text)}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="CPF"
        keyboardType="numeric"
        value={control._formValues?.cpf ?? ''}
        onChangeText={(text) => control.setValue('cpf', text)}
      />
      {errors.cpf && <Text style={styles.error}>{errors.cpf.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Telefone"
        keyboardType="phone-pad"
        value={control._formValues?.phone ?? ''}
        onChangeText={(text) => control.setValue('phone', text)}
      />
      {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Endereço"
        value={control._formValues?.address ?? ''}
        onChangeText={(text) => control.setValue('address', text)}
      />
      {errors.address && <Text style={styles.error}>{errors.address.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Cidade"
        value={control._formValues?.city ?? ''}
        onChangeText={(text) => control.setValue('city', text)}
      />
      {errors.city && <Text style={styles.error}>{errors.city.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Estado"
        value={control._formValues?.state ?? ''}
        onChangeText={(text) => control.setValue('state', text)}
      />
      {errors.state && <Text style={styles.error}>{errors.state.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="CEP"
        keyboardType="numeric"
        value={control._formValues?.zipCode ?? ''}
        onChangeText={(text) => control.setValue('zipCode', text)}
      />
      {errors.zipCode && <Text style={styles.error}>{errors.zipCode.message}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmitForm)} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Salvando...' : 'Salvar Cadastro'}</Text>
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
  button: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
