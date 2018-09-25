#! /bin/bash

ROOT_DIR=dist

rm -rf $ROOT_DIR
mkdir $ROOT_DIR

cp -r public/images $ROOT_DIR/
cp -r public/js $ROOT_DIR/
cp -r public/loader $ROOT_DIR/

cp public/index.html $ROOT_DIR/
cp public/package.json $ROOT_DIR/

webpack --config webpack-dist.config.js