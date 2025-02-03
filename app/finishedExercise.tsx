import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, globalStyles } from "./styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";

type ErrorStats = {
  incompleteRange: number;
  tooFastReps: number;
  misalignedArm: number;
  wrongStartAngle: number;
  wrongEndAngle: number;
};

export default function FinishedExercise() {
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as {
    perfectReps: number;
    totalReps: number;
    wrongReps: number;
    completedSets: number;
    formMistakes: number;
    errorStats: ErrorStats;
    mostCommonError: string;
    formAccuracy: string;
  };

  const getErrorFeedback = (mostCommonError: string) => {
    const feedbackMessages = {
      incompleteRange:
        "Focus on completing the full range of motion for each rep. This ensures you're getting the maximum benefit from each curl.",
      tooFastReps:
        "Try to maintain a slower, more controlled pace. This will help engage your muscles more effectively and prevent injury.",
      misalignedArm:
        "Keep your upper arm steady and close to your body throughout the movement. This helps isolate your bicep and prevents shoulder compensation.",
      wrongStartAngle:
        "Start with your arm at the correct angle. This ensures proper form and maximum effectiveness.",
      wrongEndAngle:
        "Complete the curl with proper form at the top. This targets your biceps effectively.",
      none: "Great work on maintaining proper form! Keep focusing on controlled movements and full range of motion.",
    };

    return (
      feedbackMessages[mostCommonError as keyof typeof feedbackMessages] ||
      feedbackMessages.none
    );
  };

  const getGradeEmoji = (accuracy: number) => {
    if (accuracy >= 90) return "🏆";
    if (accuracy >= 80) return "💪";
    if (accuracy >= 70) return "👍";
    if (accuracy >= 60) return "💪";
    return "🎯";
  };

  const accuracy = parseFloat(params.formAccuracy || "0");
  const gradeEmoji = getGradeEmoji(accuracy);

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[globalStyles.title, styles.title]}>
            Great Job! {gradeEmoji}
          </Text>
          <View style={styles.accuracyContainer}>
            <Text style={styles.accuracyLabel}>Form Accuracy</Text>
            <Text style={styles.accuracyValue}>{params.formAccuracy}%</Text>
          </View>
        </View>

        <Text style={[globalStyles.body, styles.feedback]}>
          {accuracy > 80
            ? "Excellent form! Keep up the great work!"
            : "Your form has improved! Here's what to focus on next:"}
        </Text>

        <Text style={[globalStyles.body, styles.errorFeedback]}>
          {getErrorFeedback(params.mostCommonError)}
        </Text>

        <View style={styles.statsContainer}>
          <Text style={[globalStyles.subtitle, styles.statsTitle]}>
            Exercise Summary:
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[globalStyles.subtitle, styles.tableHeader]}>
                Sets
              </Text>
              <Text style={[globalStyles.subtitle, styles.tableHeader]}>
                Total Reps
              </Text>
              <Text style={[globalStyles.subtitle, styles.tableHeader]}>
                Perfect
              </Text>
              <Text style={[globalStyles.subtitle, styles.tableHeader]}>
                Errors
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text
                style={[
                  globalStyles.body,
                  styles.tableCell,
                  styles.exerciceNumberColor,
                ]}
              >
                {params.completedSets}
              </Text>
              <Text
                style={[
                  globalStyles.body,
                  styles.tableCell,
                  styles.exerciceNumberColor,
                ]}
              >
                {params.totalReps}
              </Text>
              <Text
                style={[
                  globalStyles.body,
                  styles.tableCell,
                  styles.exerciceNumberColor,
                ]}
              >
                {params.perfectReps}
              </Text>
              <Text
                style={[
                  globalStyles.body,
                  styles.tableCell,
                  styles.formMistakesColor,
                ]}
              >
                {params.formMistakes}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.errorBreakdownContainer}>
          <Text style={[globalStyles.subtitle, styles.breakdownTitle]}>
            Error Breakdown:
          </Text>
          {Object.entries(params.errorStats || {}).map(
            ([type, count]) =>
              count > 0 && (
                <View key={type} style={styles.errorItem}>
                  <View style={styles.errorIconContainer}>
                    <Ionicons
                      name={
                        type === "incompleteRange"
                          ? "resize-outline"
                          : type === "tooFastReps"
                          ? "flash-outline"
                          : type === "misalignedArm"
                          ? "git-compare-outline"
                          : type === "wrongStartAngle"
                          ? "arrow-down-outline"
                          : "arrow-up-outline"
                      }
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.errorTextContainer}>
                    <Text style={styles.errorType}>
                      {type
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </Text>
                    <Text style={styles.errorCount}>{count} times</Text>
                  </View>
                </View>
              )
          )}
        </View>

        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={() => router.push("/")}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={globalStyles.buttonText}>Back to Home</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.dark,
    alignItems: "center",
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    marginTop: 40,
    marginBottom: 20,
    textAlign: "center",
  },
  accuracyContainer: {
    backgroundColor: COLORS.darkGray,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  accuracyLabel: {
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 5,
  },
  accuracyValue: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: "bold",
  },
  feedback: {
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  errorFeedback: {
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
    color: COLORS.primary,
  },
  statsContainer: {
    width: "100%",
    backgroundColor: COLORS.darkGray,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    marginBottom: 20,
  },
  table: {
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tableHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
  },
  errorBreakdownContainer: {
    width: "100%",
    backgroundColor: COLORS.darkGray,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  breakdownTitle: {
    marginBottom: 15,
  },
  errorItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    borderRadius: 10,
  },
  errorIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 122, 0, 0.1)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorType: {
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 4,
  },
  errorCount: {
    color: COLORS.primary,
    fontSize: 14,
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: "auto",
    marginBottom: 20,
  },
  button: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciceNumberColor: {
    color: COLORS.primary,
  },
  formMistakesColor: {
    color: "#ff6b6b",
  },
});
