#!/bin/bash
TOKEN=$(osascript -e 'Tell application "System Events" to display dialog "Enter Supabase Personal Access Token:" default answer "" with hidden answer' | grep -o 'text returned:.*' | sed 's/text returned://')
if [ -z "$TOKEN" ]; then
  echo "Token is empty."
  exit 1
fi
export SUPABASE_ACCESS_TOKEN="$TOKEN"

PASSWORD=$(osascript -e 'Tell application "System Events" to display dialog "Enter Database Password:" default answer "" with hidden answer' | grep -o 'text returned:.*' | sed 's/text returned://')
if [ -z "$PASSWORD" ]; then
  echo "Password is empty."
  exit 1
fi
export SUPABASE_DB_PASSWORD="$PASSWORD"

echo "Running supabase link..."
npx -y supabase link --project-ref xhrqpuurgbnngeralzxv

echo "Running dry run..."
npx supabase db push --dry-run
