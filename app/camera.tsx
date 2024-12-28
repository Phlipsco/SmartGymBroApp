import { useRef, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import * as React from "react";
import {
  CameraView,
  PermissionStatus,
  useCameraPermissions,
} from "expo-camera";
import { WebView } from "react-native-webview";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const trackingHtml = require("../html/index.html");

  React.useEffect(() => {
    requestPermission();
  }, []);

  if (!permission || permission.status === PermissionStatus.UNDETERMINED) {
    return (
      <View style={styles.container}>
        <Text>Camera permission is required</Text>
      </View>
    );
  }

  if (permission.status === PermissionStatus.DENIED) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  //   return (
  //     <View style={styles.container}>
  //       <CameraView
  //         ref={cameraRef}
  //         style={styles.camera}
  //         facing="front"
  //         onMountError={(error) => {
  //           console.error("Camera mount error:", error);
  //         }}
  //       />
  //     </View>
  //   );
  // }

  const handleWebViewMessage = (event: any) => {
    // Process messages from WebView
    const data = event.nativeEvent.data;
    console.log("Message from WebView:", data);
  };

  return (
    <View style={styles.container}>
      <WebView
        source={trackingHtml}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
});
