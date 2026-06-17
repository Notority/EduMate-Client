import Constants from 'expo-constants';

const PORT = 3000;

// When running in Expo Go on a physical device, Constants.expoConfig.hostUri
// holds the Metro bundler address (e.g. "192.168.1.10:8081").
// We strip the port suffix to get the bare machine IP.
// This works on emulators, simulators, and real devices automatically.
const getDevHost = (): string => {
  const hostUri = (Constants.expoConfig as any)?.hostUri as string | undefined;
  if (hostUri) {
    // hostUri is "192.168.x.x:8081" — strip the :8081
    return hostUri.split(':')[0];
  }
  // Fallback for bare/managed builds without Metro info
  return 'localhost';
};

const envUrl = process.env.EXPO_PUBLIC_API_URL;

export const API_BASE_URL = envUrl || `http://${getDevHost()}:${PORT}/api`;

