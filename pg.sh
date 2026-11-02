#!/bin/sh
# Base Postgres locale du projet (dev). Usage : ./pg.sh start | stop | status
PG=/opt/homebrew/opt/postgresql@17/bin
DIR="$(cd "$(dirname "$0")" && pwd)/.pgdata"
exec "$PG/pg_ctl" -D "$DIR" -l "$DIR/server.log" -o "-p 5432 -k /tmp" "$1"
