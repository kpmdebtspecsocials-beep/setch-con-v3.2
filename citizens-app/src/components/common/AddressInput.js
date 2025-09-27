import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import addressService from '../../services/addressService';
import { useLocation } from '../../hooks/useLocation';

const AddressInput = ({
  label = 'Address',
  value = '',
  onAddressSelect,
  placeholder = 'Enter your address',
  showGPSOption = true,
  style,
  required = false,
  error,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);
  const { getCurrentLocation, reverseGeocode } = useLocation();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const searchAddresses = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      const results = await addressService.searchWards(
        query, 
        abortControllerRef.current.signal
      );
      setSuggestions(results.wards || []);
      setShowSuggestions(true);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Address search error:', err);
        setSuggestions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (text) => {
    setInputValue(text);
    addressService.debouncedSearch(text, searchAddresses, 300);
  };

  const handleSuggestionSelect = (suggestion) => {
    const addressText = `${suggestion.name}, ${suggestion.municipality?.name || ''}`;
    setInputValue(addressText);
    setShowSuggestions(false);
    Keyboard.dismiss();

    onAddressSelect?.({
      address: addressText,
      lat: suggestion.lat || null,
      lng: suggestion.lng || null,
      municipality_id: suggestion.municipality_id || null,
      ward_id: suggestion.ward_id || null,
    });
  };

  const handleGPSLocation = async () => {
    try {
      setGpsLoading(true);
      const location = await getCurrentLocation();
      const address = await reverseGeocode(location.latitude, location.longitude);
      setInputValue(address);
      setShowSuggestions(false);
      onAddressSelect?.({
        address,
        lat: location.latitude,
        lng: location.longitude,
        municipality_id: null,
        ward_id: null,
      });
    } catch (err) {
      console.error('GPS location error:', err);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (inputValue.length >= 3) setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <Ionicons name="location-outline" size={16} color="#666" />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionName}>{item.name}</Text>
        {item.municipality?.name && (
          <Text style={styles.suggestionMunicipality}>{item.municipality.name}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {!value && !inputValue && <Text style={styles.optional}>Optional</Text>}
      </View>

      <View style={[
        styles.inputContainer,
        isFocused && styles.focused,
        error && styles.error,
      ]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={inputValue}
          onChangeText={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline={Platform.OS === 'ios'}
          numberOfLines={Platform.OS === 'ios' ? 2 : 1}
        />
        
        <View style={styles.inputActions}>
          {loading && <ActivityIndicator size="small" color="#2196F3" style={styles.loadingIcon} />}
          {showGPSOption && (
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={handleGPSLocation}
              disabled={gpsLoading}
            >
              {gpsLoading ? <ActivityIndicator size="small" color="#2196F3" /> : <Ionicons name="location" size={20} color="#2196F3" />}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id || item.ward_id}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  labelContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 16, fontWeight: '600', color: '#333' },
  required: { color: '#F44336' },
  optional: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fff', minHeight: 48 },
  focused: { borderColor: '#2196F3' },
  error: { borderColor: '#F44336' },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#333', textAlignVertical: 'top' },
  inputActions: { flexDirection: 'row', alignItems: 'center', paddingRight: 12, paddingTop: 12 },
  loadingIcon: { marginRight: 8 },
  gpsButton: { padding: 4 },
  errorText: { marginTop: 4, fontSize: 14, color: '#F44336' },
  suggestionsContainer: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderTopWidth: 0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, maxHeight: 200, zIndex: 1000, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  suggestionsList: { flex: 1 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  suggestionContent: { marginLeft: 12, flex: 1 },
  suggestionName: { fontSize: 14, color: '#333', fontWeight: '500' },
  suggestionMunicipality: { fontSize: 12, color: '#666', marginTop: 2 },
});

export default AddressInput;
