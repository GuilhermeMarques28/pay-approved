import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

interface Contract {
  id: string;
  name: string;
  totalAmount: number;
  installments: number;
  paidInstallments: number;
  nextDueDate: string;
  status: 'active' | 'completed' | 'overdue';
}

interface DashboardStats {
  totalContracts: number;
  activeContracts: number;
  totalDebt: number;
  nextPayment: string;
}

export function DashboardScreen() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => ({ totalContracts: 0, activeContracts: 0, totalDebt: 0, nextPayment: '' }),
  });

  const { data: contracts = [] } = useQuery<Contract[]>({
    queryKey: ['contracts'],
    queryFn: async () => [],
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando painel...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Painel de Controle</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="document-text-outline" size={24} color="#2563eb" />
          <Text style={styles.statValue}>{stats?.totalContracts ?? 0}</Text>
          <Text style={styles.statLabel}>Contratos</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#16a34a" />
          <Text style={styles.statValue}>{stats?.activeContracts ?? 0}</Text>
          <Text style={styles.statLabel}>Ativos</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={24} color="#f59e0b" />
          <Text style={styles.statValue}>R$ {(stats?.totalDebt ?? 0).toFixed(2)}</Text>
          <Text style={styles.statLabel}>Dívida Total</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={24} color="#8b5cf6" />
          <Text style={styles.statValue}>{stats?.nextPayment || '---'}</Text>
          <Text style={styles.statLabel}>Próximo Pagamento</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Meus Contratos</Text>
      {contracts.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum contrato encontrado</Text>
      ) : (
        contracts.map((contract) => (
          <View key={contract.id} style={styles.contractCard}>
            <View style={styles.contractHeader}>
              <Text style={styles.contractName}>{contract.name}</Text>
              <Text style={[styles.contractStatus, { color: contract.status === 'active' ? '#16a34a' : contract.status === 'overdue' ? '#dc2626' : '#6b7280' }]}>{contract.status}</Text>
            </View>
            <View style={styles.contractDetails}>
              <Text style={styles.contractDetail}>R$ {contract.totalAmount.toFixed(2)}</Text>
              <Text style={styles.contractDetail}>{contract.paidInstallments}/{contract.installments} parcelas</Text>
              <Text style={styles.contractDetail}>Próximo vencimento: {contract.nextDueDate}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1e3a8a' },
  loading: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, width: '48%', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1e3a8a' },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 20 },
  contractCard: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  contractHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  contractName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  contractStatus: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  contractDetails: { gap: 4 },
  contractDetail: { fontSize: 13, color: '#4b5563' },
});