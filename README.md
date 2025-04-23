# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## 项目简介

- 该项目是一个基于Vue 3 + TypeScript + Vite，SPA简单单页应用项目，使用TypeScript进行类型检查，使用pinia进行状态管理，使用vue-router进行路由管理。

## 构建和部署

```bash
# 项目打包
yarn build
```

```bash
# 通过u盘部署到ubuntu
sudo fdisk -l
sudo mkdir /mnt/usb
sudo mount /dev/sdb1 /mnt/usb
sudo cp -r /mnt/usb/dist /var/www/html/
sudo umount /mnt/usb
```

修改nginx配置文件：

```bash
sudo vim /etc/nginx/sites-available/default
```

改root为：

```bash
root /var/www/html/dist;
```

重启nginx：

```bash
sudo service nginx restart
```

## 技术栈

- Vue3
- TypeScript
- Vite
- pinia
