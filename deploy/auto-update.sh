#!/bin/bash
# Redeploys the site when a new :latest image is published. Runs every 2 minutes from a systemd
# timer on the server (murqin-auto-update.timer / .service, as user debian; the box has no cron).
#
# Polling instead of a webhook keeps the server closed: nothing outside can trigger it, and
# GitHub never gets credentials for the box. Cost: a push shows up within build time + 2 minutes.
#
# If the new container does not answer within a minute, the previous image is started again.
set -euo pipefail

IMAGE=ghcr.io/murqin/murq.in:latest
NAME=murqin-site
DIR="$HOME/murqin-deploy"
DATA=/cosmos-storage/murqin/data

log() { echo "$(date '+%F %T') $*"; }

run_site() {
    # Same settings as the manual deploy. PORT=80 keeps the Cosmos route (http://murqin-site:80) valid.
    # The image's Dockerfile labels itself cosmos-auto-update=true; switch that off so Cosmos and this
    # script never recreate the container at the same time.
    docker run -d --name "$NAME" --restart unless-stopped -p 8080:80 \
        --network cosmos-web-default --network-alias web \
        -e PORT=80 -e ALLOWED_ORIGINS=https://murq.in \
        -v "$DATA:/data" \
        --label cosmos-auto-update=false \
        "$1" >/dev/null
}

healthy() {
    for _ in $(seq 30); do
        curl -fs -o /dev/null --max-time 2 http://127.0.0.1:8080/api/visitors && return 0
        sleep 2
    done
    return 1
}

# A slow pull must not overlap the next cron run.
exec 9>"$DIR/.lock"
flock -n 9 || exit 0

docker pull -q "$IMAGE" >/dev/null
new=$(docker image inspect -f '{{.Id}}' "$IMAGE")
old=$(docker inspect -f '{{.Image}}' "$NAME" 2>/dev/null || echo none)
[ "$new" = "$old" ] && exit 0
# An image that already failed its health check is not retried every two minutes; the next push replaces it.
[ -f "$DIR/failed-image" ] && [ "$(cat "$DIR/failed-image")" = "$new" ] && exit 0

log "new image ${new:7:12} (was ${old:7:12}), redeploying"
docker rm -f "$NAME" >/dev/null 2>&1 || true
run_site "$IMAGE"

if healthy; then
    log "up"
    rm -f "$DIR/failed-image"
    # Only now drop the old image; until here it is the rollback target.
    docker image prune -f >/dev/null
else
    log "new image did not answer within 60 s, rolling back to ${old:7:12}"
    echo "$new" > "$DIR/failed-image"
    docker logs --tail 20 "$NAME" 2>&1 | sed 's/^/    /' || true
    docker rm -f "$NAME" >/dev/null 2>&1 || true
    if [ "$old" != none ]; then
        run_site "$old"
        healthy && log "rolled back" || log "rollback did not answer either, check by hand"
    fi
    exit 1
fi

# Keep the log short: it only grows on deploys and errors.
tail -n 500 "$DIR/update.log" > "$DIR/update.log.tmp" 2>/dev/null && mv "$DIR/update.log.tmp" "$DIR/update.log" || true
