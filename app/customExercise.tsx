import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, globalStyles } from "./styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export type CustomWorkout = {
  id: string;
  name: string;
  exercises: {
    type: string;
    name: string;
    sets: number;
    reps: number;
  }[];
};

export const STORAGE_KEY = "@custom_workouts";

export default function CustomExercise() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<CustomWorkout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<CustomWorkout | null>(
    null
  );

  const loadWorkouts = async () => {
    try {
      const savedWorkouts = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedWorkouts) {
        setWorkouts(JSON.parse(savedWorkouts));
      }
    } catch (error) {
      console.error("Error loading workouts:", error);
    }
  };

  // Load workouts on initial mount
  useEffect(() => {
    loadWorkouts();
  }, []);

  // Reload workouts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const handleAddWorkout = () => {
    router.push("/createWorkout");
  };

  const handleEditWorkout = (workoutId: string) => {
    router.push({
      pathname: "/editWorkout",
      params: { id: workoutId },
    });
  };

  const handleStartWorkout = (workoutId: string) => {
    const workout = workouts.find((w) => w.id === workoutId);
    if (workout) {
      router.push({
        pathname: "/camera",
        params: {
          workoutId: workoutId,
          exercises: JSON.stringify(workout.exercises),
        },
      });
    }
  };

  const handleDeleteAllWorkouts = () => {
    Alert.alert(
      "Delete All Workouts",
      "Are you sure you want to delete all workouts? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEY);
              setWorkouts([]);
            } catch (error) {
              console.error("Error deleting workouts:", error);
              Alert.alert("Error", "Failed to delete workouts");
            }
          },
        },
      ]
    );
  };

  const handleWorkoutPress = (workout: CustomWorkout) => {
    setSelectedWorkout(workout);
  };

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <View style={styles.header}>
        <Text style={[globalStyles.title, styles.title]}>Custom Workouts</Text>
        {workouts.length > 0 && (
          <TouchableOpacity
            style={styles.deleteAllButton}
            onPress={handleDeleteAllWorkouts}
          >
            <Ionicons name="trash-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {workouts.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No workouts yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first workout to get started
              </Text>
            </View>
          ) : (
            <View style={styles.workoutList}>
              {workouts.map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  style={styles.workoutCard}
                  onPress={() => handleWorkoutPress(workout)}
                >
                  <Text style={styles.workoutTitle}>{workout.name}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={selectedWorkout !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedWorkout(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Start Exercise</Text>
            <Text style={styles.modalWorkoutName}>{selectedWorkout?.name}</Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                if (selectedWorkout) {
                  handleStartWorkout(selectedWorkout.id);
                  setSelectedWorkout(null);
                }
              }}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startButtonGradient}
              >
                <Text style={globalStyles.buttonText}>Start Workout</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                if (selectedWorkout) {
                  handleEditWorkout(selectedWorkout.id);
                  setSelectedWorkout(null);
                }
              }}
            >
              <Text style={styles.editButtonText}>Edit Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedWorkout(null)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.addButton} onPress={handleAddWorkout}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addButtonGradient}
        >
          <Text style={[globalStyles.buttonText, styles.addButtonText]}>
            Add Exercise +
          </Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  deleteAllButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    marginBottom: 0,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyStateText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: COLORS.lightGray,
    fontSize: 16,
    textAlign: "center",
  },
  workoutList: {
    gap: 20,
  },
  workoutCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 15,
    padding: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  workoutTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 20,
    padding: 24,
    width: "90%",
    alignItems: "center",
  },
  modalHeader: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalWorkoutName: {
    color: COLORS.white,
    fontSize: 20,
    marginBottom: 24,
  },
  startButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  startButtonGradient: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    width: "100%",
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    width: "100%",
    padding: 16,
    alignItems: "center",
  },
  closeButtonText: {
    color: COLORS.lightGray,
    fontSize: 16,
  },
  addButtonText: {
    fontSize: 18,
  },
  addButton: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: "hidden",
    height: 60,
  },
  addButtonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
