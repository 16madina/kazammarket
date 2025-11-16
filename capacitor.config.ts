import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fdde6a57c0ea45b0bd6d4e42d3d22471',
  appName: 'DJASSA',
  webDir: 'dist',
  server: {
    url: 'https://fdde6a57-c0ea-45b0-bd6d-4e42d3d22471.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      showSpinner: false
    },
    Camera: {
      android: {
        permissions: ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
      },
      ios: {
        permissions: ["NSCameraUsageDescription", "NSPhotoLibraryUsageDescription"]
      }
    },
    NativeBiometric: {
      ios: {
        permissions: ["NSFaceIDUsageDescription"]
      }
    }
  }
};

export default config;
