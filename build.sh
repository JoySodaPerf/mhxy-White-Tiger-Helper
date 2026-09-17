#!/bin/sh
# Cloudflare Pages 构建脚本：把站点文件复制到 dist，避免把 node_modules 等误传
set -e
rm -rf dist
mkdir -p dist
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
  dist/
echo "Built dist/ with $(ls dist | wc -l) files."
ls -1 dist