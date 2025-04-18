#!/bin/sh

while ping -c 1 $1 >/dev/null 2>&1
    do sleep 1
done

echo "$1 finished!"

export PATH="$PATH:$SCRIPT_PATH"
exec $2