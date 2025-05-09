---
title: AWS Redis 轉換到 ValKey
date: 2025-05-07 22:58:28
tags:
  - AWS
  - Redis
  - Valkey
  - ElastiCache
  - 雲端服務
---

# AWS Redis 轉換到 Valkey 的優缺點與遷移

AWS 最近宣布支援 Valkey 作為 ElastiCache 的選項，Valkey 是一個 Redis 的開源分支，由 Linux Foundation 支持，並得到了多家科技巨頭的支援，包括 AWS、Google Cloud、Oracle 等。本文將探討從 Redis 遷移到 Valkey 的優缺點，以及如何進行無縫遷移。

## 為什麼考慮從 Redis 轉換到 Valkey？授權問題說分明

說到 Redis 和 Valkey，不得不提一下那個導致它們「分家」的大象在房間裡 - 授權問題。讓我們用比較輕鬆的方式來聊聊這個話題！

### Redis 的授權變更風波

Redis 一直是開發者心中的「快取之王」，但在 2018 年，Redis Labs（現在的 Redis Inc.）做了一個有點出人意料的決定 - 他們將部分模組的授權從開源友好的 BSD/MIT 變更為 Commons Clause。這個變更基本上是說：「嘿，你可以用我們的軟體，但別拿去當雲服務賣錢哦！」

這個變動對誰影響最大？沒錯，正是像 AWS、Google Cloud 這樣的雲服務提供商。他們突然間發現自己不能再那麼自由地提供 Redis 服務了（至少對於這些特殊模組）。簡單地說，Redis Labs 說：「想用我們的高級模組來賺錢？那就付費吧！」

### 雲服務廠商的「小心思」

對於雲服務廠商來說，這就像是在燒烤派對上突然被告知調味料要另外收費。AWS 和其他廠商想：「我們不能就這樣坐以待斃吧？」

於是，2024 年 3 月，在 Linux Foundation 的支持下，Valkey 誕生了！Valkey 基本上就是說：「我們要回到原始的開源精神，創建一個真正自由的 Redis 分支。」

### Valkey：自由奔放的 Redis 孿生兄弟

Valkey 採用了更為寬鬆的 BSD 授權，這基本上意味著：「拿去用吧！想怎麼用就怎麼用！」這讓雲服務廠商鬆了一口氣，因為他們可以自由地在自己的平台上提供 Valkey 服務，而不用擔心被告侵權或要支付額外的授權費用。

這就好比你原本最愛的咖啡店突然開始限制你帶走的咖啡不能在辦公室分享，而 Valkey 則是說：「來吧，想拿去哪裡喝都行！」

### 對開發者意味著什麼？

對於我們這些普通開發者來說，這場「授權大戰」到底有什麼影響呢？

1. **更多選擇**：有競爭才有進步！Redis 和 Valkey 的競爭可能會促使雙方不斷推出更好的功能。

2. **更低成本**：如前面提到的，AWS 的 ElastiCache for Valkey 比 Redis 便宜多達 33%。誰不喜歡省錢呢？

3. **API 兼容性**：好消息是，你的代碼幾乎不需要改動！Valkey 完全兼容 Redis 的 API，所以遷移過程應該相當平滑。

4. **開源的未來更有保障**：有了 Linux Foundation 這個大靠山，Valkey 的開源未來似乎更有保障，不太可能突然改變授權條款。

總的來說，Redis 的授權變更引發了開源社區的一場小地震，而 Valkey 則是這場地震後的新大陸。對於企業和開發者來說，這意味著更多選擇、更低成本，以及對開源未來的更多保障。

## Valkey 是什麼？

Valkey 是一個由 Linux Foundation 支持的 Redis 開源分支，它提供與 Redis OSS 相容的 API，同時具有高性能的鍵值存儲功能。Valkey 支持多種工作負載，如快取、消息隊列，甚至可以作為主要數據庫使用。它可以作為獨立守護進程運行，也可以在集群中運行，支持複製和高可用性選項。

## Redis 轉換到 Valkey 的優點

1. **成本效益**：
   - ElastiCache for Valkey Serverless 比 Redis 便宜 33%
   - 自行設計的集群可節省 20% 的成本
   - Serverless 的成本可低至每月 $6 起

2. **與 Redis OSS API 完全相容**：
   - 無需修改程式碼即可遷移
   - 支持 Redis 的核心數據結構（字符串、列表、集合、排序集合、哈希等）

3. **開源優勢**：
   - 開放治理模式，減少廠商鎖定風險
   - 由多家科技巨頭支持，包括 AWS、Google Cloud、Oracle 等
   - Linux Foundation 的持續支持與發展

4. **高性能**：
   - 支持每秒數百萬次操作，響應時間為微秒級
   - 性能基準測試顯示與 Redis OSS 相當或超越

5. **AWS 整合優化**：
   - 與 AWS 服務完全整合
   - 支持無縫擴展、多可用區部署和跨區域複製
   - AWS 優化的雲端特定功能

## Redis 轉換到 Valkey 的缺點

1. **生態系統成熟度**：
   - Redis 擁有更成熟的生態系統和更廣泛的文檔
   - Redis 的社區和第三方工具更為豐富

2. **高級功能可用性**：
   - 部分 Redis Labs 的專有模塊（如 RedisBloom、RedisGraph、RedisTimeSeries）尚未完全支持
   - Valkey 的某些企業級功能可能仍在開發中

3. **穩定性考量**：
   - Valkey 相對較新（2024年3月推出），長期穩定性尚未被廣泛驗證
   - Redis 已有多年的生產環境驗證

4. **技術支持**：
   - Redis 提供商業支持選項
   - Valkey 的支持主要來自開源社區和 AWS

5. **遷移風險**：
   - 即使 API 相容，在大規模遷移過程中仍可能遇到未知問題
   - 需要全面測試以確保無縫遷移

## 如何進行遷移

## 1. 新建立 Valkey 環境

![AWS Valkey](valkey.png)

## 2. AWS 提供了從自我託管的 Redis OSS 遷移到 ElastiCache for Valkey 的線上遷移功能，以下是遷移步驟：

### 1. 準備工作

1. **評估兼容性**：
   - 確保您當前的 Redis 使用方式與 Valkey 兼容
   - 檢查是否使用了 Valkey 尚未支持的 Redis 特定功能

2. **創建目標環境**：
   - 在 AWS 中創建 ElastiCache for Valkey 部署
   - 配置應與源 Redis 部署相匹配（實例類型、分片數、副本數等）

3. **網絡配置**：
   - 確保源 Redis 部署和目標 Valkey 部署之間的網絡連接
   - 設置安全組和網絡 ACL，允許複製流量

### 2. 測試遷移

在實際進行生產環境遷移之前，建議在測試環境中進行遷移測試：

1. 創建測試環境的 Redis 和 Valkey 部署
2. 使用實際數據的子集進行測試遷移
3. 驗證數據一致性和應用程序兼容性
4. 測量遷移時間和性能影響

### 3. 執行遷移

AWS 提供的線上遷移功能可以實現零停機遷移：

1. **啟動遷移**：
   - 使用 `StartMigration` API 操作或 AWS CLI 命令開始遷移
   - 對於 Redis 非集群模式，ElastiCache Valkey 的主節點將設為源 Redis 主集群的副本
   - 對於 Redis 集群模式，每個 ElastiCache 分片的主節點將成為源集群對應分片的副本

2. **監控複製狀態**：
   - 使用 `valkey-cli INFO` 命令檢查複製狀態
   - 監控 AWS CloudWatch 指標追蹤遷移進度

3. **驗證數據同步**：
   - 確認所有數據已同步到 Valkey 部署
   - 檢查復制延遲指標，確保數據一致性

### 4. 完成遷移

當複制完成且應用程序準備好切換時：

1. **完成遷移**：
   - 使用 `CompleteMigration` API 操作將 ElastiCache Valkey 部署提升為主要部署
   - 這將使 Valkey 節點變為主節點，能夠接受寫操作

2. **重定向應用程序**：
   - 更新應用程序配置，指向新的 ElastiCache Valkey 端點
   - 逐步轉移流量，監控應用程序性能和錯誤率

3. **驗證遷移**：
   - 確認所有數據已成功遷移
   - 驗證應用程序功能和性能

### 5. 後續監控與優化

1. **持續監控**：
   - 使用 CloudWatch 監控 Valkey 性能指標
   - 設置告警以捕捉潛在問題

2. **優化配置**：
   - 根據實際工作負載調整 Valkey 部署配置
   - 考慮利用 Valkey 特有的功能和優化

## 結論

將 Redis 遷移到 AWS ElastiCache for Valkey 提供了顯著的成本優勢和開源靈活性，同時保持與 Redis OSS API 的兼容性。Valkey 作為 Redis 的「自由精神繼承者」，不僅解決了授權問題的困擾，還為企業提供了更具成本效益的選擇。

不過，每枚硬幣都有兩面。Valkey 作為後起之秀，在生態系統成熟度和部分高級功能方面還有追趕的空間。這就像是選擇最新款的智能手機 vs 經過時間檢驗的老牌機型 - 各有優缺。

通過仔細規劃、測試和執行，從 Redis 到 Valkey 的平滑遷移絕對是可能的。AWS 提供的線上遷移功能就像是一位經驗豐富的搬家公司，讓整個過程變得簡單且低風險。

對於考慮此遷移的團隊，建議先在非關鍵環境中「小試牛刀」，評估一下性能和兼容性，然後再決定是否在生產環境中「大展拳腳」。畢竟，再好的地圖也比不上親自踏上旅程！

## 參考資料

- [AWS ElastiCache 線上遷移文檔](https://docs.aws.amazon.com/zh_tw/AmazonElastiCache/latest/dg/OnlineMigration.html)
- [What is Valkey? How is it related to Redis and AWS ElastiCache?](https://medium.com/@csjcode/what-is-valkey-how-is-it-related-to-redis-and-aws-elasticache-61bed5126658)
- [Valkey 官方網站](https://valkey.io/) 