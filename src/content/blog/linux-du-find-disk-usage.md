---
title: "Linux du 找尋誰吃滿了硬碟"
description: "詳細介紹如何使用Linux du命令來檢查系統檔案或目錄的使用大小，幫助找出佔用過多空間的資料。"
publishDate: 2020-06-24
updatedDate: 2024-12-05
heroImage: "/images/blog/linux-du.svg"
category: "Linux"
tags: ["Linux", "du", "io performance", "系統管理", "效能優化"]
draft: false
featured: true
author: "Allen Shi"
readingTime: 3
---

du 指令是用來檢查 Linux 系統的檔案或目錄的使用大小，當 disk 堆滿的時候可以找出哪裡的資料佔據過多，來做故障排除。

## 命令參數

- **-a** 或 **--all**: 顯示目錄中個別檔的大小。   
  
- **-b** 或 **--bytes**: 顯示目錄或檔大小時，以 byte 為單位。   
  
- **-c** 或 **--total**: 除了顯示個別目錄或檔的大小外，同時也顯示所有目錄或檔的總和。   
  
- **-k** 或 **--kilobytes**: 以 KB (1024bytes) 為單位輸出。  
  
- **-m** 或 **--megabytes**: 以 MB 為單位輸出。   
  
- **-s** 或 **--summarize**: 僅顯示總計，只列出最後加總的值。  
  
- **-h** 或 **--human-readable**: 以 K、M、G 為單位，提高資訊的可讀性。  
  
- **-x** 或 **--one-file-xystem**: 以一開始處理時的檔系統為准，若遇上其他不同的檔系統目錄則略過。   
  
- **-L** <符號鏈結> 或 **--dereference** <符號鏈結>: 顯示選項中所指定符號鏈結的原始檔案大小。   
  
- **-S** 或 **--separate-dirs**: 顯示個別目錄的大小時，並不含其子目錄的大小。   
  
- **-X** <檔> 或 **--exclude-from=** <檔>: 在 <檔> 指定目錄或檔。   
  
- **--exclude=** <目錄或檔>: 略過指定的目錄或檔。   
  
- **-D** 或 **--dereference-args**: 顯示指定符號鏈結的原始檔案大小。   
  
- **-H** 或 **--si**: 與 -h 參數相同，但是 K、M、G 是以 1000 為換算單位。   
  
- **-l** 或 **--count-links**: 重複計算硬體鏈結的檔。

## 常見用法

### 1. 顯示目錄或者檔所占空間

```bash
du
```

### 2. 檔案和目錄都顯示（適合找Docker容器佔用空間）

```bash
du -sh /var/lib/docker/*
```

### 3. 以人類可讀的方式顯示目錄大小

```bash
du -h /home
```

### 4. 顯示當前目錄下最大的前10個資料夾

```bash
du -h --max-depth=1 | sort -hr | head -n 10
```

### 5. 排除特定目錄

```bash
du -h --exclude="node_modules" .
```

## 結合其他命令

du 命令可以結合其他工具如 `sort`、`head` 等來更有效地分析磁碟空間：

```bash
# 找出 /var 目錄下最大的5個子目錄
du -h /var | sort -rh | head -5

# 用 ncdu 交互式檢查目錄大小
ncdu /var
```

當系統告警磁碟空間不足時，使用 du 命令可以快速找出哪些資料夾或檔案佔用了大量空間，從而採取清理或遷移的措施。 