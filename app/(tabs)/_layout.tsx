import { Tabs } from "expo-router";
import { Platform, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        // Ocultar tab bar en TODAS las pantallas
        tabBarStyle: {
          display: "none",
        },
        // Alternativa si lo anterior no funciona
        tabBarVisible: false,
      })}
    >
      {/* Las rutas se generan automáticamente con Expo Router */}
    </Tabs>
  );
}
