#!/bin/sh

# prepare
echo "Prepare dir......"

# build
echo "Compiling....."
npm run build || { echo "Compilation failed, please check and try again"; exit 1; }

zip -r rambler.zip dist/

echo "Packaged done"

mv -f rambler.zip ~/Downloads/

echo "Move to Download"