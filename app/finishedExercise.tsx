import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, globalStyles } from "./styles/globalStyles";

export default function FinishedExercise() {
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as {
    perfectReps: number;
    totalReps: number;
    completedSets: number;
    formMistakes: number;
  };

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.title, styles.title]}>Great Job! 💪</Text>
      <Text style={[globalStyles.body, styles.feedback]}>
        {params.perfectReps / params.totalReps > 0.8
          ? "Excellent form! Keep up the great work!"
          : "Your form has improved! For better results"}
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
              Reps
            </Text>
            <Text style={[globalStyles.subtitle, styles.tableHeader]}>
              Form Errors
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
              {params.formMistakes}
            </Text>
          </View>
        </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.dark,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    marginTop: 40,
    marginBottom: 20,
    textAlign: "center",
  },
  feedback: {
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  statsContainer: {
    width: "100%",
    backgroundColor: COLORS.darkGray,
    borderRadius: 15,
    padding: 20,
    marginBottom: 40,
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
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: "auto",
  },
  button: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciceNumberColor: {
    color: COLORS.primary,
  },
});
