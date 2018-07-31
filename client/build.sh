#! /bin/bash

ROOT_DIR=../dist

rm -rf $ROOT_DIR
mkdir $ROOT_DIR

cp -r public/images $ROOT_DIR/
cp -r public/js $ROOT_DIR/
cp -r public/loader $ROOT_DIR/

cp public/index.html $ROOT_DIR/
cp public/jwt.html $ROOT_DIR/
cp public/ie.html $ROOT_DIR/
cp public/manifest.json $ROOT_DIR/

webpack --config webpack-dist.config.js