# TrackMyMeds Setup Guide

## Important: Node.js Version Requirement

Your current Node.js version is **v18.14.0**, which is compatible with React Native 0.71.19 used in this project.

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/tipl/Claude/track-my-meds/TrackMyMeds
npm install
```

### 2. iOS Setup (macOS only)

Install CocoaPods dependencies:

```bash
cd ios
pod install
cd ..
```

### 3. Run the App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## Detailed Setup Instructions

### Prerequisites Check

1. **Node.js** (v18.14.0 ✓)
   ```bash
   node --version
   ```

2. **npm** (v9.3.1 ✓)
   ```bash
   npm --version
   ```

3. **For iOS:**
   - macOS required
   - Xcode 14+ (install from Mac App Store)
   - CocoaPods:
     ```bash
     sudo gem install cocoapods
     ```

4. **For Android:**
   - Android Studio
   - JDK 11+
   - Android SDK (API Level 33)
   - Set ANDROID_HOME environment variable

### Installation Steps

#### 1. Install Node Dependencies

```bash
cd /Users/tipl/Claude/track-my-meds/TrackMyMeds
npm install
```

This will install:
- React Native 0.71.19
- @notifee/react-native (notifications)
- @react-native-async-storage/async-storage (storage)
- @react-navigation packages (navigation)
- date-fns (date utilities)
- TypeScript and other dev dependencies

#### 2. iOS Setup

```bash
cd ios
pod install
cd ..
```

This installs iOS native dependencies via CocoaPods.

**If pod install fails:**
```bash
cd ios
pod repo update
pod install
cd ..
```

#### 3. Android Setup

No additional setup needed. The Android build will download dependencies automatically when you run the app.

### Running the App

#### iOS

Option 1 - Command Line:
```bash
npm run ios
```

Option 2 - Xcode:
1. Open `ios/TrackMyMeds.xcworkspace` in Xcode
2. Select a simulator or device
3. Click the Run button (▶️)

**Troubleshooting iOS:**
- If build fails, try cleaning: Xcode > Product > Clean Build Folder
- Ensure you're opening `.xcworkspace`, not `.xcodeproj`
- Try resetting Metro cache: `npm start -- --reset-cache`

#### Android

Option 1 - Command Line:
```bash
npm run android
```

Make sure you have an Android emulator running or a device connected with USB debugging enabled.

Option 2 - Android Studio:
1. Open the `android` folder in Android Studio
2. Wait for Gradle sync to complete
3. Select a device/emulator
4. Click Run

**Troubleshooting Android:**
- If build fails, try: `cd android && ./gradlew clean && cd ..`
- Ensure ANDROID_HOME is set: `echo $ANDROID_HOME`
- Make sure emulator is running: `adb devices`
- Try disabling antivirus temporarily (can interfere with Metro)

### Starting Metro Bundler Separately

If you want to start the Metro bundler separately:

```bash
npm start
```

Then in separate terminals:
```bash
npm run ios
# or
npm run android
```

### Testing the App

Once the app is running:

1. **Grant notification permissions** when prompted
2. **Add a test medication:**
   - Tap the + button
   - Enter name: "Test Med"
   - Enter dosage: "100mg"
   - Set a time 2 minutes from now
   - Tap Save

3. **Wait for notification:**
   - Keep the app in the background
   - After 2 minutes, you should receive a notification
   - Test the action buttons (Confirm, Snooze, Skip)

4. **Test foreground dialog:**
   - Add another medication with time 2 minutes from now
   - Keep the app open (foreground)
   - You should see an in-app dialog instead of notification

### Common Issues and Solutions

#### "Unable to resolve module..."

```bash
rm -rf node_modules
npm install
npm start -- --reset-cache
```

#### iOS Build Errors

```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

#### Android Build Errors

```bash
cd android
./gradlew clean
cd ..
npm run android
```

#### Metro Bundler Issues

```bash
# Kill all node processes
killall node

# Clear watchman (if installed)
watchman watch-del-all

# Clear Metro cache
npm start -- --reset-cache
```

#### Notifications Not Working

**iOS:**
1. Check Settings > Notifications > TrackMyMeds
2. Ensure all notification settings are enabled
3. Try uninstalling and reinstalling the app

**Android:**
1. Check Settings > Apps > TrackMyMeds > Notifications
2. Ensure all notification categories are enabled
3. For Android 12+: Check Settings > Apps > TrackMyMeds > Set alarms and reminders
4. Try clearing app data

### Development Tips

#### Hot Reload

- Press `r` in Metro terminal to reload
- Press `d` to open developer menu
- On device: Shake device to open developer menu

#### Debugging

**React Native Debugger:**
- Enable remote debugging from developer menu
- Use Chrome DevTools or React Native Debugger app

**Console Logs:**
- All `console.log()` statements appear in Metro terminal
- Use `console.error()` for errors
- Use `console.warn()` for warnings

**Inspecting Scheduled Notifications:**

Add this code temporarily to see scheduled notifications:

```typescript
import {NotificationService} from './src/services/notifications';

const notifications = await NotificationService.getScheduledNotifications();
console.log('Scheduled notifications:', notifications);
```

### File Structure Reference

```
TrackMyMeds/
├── App.tsx                     # Main app component
├── index.js                    # Entry point
├── package.json                # Dependencies
├── tsconfig.json              # TypeScript config
├── babel.config.js            # Babel config
├── metro.config.js            # Metro bundler config
├── src/
│   ├── types/
│   │   └── medication.ts
│   ├── services/
│   │   ├── storage.ts
│   │   ├── notifications.ts
│   │   └── scheduler.ts
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── AddMedicationScreen.tsx
│   │   └── MedicationDetailScreen.tsx
│   ├── components/
│   │   ├── MedicationCard.tsx
│   │   ├── ReminderDialog.tsx
│   │   └── TimePickerInput.tsx
│   └── navigation/
│       └── AppNavigator.tsx
├── ios/
│   ├── Podfile
│   └── TrackMyMeds/
│       └── Info.plist
└── android/
    ├── build.gradle
    ├── settings.gradle
    └── app/
        ├── build.gradle
        └── src/main/
            └── AndroidManifest.xml
```

### Next Steps

After successful setup and testing:

1. **Customize the app:**
   - Modify colors in component stylesheets
   - Add app icon and splash screen
   - Adjust notification sounds

2. **Add features:**
   - See README.md for future enhancement ideas
   - Consider adding cloud sync
   - Add data export functionality

3. **Prepare for release:**
   - Update app icons
   - Configure signing certificates
   - Test on real devices
   - Submit to App Store / Play Store

### Getting Help

If you encounter issues:

1. Check this guide and README.md
2. Search React Native documentation: https://reactnative.dev/
3. Check notifee documentation: https://notifee.app/
4. Look for similar issues on GitHub

### Version Compatibility Notes

This project uses:
- **React Native 0.71.19** - Compatible with Node.js 18.x
- **notifee 7.8.0** - Latest stable version
- **React Navigation 6.x** - Latest stable version
- **TypeScript 4.8.4** - Stable release

All versions are tested and working together. Do not upgrade React Native or major dependencies without testing thoroughly, as breaking changes may occur.
