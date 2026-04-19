#!/bin/bash
#===============================================
# 编译定制脚本 - 优化版
# 功能：源码级配置修改
# 必要性：★★★☆☆ (中)
#===============================================

set -e  # 遇到错误立即退出

echo "=== 开始定制配置 ==="

#-----------------------------------------------
# 1. 修改默认 IP 地址
# 必要性：★★★☆☆ 
# 说明：将默认 LAN IP 从 192.168.1.1 改为 10.1.1.110
#      避免与光猫或其他路由器冲突
#-----------------------------------------------
echo "[1/3] 修改默认 IP 地址..."
sed -i 's/192\.168\.1\.1/10.1.1.110/g' openwrt/package/base-files/files/bin/config_generate

#-----------------------------------------------
# 2. 修改主机名 (可选)
# 必要性：★★☆☆☆
# 说明：设置默认主机名为 ImmortalWrt
#-----------------------------------------------
# sed -i 's/OpenWrt/ImmortalWrt/g' openwrt/package/base-files/files/bin/config_generate

#-----------------------------------------------
# 3. 设置 root 密码 (可选，生产环境建议手动设置)
# 必要性：★☆☆☆☆
# 说明：如需免密码登录可启用，否则注释掉
#      密码格式：$1$salt$hashed_password
#-----------------------------------------------
# sed -i 's/root::0:0:99999:7:::/root:$1$V4UetPzk$CYXluq4wUazHjmCDBCqXF.:0:0:99999:7:::/g' \
#     openwrt/package/base-files/files/etc/shadow

#-----------------------------------------------
# 4. 其他定制选项 (按需启用)
# 必要性：★☆☆☆☆
#-----------------------------------------------
# 启用 zstd 压缩并添加 upx 工具
# sed -i 's?zstd$?zstd ucl upx\n$(curdir)/upx/compile := $(curdir)/ucl/compile?g' tools/Makefile

# 允许覆盖已安装的包
# sed -i 's/$(TARGET_DIR)) install/$(TARGET_DIR)) install --force-overwrite/' package/Makefile

echo "=== 定制配置完成 ==="
