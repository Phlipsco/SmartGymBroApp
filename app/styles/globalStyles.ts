import { StyleSheet, Dimensions } from 'react-native';

export const COLORS = {
  primary: '#FF7A47',          // Main orange
  primaryLight: '#FF9666',     // Lighter orange for highlights
  primaryDark: '#E9370B',      // Darker orange for buttons
  dark: '#1A1A1A',            // Main background
  darkGray: '#2D2D2D',        // Secondary background
  lightGray: '#AAAAAA',       // Disabled text
  white: '#FFFFFF',
  error: '#FF5555',
  success: '#66D9A3',
  overlay: 'rgba(0,0,0,0.7)'  // For modals/overlays
};

const { width } = Dimensions.get('window');

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    color: COLORS.white,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: width * 0.9,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: width * 0.9,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 