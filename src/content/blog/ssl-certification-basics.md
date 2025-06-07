---
title: "SSL 憑證運作原理"
description: "深入了解SSL憑證的基本概念、運作原理和結構，包括根憑證、中繼憑證及其在安全通訊中的角色。"
publishDate: 2020-05-03
updatedDate: 2024-12-05
heroImage: "/images/blog/ssl-certification.svg"
category: "網路技術"
tags: ["SSL", "HTTPS", "網路安全", "憑證", "加密", "certification"]
draft: false
featured: false
author: "Allen Shi"
readingTime: 4
---

上次我們提到 SSL (Secure Sockets Layer) 可以運用 CertBot 來自動續簽，這單元我們要來理解憑證 (Certification) 是什麼，以及它在安全通訊中扮演的角色。

## SSL 憑證基本結構

SSL 憑證都採用 x509 的規範，形成一種階層式的信任鏈，包含以下幾個關鍵部分：

1. **最高認證中心** - Root Certificate Authority (RCA)
2. **中繼認證中心** - Intermediate Certificate Authority (ICA)
3. **使用者/伺服器憑證** - 用戶向認證中心 (CA) 註冊取得的可證明身分的憑證

憑證的簽發方式為金字塔型，從頂端為 RCA 發起端，RCA 不會直接簽發 Server 與 Client certificate，而是簽發 Intermediate Certificate 憑證給 ICA，再由 ICA 簽發 Server certificate 給我們使用。

## CA Bundle 的組成

CA bundle 的檔案如 \*.crt，內容包含了根憑證與簽發路徑中所有的中繼憑證，典型的結構如下：

```
- Intermediate CA Certificate 2
- Intermediate CA Certificate 1
- Root CA Certificate
```

由於根憑證通常已經內建於作業系統或瀏覽器中，因此有些中繼憑證中心提供的檔案是不包含根憑證，此種檔案又被稱為中繼憑證檔 (Intermediate certificates file)。

## SSL 憑證的關鍵欄位

當我們檢查一個 SSL 憑證時，會看到幾個重要欄位：

- **Subject**: 就是我們簽的網域名稱，代表憑證所屬的實體
- **Issuer**: 憑證的簽發者，通常是中繼認證中心
- **Fingerprint**: 每一張證書都會有獨一無二的簽署指紋
- **Valid From/To**: 憑證的有效期限

## Linux OpenSSL 實用指令

OpenSSL 是管理和檢查 SSL 憑證的強大工具，以下是一些實用的指令：

### 檢查憑證到期時間

```bash
echo | openssl s_client -servername 1on1.today -connect 1on1.today:443 2>/dev/null | openssl x509 -noout -dates
```

輸出結果範例：
```
notBefore=Apr 24 13:41:09 2020 GMT
notAfter=Jul 23 13:41:09 2020 GMT
```

### 查看憑證的完整資訊

```bash
openssl x509 -in certificate.crt -text -noout
```

### 驗證網站的憑證鏈

```bash
openssl s_client -connect example.com:443 -showcerts
```

### 檢查私鑰是否與憑證匹配

```bash
openssl x509 -noout -modulus -in certificate.crt | openssl md5
openssl rsa -noout -modulus -in private.key | openssl md5
# 如果兩個命令的輸出相同，則表示私鑰與憑證匹配
```

## SSL 憑證與安全通訊

憑證在 HTTPS 通訊中扮演著核心角色，主要有以下幾個功能：

1. **身份驗證**: 確保你連接的是合法的網站而非假冒的
2. **數據加密**: 加密客戶端與服務器之間傳輸的數據
3. **數據完整性**: 確保數據在傳輸過程中沒有被篡改

當瀏覽器連接到支持 HTTPS 的網站時，會檢查憑證的有效性，包括：
- 憑證是否由受信任的 CA 簽發
- 憑證是否過期
- 憑證的域名是否與訪問的網站匹配
- 憑證是否被撤銷

## 結論

理解 SSL 憑證的結構和運作原理對於維護安全的網站至關重要。透過 Let's Encrypt 和 CertBot 等工具，現在部署和管理 SSL 憑證變得更加簡單，但了解其背後的機制仍然有助於診斷問題和確保最佳的安全實踐。

---

### 參考資源

- [網站SSL加密原理簡介](https://www.netadmin.com.tw/netadmin/zh-tw/technology/6F6D669EB83E4DC9BEA42F1C94636D46)
- [憑證信任鏈](https://letsencrypt.org/zh-tw/certificates/) 