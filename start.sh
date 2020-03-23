#! /bin/bash

# Download Dependencies
# =====================


# To Run lnav on xterm-256color may need to set TERM manually
# TERM=xterm-color ./bin/lnav ./logs/


# Hotkeys Reference!
# https://lnav.readthedocs.io/en/latest/hotkeys.html

# https://github.com/tstack/lnav
download_lnav() {
    curl -s https://api.github.com/repos/tstack/lnav/releases/latest \
    | grep -m 1 "browser_download_url.*linux-64bit.zip" \
    | cut -d : -f 2,3 \
    | tr -d \" \
    | wget --output-document lnav.zip -qi -
    # Move into Bin
    unzip "lnav.zip" -d "./bin"
    mv ./bin/**/* ./bin/
    find ./bin -type d -empty -delete
    rm -f "lnav.zip"
}
# https://github.com/vi/websocat
download_websocat() {
    curl -s https://api.github.com/repos/vi/websocat/releases/latest \
    | grep -m 1 "browser_download_url.*_i386-linux" \
    | cut -d : -f 2,3 \
    | tr -d \" \
    | wget --output-document websocat -qi -
    # Move into Bin
    mv ./websocat ./bin
    chmod +x ./bin/websocat
    rm -f "websocat.zip"

}

# Make sure we have lnav
if [[ -f "./bin/lnav" && -s "./bin/lnav" ]]; then
    echo "lnav already downloaded"
else
    download_lnav
    echo "lnav was downloaded";
fi

# Make sure we websocat
if [[ -f "./bin/websocat" && -s "./bin/websocat" ]]; then
    echo "websocat already downloaded"
else
    download_websocat
    echo "websocat was downloaded";
fi

# Run program and write logs
# ==========================

# Parse current environment variables
export $(egrep -v '^#' .env | xargs)

start() {
    # Poke it
    touch $1
    npm run --silent start:app &>> $1 # stdout and stderr to file
    # npm run --silent start:app &>> tee $1 #optional stdout as well as log
}

# Do logic if flag for sync is set
# EG: "./start.sh sync"

if [ -z "$1" ]; then
    echo "Starting app and logging locally"
    start ./logs/$LOG_TAG.log
else
    echo "Starting app and logging over the network"
    touch ./$LOG_TAG.log
    tail ./$LOG_TAG.log -f -q -n0 | ./bin/websocat --binary stdio: ws://$LOG_ENDPOINT/$LOG_TAG &
    start ./$LOG_TAG.log &
    wait
fi

# Wait for the end of processes
