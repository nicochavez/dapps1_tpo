# Simple React Native App

A simple React Native project created with Expo, featuring a blank template to get started quickly.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or later) - Download from [nodejs.org](https://nodejs.org/)
- **Expo CLI** - Install globally with `npm install -g @expo/cli`
- **Expo Go App** - Download on your mobile device from the App Store (iOS) or Google Play Store (Android)

For Android development:

- Android Studio with Android SDK
- Android emulator or physical device

For iOS development (macOS only):

- Xcode
- iOS Simulator or physical device

## Installation

1. Clone or download this project to your local machine.

2. Navigate to the project directory:

   ```
   cd your-project-directory
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Running the Project

### Start the Expo Development Server

Run the following command to start the development server:

```
npm start
```

or

```
npx expo start
```

This will open the Expo Developer Tools in your browser.

### Run on Specific Platforms

- **Android**:

  ```
  npm run android
  ```

  This will start the app on an Android emulator or connected device.

- **iOS** (macOS only):

  ```
  npm run ios
  ```

  This will start the app on the iOS Simulator.

- **Web**:
  ```
  npm run web
  ```
  This will open the app in your default web browser.

### Using Expo Go

1. After starting the development server, scan the QR code displayed in the terminal or Expo Developer Tools with the Expo Go app on your mobile device.
2. The app will load and you can see your changes in real-time.

## Project Structure

- `App.js` - Main application component
- `assets/` - Static assets like images and fonts
- `package.json` - Project dependencies and scripts
- `app.json` - Expo configuration

## Building for Production

To build a production version of your app:

1. Install EAS CLI:

   ```
   npm install -g @expo/eas-cli
   ```

2. Login to your Expo account:

   ```
   eas login
   ```

3. Build for your platform:
   - Android: `eas build --platform android`
   - iOS: `eas build --platform ios`

## Troubleshooting

- If you encounter issues with Metro bundler, try clearing the cache: `npx expo start --clear`
- Ensure your Node.js version is compatible with the Expo SDK version used in this project.
- For more help, check the [Expo documentation](https://docs.expo.dev/) or [React Native documentation](https://reactnative.dev/docs/getting-started).

## Contributing

Feel free to modify the code and experiment with React Native features!

## License

This project is licensed under the MIT License.
