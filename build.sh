#!/bin/sh
# Cloudflare Workers 构建脚本：把站点文件放到 dist/mhxy/wtutils/ 子目录
# 这样 Workers Assets 直接按路径匹配，不需要 rewrite 规则
set -e
rm -rf dist
mkdir -p dist/mhxy/wtutils
cp \
  index.html \
  styles.css \
  app.js \
  data.js \
  manifest.webmanifest \
  sw.js \
  icon-192.png \
  icon-512.png \
  icon-180.png \
  icon.svg \
  dist/mhxy/wtutils/
echo "Built dist/ with structure:"
find dist -type f | sort
