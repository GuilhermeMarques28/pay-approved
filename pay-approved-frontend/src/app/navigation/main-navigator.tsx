import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Ionicons } from '@expo/vector-icons';

import { DashboardScreen } from '@/screens/Dashboard/DashboardScreen';
import { CustomerRegistrationScreen } from '@/screens/CustomerRegistration/CustomerRegistrationScreen';
import { ContractSigningScreen } from '@/screens/ContractSigning/ContractSigningScreen';
import { DocumentUploadScreen } from '@/screens/DocumentUpload/DocumentUploadScreen';
import { PaymentAlertsScreen } from '@/screens/PaymentAlerts/PaymentAlertsScreen';
import { AdminDashboardScreen } from '@/screens/Dashboard/AdminDashboardScreen';

const Tab = createBottomTabNavigator();
const ContractStack = createNativeStackNavigator();
const DocumentStack = createNativeStackNavigator();

function ContractStackNavigator() {
  return (
    <ContractStack.Navigator screenOptions={{ headerShown: true }}>
      <ContractStack.Screen name="ContractList" component={ContractSigningScreen} options={{ title: 'Contratos' }} />
      <ContractStack.Screen
        name="ContractDetail"
        component={ContractSigningScreen}
        options={{ title: 'Detalhes do Contrato' }}
      />
    </ContractStack.Navigator>
  );
}

function DocumentStackNavigator() {
  return (
    <DocumentStack.Navigator screenOptions={{ headerShown: true }}>
      <DocumentStack.Screen name="DocumentList" component={DocumentUploadScreen} options={{ title: 'Documentos' }} />
      <DocumentStack.Screen
        name="DocumentDetail"
        component={DocumentUploadScreen}
        options={{ title: 'Detalhes do Documento' }}
      />
    </DocumentStack.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'help-outline';
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Registration') {
            iconName = focused ? 'person-add' : 'person-add-outline';
          } else if (route.name === 'Contracts') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Documents') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'Alerts') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Registration" component={CustomerRegistrationScreen} options={{ title: 'Cadastro' }} />
      <Tab.Screen name="Contracts" component={ContractStackNavigator} />
      <Tab.Screen name="Documents" component={DocumentStackNavigator} />
      <Tab.Screen name="Alerts" component={PaymentAlertsScreen} options={{ title: 'Alertas' }} />
    </Tab.Navigator>
  );
}
