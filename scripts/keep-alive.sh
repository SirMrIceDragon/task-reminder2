#!/bin/bash
# Keep server alive
while true; do
  if ! curl -s -o /dev/null --max-time 3 http://localhost:3000 > /dev/null 2>&1; then
    pkill -9 -f "http.server" 2>/dev/null
    sleep 1
    cd /home/z/my-project/out
    python3 -m http.server 3000 --bind 0.0.0.0 > /tmp/srv.log 2>&1 &
    sleep 2
  fi
  sleep 5
done
