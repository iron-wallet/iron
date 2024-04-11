#!/bin/bash

env=${1:-prod}

tauri() {
  color=$1
  cargo tauri icon --output bin/icons icons/symbol-$color.png
  cargo tauri icon --output bin/icons-attention icons/symbol-$color-attention.png
}

gui() {
  color=$1
  dest=$2
  mkdir -p gui/public/logo
  cp icons/symbol-$color.svg gui/public/logo/symbol-$dest.svg
  cp icons/symbol-$color-attention.svg gui/public/logo/symbol-$dest-attention.svg
}

extension() {
  color=$1
  for size in 16 48 128; do
    mkdir -p extension/src/public/icons
    convert icons/symbol-$color.png -resize ${size}x extension/src/public/icons/ethui-${size}.png
    convert icons/symbol-$color-attention.png -resize ${size}x extension/src/public/icons/ethui-attention-${size}.png
  done
}

if [[ "$env" == "prod" ]]; then
  echo "Generating production icons..."
  tauri "white"
  gui white white
  gui black black
  extension black
else
  echo "Generating dev icon..."
  tauri purple
  gui purple white
  gui purple black
  extension purple
fi

