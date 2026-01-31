#!/bin/bash
# XenonFlow DB restore
# Usage: restore-db.sh <backup-file>
# Example: restore-db.sh backups/xenonflow-20260131-120000-hourly.db

set -e

BACKUP_FILE="$1"
DB_DIR="/home/joao/projects/xenonflow-kanban/server/data"
DB_PATH="$DB_DIR/xenonflow.db"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: restore-db.sh <backup-file>"
    echo ""
    echo "Available backups:"
    ls -lt /home/joao/projects/xenonflow-kanban/backups/*.db 2>/dev/null | head -20
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    # Try with backups/ prefix
    BACKUP_FILE="/home/joao/projects/xenonflow-kanban/backups/$BACKUP_FILE"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "=== XenonFlow DB Restore ==="
echo "Source: $BACKUP_FILE"
echo "Target: $DB_PATH"
echo ""

# Stop the service first
echo "Stopping xenonflow-kanban service..."
systemctl --user stop xenonflow-kanban || true
sleep 2

# Backup current DB before overwriting
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
if [ -f "$DB_PATH" ]; then
    echo "Backing up current DB..."
    cp "$DB_PATH" "/home/joao/projects/xenonflow-kanban/backups/xenonflow-$TIMESTAMP-pre-restore.db"
fi

# Remove WAL files
rm -f "$DB_PATH" "${DB_PATH}-wal" "${DB_PATH}-shm"

# Restore
echo "Restoring from backup..."
cp "$BACKUP_FILE" "$DB_PATH"

# Restore WAL files if they exist
[ -f "${BACKUP_FILE}-wal" ] && cp "${BACKUP_FILE}-wal" "${DB_PATH}-wal"
[ -f "${BACKUP_FILE}-shm" ] && cp "${BACKUP_FILE}-shm" "${DB_PATH}-shm"

# Restart service
echo "Starting xenonflow-kanban service..."
systemctl --user start xenonflow-kanban
sleep 2

# Verify
echo ""
echo "Verifying restore..."
curl -s http://localhost:3333/api/projects | node -e "
const data = require('fs').readFileSync(0, 'utf8');
const projects = JSON.parse(data);
console.log('Projects restored:', projects.length);
projects.forEach(p => console.log('  -', p.name));
"

echo ""
echo "✅ Restore complete!"
