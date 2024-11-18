# NodePin

订阅监看管理，汇总配置生成

## 技术栈
- Next.js 14
- TypeScript
- Cloudflare Pages 部署

## 功能特性
- 多订阅源管理
- 流量统计追踪
- 节点过滤和分组
- Clash 配置生成

## 环境变量配置
```bash
ADMIN_USERNAME=admin     # 管理面板用户名
ADMIN_PASSWORD=admin     # 管理面板密码
SUB_URL_1=        # 订阅链接可配置多个
SUB_URL_2=
...
```

## 订阅导入
通过 域名/clash 获取配置，可直接导入 clash 客户端

## D1 数据库
```sql
DROP TABLE IF EXISTS subscriptions;
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```