#!/bin/bash
# Keep-alive برای static server
cd /home/z/my-project/out

while true; do
  # چک کن آیا سرور هنوز زنده هست
  if ! curl -s -o /dev/null --max-time 3 http://localhost:3000 > /dev/null 2>&1; then
    echo "$(date) - Server down, restarting..."
    pkill -9 -f "http.server" 2>/dev/null
    sleep 1
    nohup python3 -m http.server 3000 --bind 0.0.0.0 > /tmp/static-server.log 2>&1 &
    sleep 2
  fi
  sleep 5
done
