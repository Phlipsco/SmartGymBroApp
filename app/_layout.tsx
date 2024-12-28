import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="exercise/[id]" 
          options={{
            headerTitle: "",
            headerBackTitle: "Back"
          }}
        />
        <Stack.Screen 
          name="camera" 
          options={{
            headerTitle: "Exercise Camera",
            headerBackTitle: "Back"
          }}
        />
      </Stack>
    </>
  );
}
