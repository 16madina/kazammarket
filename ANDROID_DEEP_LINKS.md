# Configuration des Deep Links Android - AYOKA MARKET

## Configuration automatique

Exécutez le script de configuration :

```bash
node scripts/configure-android.js
```

Ce script configure automatiquement :
- ✅ Le nom de l'application
- ✅ Le splash screen
- ✅ Les deep links (App Links HTTPS + Custom URL Scheme)

## Configuration manuelle (si nécessaire)

### 1. Modifier AndroidManifest.xml

Ouvrez `android/app/src/main/AndroidManifest.xml` et modifiez la balise `<activity>` de MainActivity :

```xml
<activity
    android:name=".MainActivity"
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:label="@string/title_activity_main"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:launchMode="singleTask"
    android:exported="true">

    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>

    <!-- App Links - HTTPS (vérifiés automatiquement) -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" android:host="ayokamarket.com" />
    </intent-filter>
    
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" android:host="www.ayokamarket.com" />
    </intent-filter>

    <!-- Custom URL Scheme -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="ayokamarket" />
    </intent-filter>

</activity>
```

## Reconstruction et test

### Étape 1 : Synchroniser et reconstruire

```bash
npx cap sync android
cd android && ./gradlew assembleDebug
```

### Étape 2 : Réinstaller l'application

```bash
adb uninstall com.ayoka.market
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Étape 3 : Vérifier les App Links

```bash
adb shell pm get-app-links com.ayoka.market
```

**Résultat attendu :**
```
com.ayoka.market:
    ID: xxxxxxxx
    Signatures: [D4:6B:41:1E:99:1E:0A:23:DB:39:87:3D:3C:95:AC:44:D4:FD:61:66:6F:79:37:DE:38:AE:18:A9:13:7D:31:F7]
    Domains: ayokamarket.com www.ayokamarket.com
      Status: verified
```

### Étape 4 : Tester les deep links

```bash
# Test App Link HTTPS
adb shell am start -W -a android.intent.action.VIEW -d "https://ayokamarket.com/open-app?ref=TEST123" com.ayoka.market

# Test Custom URL Scheme
adb shell am start -W -a android.intent.action.VIEW -d "ayokamarket://open-app?ref=TEST123" com.ayoka.market

# Test avec listing
adb shell am start -W -a android.intent.action.VIEW -d "https://ayokamarket.com/open-app?listing=abc123" com.ayoka.market

# Test avec seller
adb shell am start -W -a android.intent.action.VIEW -d "https://ayokamarket.com/open-app?seller=xyz789" com.ayoka.market
```

## Troubleshooting

### Status "ask" au lieu de "verified"

1. **Vérifier assetlinks.json** :
   ```bash
   curl -I https://ayokamarket.com/.well-known/assetlinks.json
   ```
   Le fichier doit être accessible avec Content-Type: application/json

2. **Vérifier le SHA256** :
   ```bash
   keytool -printcert -jarfile android/app/build/outputs/apk/debug/app-debug.apk | grep SHA256
   ```
   Doit correspondre au fingerprint dans assetlinks.json

3. **Forcer la re-vérification** :
   ```bash
   adb shell pm set-app-links --package com.ayoka.market 0 all
   adb shell pm verify-app-links --re-verify com.ayoka.market
   ```

### L'application ne s'ouvre pas

1. Vérifiez que l'activité est exportée : `android:exported="true"`
2. Vérifiez le launchMode : `android:launchMode="singleTask"`
3. Désinstallez complètement et réinstallez l'app

### Le lien ouvre le navigateur

1. Allez dans Paramètres > Applications > AYOKA
2. Ouvrir par défaut > Ajouter un lien
3. Activez ayokamarket.com et www.ayokamarket.com

## Fichiers de configuration

| Fichier | Description |
|---------|-------------|
| `public/.well-known/assetlinks.json` | Fichier de vérification pour Android App Links |
| `resources/android-intent-filters.xml` | Intent filters de référence |
| `scripts/configure-android.js` | Script de configuration automatique |

## URLs supportées

| URL | Action |
|-----|--------|
| `https://ayokamarket.com/open-app?ref=CODE` | Parrainage |
| `https://ayokamarket.com/open-app?listing=ID` | Voir une annonce |
| `https://ayokamarket.com/open-app?seller=ID` | Voir un vendeur |
| `ayokamarket://open-app?ref=CODE` | Parrainage (scheme) |
