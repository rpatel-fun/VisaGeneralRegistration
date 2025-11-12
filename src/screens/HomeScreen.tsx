import React from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {Container} from '../components/Container';
import {Button} from '../components/Button';
import {useAuth} from '../context/AuthContext';

export const HomeScreen: React.FC = () => {
  const {user, logout} = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
      {cancelable: true},
    );
  };

  if (!user) {
    return (
      <Container>
        <View style={styles.container}>
          <Text style={styles.errorText}>User data not available</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Welcome back!</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileSection}>
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.value} accessibilityLabel={`Email: ${user.email}`}>
              {user.email}
            </Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.label}>First Name</Text>
            <Text
              style={styles.value}
              accessibilityLabel={`First name: ${user.firstName}`}>
              {user.firstName}
            </Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.label}>Last Name</Text>
            <Text
              style={styles.value}
              accessibilityLabel={`Last name: ${user.lastName}`}>
              {user.lastName}
            </Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.label}>Phone Number</Text>
            <Text
              style={styles.value}
              accessibilityLabel={`Phone number: ${user.phoneNumber}`}>
              {user.phoneNumber}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
            testID="logout-button"
          />
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  profileSection: {
    marginBottom: 20,
  },
  profileSectionLast: {
    marginBottom: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
});

