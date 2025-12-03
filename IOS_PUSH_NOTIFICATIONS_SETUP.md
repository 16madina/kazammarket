# Configuration des Notifications Push iOS pour AYOKA MARKET

Ce guide explique comment configurer les notifications push iOS avec Apple Push Notification service (APNs) et Firebase Cloud Messaging.

## Prérequis

- Un compte Apple Developer ($99/an)
- Xcode installé sur macOS
- Un appareil iOS physique (les simulateurs ne supportent pas les notifications push)
- Le projet Firebase "ayoka-market" configuré

## Étape 1 : Configurer APNs dans Apple Developer

### 1.1 Créer un App ID

1. Connectez-vous à [Apple Developer Portal](https://developer.apple.com/account)
2. Allez dans **Certificates, Identifiers & Profiles**
3. Sélectionnez **Identifiers** → **App IDs**
4. Cliquez sur **+** pour créer un nouvel App ID
5. Configurez :
   - **Description** : AYOKA MARKET
   - **Bundle ID** : `com.ayoka.market` (Explicit)
6. Dans **Capabilities**, activez **Push Notifications**
7. Cliquez sur **Continue** puis **Register**

### 1.2 Créer une clé APNs (Méthode recommandée)

1. Dans Apple Developer, allez dans **Keys**
2. Cliquez sur **+** pour créer une nouvelle clé
3. Configurez :
   - **Key Name** : AYOKA MARKET Push Key
   - Cochez **Apple Push Notifications service (APNs)**
4. Cliquez sur **Continue** puis **Register**
5. **IMPORTANT** : Téléchargez la clé `.p8` et notez le **Key ID**
6. Notez également votre **Team ID** (visible en haut à droite)

## Étape 2 : Configurer Firebase pour iOS

### 2.1 Ajouter l'app iOS dans Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez le projet **ayoka-market**
3. Cliquez sur **Ajouter une application** → **iOS**
4. Configurez :
   - **Bundle ID** : `com.ayoka.market`
   - **Nom de l'app** : AYOKA MARKET
5. Téléchargez le fichier `GoogleService-Info.plist`

### 2.2 Uploader la clé APNs dans Firebase

1. Dans Firebase Console, allez dans **Project Settings** → **Cloud Messaging**
2. Sous **Apple app configuration**, cliquez sur **Upload** pour APNs Authentication Key
3. Uploadez votre fichier `.p8`
4. Entrez le **Key ID** et le **Team ID**

## Étape 3 : Configurer le projet Xcode

### 3.1 Ajouter les capabilities

1. Exportez le projet vers GitHub et clonez-le localement
2. Exécutez `npm install` et `npx cap add ios`
3. Ouvrez le projet iOS : `npx cap open ios`
4. Dans Xcode, sélectionnez votre target **App**
5. Allez dans **Signing & Capabilities**
6. Cliquez sur **+ Capability** et ajoutez :
   - **Push Notifications**
   - **Background Modes** → cochez **Remote notifications**

### 3.2 Ajouter GoogleService-Info.plist

1. Copiez `GoogleService-Info.plist` dans le dossier `ios/App/App/`
2. Dans Xcode, faites un clic droit sur le dossier **App** → **Add Files to "App"**
3. Sélectionnez `GoogleService-Info.plist`
4. Cochez **Copy items if needed** et **Add to targets: App**

### 3.3 Configurer le Podfile

Ouvrez `ios/App/Podfile` et ajoutez Firebase :

```ruby
platform :ios, '14.0'

def capacitor_pods
  pod 'Capacitor', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../../node_modules/@capacitor/ios'
  # Ajoutez vos pods Capacitor ici
end

target 'App' do
  capacitor_pods
  
  # Firebase
  pod 'Firebase/Core'
  pod 'Firebase/Messaging'
end
```

Puis exécutez :

```bash
cd ios/App
pod install
```

### 3.4 Configurer AppDelegate.swift

Modifiez `ios/App/App/AppDelegate.swift` :

```swift
import UIKit
import Capacitor
import Firebase
import FirebaseMessaging

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Configure Firebase
        FirebaseApp.configure()
        
        // Set messaging delegate
        Messaging.messaging().delegate = self
        
        // Set notification delegate
        UNUserNotificationCenter.current().delegate = self
        
        // Request notification authorization
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            print("Notification permission granted: \(granted)")
            if let error = error {
                print("Notification permission error: \(error)")
            }
        }
        
        // Register for remote notifications
        application.registerForRemoteNotifications()
        
        return true
    }

    // Handle registration for remote notifications
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Messaging.messaging().apnsToken = deviceToken
        print("APNs token registered")
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Failed to register for remote notifications: \(error)")
    }

    // MessagingDelegate
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("Firebase registration token: \(String(describing: fcmToken))")
        
        // Notify Capacitor plugin about the token
        NotificationCenter.default.post(
            name: Notification.Name("FCMToken"),
            object: nil,
            userInfo: ["token": fcmToken ?? ""]
        )
    }

    // UNUserNotificationCenterDelegate - Handle foreground notifications
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .badge, .sound])
    }

    // Handle notification tap
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        print("Notification tapped: \(userInfo)")
        
        // Forward to Capacitor
        NotificationCenter.default.post(
            name: Notification.Name("PushNotificationActionPerformed"),
            object: nil,
            userInfo: userInfo
        )
        
        completionHandler()
    }

    // Continue existing lifecycle methods...
    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationDidBecomeActive(_ application: UIApplication) {
        // Clear badge when app becomes active
        UIApplication.shared.applicationIconBadgeNumber = 0
    }
    func applicationWillTerminate(_ application: UIApplication) {}
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
    
    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
```

## Étape 4 : Structure du fichier GoogleService-Info.plist

Créez `ios/App/App/GoogleService-Info.plist` avec ce contenu (à compléter avec vos valeurs Firebase) :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CLIENT_ID</key>
    <string>YOUR_CLIENT_ID.apps.googleusercontent.com</string>
    <key>REVERSED_CLIENT_ID</key>
    <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
    <key>API_KEY</key>
    <string>AIzaSyCDYHY9hcv_45bkzs4d6qe7PklCb1vV-48</string>
    <key>GCM_SENDER_ID</key>
    <string>198878757338</string>
    <key>PLIST_VERSION</key>
    <string>1</string>
    <key>BUNDLE_ID</key>
    <string>com.ayoka.market</string>
    <key>PROJECT_ID</key>
    <string>ayoka-market</string>
    <key>STORAGE_BUCKET</key>
    <string>ayoka-market.firebasestorage.app</string>
    <key>IS_ADS_ENABLED</key>
    <false/>
    <key>IS_ANALYTICS_ENABLED</key>
    <false/>
    <key>IS_APPINVITE_ENABLED</key>
    <true/>
    <key>IS_GCM_ENABLED</key>
    <true/>
    <key>IS_SIGNIN_ENABLED</key>
    <true/>
    <key>GOOGLE_APP_ID</key>
    <string>1:198878757338:ios:YOUR_IOS_APP_ID</string>
</dict>
</plist>
```

## Étape 5 : Build et Test

### 5.1 Construire l'application

```bash
# Build le projet web
npm run build

# Synchroniser avec Capacitor
npx cap sync ios

# Ouvrir dans Xcode
npx cap open ios
```

### 5.2 Tester sur un appareil

1. Connectez votre appareil iOS
2. Dans Xcode, sélectionnez votre appareil comme destination
3. Cliquez sur **Run** (⌘R)
4. L'app demandera la permission pour les notifications
5. Acceptez pour recevoir les notifications

### 5.3 Vérifier le token

Le token FCM sera automatiquement enregistré dans la table `profiles.push_token` de Supabase.

Vous pouvez vérifier en consultant les logs Xcode ou en interrogeant la base de données.

## Étape 6 : Test d'envoi de notification

### Depuis l'interface admin

1. Connectez-vous comme admin sur AYOKA MARKET
2. Allez dans Admin → Notifications Push
3. Sélectionnez un utilisateur avec un token enregistré
4. Envoyez une notification de test

### Depuis Firebase Console

1. Allez dans Firebase Console → Cloud Messaging
2. Cliquez sur **Créer votre première campagne**
3. Sélectionnez **Messages de notification Firebase**
4. Entrez un titre et un message
5. Ciblez l'app iOS `com.ayoka.market`
6. Envoyez la notification

## Dépannage

### Les notifications ne sont pas reçues

1. **Vérifiez les capabilities** : Push Notifications et Background Modes doivent être activés
2. **Vérifiez APNs** : La clé .p8 doit être uploadée dans Firebase
3. **Vérifiez le provisioning** : Le profil doit inclure la capability Push Notifications
4. **Testez sur un vrai appareil** : Les simulateurs ne supportent pas les push

### Le token n'est pas enregistré

1. Vérifiez que l'utilisateur est connecté
2. Consultez les logs Xcode pour les erreurs
3. Vérifiez que GoogleService-Info.plist est bien ajouté au target

### Erreur "Invalid APNs credentials"

1. Vérifiez que le Bundle ID correspond exactement
2. Re-uploadez la clé APNs dans Firebase
3. Vérifiez le Key ID et Team ID

## Ressources

- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
- [Firebase Cloud Messaging iOS](https://firebase.google.com/docs/cloud-messaging/ios/client)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
