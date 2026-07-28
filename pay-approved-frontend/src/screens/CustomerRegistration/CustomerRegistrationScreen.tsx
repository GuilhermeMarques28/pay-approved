import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

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

export function CustomerRegistrationScreen() {
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CustomerFormData>({
    resolver: yupResolver(customerSchema),
    defaultValues: { name: '', email: '', cpf: '', phone: '', address: '', city: '', state: '', zipCode: '' },
  });

  const name = watch('name');
  const email = watch('email');
  const cpf = watch('cpf');
  const phone = watch('phone');
  const address = watch('address');
  const city = watch('city');
  const state = watch('state');
  const zipCode = watch('zipCode');

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
    await new Promise((resolve) => setTimeout(resolve, 500));
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro do Cliente</Text>
      <Text style={styles.subtitle}>Preencha seus dados para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={name}
        onChangeText={(text) => setValue('name', text)}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(text) => setValue('email', text)}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="CPF"
        keyboardType="numeric"
        value={cpf}
        onChangeText={(text) => setValue('cpf', text)}
      />
      {errors.cpf && <Text style={styles.error}>{errors.cpf.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Telefone"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(text) => setValue('phone', text)}
      />
      {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Endereço"
        value={address}
        onChangeText={(text) => setValue('address', text)}
      />
      {errors.address && <Text style={styles.error}>{errors.address.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Cidade"
        value={city}
        onChangeText={(text) => setValue('city', text)}
      />
      {errors.city && <Text style={styles.error}>{errors.city.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Estado"
        value={state}
        onChangeText={(text) => setValue('state', text)}
      />
      {errors.state && <Text style={styles.error}>{errors.state.message}</Text>}

      <TextInput
        style={styles.input}
        placeholder="CEP"
        keyboardType="numeric"
        value={zipCode}
        onChangeText={(text) => setValue('zipCode', text)}
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
