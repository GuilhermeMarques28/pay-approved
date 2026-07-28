import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AdminContract {
  id: string;
  customerName: string;
  customerEmail: string;
  contractName: string;
  totalAmount: number;
  installments: number;
  paidInstallments: number;
  nextDueDate: string;
  status: 'active' | 'completed' | 'overdue';
  documents: number;
}

export function AdminDashboardScreen() {
  const contracts: AdminContract[] = [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Painel Administrativo</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={24} color="#2563eb" />
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Clientes</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="document-text-outline" size={24} color="#16a34a" />
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Contratos Ativos</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="alert-circle-outline" size={24} color="#dc2626" />
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Atrasados</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="document-attach-outline" size={24} color="#8b5cf6" />
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Pendentes Análise</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Contratos Recentes</Text>
      {contracts.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum contrato cadastrado</Text>
      ) : (
        contracts.map((contract) => (
          <View key={contract.id} style={styles.contractCard}>
            <View style={styles.contractHeader}>
              <View>
                <Text style={styles.customerName}>{contract.customerName}</Text>
                <Text style={styles.customerEmail}>{contract.customerEmail}</Text>
              </View>
              <Text
                style={[
                  styles.contractStatus,
                  {
                    color:
                      contract.status === 'active' ? '#16a34a' : contract.status === 'overdue' ? '#dc2626' : '#6b7280',
                  },
                ]}
              >
                {contract.status}
              </Text>
            </View>
            <View style={styles.contractDetails}>
              <Text style={styles.contractDetail}>Contrato: {contract.contractName}</Text>
              <Text style={styles.contractDetail}>
                R$ {contract.totalAmount.toFixed(2)} | {contract.paidInstallments}/{contract.installments} parcelas
              </Text>
              <Text style={styles.contractDetail}>Próximo vencimento: {contract.nextDueDate}</Text>
              <Text style={styles.contractDetail}>Documentos: {contract.documents}</Text>
            </View>
            <View style={styles.contractActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Ver Detalhes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.approveButton]}>
                <Text style={styles.approveButtonText}>Aprovar</Text>
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
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1e3a8a' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1e3a8a' },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 20 },
  contractCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contractHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  customerName: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  customerEmail: { fontSize: 12, color: '#6b7280' },
  contractStatus: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  contractDetails: { gap: 4, marginBottom: 12 },
  contractDetail: { fontSize: 13, color: '#4b5563' },
  contractActions: { flexDirection: 'row', gap: 8 },
  actionButton: { backgroundColor: '#f3f4f6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  actionButtonText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  approveButton: { backgroundColor: '#16a34a' },
  approveButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
