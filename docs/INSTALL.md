# 本地部署指南

本文档介绍 Qwerty Learner 项目在本机的安装与部署步骤。

## 环境要求

| 工具    | 版本要求 | 说明                                 |
| ------- | -------- | ------------------------------------ |
| Node.js | ≥ 16     | JavaScript 运行环境                  |
| Yarn    | 1.x      | 包管理工具（项目使用 yarn 而非 npm） |
| Git     | 任意     | 用于拉取代码                         |

### 验证环境

在终端执行以下命令，确认版本号正常输出：

```bash
node --version
git --version
yarn --version
```

## 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/RealKai42/qwerty-learner.git
cd qwerty-learner
```

### 2. 安装依赖

使用 yarn 安装项目依赖（项目内已有 `yarn.lock`，建议保持版本一致）：

```bash
yarn install
```

依赖安装可能需要 1-2 分钟。

### 3. 启动开发服务器

```bash
yarn start
```

启动成功后控制台会输出：

```
  VITE v4.3.8  ready in 600 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

浏览器访问 [http://localhost:5173/](http://localhost:5173/) 即可使用。

## 常用命令

| 命令            | 作用                               |
| --------------- | ---------------------------------- |
| `yarn start`    | 启动开发服务器（Vite，支持热更新） |
| `yarn build`    | 生产环境构建，输出到 `build/` 目录 |
| `yarn lint`     | 运行 ESLint 代码检查               |
| `yarn prettier` | 使用 Prettier 格式化代码           |
| `yarn test:e2e` | 运行 Playwright 端到端测试         |

## 后台启动 / 停止服务

### 后台启动

```bash
nohup yarn start > /tmp/qwerty-learner-dev.log 2>&1 &
echo "PID: $!"
```

### 停止服务

```bash
# 找到进程 ID 后终止
lsof -ti:5173 | xargs kill

# 或者直接 kill（替换为实际 PID）
kill <PID>
```

### 查看日志

```bash
tail -f /tmp/qwerty-learner-dev.log
```

## Docker 部署（可选）

项目根目录已包含 `Dockerfile` 和 `docker-compose.yaml`，可使用 Docker 一键启动：

```bash
docker-compose up -d
```

## 常见问题

### Q: 端口 5173 被占用？

Vite 启动时若检测到端口被占用会自动切换到下一个可用端口（5174、5175…），以控制台实际输出为准。

也可以手动指定端口启动：

```bash
npx vite --port 5174
```

### Q: 依赖安装很慢 / 失败？

- 检查网络：可以配置 yarn 镜像源，例如淘宝镜像：

  ```bash
  yarn config set registry https://registry.npmmirror.com
  ```

- 清理缓存重试：

  ```bash
  yarn cache clean
  rm -rf node_modules
  yarn install
  ```

### Q: Node 版本过低报错？

本项目 Vite 4 要求 Node.js ≥ 14.18，推荐 Node 16+。可通过 [nvm](https://github.com/nvm-sh/nvm) 切换版本：

```bash
nvm install 18
nvm use 18
```

### Q: macOS 上 `node-gyp` 报错？

安装 Xcode 命令行工具：

```bash
xcode-select --install
```
