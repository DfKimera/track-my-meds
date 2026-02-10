# TrackMyMeds - Medication Reminder App

A React Native mobile application for tracking medication reminders with push notifications and in-app dialogs.

## Features

- 📱 Cross-platform support (iOS and Android)
- ⏰ Customizable reminder times for each medication
- 🔔 Push notifications with action buttons (Confirm, Snooze, Skip)
- 💬 In-app dialog when notification fires while app is open
- 📊 Medication history tracking
- 💾 Local storage with AsyncStorage
- 🔄 30-minute snooze functionality
- ✅ Enable/disable individual medications

## Technology Stack

- **Framework**: React Native 0.71.19
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Storage**: AsyncStorage
- **Notifications**: notifee (cross-platform notification library)
- **Date handling**: date-fns

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- For iOS development:
  - macOS
  - Xcode 14+
  - CocoaPods
- For Android development:
  - Android Studio
  - JDK 11+
  - Android SDK

## Installation

1. **Clone and navigate to the project:**
   ```bash
   cd TrackMyMeds
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install iOS dependencies (macOS only):**
   ```bash
   cd ios && pod install && cd ..
   ```

## Running the App

### iOS
```bash
npm run ios
```

Or open `ios/TrackMyMeds.xcworkspace` in Xcode and run from there.

### Android
```bash
npm run android
```

Make sure you have an Android emulator running or a device connected.

## Project Structure

```
TrackMyMeds/
├── src/
│   ├── types/
│   │   └── medication.ts          # TypeScript interfaces
│   ├── services/
│   │   ├── storage.ts              # AsyncStorage wrapper
│   │   ├── notifications.ts        # notifee notification management
│   │   └── scheduler.ts            # Reminder scheduling logic
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Main medication list
│   │   ├── AddMedicationScreen.tsx # Add/edit form
│   │   └── MedicationDetailScreen.tsx # Detail view
│   ├── components/
│   │   ├── MedicationCard.tsx      # List item component
│   │   ├── ReminderDialog.tsx      # In-app dialog modal
│   │   └── TimePickerInput.tsx     # Time selection component
│   ├── navigation/
│   │   └── AppNavigator.tsx        # React Navigation setup
│   └── App.tsx                     # Root component
├── android/                        # Android native code
├── ios/                           # iOS native code
└── package.json
```

## Usage

### Adding a Medication

1. Tap the **+** button on the home screen
2. Enter medication name (e.g., "Aspirin")
3. Enter dosage (e.g., "100mg")
4. Add one or more reminder times using the time picker
5. Toggle "Enable Reminders" if you want to pause notifications
6. Tap **Save**

### Managing Medications

- **View details**: Tap on any medication card
- **Edit**: Open the medication detail screen and tap "Edit Medication"
- **Disable**: Toggle "Enable/Disable Reminders" from the detail screen
- **Delete**: Tap "Delete Medication" from the detail screen

### Responding to Reminders

When a reminder notification appears, you have three options:

1. **✓ Confirm Taken**: Records that you took the medication
2. **⏰ Snooze 30 min**: Postpones the reminder for 30 minutes
3. **Skip**: Records that you skipped this dose

If the app is open when a reminder fires, you'll see an in-app dialog with the same options.

### Viewing History

Open any medication's detail screen to see the last 20 reminder actions with timestamps.

## Permissions

### iOS
- **Notifications**: Required for medication reminders
- Configured in `ios/TrackMyMeds/Info.plist`

### Android
- **POST_NOTIFICATIONS**: Display notifications (Android 13+)
- **SCHEDULE_EXACT_ALARM**: Schedule exact-time reminders
- **RECEIVE_BOOT_COMPLETED**: Reschedule reminders after device reboot
- Configured in `android/app/src/main/AndroidManifest.xml`

## How It Works

### Notification Scheduling

- Each medication time gets its own daily repeating notification
- Notifications are scheduled using notifee's trigger API with `RepeatFrequency.DAILY`
- All active medications are rescheduled when the app starts (handles device reboots)

### Snooze Functionality

- Creates a one-time notification 30 minutes from when you snooze
- Does not affect the original daily schedule
- Records the snooze action in history

### Storage

- Medications are stored as JSON in AsyncStorage
- History entries are stored separately (limited to last 1000 entries)
- All data persists across app restarts

## Testing

### Local Testing Checklist

1. **Setup verification:**
   - Run the app on iOS and Android
   - Verify notification permission prompts appear
   - Grant notification permissions

2. **Add medication:**
   - Create a medication with a time 2 minutes in the future
   - Verify notification appears at scheduled time
   - Test all three action buttons

3. **Foreground behavior:**
   - Keep app open when notification time arrives
   - Verify in-app dialog appears
   - Test all three action buttons in dialog

4. **Snooze:**
   - Snooze a reminder
   - Wait 30 minutes
   - Verify snoozed notification appears

5. **Persistence:**
   - Add medications, close app, reopen
   - Verify medications are still there
   - Verify notifications still fire after app restart

6. **Edge cases:**
   - Multiple medications at same time
   - Edit medication time (should reschedule)
   - Disable medication (should cancel notifications)
   - Delete medication (should cancel and remove)

## Known Limitations

- Local storage only (no cloud sync in this version)
- Single user/device
- Fixed 30-minute snooze duration
- History limited to last 1000 entries
- Notifications require app to be opened at least once after device reboot on some Android versions

## Future Enhancements

- Cloud sync with backend API
- User authentication
- Multiple user profiles
- Medication refill reminders
- History charts and analytics
- Custom snooze durations
- Photo/barcode scanning for medication info
- Widget support
- Apple Watch/Wear OS support

## Troubleshooting

### Notifications not appearing

**iOS:**
- Check Settings > Notifications > TrackMyMeds
- Ensure notifications are allowed
- Try restarting the app

**Android:**
- Check Settings > Apps > TrackMyMeds > Notifications
- Ensure exact alarms are allowed (Android 12+)
- Try clearing app data and restarting

### App crashes on startup

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- For iOS: `cd ios && pod install && cd ..`
- For Android: `cd android && ./gradlew clean && cd ..`

### Metro bundler issues

```bash
npm start -- --reset-cache
```

## License

MIT

## Support

For issues or questions, please open an issue on the project repository.
