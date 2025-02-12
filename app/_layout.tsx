import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="exercise/[id]"
          options={{
            headerTitle: "",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#1E1E1E" },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="camera"
          options={{
            headerTitle: "Exercise Camera",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#1E1E1E" },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="finishedExercise"
          options={{
            headerTitle: "Finished Exercise",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#1E1E1E" },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="customExercise"
          options={{
            headerTitle: "Custom Exercise",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#1E1E1E" },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="createWorkout"
          options={{
            headerTitle: "Create Workout",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#1E1E1E" },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="editWorkout"
          options={{
            headerTitle: "Edit Workout",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#1E1E1E" },
            headerTintColor: "white",
          }}
        />
      </Stack>
    </>
  );
}
