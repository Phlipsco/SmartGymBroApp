import { Text, View, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import { COLORS, globalStyles } from "./styles/globalStyles";
import BicepCurl from "@/assets/icons/BicepCurl";
import LateralRaises from "@/assets/icons/LateralRaises";
import Lunges from "@/assets/icons/Lunges";

const exercises = [
  {
    id: "bicep-curls",
    title: "Bicep Curls",
    video: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    icon: <BicepCurl style={{ width: 30, height: 30 }} />,
  },
  {
    id: "lunges",
    title: "Lunges",
    video: "https://www.youtube.com/embed/QOVaHwm-Q6U",
    icon: <Lunges style={{ width: 30, height: 30 }} />,
  },
  {
    id: "butterfly",
    title: "Lateral Raises",
    video: "https://www.youtube.com/watch?v=XPPfnSEATJA",
    icon: <LateralRaises style={{ width: 30, height: 30 }} />,
  },
];

const motivationalMessages = [
  "Push yourself, because no one else will do it for you!",
  "Great things never come from comfort zones.",
  "Don't limit your challenges. Challenge your limits!",
  "The body achieves what the mind believes.",
  "Strive for progress, not perfection.",
];

export default function Home() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<{
    id: string;
    title: string;
    video: string;
  } | null>(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(12);
  const [streak, setStreak] = useState(1);
  const [motivationalMessage, setMotivationalMessage] = useState("");

  useEffect(() => {
    // Randomize motivational message on screen load
    const randomMessage =
      motivationalMessages[
        Math.floor(Math.random() * motivationalMessages.length)
      ];
    setMotivationalMessage(randomMessage);
  }, []);

  const handleExercisePress = (exercise: any) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const handleStartExercise = () => {
    setModalVisible(false);
    setStreak(streak + 1);
    if (selectedExercise) {
      console.log("Starting exercise with:", { sets, reps });
      router.push({
        pathname: "/camera",
        params: {
          sets: sets.toString(),
          reps: reps.toString(),
        },
      });
    }
  };

  const handleShowDemo = () => {
    setModalVisible(false);
    if (selectedExercise) {
      router.push({
        pathname: `/exercise/[id]`,
        params: {
          id: selectedExercise.id,
          sets: sets.toString(),
          reps: reps.toString(),
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[globalStyles.title, styles.greeting]}>
            Hello, Philipp
          </Text>
          <TouchableOpacity onPress={() => alert("Settings pressed!")}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Streak View */}
        <View style={styles.streakView}>
          <Ionicons name="flame-outline" size={32} color={COLORS.primary} />
          <Text style={[globalStyles.subtitle, styles.streakText]}>
            Streak: {streak} days
          </Text>
        </View>

        {/* Motivational Message */}
        <View style={styles.messageView}>
          <Text style={styles.motivationalMessage}>{motivationalMessage}</Text>
        </View>

        {/* Exercise List */}
        <View style={styles.exerciseList}>
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseButtonWrapper}
              onPress={() => handleExercisePress(exercise)}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.exerciseButton}
              >
                {exercise.icon}
                <Text
                  style={[globalStyles.buttonText, styles.exerciseButtonText]}
                >
                  {exercise.title}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={[globalStyles.title, styles.modalTitle]}>
                {selectedExercise?.title}
              </Text>

              {/* Counter Container */}
              <View style={styles.counterContainer}>
                <View style={styles.counterSection}>
                  <Text style={[globalStyles.subtitle, styles.counterLabel]}>
                    Sets
                  </Text>
                  <View style={styles.counterControls}>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => setSets(Math.max(1, sets - 1))}
                    >
                      <Text style={styles.counterButtonText}>-</Text>
                    </TouchableOpacity>
                    <View style={styles.counterValueContainer}>
                      <Text style={[globalStyles.title, styles.counterValue]}>
                        {sets}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => setSets(sets + 1)}
                    >
                      <Text style={styles.counterButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.counterSection}>
                  <Text style={[globalStyles.subtitle, styles.counterLabel]}>
                    Reps
                  </Text>
                  <View style={styles.counterControls}>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => setReps(Math.max(1, reps - 1))}
                    >
                      <Text style={styles.counterButtonText}>-</Text>
                    </TouchableOpacity>
                    <View style={styles.counterValueContainer}>
                      <Text style={[globalStyles.title, styles.counterValue]}>
                        {reps}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => setReps(reps + 1)}
                    >
                      <Text style={styles.counterButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={handleShowDemo}
                >
                  <Text
                    style={[globalStyles.buttonText, styles.demoButtonText]}
                  >
                    Show me how
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.startButton}
                  onPress={handleStartExercise}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.startButtonGradient}
                  >
                    <Text style={globalStyles.buttonText}>Start Exercise</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: COLORS.dark,
    paddingTop: 16,
  },

  container: {
    width: "95%",
    margin: 0,
    marginHorizontal: "auto",
    display: "flex",
    justifyContent: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },

  exerciseList: {
    padding: 24,
    gap: 20,
  },

  exerciseButtonWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.darkGray,
    marginVertical: 8,

    elevation: 8,
    transform: [{ scale: 1 }],
  },

  exerciseButton: {
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  exerciseButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.white,
    letterSpacing: 0.5,
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(26, 26, 26, 0.95)",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: COLORS.darkGray,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    width: "100%",
    alignItems: "center",
    elevation: 10,
  },

  modalTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 32,
    textAlign: "center",
  },

  counterContainer: {
    width: "100%",
    marginBottom: 32,
  },

  counterSection: {
    marginBottom: 24,
    backgroundColor: "rgba(26, 26, 26, 0.5)",
    borderRadius: 20,
    padding: 24,
  },

  counterLabel: {
    marginBottom: 8,
  },

  counterControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },

  counterButton: {
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },

  counterButtonText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "600",
  },

  counterValueContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  counterValue: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 0,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 16,
    marginTop: 24,
    width: "100%",
  },

  demoButton: {
    flex: 1,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 122, 71, 0.15)",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 20,
  },

  demoButtonText: {
    color: COLORS.white,
  },

  startButton: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },

  startButtonGradient: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  closeButton: {
    position: "absolute",
    top: 24,
    right: 24,
    padding: 16,
    backgroundColor: "rgba(26, 26, 26, 0.5)",
    borderRadius: 100,
  },

  streakView: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 22,
    paddingVertical: 12,
    paddingHorizontal: 0,
    maxWidth: "90%",
  },

  streakText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 0,
  },

  messageView: {
    paddingHorizontal: 32,
    marginVertical: 24,
  },

  motivationalMessage: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
});
