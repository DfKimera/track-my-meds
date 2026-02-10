# QuickStart Guide

Get TrackMyMeds up and running in 5 minutes.

## Prerequisites

✓ Node.js 18.14.0 (you already have this)
✓ npm 9.3.1 (you already have this)

**For iOS:**
- macOS required
- Xcode 14+ (install from Mac App Store)
- CocoaPods: `sudo gem install cocoapods`

**For Android:**
- Android Studio
- Android SDK
- An emulator or connected device

## Step 1: Install Dependencies

```bash
cd /Users/tipl/Claude/track-my-meds/TrackMyMeds
npm install
```

This will take 2-3 minutes.

## Step 2: iOS Setup (Skip if Android only)

```bash
cd ios
pod install
cd ..
```

This will take 1-2 minutes.

## Step 3: Run the App

Choose your platform:

### iOS Simulator

```bash
npm run ios
```

Wait for the simulator to open and the app to build (3-5 minutes first time).

### Android Emulator

1. Start an Android emulator from Android Studio
2. Then run:

```bash
npm run android
```

Wait for the build to complete (3-5 minutes first time).

## Step 4: Test Notifications

1. When the app opens, **grant notification permissions**
2. Tap the **+** button
3. Add a test medication:
   - Name: `Test Med`
   - Dosage: `100mg`
   - Time: Set to **2 minutes from now**
4. Tap **Save**
5. Put the app in the background (press home button)
6. Wait 2 minutes
7. You should see a notification with three action buttons

## Common Issues

### "Command not found: pod"

Install CocoaPods:
```bash
sudo gem install cocoapods
```

### "Unable to resolve module..."

Clear Metro cache:
```bash
npm start -- --reset-cache
```

### Android build fails

Clean Gradle:
```bash
cd android
./gradlew clean
cd ..
```

### Notifications don't appear

- **iOS**: Check Settings > Notifications > TrackMyMeds
- **Android**: Check Settings > Apps > TrackMyMeds > Notifications

## Next Steps

Once the app is running successfully:

1. Read **README.md** for feature documentation
2. Read **ARCHITECTURE.md** to understand the code
3. Start customizing the app to your needs

## Need Help?

- **Setup issues**: See SETUP_GUIDE.md
- **Architecture questions**: See ARCHITECTURE.md
- **Usage questions**: See README.md

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Lint code
npm run lint

# Clear caches (if issues)
npm start -- --reset-cache
```

## File Locations

- **Source code**: `src/`
- **iOS project**: `ios/TrackMyMeds.xcworkspace`
- **Android project**: `android/`
- **Dependencies**: `node_modules/` (created after npm install)

## Success Check

Your app is working correctly if:

- ✓ App launches without errors
- ✓ You can add a medication
- ✓ Notification permission prompt appears
- ✓ You receive a notification at the scheduled time
- ✓ Action buttons work (Confirm, Snooze, Skip)
- ✓ In-app dialog shows when app is open during reminder

## Estimated Time

- **First-time setup**: 10-15 minutes
- **Subsequent runs**: < 1 minute

Enjoy building with TrackMyMeds! 🎉
