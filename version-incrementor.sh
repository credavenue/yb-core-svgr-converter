#!/bin/bash


file_path="yb-core-icon/package.json"

version=$(sed -n 's/.*"version": "\(.*\)".*/\1/p' "$file_path")

if [[ $version =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)(.*)$ ]]; then
  major="${BASH_REMATCH[1]}"
  minor="${BASH_REMATCH[2]}"
  patch="${BASH_REMATCH[3]}"
  suffix="${BASH_REMATCH[4]}"
  new_version="$major.$minor.$((patch+1))$suffix"
  sed -i "" "s/\"version\": \"$version\"/\"version\": \"$new_version\"/" "$file_path"
  echo "Version updated to $new_version"
else
  echo "Invalid version format: $version"
fi