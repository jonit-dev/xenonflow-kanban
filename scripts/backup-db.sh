#!/bin/bash
# Backup XenonFlow DB before any dangerous operation
BACKUP_DIR="/home/joao/projects/xenonflow-kanban/backups"
DB_PATH="/home/joao/projects/xenonflow-kanban/server/data/xenonflow.db"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"
cp "$DB_PATH" "$BACKUP_DIR/xenonflow-$TIMESTAMP.db"
echo "Backed up to $BACKUP_DIR/xenonflow-$TIMESTAMP.db"

# Keep only last 10 backups
ls -t "$BACKUP_DIR"/xenonflow-*.db | tail -n +11 | xargs -r rm
