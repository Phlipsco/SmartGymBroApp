import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";
import { COLORS, globalStyles } from '../styles/globalStyles';

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
    return (
      <SafeAreaView style={globalStyles.container}>
        <Text style={globalStyles.title}>Exercise not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.container, styles.container]}>
      <Text style={globalStyles.title}>{exercise.title}</Text>
      <View style={styles.videoContainer}>
        <WebView
          style={styles.video}
          source={{ uri: exercise.video }}
          allowsFullscreenVideo
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={globalStyles.primaryButton}
          onPress={() => router.push("/camera")}
        >
          <Text style={globalStyles.buttonText}>Start Exercising Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={globalStyles.secondaryButton}
          onPress={() => router.push("/camera")}
        >
          <Text style={[globalStyles.buttonText, { color: COLORS.primary }]}>
            Don't Show Again
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: COLORS.darkGray,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  video: {
    flex: 1,
  },
  buttonContainer: {
    gap: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
});
