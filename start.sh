#!/bin/sh

# Wait for Postgres to be ready
echo "Checking if PostgreSQL is ready..."
until pg_isready -h postgres -p 5432 -U notification_user; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

# Run DB migrations 
echo "Running database migrations..."
npm run migrate:up

# Start the application
echo "Starting the application..."
npm run start
