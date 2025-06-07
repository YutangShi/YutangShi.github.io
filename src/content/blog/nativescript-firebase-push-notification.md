---
title: "NativeScript 與 Firebase Push Notification 整合指南"
description: "詳細介紹如何在 NativeScript 應用程式中整合 Firebase Push Notification，包含 iOS 和 Android 的完整設定流程和實作步驟。"
publishDate: 2021-06-13
updatedDate: 2024-12-05
heroImage: "/images/blog/nativescript-firebase-push-notification.svg"
category: "移動開發"
tags: ["NativeScript", "Firebase", "Push Notification", "iOS", "Android", "移動應用開發"]
draft: false
featured: true
author: "Allen Shi"
readingTime: 8
---

由於推播是增加與用戶的互動的一項重要功能，因此我們今天要來介紹 NativeScript 如何串接 Firebase Push Notification 機制，讓我們的 App 能夠收到推播通知。

以下會分別由 iOS 與 Android 分別做介紹。

## 前置作業

在開始實作之前，我們需要準備以下項目：

1. **申請 Firebase 專案**
2. **iOS 申請 Apple Developer Account**
3. **NativeScript Plugin @nativescript/firebase**

確保你已經安裝了 NativeScript 7 或更新版本，並且有基本的 NativeScript 開發環境。

## iOS APP 推播設定

以下步驟會產生 iOS 憑證或 APNs 憑證的檔案，建議先建立空的資料夾統一放置，避免要上傳到 Firebase 或 iOS 平台時找不到了。

> 💡 **提示**: 目前 Firebase 改用 p8 的 Key 來驗證了，這個方法更簡單且安全。

### 1. 從 Mac 上產生一個 CSR 檔

1. 按下 `cmd` + `space`，輸入 **Keychain Access**（金匙圈存取）
2. 從選單上再點選 **Keychain Access > Certificate Assistant > Request a Certificate From a Certificate Authority**

填寫以下資訊：
- **Email**: 你的開發者帳號 Email
- **Common Name**: 要簽署 CSR 的名稱
- 選擇**儲存到磁碟**再按下繼續

最後會產生一份 `CertificateSigningRequest.certSigningRequest` CSR 檔案，待會需要上傳到 iOS 平台。

### 2. 上傳你的 CSR 檔

1. 登入到 [Apple Developer Account](https://developer.apple.com/account/)
2. 從左側選擇 **Certificates, IDs & Profiles**
3. 從 **Certificates** 點選新增進入下一步

這邊依據開發狀況來申請，建議申請兩個：
- **開發時使用** (Sandbox)
- **正式上線時使用** (Sandbox & Production)

步驟流程：
1. 選擇要申請憑證的 App
2. 上傳剛剛產生好的 CSR 檔案
3. 下載申請好的推播憑證

### 3. 準備 APNs 認證

我們已經準備好 iOS 憑證，另外我們需要產生一份 APNs 認證 (Apple Push Notifications)，設定 Firebase 時會需要用到。

1. 將剛剛下載的 `aps_development.cer` 點擊兩下來加入到 Keychain Access
2. 在 KeyChain Access 的 **My Certificates** 會有一份剛剛加入的憑證：`Apple Development IOS Push Services:<yourapp.bundle.id>`
3. 點選**輸出** Apple Development IOS Push Services
4. 可以輸入一組密碼保護這組 APNs，確認後會產生出 p12 檔案

### 4. 設定 Firebase 的推播設定

1. 建立一個推播專用的專案
2. 點選**專案設定**，再點選 **iOS icon** 來建立應用程式
3. 填寫 iOS App 相關資訊後繼續下一步
4. 將 `GoogleService-Info.plist` 下載放到安全的地方

**重要設定**：
- 點選到**雲端通訊**，注意**伺服器金鑰**，這是發推播到 Firebase 需要的 key
- 上傳 APNs 憑證，將剛剛匯出的 p12 檔案上傳到**開發 APN 憑證中**
- 發佈 App 前要記得將**實作 APN 憑證**也上傳，才能正常收到推播資訊

## 建立 NativeScript Demo App

> 📝 **注記**: 目前版本是使用 NativeScript 7

### 4.1 安裝 Firebase 套件

建立一個新的 NativeScript App 並安裝 `@nativescript/firebase` 推播套件：

```bash
ns plugin add @nativescript/firebase
```

安裝的時候可以選擇自己需要哪些 Firebase 套件，選擇 Y 就可以。

### 4.2 設定 iOS 授權檔案

新建立一份 `demoapp.entitlements` 檔案到 `App_Resources -> iOS` 下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>aps-environment</key>
    <string>development</string>
  </dict>
</plist>
```

並從 `App_Resources -> iOS -> build.xcconfig` 設定參數：

```
CODE_SIGN_ENTITLEMENTS = demoapp/demoapp.entitlements
```

### 4.3 放置 Firebase 設定檔

將 `GoogleService-Info.plist` 檔案，放置到專案的 `App_Resources -> iOS` 下。

### 4.4 建立推播接收頁面

建立一個 `main-page.xml` 頁面接收推播：

```xml
<Page xmlns="http://schemas.nativescript.org/tns.xsd" navigatingTo="onNavigatingTo">  
   <StackLayout class="content">     
     <Label text="Demo App" />  
   </StackLayout>
</Page>
```

### 4.5 串接 Firebase 推播功能

在 `main-page.js` 中實作 Firebase 推播：

```javascript
const firebase = require("@nativescript/firebase").firebase;

function onNavigatingTo(args) {
  firebase.init({
    showNotifications: true,
    showNotificationsWhenInForeground: true,
    onPushTokenReceivedCallback: (token) => {
      console.log('[Firebase] onPushTokenReceivedCallback:', { token });
    },
    onMessageReceivedCallback: (message) => {
      if (message.body) {  
        dialogs.alert({
          title: "通知",
          message: message.body,
          okButtonText: "確定"
        });
      }
      console.log('[Firebase] onMessageReceivedCallback:', { message });
    }
  }).then(() => {  
    console.log('[Firebase] Initialized');
  }).catch(error => {  
    console.log('[Firebase] Initialize', { error });
  });
}

exports.onNavigatingTo = onNavigatingTo;
```

### 4.6 在 Xcode 專案中增加推播服務

1. 在專案中找到 `platform -> ios -> yourapp.xcworkspace` 並打開
2. 找到 **Capability** 中查詢 notification
3. 將 **Push Notification** 服務加入到 App 中

### 4.7 測試 iOS 推播

執行以下命令啟動 App：

```bash
ns run ios
```

從 log 有看到 token 的話，就代表有將裝置成功與 Firebase 註冊成功，可以開始接收推播資訊。

## 測試 Firebase 推播功能

你可以使用 Postman 或其他 API 測試工具來測試推播功能：

### Header 設定

```
Authorization: key={Firebase_伺服器金鑰}
Content-Type: application/json
```

### 請求內容

```json
{  
  "notification": {  
    "title": "推播通知",  
    "text": "今天天氣好",  
    "sound": "default"
  },  
  "priority": "High",  
  "to": "{device_token}"
}
```

到這邊就可以順利的發送與接收推播資訊。iOS 申請的過程步驟有點長，若沒有收到的話，可以再稍微檢查是否有步驟遺漏了。

## Android 推播流程

Android 的設定相對簡單許多：

### 1. 在 Firebase 上申請 Android 推播應用程式

在 Firebase Console 中：
1. 選擇你的專案
2. 點選**新增應用程式**
3. 選擇 **Android** 平台
4. 填寫應用程式資訊

### 2. 下載並放置設定檔

下載 `google-services.json` 後放到 `App_Resources -> Android` 下即可。

### 3. 測試 Android 推播

執行以下命令：

```bash
ns run android
```

這樣就可以順利串接完 iOS 以及 Android 的推播服務了！

## 小結

NativeScript 與 Firebase Push Notification 的整合提供了一個強大的解決方案來增強用戶參與度。雖然 iOS 的設定步驟較為複雜，但一旦設定完成，就能享受到穩定可靠的推播服務。

### 重點回顧

1. **iOS 設定較複雜**：需要處理憑證、APNs 認證等步驟
2. **Android 設定相對簡單**：主要是放置 `google-services.json` 檔案
3. **測試很重要**：確保在開發和生產環境都能正常運作
4. **安全性考量**：妥善保管各種金鑰和憑證檔案

希望這個指南能幫助你成功在 NativeScript 應用程式中實作 Firebase Push Notification！如果在實作過程中遇到問題，歡迎在留言區討論。

---

*原文發表於 Medium: [NativeScript with Firebase Push Notification](https://medium.com/@allenshi-81981/nativescript-with-firebase-push-notification-a39d3bcee120)* 