# TrackMyMeds - Architecture Documentation

## Overview

TrackMyMeds is a React Native medication reminder application with local storage and cross-platform notification support. This document describes the technical architecture and key design decisions.

## Technology Choices

### React Native 0.71.19
- **Why**: Mature stable version compatible with Node.js 18.x
- **Benefits**: Cross-platform, large ecosystem, good performance
- **Trade-offs**: Requires native code for some features

### TypeScript
- **Why**: Type safety, better IDE support, fewer runtime errors
- **Benefits**: Catch errors at compile time, better refactoring
- **Trade-offs**: Some learning curve, more verbose than JavaScript

### notifee
- **Why**: Most reliable cross-platform notification library for React Native
- **Benefits**:
  - Better than native notifications for complex scheduling
  - Action buttons support on both platforms
  - Exact timing control
  - Active maintenance and community support
- **Alternatives considered**:
  - `@react-native-community/push-notification-ios` - iOS only
  - `react-native-push-notification` - Less reliable, harder to configure

### AsyncStorage
- **Why**: Simple key-value storage, built for React Native
- **Benefits**: Easy to use, persistent, good for small datasets
- **Trade-offs**:
  - Not suitable for large datasets
  - JSON serialization overhead
  - Could be replaced with MMKV for better performance

### React Navigation
- **Why**: De facto standard for React Native navigation
- **Benefits**: Full-featured, well-documented, type-safe
- **Trade-offs**: Bundle size (but alternatives have similar size)

### date-fns
- **Why**: Lightweight date utility library
- **Benefits**: Tree-shakeable, immutable, TypeScript support
- **Alternative**: moment.js (larger bundle size)

## Architecture Patterns

### Service Layer Pattern

All business logic is separated into service modules:

```
services/
├── storage.ts        # Data persistence
├── notifications.ts  # Notification management
└── scheduler.ts      # Scheduling logic
```

**Benefits:**
- Clear separation of concerns
- Easy to test in isolation
- Reusable across screens
- Can be mocked for testing

**Design:**
- Export singleton objects with methods
- Async methods return Promises
- Handle errors internally when possible
- Log errors for debugging

### Screen-Component Pattern

Screens are containers that manage state and business logic. Components are presentational.

**Screens:**
- Fetch data from services
- Manage local state
- Handle user interactions
- Navigate between screens

**Components:**
- Receive data via props
- Call callbacks for interactions
- No direct service access
- Reusable and composable

### Type-First Design

All data models are defined as TypeScript interfaces first:

```typescript
interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  enabled: boolean;
  createdAt: string;
}
```

**Benefits:**
- Single source of truth for data shape
- Compile-time validation
- IDE autocomplete
- Self-documenting code

## Data Flow

### Adding a Medication

```
User Input (AddMedicationScreen)
  ↓
StorageService.addMedication()
  ↓
SchedulerService.scheduleMedication()
  ↓
NotificationService.scheduleNotification() (for each time)
  ↓
notifee.createTriggerNotification()
  ↓
Navigate back to HomeScreen
```

### Notification Flow

#### Background (App Closed)

```
Scheduled Time Arrives
  ↓
System Shows Notification
  ↓
User Taps Action Button
  ↓
notifee.onBackgroundEvent()
  ↓
handleNotificationAction()
  ↓
StorageService.addHistory()
  ↓
(If snoozed) SchedulerService.handleSnooze()
```

#### Foreground (App Open)

```
Scheduled Time Arrives
  ↓
notifee.onForegroundEvent() (type: DELIVERED)
  ↓
Load medication from storage
  ↓
Show ReminderDialog component
  ↓
User taps action button
  ↓
handleDialogAction()
  ↓
StorageService.addHistory()
  ↓
(If snoozed) SchedulerService.handleSnooze()
```

### Snooze Flow

```
User Snoozes Reminder
  ↓
SchedulerService.handleSnooze()
  ↓
NotificationService.scheduleSnoozeNotification()
  ↓
Create one-time notification (timestamp = now + 30 min)
  ↓
Record 'snoozed' action in history
```

**Important:** Snooze creates a NEW notification. It does not modify the daily recurring notification.

## Storage Schema

### Medications Key: `@medications`

```json
[
  {
    "id": "1234567890",
    "name": "Aspirin",
    "dosage": "100mg",
    "times": ["09:00", "21:00"],
    "enabled": true,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
]
```

### History Key: `@reminder_history`

```json
[
  {
    "id": "1234567891",
    "medicationId": "1234567890",
    "scheduledTime": "09:00",
    "action": "taken",
    "actionTime": "2025-01-15T09:02:00.000Z"
  }
]
```

**Notes:**
- History is limited to last 1000 entries to prevent unlimited growth
- Both keys store JSON arrays
- Times are stored as 24-hour format strings (HH:mm)
- Dates are ISO 8601 strings

## Notification Strategy

### Scheduling Approach

**Daily Repeating Notifications:**
```typescript
const trigger: TimestampTrigger = {
  type: TriggerType.TIMESTAMP,
  timestamp: scheduledDate.getTime(),
  repeatFrequency: RepeatFrequency.DAILY,
};
```

- Each medication time gets its own notification
- Notification ID format: `{medicationId}_{time}` (e.g., "1234567890_0900")
- If time has passed today, schedules for tomorrow
- Repeats daily automatically

**One-Time Snooze Notifications:**
```typescript
const trigger: TimestampTrigger = {
  type: TriggerType.TIMESTAMP,
  timestamp: Date.now() + (30 * 60 * 1000),
  // No repeatFrequency
};
```

- Unique ID using timestamp: `{medicationId}_snooze_{timestamp}`
- Fires once and is automatically removed

### Notification Actions

Both iOS and Android support three actions:
- ✓ Confirm Taken (green)
- ⏰ Snooze 30 min (blue)
- Skip (gray)

**iOS:** Uses notification categories defined in `setupIOSCategories()`
**Android:** Uses actions array in notification payload

### Rescheduling Strategy

**When app starts:**
1. Cancel ALL existing notifications
2. Load all medications from storage
3. Schedule each enabled medication
4. Log results

**Why cancel all?**
- Prevents duplicate notifications
- Handles medications that were modified while app was closed
- Simpler than trying to diff what changed

**Trade-off:** Requires app to open after device reboot for notifications to resume. Most users open their apps daily.

**Future improvement:** Use native boot receiver to reschedule without opening app.

## Screen Architecture

### HomeScreen

**Responsibilities:**
- Display list of all medications
- Show active reminder count
- Handle navigation to add/detail screens
- Support pull-to-refresh

**State:**
- `medications: Medication[]` - All medications
- `refreshing: boolean` - Pull-to-refresh state

**Lifecycle:**
- `useFocusEffect` - Reload medications when screen gains focus
- Ensures list is fresh after adding/editing medications

### AddMedicationScreen

**Responsibilities:**
- Create new medications
- Edit existing medications (receives medication via route params)
- Validate form inputs
- Handle time picker interactions

**State:**
- Form fields: `name`, `dosage`, `times`, `enabled`
- `saving: boolean` - Prevent double-submits

**Validation:**
- Name required
- Dosage required
- At least one time required

**On Save:**
1. Validate form
2. Create/update medication object
3. Save to storage
4. Schedule/reschedule notifications
5. Navigate back

### MedicationDetailScreen

**Responsibilities:**
- Display medication details
- Show recent history (last 20 entries)
- Enable/disable medication
- Navigate to edit screen
- Handle deletion

**State:**
- `medication: Medication | null`
- `history: ReminderHistory[]`

**Actions:**
- Edit: Navigate to AddMedicationScreen with medication param
- Toggle: Update enabled status, reschedule/cancel notifications
- Delete: Show confirmation, delete from storage, cancel notifications

## Component Design

### ReminderDialog

**Purpose:** Show in-app modal when notification fires while app is open

**Props:**
```typescript
{
  visible: boolean;
  medication: Medication | null;
  scheduledTime: string;
  onAction: (action: ReminderAction) => void;
  onClose: () => void;
}
```

**Design:**
- Modal with overlay
- Non-dismissible (must choose an action)
- Same actions as notification
- Matches notification visual style

### MedicationCard

**Purpose:** Display medication summary in list

**Props:**
```typescript
{
  medication: Medication;
  onPress: () => void;
}
```

**Features:**
- Shows name, dosage, times
- Calculates next reminder time
- Visual indication if disabled
- Tappable to open detail screen

**Next Reminder Logic:**
```typescript
// Find next time today after current time
// If none, show first time tomorrow
```

### TimePickerInput

**Purpose:** Custom time picker matching app style

**Props:**
```typescript
{
  value: string;        // "HH:mm"
  onChange: (time: string) => void;
  onRemove?: () => void;
}
```

**Design:**
- Custom modal picker (not native picker)
- Scrollable hour/minute columns
- Remove button (if multiple times)
- Consistent styling across platforms

**Why custom?** Native pickers look different on iOS/Android and are harder to style.

## Error Handling

### Strategy

**Services:**
- Try-catch all async operations
- Log errors with `console.error()`
- Throw errors for caller to handle
- Return empty arrays/defaults for read operations

**Screens:**
- Catch service errors
- Show user-friendly alerts
- Don't crash the app

**Example:**
```typescript
try {
  await StorageService.addMedication(medication);
  await SchedulerService.scheduleMedication(medication);
  navigation.goBack();
} catch (error) {
  console.error('Error saving medication:', error);
  Alert.alert('Error', 'Failed to save medication');
}
```

### Notification Permission Handling

- Request permissions on app start
- Log warning if denied (don't block app)
- User can still use app to view medications
- Notifications just won't fire

**Future:** Show in-app banner if permissions denied, with link to settings.

## Performance Considerations

### Storage

**Current:**
- JSON serialization for every read/write
- Full array loaded on each operation

**Optimization if needed:**
- Switch to MMKV (faster key-value storage)
- Implement caching layer
- Use SQLite for complex queries

**Current approach is fine for:**
- < 100 medications
- < 1000 history entries

### Notification Scheduling

**Current:**
- Cancel and reschedule all on app start
- Acceptable for < 100 medications

**If scaling needed:**
- Only reschedule changed medications
- Use hash to detect changes
- Batch notification operations

### List Rendering

**Current:**
- FlatList with simple data
- No virtualization issues expected

**Optimization if needed:**
- Memoize MedicationCard
- Use `getItemLayout` for fixed heights
- Add pagination for large lists

## Testing Strategy

### Manual Testing

See SETUP_GUIDE.md for testing checklist.

**Key scenarios:**
1. Add medication
2. Receive notification in background
3. Receive notification in foreground
4. Snooze functionality
5. Edit medication (reschedules correctly)
6. Disable medication (cancels notifications)
7. App restart (persists data, reschedules notifications)

### Automated Testing (Future)

**Unit tests:**
- Service functions (storage, scheduling logic)
- Utility functions (date formatting, validation)

**Integration tests:**
- Full notification flow
- Storage persistence

**E2E tests:**
- Complete user flows with Detox

## Security Considerations

### Data Privacy

**Current:**
- All data stored locally on device
- No cloud sync
- No authentication needed
- Not encrypted

**For production:**
- Consider encrypting AsyncStorage
- Use iOS Keychain / Android Keystore for sensitive data
- Add PIN/biometric lock option

### Permissions

**Requested:**
- Notifications (required for core functionality)
- Exact alarms on Android (required for timing accuracy)

**Not requested:**
- Camera, location, contacts, etc.

## Scalability

### Current Limits

- **Medications:** No hard limit, but UI will degrade with 100+
- **History:** Capped at 1000 entries
- **Notification times:** No limit per medication

### Scaling Strategies

**If adding cloud sync:**
- Use pagination for history
- Sync in background
- Cache data locally
- Handle offline mode

**If supporting many medications:**
- Add search/filter
- Group by category
- Virtual scrolling

**If adding multi-user:**
- Separate storage keys per user
- User authentication
- Profile management

## Future Architecture Changes

### Cloud Sync

**Approach:**
1. Add REST API service
2. Implement sync queue for offline changes
3. Use optimistic updates
4. Handle conflicts (last-write-wins or user prompt)

**Storage changes:**
- Add sync metadata (lastSyncedAt, isDirty)
- Queue pending changes
- Merge remote changes with local

### Analytics

**Privacy-preserving approach:**
- Count of medications (no names/dosages)
- Reminder adherence rate
- App usage patterns
- No personally identifiable information

**Implementation:**
- Add analytics service layer
- Use mixpanel or custom backend
- Make opt-in

### Widget Support

**iOS:**
- Use WidgetKit
- Show today's medication schedule
- Deep link to app

**Android:**
- Use Glance API
- Similar functionality

**Challenges:**
- Shared storage between app and widget
- Update widget when medications change

## Code Style and Conventions

### File Naming

- **Screens:** PascalCase with "Screen" suffix (HomeScreen.tsx)
- **Components:** PascalCase (ReminderDialog.tsx)
- **Services:** camelCase (storage.ts)
- **Types:** camelCase (medication.ts)

### Component Structure

```typescript
// 1. Imports
import React from 'react';

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Component
export const ComponentName: React.FC<Props> = ({...props}) => {
  // 3a. State
  // 3b. Effects
  // 3c. Handlers
  // 3d. Render
};

// 4. Styles
const styles = StyleSheet.create({
  // ...
});
```

### Naming Conventions

- **Components:** PascalCase
- **Functions:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **Private methods:** _privateMethod (underscore prefix)
- **Event handlers:** handleEventName
- **Boolean props/state:** isLoading, hasError, canEdit

### Comments

- **When to comment:**
  - Complex logic that isn't obvious
  - Business rules
  - Workarounds for platform issues
  - TODO items

- **When not to comment:**
  - Obvious code (self-documenting)
  - What the code does (explain WHY instead)

## Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.2.0 | Core React library |
| react-native | 0.71.19 | Mobile framework |
| @notifee/react-native | ^7.8.0 | Notifications |
| @react-native-async-storage/async-storage | ^1.18.1 | Storage |
| @react-navigation/native | ^6.1.6 | Navigation |
| @react-navigation/native-stack | ^6.9.12 | Stack navigator |
| date-fns | ^2.30.0 | Date utilities |
| react-native-safe-area-context | ^4.5.0 | Safe area handling |
| react-native-screens | ^3.20.0 | Native screen optimization |

### Dev Dependencies

| Package | Purpose |
|---------|---------|
| typescript | Type checking |
| @types/* | TypeScript definitions |
| eslint | Code linting |
| prettier | Code formatting |
| jest | Testing framework |

## Build and Deployment

### Development Build

**iOS:**
```bash
npm run ios
```
Builds debug version and deploys to simulator.

**Android:**
```bash
npm run android
```
Builds debug APK and installs to emulator/device.

### Production Build

**iOS:**
1. Open Xcode
2. Select "Any iOS Device" or connected device
3. Product > Archive
4. Upload to App Store Connect

**Android:**
```bash
cd android
./gradlew bundleRelease
```
Generates signed AAB for Play Store.

**Requirements:**
- Signing certificates configured
- Version numbers updated
- Icons and splash screens added

## Maintenance

### Dependency Updates

**Check for updates:**
```bash
npm outdated
```

**Update process:**
1. Read changelog for breaking changes
2. Update one major package at a time
3. Test thoroughly
4. Update related packages together (e.g., all @react-navigation packages)

**Critical dependencies:**
- React Native (test on both platforms)
- notifee (test all notification flows)
- React Navigation (test all navigation)

### Debugging Production Issues

**Tools:**
- Sentry or similar for crash reporting
- Analytics for usage patterns
- User feedback form in app

**Common issues:**
- Notifications not firing: Check permissions, exact alarm settings
- App crashes: Check error logs, Sentry
- Data loss: Check AsyncStorage, backup/restore

## Conclusion

This architecture balances simplicity with functionality. It's appropriate for a local-first medication reminder app with future cloud sync potential.

**Strengths:**
- Clear separation of concerns
- Type-safe
- Cross-platform
- Easy to understand and modify

**Areas for improvement:**
- Add automated tests
- Implement cloud sync
- Encrypt sensitive data
- Add widget support

The codebase is designed to be maintainable and extensible. Each service and component has a single responsibility and clear interfaces.
