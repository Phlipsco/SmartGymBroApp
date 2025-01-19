import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useState } from "react";
import { WebView } from "react-native-webview";
import { COLORS, globalStyles } from "../styles/globalStyles";

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
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, sets, reps } = useLocalSearchParams();
  const exercise = exercises[id as keyof typeof exercises];

  const exerciseConfig = {
    sets: parseInt(params.sets as string) || 3,
    reps: parseInt(params.reps as string) || 12,
  };

  const handleStartExercise = () => {
    alert(
      `Starting exercise with: ${exerciseConfig.sets} sets and ${exerciseConfig.reps} reps, this should show only in "dev" mode`
    );
    router.push({
      pathname: "/camera",
      params: {
        sets: sets.toString(),
        reps: reps.toString(),
      },
    });
  };

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
          onPress={handleStartExercise}
        >
          <Text style={globalStyles.buttonText}>Start Exercising Now</Text>
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
    overflow: "hidden",
    marginBottom: 20,
  },
  video: {
    flex: 1,
  },
  buttonContainer: {
    alignItems: "center",
  },
});
