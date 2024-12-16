# NodePin

订阅一站式管理，轻松实现授权分发获取

## 技术栈
- Next.js 14
- TypeScript
- Vercel 部署
- supabase 数据库

## 功能特性
- 多订阅源管理
- 流量统计追踪
- 节点过滤和分组
- Clash 配置生成

## 开发计划
### 已完成
- [x] 主页文本魔法化（react-i18next）
- [x] 免责声明页面
- [x] 表结构确定
- [x] 移除 MongoDB
- [x] 接入 Linux.do 登录
- [x] 账号数据保存到 supabase
- [x] 账号数据同步时机
- [x] 获取登录用户 Discourse 表 ID
- [x] 获取显示用户列表
- [X] 系统设计梳理优化
- [X] 获取用户profile ID
- [X] 使用access token 检查会话有效性
- [X] 导航栏
- [X] 导航页
- [X] 404 页面
- [X] 主页订阅信息展示
- [X] 会话过期状态显示
- [x] 认证中间件实现
- [x] 用户认证逻辑重构
- [X] 订阅加密实现
- [X] 订阅数据同步：上传、更新、下载
- [X] 请求头统一添加
- [x] 调用API检查会话过期并清除登录状态
- [x] 等待登录同步loading
- [x] navbar 中间部分内容调整

### preview分支
- [x] 跳转页面显示loading
- [x] 订阅令牌生成
- [ ] 订阅、令牌数据同步

- [ ] 订阅链接显示

- [ ] 会话过期倒计时提醒
- [ ] loading显示详细状态

### 正式分支
- [ ] 订阅管理面板完善
- [ ] zustand 状态管理
- [ ] 上传订阅时获取订阅信息，自动设置过期时间
- [ ] 上传者一键更新订阅，定时更新订阅
- [ ] 订阅更新失败提醒
- [ ] 令牌发行、管理、使用
- [ ] 节点获取、过滤、规则、导出
- [ ] 管理面板：用户管理、令牌管理、订阅管理、节点管理

### 后续计划
- [ ] 集成Sub-Store
> https://github.com/sub-store-org/Sub-Store
> https://github.com/sub-store-org/Sub-Store-Front-End