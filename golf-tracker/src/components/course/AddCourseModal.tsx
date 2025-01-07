// src/components/course/AddCourseModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { FormInput } from '../FormInput';
import { FormButton } from '../FormButton';
import { X as XIcon } from 'lucide-react-native';

interface AddCourseModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (courseData: {
    name: string;
    location: {
      city?: string;
      state?: string;
      country?: string;
    };
  }) => Promise<void>;
}

export function AddCourseModal({ visible, onClose, onAdd }: AddCourseModalProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleSubmit = async () => {
    const newErrors: {[key: string]: string} = {};
    if (!name.trim()) newErrors.name = 'Course name is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onAdd({
        name,
        location: {
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          country: country.trim() || undefined,
        }
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Course</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <XIcon size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalForm}>
            <FormInput
              label="Course Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter course name"
              error={errors.name}
              editable={!loading}
            />
            <FormInput
              label="City"
              value={city}
              onChangeText={setCity}
              placeholder="Enter city"
              editable={!loading}
            />
            <FormInput
              label="State/Province"
              value={state}
              onChangeText={setState}
              placeholder="Enter state/province"
              editable={!loading}
            />
            <FormInput
              label="Country"
              value={country}
              onChangeText={setCountry}
              placeholder="Enter country"
              editable={!loading}
            />
            
            <View style={styles.modalButtons}>
              <FormButton
                title="Cancel"
                onPress={onClose}
                variant="secondary"
                loading={loading}
              />
              <FormButton
                title="Add Course"
                onPress={handleSubmit}
                loading={loading}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    padding: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
});