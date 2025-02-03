import React, { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { CustomWorkout } from "./customExercise";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@custom_workouts";

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

export default function EditWorkout() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const workoutId = params.id as string;

  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<
    number | null
  >(null);
  const [showNameError, setShowNameError] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    try {
      const savedWorkouts = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedWorkouts) {
        const workouts = JSON.parse(savedWorkouts) as CustomWorkout[];
        const workout = workouts.find((w) => w.id === workoutId);
        if (workout) {
          setWorkoutName(workout.name);
          setExercises(workout.exercises);
        }
      }
    } catch (error) {
      console.error("Error loading workout:", error);
    }
  };

  const handleAddExercise = (exercise: { id: string; name: string }) => {
    setCurrentExercise({
      type: exercise.id,
      name: exercise.name,
      sets: 3,
      reps: 12,
    });
    setEditingExerciseIndex(null);
    setShowExerciseModal(true);
  };

  const handleEditExercise = (index: number) => {
    setCurrentExercise(exercises[index]);
    setEditingExerciseIndex(index);
    setShowExerciseModal(true);
  };

  const handleSaveExercise = () => {
    if (currentExercise) {
      if (editingExerciseIndex !== null) {
        // Edit existing exercise
        const newExercises = [...exercises];
        newExercises[editingExerciseIndex] = currentExercise;
        setExercises(newExercises);
      } else {
        // Add new exercise
        setExercises([...exercises, currentExercise]);
      }
      setCurrentExercise(null);
      setEditingExerciseIndex(null);
      setShowExerciseModal(false);
    }
  };

  const handleRemoveExercise = (index: number) => {
    Alert.alert(
      "Remove Exercise",
      "Are you sure you want to remove this exercise?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setExercises(exercises.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const handleSaveWorkout = async () => {
    let hasErrors = false;
    let errorMessages = [];

    if (!workoutName.trim()) {
      hasErrors = true;
      errorMessages.push("Please enter a workout name");
      setShowNameError(true);
    }

    if (exercises.length === 0) {
      hasErrors = true;
      errorMessages.push("Please add at least one exercise");
    }

    if (hasErrors) {
      Alert.alert("Cannot Save Changes", errorMessages.join("\n"), [
        { text: "OK" },
      ]);
      return;
    }

    try {
      const savedWorkouts = await AsyncStorage.getItem(STORAGE_KEY);
      if (!savedWorkouts) {
        throw new Error("No workouts found");
      }

      const workouts = JSON.parse(savedWorkouts) as CustomWorkout[];
      const workoutIndex = workouts.findIndex((w) => w.id === workoutId);

      if (workoutIndex === -1) {
        throw new Error("Workout not found");
      }

      workouts[workoutIndex] = {
        ...workouts[workoutIndex],
        name: workoutName.trim(),
        exercises: exercises,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
      Alert.alert("Success", "Changes saved successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert("Error", "Failed to save changes");
    }
  };

  const handleDeleteWorkout = async () => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const savedWorkouts = await AsyncStorage.getItem(STORAGE_KEY);
              if (!savedWorkouts) {
                throw new Error("No workouts found");
              }

              const workouts = JSON.parse(savedWorkouts) as CustomWorkout[];
              const updatedWorkouts = workouts.filter(
                (w) => w.id !== workoutId
              );
              await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(updatedWorkouts)
              );
              Alert.alert("Success", "Workout deleted successfully!", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error("Error deleting workout:", error);
              Alert.alert("Error", "Failed to delete workout");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[globalStyles.title, styles.title]}>Edit Workout</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteWorkout}
            >
              <Ionicons name="trash-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Workout Name</Text>
            <TextInput
              style={[styles.input, showNameError && styles.inputError]}
              value={workoutName}
              onChangeText={(text) => {
                setWorkoutName(text);
                setShowNameError(!text.trim());
              }}
              onBlur={() => setShowNameError(!workoutName.trim())}
              placeholder="Enter workout name"
              placeholderTextColor={COLORS.lightGray}
            />
            {showNameError && (
              <Text style={styles.errorText}>Please enter a workout name</Text>
            )}
          </View>

          <View style={styles.exercisesContainer}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            {exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseItem}>
                <TouchableOpacity
                  style={styles.exerciseContent}
                  onPress={() => handleEditExercise(index)}
                >
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDetails}>
                      {exercise.sets} sets × {exercise.reps} reps
                    </Text>
                  </View>
                  <View style={styles.exerciseActions}>
                    <TouchableOpacity
                      onPress={() => handleEditExercise(index)}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoveExercise(index)}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowExerciseModal(true)}
          >
            <Text style={styles.addButtonText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Exercise Selection/Edit Modal */}
      {showExerciseModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingExerciseIndex !== null ? "Edit Exercise" : "Add Exercise"}
            </Text>

            {!currentExercise ? (
              <ScrollView style={styles.exerciseList}>
                {availableExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.exerciseOption}
                    onPress={() => handleAddExercise(exercise)}
                  >
                    <Text style={styles.exerciseOptionText}>
                      {exercise.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
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
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowExerciseModal(false);
                  setCurrentExercise(null);
                  setEditingExerciseIndex(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              {currentExercise && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleSaveExercise}
                >
                  <Text style={styles.modalButtonTextPrimary}>
                    {editingExerciseIndex !== null
                      ? "Save Changes"
                      : "Add Exercise"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveWorkout}
        disabled={!workoutName.trim() || exercises.length === 0}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.saveButtonGradient}
        >
          <Text style={globalStyles.buttonText}>Save Changes</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
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
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  exercisesContainer: {
    marginBottom: 24,
  },
  exerciseItem: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  exerciseContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
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
  exerciseActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  addButton: {
    backgroundColor: "rgba(255, 122, 0, 0.1)",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
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
    maxHeight: "80%",
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  exerciseList: {
    marginBottom: 24,
  },
  exerciseOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  exerciseOptionText: {
    color: COLORS.white,
    fontSize: 16,
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
    bottom: 20,
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
});
