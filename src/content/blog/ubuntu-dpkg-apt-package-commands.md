---
title: Ubuntu dpkg apt 套件指令
meta_title: Ubuntu dpkg apt 套件指令
description: 詳細介紹Ubuntu系統中使用apt和dpkg進行套件管理的常用指令，包括搜尋、安裝、移除和更新套件。
date: 2020-05-31T00:00:00.000Z
author: Allen Shi
categories:
  - 自動化
tags:
  - Ubuntu
  - Linux
  - dpkg
  - apt
  - 套件管理
  - 系統管理
draft: false
---
Ubuntu 是基於 Debian 套件管理系統，當我們要安裝套件時，我們可以使用 apt 或 dpkg 來進行套件的查詢、移除、相依性等操作。這篇文章整理了常用的套件管理指令，幫助您更有效地管理系統套件。

## 你看完會得到什麼

- 你會知道 `apt` 跟 `dpkg` 分別用在什麼情境。  
- 你會理解常見指令背後在做什麼，避免「照抄」導致出問題。  
- 你會拿到 3 個真實情境的最短指令路徑（更新、安裝、清理）。  

## 先懂的名詞（每個 2 句內）

1. 套件（Package）：一個可安裝的軟體單位，通常包含程式與設定檔。安裝套件就像幫系統加功能。  
2. 套件庫（Repository）：套件從哪裡下載的來源清單。來源設定錯了，更新就會失敗。  
3. 相依性（Dependency）：套件需要其他套件才能正常運作。`apt` 會幫你處理相依性，`dpkg` 不會。  
4. update vs upgrade：`update` 是更新「清單」，`upgrade` 是更新「已安裝套件」。很多人會把這兩個搞混。  
5. 清理（clean/autoremove）：移除不再需要的檔案或套件，讓系統更乾淨。清理不等於修復問題，但能降低雜訊。  

## 真實場景例子（3 個）

1. 新機器剛裝好：先更新清單，再安裝工具（例如 `curl`、`git`）。  
2. 系統提示「磁碟滿了」：用清理指令移除快取與不用的相依套件。  
3. 你只有一個 `.deb` 檔：用 `dpkg` 安裝，再用 `apt` 修相依性。  

## 常見誤解（至少 3 點）

1. 「我只要一直跑 `sudo apt-get update` 就會修好。」  
`update` 只是更新清單，問題可能是來源、網路或套件衝突。  

2. 「`dpkg -i` 安裝失敗就算了。」  
`dpkg` 不會自動補相依套件，你通常需要再跑 `sudo apt-get -f install` 來修。  

3. 「清理指令可以解決所有套件問題。」  
清理只處理快取與不用的套件，不會修復來源錯誤或版本衝突。  

## 下一步（3 條）

1. 把你常用的安裝清單做成一個腳本或筆記（新機器可快速重建）。  
2. 練習把指令改成「可理解」：知道每個參數在做什麼，避免照抄踩坑。  
3. 如果你在學 AI 自動化：可以把「需求」寫成結構化 Prompt，讓 AI 產出你要的安裝步驟並要求它列風險。  

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
