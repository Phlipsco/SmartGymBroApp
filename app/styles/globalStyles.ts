import { StyleSheet, Dimensions } from "react-native";

export const COLORS = {
  primary: "#FF7A47",
  primaryLight: "#FF9666",
  primaryDark: "#E9370B",
  dark: "#1A1A1A",
  darkGray: "#2D2D2D",
  lightGray: "#AAAAAA",
  white: "#FFFFFF",
  error: "#FF5555",
  success: "#66D9A3",
  overlay: "rgba(0,0,0,0.7)",
};

const { width } = Dimensions.get("window");

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    color: COLORS.white,
  },
  primaryButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,

    width: width * 0.9,
    alignItems: "center",
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: "transparent",

    width: width * 0.9,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
