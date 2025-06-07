---
title: "SSL nginx certbot 憑證簽署與自動續期"
description: "詳細介紹如何使用Certbot在Ubuntu環境下為Nginx伺服器配置Let's Encrypt SSL憑證，並設置自動續期。"
publishDate: 2020-05-03
updatedDate: 2024-12-05
heroImage: "/images/blog/ssl-certbot.svg"
category: "網路技術"
tags: ["SSL", "HTTPS", "nginx", "certbot", "Let's Encrypt", "Ubuntu", "網路安全"]
draft: false
featured: false
author: "Allen Shi"
readingTime: 5
---

目前SSL已經普遍使用 Let's Encrypt CA (Certificate Authority) 來簽署，但每隔90天就要重新更換，因此就有了certbot服務的產生，來幫我們自動重簽憑證。本文將介紹如何在Ubuntu環境下使用certbot為Nginx設置SSL憑證。

## 環境準備

在Ubuntu 18.04環境下安裝certbot，需要進行以下準備工作：

```bash
# 更新套件庫
sudo apt-get update

# 安裝所需套件
sudo apt-get install software-properties-common

# 添加certbot的PPA儲存庫
sudo add-apt-repository ppa:certbot/certbot

# 再次更新套件庫
sudo apt-get update

# 安裝certbot和nginx插件
sudo apt-get install certbot python3-certbot-nginx
```

## 簽署SSL憑證的方式

使用certbot有幾種方式可以簽署SSL憑證：

### 1. 自動模式

這是最簡單的方式，certbot會自動找到Nginx配置並修改：

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

### 2. 僅獲取憑證

如果你想手動配置Nginx，可以只獲取憑證：

```bash
sudo certbot certonly --nginx -d example.com -d www.example.com
```

### 3. 使用standalone模式

如果你還沒有設置Web伺服器或想要在安裝Web伺服器前獲取憑證：

```bash
sudo certbot certonly --standalone -d example.com -d www.example.com
```

### 4. Webroot模式

如果你已經有運行中的網站，不想中斷服務：

```bash
sudo certbot certonly --webroot -w /var/www/html -d example.com -d www.example.com
```

## Nginx設置SSL範例

以下是一個使用SSL的Nginx配置範例：

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;

    # SSL設置優化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # HSTS (強制使用HTTPS)
    add_header Strict-Transport-Security "max-age=63072000" always;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # 其他配置
    root /var/www/html;
    index index.html index.php;

    location / {
        try_files $uri $uri/ =404;
    }

    # PHP處理
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.2-fpm.sock;
    }
}
```

## 自動續期設置

Certbot安裝後會自動創建一個定時任務來檢查和更新憑證。你可以通過以下命令查看：

```bash
systemctl list-timers | grep certbot
```

你還可以手動運行一次續期測試：

```bash
sudo certbot renew --dry-run
```

如果一切正常，證書將在到期前自動續期，無需任何手動操作。

## 檢查SSL設置質量

你可以使用線上工具來檢查你的SSL設置質量：

1. [SSL Labs Server Test](https://www.ssllabs.com/ssltest/)
2. [ImmuniWeb SSL Security Test](https://www.immuniweb.com/ssl/)

這些工具會對你的SSL設置進行評分，並提供改進建議。

## 故障排除

### 常見問題

1. **Nginx沒有重新加載配置**：
   ```bash
   sudo systemctl reload nginx
   ```

2. **權限問題**：
   ```bash
   sudo chown -R www-data:www-data /etc/letsencrypt/live/
   sudo chmod -R 755 /etc/letsencrypt/live/
   ```

3. **防火牆阻擋**：
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   ```

4. **域名解析問題**：
   ```bash
   dig example.com +short
   ```

### 日誌文件

Certbot的日誌位於：
```
/var/log/letsencrypt/
```

Nginx的錯誤日誌通常位於：
```
/var/log/nginx/error.log
```

## 結論

使用Let's Encrypt和Certbot是保護網站安全的一個簡單而有效的方法。不僅免費，而且自動化程度高，大大減輕了管理SSL憑證的負擔。

通過本文的設置，你的網站將擁有強大的加密保護，提升用戶信任，並可能在搜索引擎排名中獲得更好的位置。

---

**提示**：記得定期檢查你的SSL設置，並關注Let's Encrypt的公告，以確保你的網站安全符合最新標準。 