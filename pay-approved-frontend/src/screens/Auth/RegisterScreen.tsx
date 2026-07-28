import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/features/auth/context/auth-context';

const registerSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  cpf: yup.string().required('CPF é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório'),
  password: yup.string().min(6, 'Senha deve ter no mínimo 6 caracteres').required('Senha é obrigatória'),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

export function RegisterScreen() {
  const navigation = useNavigation();
  const { register: registerUser } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: { name: '', email: '', cpf: '', phone: '', password: '' },
  });

  const name = watch('name');
  const email = watch('email');
  const cpf = watch('cpf');
  const phone = watch('phone');
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    await registerUser(data);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pay Approved</Text>
        <Text style={styles.subtitle}>Crie sua conta</Text>

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
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={(text) => setValue('password', text)}
        />
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          <Text style={styles.buttonText}>{isSubmitting ? 'Cadastrando...' : 'Cadastrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <Text style={styles.link}>Já tem conta? Faça login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#1e3a8a' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32, color: '#6b7280' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 4, fontSize: 16 },
  error: { color: '#ef4444', fontSize: 12, marginBottom: 12 },
  button: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { marginTop: 16, textAlign: 'center', color: '#2563eb', fontSize: 14 },
});
