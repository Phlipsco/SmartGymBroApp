import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";

const exercises = {
  "bicep-curls": {
    title: "Bicep Curls",
    video: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
  },
  lunges: {
    title: "Lunges",
    video: "https://www.youtube.com/embed/QOVaHwm-Q6U",
  },
  butterfly: {
    title: "Butterfly",
    video: "https://youtu.be/XPPfnSEATJA",
  },
};

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const exercise = exercises[id as keyof typeof exercises];

  if (!exercise) {
    return <Text>Exercise not found</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exercise.title}</Text>
      <View style={styles.videoContainer}>
        <WebView
          style={styles.video}
          source={{ uri: exercise.video }}
          allowsFullscreenVideo
        />
      </View>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => router.push("/camera")}
      >
        <Text style={styles.startButtonText}>Start Exercising Now</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.dontShowAgainnBtn}
        onPress={() => router.push("/camera")}
      >
        <Text style={styles.dontShowAgainnText}>Dont Show Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  videoContainer: {
    flex: 1,
    marginBottom: 20,
  },
  video: {
    flex: 1,
  },
  startButton: {
    backgroundColor: "#007AFF",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  dontShowAgainnBtn: {
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  dontShowAgainnText: {
    color: "black",
    fontSize: 18,
    fontWeight: "600",
  },
});
