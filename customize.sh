#!/bin/bash
#=================================================
# Description: Customization script for OpenWrt build
# Author: kenzo
#=================================================

set -e

echo "=== 开始定制配置 ==="

# [1/3] 修改默认 IP 地址为 10.1.1.110 (适配 ImmortalWrt 结构)
echo "[1/3] 修改默认 IP 地址..."
NETWORK_FILE="package/base-files/files/etc/config/network"
if [ -f "$NETWORK_FILE" ]; then
    # 备份原文件
    cp $NETWORK_FILE $NETWORK_FILE.bak
    # 修改 lan 接口 IP
    sed -i 's/ipaddr=192\.168\.1\.1/ipaddr=10.1.1.110/g' $NETWORK_FILE
    sed -i 's/ipaddr=\"192\.168\.1\.1\"/ipaddr=\"10.1.1.110\"/g' $NETWORK_FILE
    echo "默认 IP 已修改为 10.1.1.110"
else
    echo "警告: 未找到 network 配置文件，跳过 IP 修改。"
fi

# [2/3] 修改默认主机名
echo "[2/3] 修改默认主机名..."
SYSTEM_FILE="package/base-files/files/etc/system.conf"
if [ -f "$SYSTEM_FILE" ]; then
    sed -i 's/hostname=OpenWrt/hostname=ImmortalWrt/g' $SYSTEM_FILE
    echo "主机名已修改为 ImmortalWrt"
else
    # 尝试另一种常见路径
    SYSTEM_FILE_ALT="package/base-files/files/etc/config/system"
    if [ -f "$SYSTEM_FILE_ALT" ]; then
        sed -i 's/options system/\&\n\toption hostname '\''ImmortalWrt'\''/g' $SYSTEM_FILE_ALT
        echo "主机名已修改为 ImmortalWrt (alt)"
    else
        echo "警告: 未找到 system 配置文件，跳过主机名修改。"
    fi
fi

# [3/3] 修改默认时区
echo "[3/3] 修改默认时区..."
SYSTEM_FILE="package/base-files/files/etc/config/system"
if [ -f "$SYSTEM_FILE" ]; then
    # 如果文件存在但为空或无时区配置，追加配置
    if ! grep -q "option timezone" $SYSTEM_FILE; then
        echo "" >> $SYSTEM_FILE
        echo "config system" >> $SYSTEM_FILE
        echo "    option timezone 'CST-8'" >> $SYSTEM_FILE
        echo "    option timezone_dst ''" >> $SYSTEM_FILE
    else
        sed -i "s/option timezone '.*'/option timezone 'CST-8'/g" $SYSTEM_FILE
    fi
    echo "时区已修改为 CST-8"
else
    echo "警告: 未找到 system 配置文件，跳过时区修改。"
fi

echo "=== 定制配置完成 ==="
