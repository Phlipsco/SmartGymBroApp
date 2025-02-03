import React from "react";
import { Text, View, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, globalStyles } from "@/app/styles/globalStyles";

export default function QuickExerciseModal() {
  const [showQuickExerciseModal, setShowQuickExerciseModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<{
    id: string;
    title: string;
    video: string;
  } | null>(null);

  const handleExercisePress = (exercise: any) => {
    setSelectedExercise(exercise);
    setShowQuickExerciseModal(false);
    setModalVisible(true);
  };
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showQuickExerciseModal}
      onRequestClose={() => setShowQuickExerciseModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={[globalStyles.title, styles.modalTitle]}>
            Choose Exercise
          </Text>

          <View style={styles.quickExerciseList}>
            {exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.quickExerciseButton}
                onPress={() => handleExercisePress(exercise)}
              >
                <View style={styles.buttonContent}>
                  {exercise.icon}
                  <Text
                    style={[globalStyles.buttonText, styles.exerciseButtonText]}
                  >
                    {exercise.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowQuickExerciseModal(false)}
          >
            <Ionicons name="close" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
