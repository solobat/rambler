#!/bin/sh

# prepare
echo "Prepare dir......"
rm -fr dist/

# build
echo "Compiling....."
yarn build || { echo "Compilation failed, please check and try again"; exit 1; }

zip -r rambler.zip dist/

echo "Packaged done"

mv -f rambler.zip ~/Downloads/

echo "Move to Download"