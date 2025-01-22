import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, globalStyles } from './styles/globalStyles';

export default function CustomExercise() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={[globalStyles.title, styles.title]}>Custom Exercise</Text>
        <Text style={styles.description}>
          Create your own custom exercise routine heree.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: COLORS.dark,
    paddingTop: 16,
  },

  container: {
    width: "95%",
    margin: 0,
    marginHorizontal: "auto",
    display: "flex",
    justifyContent: "center",
    flex: 1,
    backgroundColor: COLORS.dark,
  },
 
  content: {
    padding: 24,
  },
  title: {
    color: COLORS.white,
    marginBottom: 16,
  },
  description: {
    color: COLORS.white,
    fontSize: 16,
    opacity: 0.8,
  },
}); 