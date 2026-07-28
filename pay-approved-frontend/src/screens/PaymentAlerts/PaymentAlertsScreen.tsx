import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

interface PaymentAlert {
  id: string;
  title: string;
  message: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
}

export function PaymentAlertsScreen() {
  const { data: alerts = [], isLoading } = useQuery<PaymentAlert[]>({
    queryKey: ['payment-alerts'],
    queryFn: async () => [],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#16a34a';
      case 'overdue': return '#dc2626';
      default: return '#f59e0b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return 'checkmark-circle';
      case 'overdue': return 'alert-circle';
      default: return 'time';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando alertas...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Alertas de Pagamento</Text>
      <Text style={styles.subtitle}>Acompanhe suas parcelas e datas de vencimento</Text>

      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>Nenhum alerta de pagamento no momento</Text>
        </View>
      ) : (
        alerts.map((alert) => (
          <View key={alert.id} style={[styles.alertCard, { borderLeftColor: getStatusColor(alert.status) }]}>
            <View style={styles.alertHeader}>
              <Ionicons name={getStatusIcon(alert.status) as any} size={20} color={getStatusColor(alert.status)} />
              <Text style={styles.alertTitle}>{alert.title}</Text>
            </View>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            <View style={styles.alertFooter}>
              <Text style={styles.alertDate}>📅 {alert.dueDate}</Text>
              <Text style={styles.alertAmount}>R$ {alert.amount.toFixed(2)}</Text>
              <Text style={[styles.alertStatus, { color: getStatusColor(alert.status) }]}>{alert.status}</Text>
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
  loading: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { marginTop: 12, color: '#9ca3af', fontSize: 14 },
  alertCard: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  alertTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  alertMessage: { fontSize: 13, color: '#4b5563', marginBottom: 12 },
  alertFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  alertDate: { fontSize: 12, color: '#6b7280' },
  alertAmount: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },
  alertStatus: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
});