// src/components/course/TeeSelector/index.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Alert 
} from 'react-native';
import { ChevronDown, Plus } from 'lucide-react-native';
import { Course } from 'shared';
import { FormInput } from '../../forms/FormInput';
import { FormButton } from '../../forms/FormButton';
import { useCourses } from '../../../hooks/useCourses';
import { styles } from './styles';

interface TeeSelectorProps {
  course: Course;
  selectedTee: string;
  onTeeSelect: (tee: string) => void;
  error?: string;
}

interface AddTeeFormData {
  name: string;
  rating: string;
  slope: string;
  numberOfFairways: string;
}

export function TeeSelector({
  course,
  selectedTee,
  onTeeSelect,
  error
}: TeeSelectorProps) {
  const { addTeeToCourse } = useCourses();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddTeeFormData>({
    name: '',
    rating: '',
    slope: '',
    numberOfFairways: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<AddTeeFormData>>({});

  const handleOpenDropdown = () => {
    if (course.tees.length === 0) {
      setShowAddModal(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const validateTeeForm = (): boolean => {
    const errors: Partial<AddTeeFormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Tee name is required';
    }
    
    if (!formData.rating) {
      errors.rating = 'Course rating is required';
    } else if (isNaN(Number(formData.rating)) || Number(formData.rating) < 60 || Number(formData.rating) > 80) {
      errors.rating = 'Rating must be between 60 and 80';
    }
    
    if (!formData.slope) {
      errors.slope = 'Slope rating is required';
    } else if (isNaN(Number(formData.slope)) || Number(formData.slope) < 55 || Number(formData.slope) > 155) {
      errors.slope = 'Slope must be between 55 and 155';
    }
    
    if (!formData.numberOfFairways) {
      errors.numberOfFairways = 'Number of fairways is required';
    } else if (isNaN(Number(formData.numberOfFairways)) || Number(formData.numberOfFairways) < 0 || Number(formData.numberOfFairways) > 18) {
      errors.numberOfFairways = 'Must be between 0 and 18';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddTee = async () => {
    if (!validateTeeForm()) return;
    
    setLoading(true);
    try {
      await addTeeToCourse(course._id, {
        name: formData.name.trim(),
        rating: Number(formData.rating),
        slope: Number(formData.slope),
        numberOfFairways: Number(formData.numberOfFairways)
      });
      
      setShowAddModal(false);
      onTeeSelect(formData.name.trim());
      
      // Reset form
      setFormData({
        name: '',
        rating: '',
        slope: '',
        numberOfFairways: ''
      });
      setFormErrors({});
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to add tee'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Tee</Text>

      <TouchableOpacity
        style={[styles.dropdown, error && styles.dropdownError]}
        onPress={handleOpenDropdown}
      >
        <Text style={[
          styles.dropdownText,
          !selectedTee && styles.placeholderText
        ]}>
          {selectedTee || "Select a tee"}
        </Text>
        <ChevronDown size={20} color="#666" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isOpen && (
        <View style={styles.dropdownMenu}>
          {course.tees.map((tee) => (
            <TouchableOpacity
              key={tee.name}
              style={styles.dropdownItem}
              onPress={() => {
                onTeeSelect(tee.name);
                setIsOpen(false);
              }}
            >
              <Text style={[
                styles.dropdownItemText,
                selectedTee === tee.name && styles.selectedItemText
              ]}>
                {tee.name}
              </Text>
              <Text style={styles.teeDetails}>
                {`${tee.rating} / ${tee.slope}`}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setIsOpen(false);
              setShowAddModal(true);
            }}
          >
            <Plus size={20} color="#2f95dc" />
            <Text style={styles.addButtonText}>Add New Tee</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Tee</Text>

            <FormInput
              label="Tee Color/Name"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="e.g., Blue"
              error={formErrors.name}
              editable={!loading}
            />

            <FormInput
              label="Course Rating"
              value={formData.rating}
              onChangeText={(text) => setFormData(prev => ({ ...prev, rating: text }))}
              placeholder="e.g., 72.1"
              keyboardType="decimal-pad"
              error={formErrors.rating}
              editable={!loading}
            />

            <FormInput
              label="Slope Rating"
              value={formData.slope}
              onChangeText={(text) => setFormData(prev => ({ ...prev, slope: text }))}
              placeholder="e.g., 125"
              keyboardType="numeric"
              error={formErrors.slope}
              editable={!loading}
            />

            <FormInput
              label="Number of Fairways"
              value={formData.numberOfFairways}
              onChangeText={(text) => setFormData(prev => ({ ...prev, numberOfFairways: text }))}
              placeholder="e.g., 14"
              keyboardType="numeric"
              error={formErrors.numberOfFairways}
              editable={!loading}
            />

            <View style={styles.modalButtons}>
              <FormButton
                title="Cancel"
                onPress={() => setShowAddModal(false)}
                variant="secondary"
                loading={loading}
                style={styles.modalButton}
              />
              <FormButton
                title="Add Tee"
                onPress={handleAddTee}
                loading={loading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}