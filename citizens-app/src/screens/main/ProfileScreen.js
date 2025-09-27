import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/common/Input';
import AddressInput from '../../components/common/AddressInput';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';
import userService from '../../services/userService';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: null,
    lng: null,
    municipality_id: null,
  });
  const { signOut } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await userService.getUserProfile();
      setProfile(userData);
      setFormData({
        name: userData.name || '',
        address: userData.home_address || '',
        lat: userData.lat,
        lng: userData.lng,
        municipality_id: userData.municipality_id,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressSelect = (addressData) => {
    setFormData(prev => ({
      ...prev,
      address: addressData.address,
      lat: addressData.lat,
      lng: addressData.lng,
      municipality_id: addressData.municipality_id,
    }));
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      
      const updates = {};
      if (formData.name !== profile.name) {
        updates.name = formData.name.trim();
      }
      if (formData.address !== profile.home_address) {
        updates.home_address = formData.address;
      }
      if (formData.lat !== profile.lat) {
        updates.lat = formData.lat;
      }
      if (formData.lng !== profile.lng) {
        updates.lng = formData.lng;
      }
      if (formData.municipality_id !== profile.municipality_id) {
        updates.municipality_id = formData.municipality_id;
      }

      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }

      const updatedProfile = await userService.updateUserProfile(updates);
      setProfile(updatedProfile);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      address: profile.home_address || '',
      lat: profile.lat,
      lng: profile.lng,
      municipality_id: profile.municipality_id,
    });
    setIsEditing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut, style: 'destructive' },
      ]
    );
  };

  const navigateToMyReports = () => {
    navigation.navigate('MyReports');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadProfile}
        retryText="Retry"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons 
            name={isEditing ? 'close' : 'pencil'} 
            size={20} 
            color="#2196F3" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#fff" />
          </View>
          <Text style={styles.email}>{profile?.email}</Text>
          <Text style={styles.role}>Citizen</Text>
        </View>

        <View style={styles.form}>
          {isEditing ? (
            <>
              <Input
                label="Full Name"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                placeholder="Enter your full name"
              />

              <AddressInput
                label="Home Address"
                value={formData.address}
                onAddressSelect={handleAddressSelect}
                placeholder="Enter your home address"
                showGPSOption={true}
                required={false}
              />

              <View style={styles.buttonContainer}>
                <Button
                  title="Save"
                  onPress={handleSave}
                  loading={updating}
                  style={styles.saveButton}
                />
                <Button
                  title="Cancel"
                  onPress={handleCancel}
                  variant="outline"
                  style={styles.cancelButton}
                />
              </View>
            </>
          ) : (
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{profile?.name || 'Not provided'}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Home Address</Text>
                <Text style={styles.infoValue}>
                  {profile?.home_address || 'Not provided'}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Municipality</Text>
                <Text style={styles.infoValue}>
                  {profile?.municipalities?.name || 'Not assigned'}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {formatDate(profile?.created_at)}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={navigateToMyReports}
          >
            <Ionicons name="document-text-outline" size={24} color="#2196F3" />
            <Text style={styles.actionText}>My Reports</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color="#F44336" />
            <Text style={[styles.actionText, styles.signOutText]}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
  },
  infoContainer: {
    gap: 20,
  },
  infoItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actions: {
    backgroundColor: '#fff',
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  signOutButton: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#F44336',
  },
});

export default ProfileScreen;