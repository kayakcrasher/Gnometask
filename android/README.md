# Gnometask Android test app

This small native Android WebView shell bundles the game inside an APK. There is no web server, login, or Internet connection needed. The normal Internet permission enables WebView’s virtual HTTPS origin; the app serves its assets locally and blocks external WebView requests. The game uses its existing generated 3D assets, audio and local save system. The virtual HTTPS origin is served exclusively from the APK's assets; all other WebView requests and navigations are blocked.

## Install and play

Copy `Gnometask-test.apk` to your Android phone and open it. Allow your browser or file manager to install this app when Android asks. Android 8.0 or newer and a current Android System WebView/Chrome are required. WebGL capability determines whether the game uses its 3D world or its existing map fallback.

Progress lives in the app's private storage and is separate from browser/Termux saves. Closing the app with Back asks to save; switching apps also triggers a save. Reinstalling over an existing copy with the same signing key retains saves. Uninstalling or clearing app storage deletes them. This is an internal signed test build, not a Play Store release.

## Build

On Linux install Node.js, JDK 17 or later, Android SDK Platform 35 and Build Tools 35.0.0. No Gradle, Android Studio or Java libraries are needed for this shell.

```sh
npm ci
export JAVA_HOME=/path/to/jdk
export ANDROID_SDK_ROOT=/path/to/android-sdk
npm run build:apk
```

For SDK archives extracted outside the standard directory layout, set `ANDROID_JAR` to the platform's `android.jar` and `ANDROID_BUILD_TOOLS` to the directory containing `aapt2`, `d8`, `zipalign` and `apksigner`.

The output is `android/build/Gnometask-test.apk`. The script rebuilds the current web game, compiles Java/resources, embeds the game, aligns and signs the APK, then verifies its signature and alignment. Build output is ignored by Git.

The first build generates `.android-signing/gnometask-test.keystore` (ignored by Git). Keep this directory privately and back it up to sign subsequent compatible test updates. Its standard internal-test password is `android`; use a different, secured signing process for any public store release. Android version metadata is in `AndroidManifest.xml`; increase `versionCode` for later distributed builds. Do not commit signing keys.

## Validation limits

The initial APK was compiled and its signature, alignment, Android metadata and bundled game assets verified. The web game passed its existing mobile browser smoke test, including island travel, naval combat, wreck salvage, rescue and repair. No Android device or emulator was available for the initial native build; installing on a phone is the next compatibility check.
