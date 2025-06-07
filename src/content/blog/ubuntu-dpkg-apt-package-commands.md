---
title: "Ubuntu dpkg apt 套件指令"
description: "詳細介紹Ubuntu系統中使用apt和dpkg進行套件管理的常用指令，包括搜尋、安裝、移除和更新套件。"
publishDate: 2020-05-31
updatedDate: 2024-12-05
heroImage: "/images/blog/ubuntu-apt.svg"
category: "Linux"
tags: ["Ubuntu", "Linux", "dpkg", "apt", "套件管理", "系統管理"]
draft: false
featured: false
author: "Allen Shi"
readingTime: 3
---

Ubuntu 是基於 Debian 套件管理系統，當我們要安裝套件時，我們可以使用 apt 或 dpkg 來進行套件的查詢、移除、相依性等操作。這篇文章整理了常用的套件管理指令，幫助您更有效地管理系統套件。

## APT 套件指令

APT (Advanced Package Tool) 是 Debian 及其衍生系統 (如 Ubuntu) 的高級套件管理工具，提供了友好的介面來處理套件。

### 套件搜尋與查詢

```bash
# 搜尋本機內 cache 中的檔案
apt-cache search package

# 查看套件的詳細資訊
apt-cache show package

# 查看套件的依賴關係
apt-cache depends package

# 查看套件被哪些其他套件依賴
apt-cache rdepends package
```

### 套件更新與安裝

```bash
# 更新套件列表
sudo apt-get update

# 升級已安裝的套件
sudo apt-get upgrade

# 安裝特定套件
sudo apt-get install package

# 安裝特定版本的套件
sudo apt-get install package=version

# 重新安裝套件
sudo apt-get --reinstall install package
```

### 套件移除與清理

```bash
# 移除套件但保留配置文件
sudo apt-get remove package

# 完全移除套件包括配置文件
sudo apt-get purge package

# 清理已下載的套件檔案
sudo apt-get clean

# 清理不再需要的套件
sudo apt-get autoremove

# 清理無用的 package
sudo apt-get clean && sudo apt-get autoclean
```

### 套件下載

```bash
# 下載套件但不安裝
sudo apt-get download package

# 下載套件的原始碼
apt-get source package
```

## DPKG 套件指令

DPKG 是 Debian 套件管理系統的低級工具，可以直接操作 .deb 檔案。

```bash
# 安裝 .deb 檔案
sudo dpkg -i package.deb

# 查看已安裝的套件
dpkg -l

# 查詢特定套件
dpkg -l | grep package

# 移除套件
sudo dpkg -r package

# 完全移除套件包括配置
sudo dpkg -P package

# 列出套件包含的文件
dpkg -L package

# 查找特定文件屬於哪個套件
dpkg -S /path/to/file
```

## 進階技巧

### 使用 apt 代替 apt-get

在較新版本的 Ubuntu 中，推薦使用 `apt` 命令，它結合了 `apt-get` 和 `apt-cache` 的功能，且介面更友善：

```bash
# 更新套件列表
sudo apt update

# 升級套件
sudo apt upgrade

# 安裝套件
sudo apt install package

# 移除套件
sudo apt remove package

# 搜尋套件
apt search package

# 顯示套件資訊
apt show package

# 清理不再需要的套件
sudo apt autoremove
```

### 使用圖形界面

Ubuntu 還提供了圖形化的套件管理工具：

- **Ubuntu Software Center** - 易於使用的應用商店
- **Synaptic** - 功能更強大的圖形界面套件管理器

```bash
# 安裝 Synaptic
sudo apt install synaptic
```

---

良好地管理系統套件可以讓 Ubuntu 系統保持乾淨和高效。希望這些指令能幫助您更好地管理系統套件！ 