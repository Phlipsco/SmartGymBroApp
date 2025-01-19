// CameraScreen.tsx
import { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as React from "react";
import { WebView } from "react-native-webview";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { COLORS, globalStyles } from "./styles/globalStyles";

export default function CameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize exercise configuration
  const exerciseConfig = {
    sets: parseInt(params.sets as string) || 3,
    reps: parseInt(params.reps as string) || 12,
  };

  // Inject configuration when WebView loads
  const injectJavaScript = () => {
    const config = {
      type: "exerciseConfig",
      sets: exerciseConfig.sets,
      reps: exerciseConfig.reps,
    };

    const jsCode = `
      try {
        console.log('Injecting config:', ${JSON.stringify(config)});
        
        // Create and dispatch a custom event
        const configEvent = new CustomEvent('exerciseConfig', {
          detail: ${JSON.stringify(config)}
        });
        document.dispatchEvent(configEvent);
        
        // Also try postMessage for compatibility
        window.postMessage(${JSON.stringify(config)}, '*');
        
        true;
      } catch (error) {
        console.error('Error injecting config:', error);
      }
    `;

    setTimeout(() => {
      webViewRef.current?.injectJavaScript(jsCode);
    }, 1000); // Delay to ensure WebView is fully loaded
  };

  // Handle messages from WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("Received message from WebView:", data);

      if (data.type === "exerciseComplete") {
        router.push({
          pathname: "/finishedExercise",
          params: data.stats,
        });
      }
    } catch (error) {
      console.error("Error handling WebView message:", error);
    }
  };

  // WebView performance optimization props
  const webViewProps = {
    androidLayerType: Platform.select({
      android: isLoading ? "none" : "hardware",
      default: undefined,
    }) as "none" | "software" | "hardware" | undefined,
    androidHardwareAccelerationDisabled: Platform.OS === "android" && isLoading,
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.webviewContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading camera...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{
            uri: "https://www.uxtreasure.de/test1/SmartGymBroWebAppPrototype/index.html",
          }}
          style={[styles.webview, isLoading && styles.hidden]}
          originWhitelist={["*"]}
          allowsInlineMediaPlayback
          javaScriptEnabled
          scalesPageToFit
          mediaPlaybackRequiresUserAction={false}
          onMessage={handleWebViewMessage}
          onLoadEnd={() => {
            setIsLoading(false);
            injectJavaScript();
          }}
          onError={(syntheticEvent) => {
            console.warn("WebView error: ", syntheticEvent.nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            console.warn("WebView HTTP error: ", syntheticEvent.nativeEvent);
          }}
          {...webViewProps}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={globalStyles.primaryButton}
          onPress={() => router.push("/finishedExercise")}
        >
          <Text style={globalStyles.buttonText}>Finish Exercise Early</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  webviewContainer: {
    flex: 1,
    backgroundColor: COLORS.darkGray,
    borderRadius: 15,
    overflow: "hidden",
    margin: 10,
  },
  webview: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.darkGray,
    zIndex: 1,
  },
  loadingText: {
    color: COLORS.white,
    marginTop: 10,
    fontSize: 16,
  },
  buttonContainer: {
    position: "fixed",
    bottom: 0,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 20,
  },
});
