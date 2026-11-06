import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexmart.app',
  appName: 'Nexmart',
  webDir: 'public',
  server: {
    url: 'https://nexmart-ma1-main.vercel.app',
    cleartext: false,
    androidScheme: 'https',
    allowNavigation: [
      'nexmart-ma1-main.vercel.app',
      '*.vercel.app',
      '*.stripe.com',
      'res.cloudinary.com',
      'accounts.google.com',
      '*.google.com',
      '*.googleusercontent.com'
    ]
  },
  android: {
    appendUserAgent: 'NexmartApp'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#032c1e',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#032c1e'
    }
  }
};

export default config;
