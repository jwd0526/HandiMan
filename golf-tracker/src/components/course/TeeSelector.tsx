import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { ChevronDown, Plus } from "lucide-react-native";
import { Course } from "shared";
import { FormInput } from "../FormInput";
import { FormButton } from "../FormButton";

interface TeeSelectorProps {
  course: Course;
  selectedTee: string;
  onTeeSelect: (tee: string) => void;
  onAddTee: (teeData: {
    name: string;
    rating: number;
    slope: number;
    numberOfFairways: number;
  }) => Promise<Course>;
}

export function TeeSelector({
  course,
  selectedTee,
  onTeeSelect,
  onAddTee,
}: TeeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenDropdown = () => {
    if (course.tees.length === 0) {
      setShowAddModal(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Tee</Text>

      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={handleOpenDropdown}
      >
        <Text style={styles.selectedText}>{selectedTee || "Select a tee"}</Text>
        <ChevronDown size={20} color="#666" />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          {course.tees.map((tee) => (
            <TouchableOpacity
              key={tee.name}
              style={styles.dropdownItem}
              onPress={() => {
                onTeeSelect(tee.name);
                setIsOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  selectedTee === tee.name && styles.selectedDropdownText,
                ]}
              >
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

      <AddTeeModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={async (teeData) => {
          setLoading(true);
          try {
            await onAddTee(teeData);
            setShowAddModal(false);
            onTeeSelect(teeData.name);
          } catch (error) {
            Alert.alert("Error", "Failed to add tee");
          } finally {
            setLoading(false);
          }
        }}
        loading={loading}
      />
    </View>
  );
}

interface AddTeeModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (teeData: {
    name: string;
    rating: number;
    slope: number;
    numberOfFairways: number;
  }) => Promise<void>;
  loading: boolean;
}

function AddTeeModal({ visible, onClose, onAdd, loading }: AddTeeModalProps) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [slope, setSlope] = useState("");
  const [fairways, setFairways] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = "Tee color/name is required";
    if (!rating) {
      newErrors.rating = "Course rating is required";
    } else if (isNaN(Number(rating)) || Number(rating) < 0) {
      newErrors.rating = "Please enter a valid rating";
    }
    if (!slope) {
      newErrors.slope = "Slope rating is required";
    } else if (
      isNaN(Number(slope)) ||
      Number(slope) < 55 ||
      Number(slope) > 155
    ) {
      newErrors.slope = "Slope must be between 55 and 155";
    }
    if (!fairways) {
      newErrors.fairways = "Number of fairways is required";
    } else if (
      isNaN(Number(fairways)) ||
      Number(fairways) < 0 ||
      Number(fairways) > 18
    ) {
      newErrors.fairways = "Must be between 0 and 18";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    await onAdd({
      name: name.trim(),
      rating: Number(rating),
      slope: Number(slope),
      numberOfFairways: Number(fairways),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Tee</Text>

          <FormInput
            label="Tee Color/Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Blue"
            error={errors.name}
            editable={!loading}
          />

          <FormInput
            label="Course Rating"
            value={rating}
            onChangeText={setRating}
            placeholder="e.g., 72.1"
            keyboardType="decimal-pad"
            error={errors.rating}
            editable={!loading}
          />

          <FormInput
            label="Slope Rating"
            value={slope}
            onChangeText={setSlope}
            placeholder="e.g., 125"
            keyboardType="number-pad"
            error={errors.slope}
            editable={!loading}
          />

          <FormInput
            label="Number of Fairways"
            value={fairways}
            onChangeText={setFairways}
            placeholder="e.g., 14"
            keyboardType="number-pad"
            error={errors.fairways}
            editable={!loading}
          />

          <View style={styles.modalButtons}>
            <FormButton
              style={styles.modalButton}
              title="Cancel"
              onPress={onClose}
              variant="secondary"
              loading={loading}
            />
            <FormButton
              style={styles.modalButton}
              title="Add Tee"
              onPress={handleSubmit}
              loading={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  selectedText: {
    fontSize: 16,
    color: "#333",
  },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  selectedDropdownText: {
    color: "#2f95dc",
    fontWeight: "600",
  },
  teeDetails: {
    fontSize: 14,
    color: "#666",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 8,
  },
  addButtonText: {
    color: "#2f95dc",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    minWidth: 120,
  },
});
