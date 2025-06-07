---
title: "React Hooks 完整指南：從基礎到進階"
description: "深入了解 React Hooks 的使用方法，包含 useState、useEffect、useContext 等常用 Hooks 的實戰應用。"
publishDate: 2024-01-15
category: "前端開發"
tags: ["React", "JavaScript", "Hooks"]
heroImage: "/images/blog/react-hooks.svg"
draft: false
---

React Hooks 自 React 16.8 版本引入以來，徹底改變了我們編寫 React 組件的方式。它讓我們能夠在函數組件中使用狀態和其他 React 特性，使代碼更加簡潔和易於理解。

## 什麼是 React Hooks？

Hooks 是一些特殊的函數，讓你能夠在函數組件中「掛鉤」到 React 的特性。它們的名稱都以 `use` 開頭，這是一個重要的約定。

### Hooks 的優勢

1. **更簡潔的代碼**：減少了類組件的樣板代碼
2. **更好的邏輯重用**：通過自定義 Hooks 實現邏輯共享
3. **更容易測試**：函數組件更容易進行單元測試
4. **更好的性能**：避免了類組件的一些性能問題

## 基礎 Hooks

### useState - 狀態管理

`useState` 是最常用的 Hook，用於在函數組件中添加狀態。

```javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>你點擊了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        點擊我
      </button>
    </div>
  );
}
```

**重要提醒**：
- 狀態更新是異步的
- 如果新狀態依賴於前一個狀態，使用函數形式：`setCount(prev => prev + 1)`

### useEffect - 副作用處理

`useEffect` 用於處理副作用，如 API 調用、訂閱、手動 DOM 操作等。

```javascript
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('獲取用戶資料失敗:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]); // 依賴數組

  if (loading) return <div>載入中...</div>;
  if (!user) return <div>找不到用戶</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

**useEffect 的清理機制**：

```javascript
useEffect(() => {
  const timer = setInterval(() => {
    console.log('定時器執行');
  }, 1000);

  // 清理函數
  return () => {
    clearInterval(timer);
  };
}, []);
```

### useContext - 上下文管理

`useContext` 讓你能夠訂閱 React 上下文的變化。

```javascript
import React, { createContext, useContext, useState } from 'react';

// 創建上下文
const ThemeContext = createContext();

// 提供者組件
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 使用上下文的組件
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff'
      }}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      切換主題
    </button>
  );
}
```

## 進階 Hooks

### useReducer - 複雜狀態管理

當狀態邏輯較為複雜時，`useReducer` 比 `useState` 更適合。

```javascript
import React, { useReducer } from 'react';

const initialState = {
  count: 0,
  step: 1
};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.payload };
    case 'reset':
      return initialState;
    default:
      throw new Error('未知的 action 類型');
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>計數: {state.count}</p>
      <p>步長: {state.step}</p>
      
      <button onClick={() => dispatch({ type: 'increment' })}>
        增加
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>
        減少
      </button>
      
      <input
        type="number"
        value={state.step}
        onChange={(e) => dispatch({ 
          type: 'setStep', 
          payload: Number(e.target.value) 
        })}
      />
      
      <button onClick={() => dispatch({ type: 'reset' })}>
        重置
      </button>
    </div>
  );
}
```

### useMemo - 性能優化

`useMemo` 用於緩存計算結果，避免不必要的重複計算。

```javascript
import React, { useState, useMemo } from 'react';

function ExpensiveComponent({ items }) {
  const [filter, setFilter] = useState('');

  // 只有當 items 或 filter 改變時才重新計算
  const filteredItems = useMemo(() => {
    console.log('重新計算過濾結果');
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="搜尋項目..."
      />
      
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### useCallback - 函數緩存

`useCallback` 用於緩存函數，避免子組件不必要的重新渲染。

```javascript
import React, { useState, useCallback, memo } from 'react';

// 子組件使用 memo 進行優化
const ChildComponent = memo(({ onClick, name }) => {
  console.log(`${name} 組件重新渲染`);
  return <button onClick={onClick}>{name}</button>;
});

function ParentComponent() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  // 使用 useCallback 緩存函數
  const handleClick1 = useCallback(() => {
    setCount1(prev => prev + 1);
  }, []);

  const handleClick2 = useCallback(() => {
    setCount2(prev => prev + 1);
  }, []);

  return (
    <div>
      <p>Count1: {count1}</p>
      <p>Count2: {count2}</p>
      
      <ChildComponent onClick={handleClick1} name="Button 1" />
      <ChildComponent onClick={handleClick2} name="Button 2" />
    </div>
  );
}
```

## 自定義 Hooks

自定義 Hooks 讓你能夠提取組件邏輯到可重用的函數中。

### useLocalStorage - 本地存儲 Hook

```javascript
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // 從 localStorage 獲取初始值
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('讀取 localStorage 失敗:', error);
      return initialValue;
    }
  });

  // 更新 localStorage 的函數
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function 
        ? value(storedValue) 
        : value;
      
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('寫入 localStorage 失敗:', error);
    }
  };

  return [storedValue, setValue];
}

// 使用自定義 Hook
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'zh-TW');

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">淺色主題</option>
        <option value="dark">深色主題</option>
      </select>
      
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="zh-TW">繁體中文</option>
        <option value="en-US">English</option>
      </select>
    </div>
  );
}
```

### useFetch - 數據獲取 Hook

```javascript
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// 使用自定義 Hook
function UserList() {
  const { data: users, loading, error } = useFetch('/api/users');

  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error}</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## Hooks 使用規則

1. **只在最頂層調用 Hooks**：不要在循環、條件或嵌套函數中調用 Hooks
2. **只在 React 函數中調用 Hooks**：在 React 函數組件或自定義 Hooks 中調用

```javascript
// ❌ 錯誤：在條件語句中使用 Hook
function BadComponent({ condition }) {
  if (condition) {
    const [state, setState] = useState(0); // 錯誤！
  }
  // ...
}

// ✅ 正確：在頂層使用 Hook
function GoodComponent({ condition }) {
  const [state, setState] = useState(0);
  
  if (condition) {
    // 在這裡使用 state
  }
  // ...
}
```

## 最佳實踐

### 1. 合理使用依賴數組

```javascript
// ❌ 缺少依賴
useEffect(() => {
  fetchUser(userId);
}, []); // userId 變化時不會重新執行

// ✅ 包含所有依賴
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

### 2. 避免過度優化

```javascript
// ❌ 不必要的 useMemo
const simpleValue = useMemo(() => props.value * 2, [props.value]);

// ✅ 直接計算
const simpleValue = props.value * 2;
```

### 3. 合理拆分狀態

```javascript
// ❌ 將不相關的狀態放在一起
const [state, setState] = useState({
  user: null,
  posts: [],
  theme: 'light'
});

// ✅ 分別管理不同的狀態
const [user, setUser] = useState(null);
const [posts, setPosts] = useState([]);
const [theme, setTheme] = useState('light');
```

## 總結

React Hooks 為函數組件帶來了強大的能力，讓我們能夠編寫更簡潔、更易維護的代碼。通過掌握基礎 Hooks 和進階 Hooks，以及學會創建自定義 Hooks，你將能夠更有效地開發 React 應用。

記住，Hooks 的核心思想是讓邏輯重用變得更簡單，讓組件更專注於 UI 的呈現。在實際開發中，要根據具體需求選擇合適的 Hooks，避免過度設計和不必要的優化。

希望這篇指南能幫助你更好地理解和使用 React Hooks！ 