import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const exercises = [
  {
    id: "bicep-curls",
    title: "Bicep Curls",
    video: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
  },
  {
    id: "lunges",
    title: "Lunges",
    video: "https://www.youtube.com/embed/QOVaHwm-Q6U",
  },
  {
    id: "butterfly",
    title: "Lateral Raises",
    video: "https://www.youtube.com/watch?v=XPPfnSEATJA",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, Philipp</Text>
          <TouchableOpacity onPress={() => alert("Settings pressed!")}>
            <Ionicons name="settings-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.exerciseList}>
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseButtonWrapper}
              onPress={() => router.push(`/exercise/${exercise.id}`)}
            >
              <LinearGradient
                colors={["#007AFF", "#00C6FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.exerciseButton}
              >
                <Text style={styles.exerciseButtonText}>{exercise.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center", // Center the content vertically
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    position: "absolute", // Keep header at the top
    top: 20,
    left: 20,
    right: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
  },
  exerciseList: {
    gap: 16,
  },
  exerciseButtonWrapper: {
    borderRadius: 10,
    overflow: "hidden", // Ensure the gradient follows rounded corners
  },
  exerciseButton: {
    padding: 20,
    alignItems: "center",
  },
  exerciseButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
