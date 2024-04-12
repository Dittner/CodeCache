#!/bin/bash
# to launch app enter cli cmd:
# bash run_app.sh

dir=$(pwd)

cat >scriptA <<EOF
#!/bin/sh
echo "1/2: Running server..."
cd $dir && python3 run_server.py
EOF
chmod +x scriptA

cat >scriptB <<EOF
#!/bin/sh
echo "2/2: Running client..."
cd "$dir"/CodeIndexClient && npm run client
EOF
chmod +x scriptB

open -a Terminal.app scriptA
open -a Terminal.app scriptB