import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, globalStyles } from "./styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { CustomWorkout, STORAGE_KEY } from "./customExercise";
import AsyncStorage from "@react-native-async-storage/async-storage";

const availableExercises = [
  { id: "bicep-curls", name: "Bicep Curls" },
  { id: "lunges", name: "Lunges" },
  { id: "squats", name: "Squats" },
  { id: "push-ups", name: "Push-ups" },
  { id: "plank", name: "Plank" },
  { id: "crunches", name: "Crunches" },
  { id: "mountain-climbers", name: "Mountain Climbers" },
  { id: "jumping-jacks", name: "Jumping Jacks" },
  { id: "burpees", name: "Burpees" },
  { id: "lateral-raises", name: "Lateral Raises" },
];

type Exercise = {
  type: string;
  name: string;
  sets: number;
  reps: number;
};

export default function CreateWorkout() {
  const router = useRouter();
  const [workoutName, setWorkoutName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [showNameError, setShowNameError] = useState(false);

  const validateWorkoutName = (name: string) => {
    const isValid = name.trim().length > 0;
    setShowNameError(!isValid);
    return isValid;
  };

  const handleNameChange = (text: string) => {
    setWorkoutName(text);
    validateWorkoutName(text);
  };

  const handleAddExercise = (exercise: { id: string; name: string }) => {
    setCurrentExercise({
      type: exercise.id,
      name: exercise.name,
      sets: 3,
      reps: 12,
    });
    setShowExerciseModal(true);
  };

  const handleSaveExercise = () => {
    if (currentExercise) {
      setSelectedExercises([...selectedExercises, currentExercise]);
      setCurrentExercise(null);
      setShowExerciseModal(false);
    }
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleSaveWorkout = async () => {
    let hasErrors = false;
    let errorMessages = [];

    if (!validateWorkoutName(workoutName)) {
      hasErrors = true;
      errorMessages.push("Please enter a workout name");
    }

    if (selectedExercises.length === 0) {
      hasErrors = true;
      errorMessages.push("Please add at least one exercise");
    }

    if (hasErrors) {
      Alert.alert("Cannot Save Workout", errorMessages.join("\n"), [
        { text: "OK" },
      ]);
      return;
    }

    try {
      const savedWorkouts = await AsyncStorage.getItem(STORAGE_KEY);
      const workouts = savedWorkouts
        ? (JSON.parse(savedWorkouts) as CustomWorkout[])
        : [];

      const newWorkout: CustomWorkout = {
        id: Date.now().toString(),
        name: workoutName.trim(),
        exercises: selectedExercises,
      };

      const updatedWorkouts = [...workouts, newWorkout];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWorkouts));
      Alert.alert("Success", "Workout saved successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert("Error", "Failed to save workout");
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[globalStyles.title, styles.title]}>Create Workout</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Workout Name</Text>
            <TextInput
              style={[styles.input, showNameError && styles.inputError]}
              value={workoutName}
              onChangeText={handleNameChange}
              onBlur={() => validateWorkoutName(workoutName)}
              placeholder="Enter workout name"
              placeholderTextColor={COLORS.lightGray}
            />
            {showNameError && (
              <Text style={styles.errorText}>Please enter a workout name</Text>
            )}
          </View>

          <View style={styles.exercisesContainer}>
            <Text style={styles.sectionTitle}>Selected Exercises</Text>
            {selectedExercises.map((exercise, index) => (
              <View key={index} style={styles.selectedExercise}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.sets} sets × {exercise.reps} reps
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveExercise(index)}
                  style={styles.removeButton}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Available Exercises</Text>
          <View style={styles.exerciseGrid}>
            {availableExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseButton}
                onPress={() => handleAddExercise(exercise)}
              >
                <Text style={styles.exerciseButtonText}>{exercise.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Exercise Configuration Modal */}
      {showExerciseModal && currentExercise && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentExercise.name}</Text>

            <View style={styles.modalInputs}>
              <View style={styles.counterContainer}>
                <Text style={styles.counterLabel}>Sets</Text>
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() =>
                      setCurrentExercise({
                        ...currentExercise,
                        sets: Math.max(1, currentExercise.sets - 1),
                      })
                    }
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>
                    {currentExercise.sets}
                  </Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() =>
                      setCurrentExercise({
                        ...currentExercise,
                        sets: currentExercise.sets + 1,
                      })
                    }
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.counterContainer}>
                <Text style={styles.counterLabel}>Reps</Text>
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() =>
                      setCurrentExercise({
                        ...currentExercise,
                        reps: Math.max(1, currentExercise.reps - 1),
                      })
                    }
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>
                    {currentExercise.reps}
                  </Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() =>
                      setCurrentExercise({
                        ...currentExercise,
                        reps: currentExercise.reps + 1,
                      })
                    }
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowExerciseModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSaveExercise}
              >
                <Text style={styles.modalButtonTextPrimary}>Add Exercise</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkout}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.saveButtonGradient}
        >
          <Text style={globalStyles.buttonText}>Save Workout</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 16,
    color: COLORS.white,
    fontSize: 16,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 24,
  },
  exercisesContainer: {
    marginBottom: 24,
  },
  selectedExercise: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 4,
  },
  exerciseDetails: {
    color: COLORS.primary,
    fontSize: 14,
  },
  removeButton: {
    padding: 4,
  },
  exerciseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  exerciseButton: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 16,
    width: "48%",
    alignItems: "center",
  },
  exerciseButtonText: {
    color: COLORS.white,
    fontSize: 14,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 20,
    padding: 24,
    width: "90%",
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  modalInputs: {
    marginBottom: 24,
  },
  counterContainer: {
    marginBottom: 20,
  },
  counterLabel: {
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 12,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 12,
    padding: 8,
  },
  counterButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  counterButtonText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  counterValue: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalButtonTextPrimary: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  inputError: {
    borderColor: COLORS.error || "#ff4444",
    borderWidth: 1,
  },
  errorText: {
    color: COLORS.error || "#ff4444",
    fontSize: 12,
    marginTop: 4,
  },
});
