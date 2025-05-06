#!/bin/sh
set -e

echo "Waiting for Postgres..."
./wait-for-it.sh todo-postgres:5432 --timeout=60 --strict

echo "Running Prisma Migrate Deploy..."
npx prisma migrate deploy

echo "Starting app..."
node dist/main
