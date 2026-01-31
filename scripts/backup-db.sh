#!/bin/bash
# XenonFlow DB backup with WAL checkpoint
# Usage: backup-db.sh [reason]
# Example: backup-db.sh "pre-restart"

set -e

NODE="/home/joao/.nvm/versions/node/v22.22.0/bin/node"
BACKUP_DIR="/home/joao/projects/xenonflow-kanban/backups"
DB_PATH="/home/joao/projects/xenonflow-kanban/server/data/xenonflow.db"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REASON="${1:-manual}"

mkdir -p "$BACKUP_DIR"

# Checkpoint WAL to ensure all data is in main DB file
cd /home/joao/projects/xenonflow-kanban/server
$NODE -e "
const Database = require('better-sqlite3');
const db = new Database('$DB_PATH');
db.pragma('wal_checkpoint(TRUNCATE)');
db.close();
console.log('WAL checkpoint complete');
"

# Copy the database
BACKUP_FILE="$BACKUP_DIR/xenonflow-$TIMESTAMP-$REASON.db"
cp "$DB_PATH" "$BACKUP_FILE"
echo "Backed up to $BACKUP_FILE"

# Also copy WAL files if they exist (belt and suspenders)
[ -f "${DB_PATH}-wal" ] && cp "${DB_PATH}-wal" "${BACKUP_FILE}-wal" 2>/dev/null || true
[ -f "${DB_PATH}-shm" ] && cp "${DB_PATH}-shm" "${BACKUP_FILE}-shm" 2>/dev/null || true

# Retention: keep 48 hourly + last 20 manual/pre-restart
# Delete hourly backups older than 48
find "$BACKUP_DIR" -name "xenonflow-*-hourly.db*" -mmin +2880 -delete 2>/dev/null || true
# Keep only last 20 non-hourly backups
ls -t "$BACKUP_DIR"/xenonflow-*-manual.db "$BACKUP_DIR"/xenonflow-*-pre-restart.db 2>/dev/null | tail -n +21 | xargs -r rm 2>/dev/null || true

echo "Backup complete: $BACKUP_FILE"
