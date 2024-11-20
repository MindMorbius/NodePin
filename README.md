# NodePin

订阅监看管理，汇总配置生成

## 技术栈
- Next.js 14
- TypeScript
- Vercel 部署
- supabase 数据库
- zustand 状态管理

## 功能特性
- 多订阅源管理
- 流量统计追踪
- 节点过滤和分组
- Clash 配置生成


## 开发计划
1. 免责声明页面
2. 主页文本魔法化（react-i18next）
3. 数据库相关代码迁移：mongodb ——> supabase
4. 表结构确定：用户profile表、LinuxDo用户表、订阅表、令牌表、key表、
5. 账号认证系统：Linux.do（discourse社区）OAuth2登录
6. 订阅上传、加密、存储
7. 令牌发行、管理、使用
8. 节点获取、过滤、规则、导出
9. 管理面板：用户管理、令牌管理、订阅管理、节点管理


## 订阅导入
通过 域名/clash 获取配置，可直接导入 clash 客户端

## 数据库表结构
### 订阅信息表
```
{
  "id": 1,
  "name": "测试订阅",
  "url": "订阅地址，需要加密",
  "info": {
    "upload": 123,
    "download": 123,
    "total": 123,
    "expire": 4102329600
  },
  "nodeCount": 10,
  "success": "",
  "level": 0,
  "user_email": "noname@example.com",
  "lastUpdate": 1716268800,
  "createdAt": 1716268800,
  "status": "show" // hide | private | public | shared
}
```




## 认证流程

### 1. 用户认证流程

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant Discourse

    User->>Frontend: OAuth登录
    Frontend->>Discourse: 认证请求
    Discourse->>Backend: 返回用户信息
    Note right of Backend: 使用 discourse_id 派生密钥
    Backend->>Backend: HKDF(discourse_id + server_secret)
    Backend->>Frontend: 返回派生的公钥
    Frontend->>Frontend: 加密订阅内容
    Frontend->>Backend: 存储加密数据
```

### 2. 订阅上传和加密流程

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant DB

    User->>Frontend: 上传订阅链接
    Frontend->>Backend: 获取加密公钥
    Backend->>Frontend: 返回公钥
    Frontend->>Frontend: 使用公钥加密订阅内容
    Frontend->>Backend: 发送加密后的内容
    Backend->>DB: 存储加密数据
    Backend->>User: 返回成功
```

### 3. 令牌创建和使用流程

```mermaid
sequenceDiagram
    actor Owner
    actor User
    participant Frontend
    participant Backend
    participant DB

    Owner->>Frontend: 创建令牌
    Frontend->>Backend: 设置令牌参数
    Backend->>Backend: 生成令牌
    Backend->>DB: 存储令牌信息
    Backend->>Owner: 返回令牌

    User->>Frontend: 使用令牌
    Frontend->>Backend: 验证令牌
    Backend->>DB: 检查令牌有效性
    Backend->>Backend: 验证信任等级
    Backend->>DB: 更新使用计数
    Backend->>User: 授权成功
```

### 4. Key创建和订阅获取流程

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant Backend
    participant DB

    User->>Client: 创建 Key
    Client->>Backend: 发送 Key 配置
    Backend->>Backend: 生成 Key
    Backend->>DB: 存储 Key 信息
    Backend->>User: 返回 Key

    Client->>Backend: 使用 Key 请求订阅
    Backend->>DB: 验证 Key
    Backend->>DB: 获取订阅内容
    Backend->>Backend: 应用筛选规则
    Backend->>Client: 返回过滤后的节点
```

### 5. 完整业务流程

```mermaid
graph TD
    A[用户] -->|OAuth登录| B[认证]
    B -->|成功| C[用户主页]
    
    C -->|上传订阅| D[订阅池]
    C -->|创建Key| E[Key池]
    
    D -->|发行令牌| F[令牌管理]
    F -->|设置权限| G[令牌配置]
    
    H[其他用户] -->|使用令牌| I[订阅授权]
    I -->|创建Key| J[个人Key]
    
    J -->|请求节点| K[节点获取]
    K -->|验证权限| L[返回节点]
```


## 数据库表结构

