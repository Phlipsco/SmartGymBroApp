import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, globalStyles } from "../styles/globalStyles";

interface ExerciseSetupProps {
  exerciseId: string;
  onClose: () => void;
}

export default function ExerciseSetup({
  exerciseId,
  onClose,
}: ExerciseSetupProps) {
  const router = useRouter();
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(12);

  const adjustValue = (type: "sets" | "reps", increment: boolean) => {
    if (type === "sets") {
      setSets((prev) => (increment ? prev + 1 : Math.max(1, prev - 1)));
    } else {
      setReps((prev) => (increment ? prev + 1 : Math.max(1, prev - 1)));
    }
  };

  return (
    <View style={[globalStyles.card, styles.container]}>
      <Text style={[globalStyles.title, styles.titleCenter]}>
        Customize Your Workout
      </Text>

      <View style={styles.counterContainer}>
        {["sets", "reps"].map((type) => (
          <View key={type} style={styles.counter}>
            <Text style={globalStyles.subtitle}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => adjustValue(type as "sets" | "reps", false)}
              >
                <Text style={globalStyles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={[globalStyles.title, styles.value]}>
                {type === "sets" ? sets : reps}
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => adjustValue(type as "sets" | "reps", true)}
              >
                <Text style={globalStyles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={globalStyles.secondaryButton}
          onPress={() => router.push(`/exercise/${exerciseId}`)}
        >
          <Text style={[globalStyles.buttonText, { color: COLORS.primary }]}>
            Watch Tutorial
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={globalStyles.primaryButton}
          onPress={() => router.push("/camera")}
        >
          <Text style={globalStyles.buttonText}>Begin Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
  },
  titleCenter: {
    textAlign: "center",
  },
  counterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 30,
  },
  counter: {
    alignItems: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.dark,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  button: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  value: {
    marginHorizontal: 20,
  },
  buttonContainer: {
    gap: 15,
    alignItems: "center",
  },
});
