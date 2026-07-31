# 本地运行 VSCode

[官方文档](https://github.com/microsoft/vscode/wiki/How-to-Contribute)

## 前置准备

- [Git](https://git-scm.com)
- [Node.JS](https://nodejs.org/en/download/prebuilt-binaries)，官方文档写的是`>=20.x`，笔者实际试下来，node 版本 22.x 可以完美运行。20.x 和 25.x 环境下都遇到了不同程度的问题。
  其中一个 25.x 高版本下遇到的一个问题在一个 [issue](https://github.com/electron-userland/electron-builder/issues/8465) 中提到。
- [Python](https://www.python.org/downloads/)用以下命令检查一下是否已经安装有 python，如果没有，可以用 Homebrew 进行安装

```
python --version
python3 --version
brew install python
```

- C/C++的编译工具链
  - [Xcode](https://developer.apple.com/xcode/resources/) 和命令行工具, 包含了安装 `gcc` 和关联的工具链 `make`
  - 通过运行 `xcode-select --install` 来安装命令行工具

## 构建和运行

### 获取源码

首先，fork 一份 vscode 源码在自己的仓库，在本地克隆下来

```
git clone https://github.com/<<<your-github-account>>>/vscode.git
```

### 构建

在这一步笔者只遇到了 node 版本导致的问题，通过使用 22.x 版本解决

```
cd vscode
npm install
```

接着有两个选择:

- 这一点笔者暂时还没试，先不翻译 ：If you want to build from inside VS Code, you can open the `vscode` folder and start the build task with <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> (<kbd>CMD</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> on macOS). The build task will stay running in the background even if you close VS Code. If you happen to close VS Code and open it again, just resume the build by pressing <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> (<kbd>CMD</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>) again. You can kill it by running the `Kill Build VS Code` task or pressing <kbd>Ctrl</kbd>+<kbd>D</kbd> in the task terminal.
- 在终端里运行`npm run watch`. 命令将在一个终端中同时运行 vscode 核心监听任务和插件任务。

### 运行

#### 桌面端

基于 Electron 运行，插件在 NodeJS 中运行：

##### macOS and Linux

```bash
./scripts/code.sh
./scripts/code-cli.sh # for running CLI commands (eg --version)
```

接下来就可以在任务栏中看到运行的开发版 vscode ("Code - OSS") 了

[![VS Code default icon](https://i.imgur.com/D2CeX0y.png)](https://i.imgur.com/D2CeX0y.png)

### 调试

先通过<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>唤出命令执行栏，接着通过`Developer: Toggle Developer Tools`命令，加载出 chrome 的开发者调试工具。
[![sourcemaps](http://i.imgur.com/KU3TdjO.png)](http://i.imgur.com/KU3TdjO.png)
