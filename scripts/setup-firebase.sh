#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PROJECT_ID="${1:-${FIREBASE_PROJECT_ID:-}}"
FIRESTORE_LOCATION="${2:-${FIRESTORE_LOCATION:-europe-central2}}"
DISPLAY_NAME="${FIREBASE_DISPLAY_NAME:-SPA NAZ}"
WEB_APP_NAME="${FIREBASE_WEB_APP_NAME:-SPA NAZ Web}"
ENV_FILE="${ENV_FILE:-.env.local}"
ASSUME_YES="${ASSUME_YES:-0}"

info() { printf '\033[1;34m[spanaz]\033[0m %s\n' "$*"; }
ok() { printf '\033[1;32m[ok]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

command -v node >/dev/null 2>&1 || die "Node.js is required."

if command -v firebase >/dev/null 2>&1; then
  FIREBASE=(firebase)
elif command -v npx >/dev/null 2>&1; then
  warn "Firebase CLI is not installed globally; using npx firebase-tools@latest."
  FIREBASE=(npx --yes firebase-tools@latest)
else
  die "Install the Firebase CLI first: npm install -g firebase-tools"
fi

fb() {
  "${FIREBASE[@]}" "$@"
}

[[ -f firebase.json ]] || die "firebase.json was not found. Run this script from the SpaNaz repository."
[[ -f firestore.rules ]] || die "firestore.rules was not found."

info "Checking Firebase authentication..."
if ! fb projects:list --json >/dev/null 2>&1; then
  info "Firebase login is required. Your browser will open."
  fb login
else
  ok "Firebase CLI is already authenticated."
fi

PROJECTS_JSON="$(fb projects:list --json)"

project_exists() {
  local wanted="$1"
  printf '%s' "$PROJECTS_JSON" | node -e '
const fs = require("fs");
const wanted = process.argv[1];
const data = JSON.parse(fs.readFileSync(0, "utf8"));
const projects = Array.isArray(data.result) ? data.result : [];
process.stdout.write(projects.some((p) => p.projectId === wanted) ? "yes" : "no");
' "$wanted"
}

create_project() {
  local requested_id="${1:-}"

  if [[ -z "$requested_id" ]]; then
    read -r -p "New Firebase project ID (globally unique, e.g. spanaz-ro-prod): " requested_id
  fi

  [[ "$requested_id" =~ ^[a-z][a-z0-9-]{4,28}[a-z0-9]$ ]] || \
    die "Invalid Firebase project ID: $requested_id"

  info "Creating Firebase project: $requested_id"
  fb projects:create "$requested_id" --display-name "$DISPLAY_NAME"
  PROJECT_ID="$requested_id"
  ok "Firebase project created: $PROJECT_ID"
}

choose_project() {
  local count
  count="$(printf '%s' "$PROJECTS_JSON" | node -e '
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(0, "utf8"));
const projects = Array.isArray(data.result) ? data.result : [];
process.stdout.write(String(projects.length));
')"

  if [[ "$count" -eq 0 ]]; then
    warn "No Firebase projects are available for the signed-in account."
    create_project
    return
  fi

  printf '\nAvailable Firebase projects:\n\n'
  printf '%s' "$PROJECTS_JSON" | node -e '
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(0, "utf8"));
const projects = Array.isArray(data.result) ? data.result : [];
projects.forEach((project, index) => {
  const displayName = project.displayName || "(no display name)";
  console.log(`  ${index + 1}) ${displayName}  [${project.projectId}]`);
});
'
  printf '\n  n) Create a new Firebase project\n\n'

  local selection
  while true; do
    read -r -p "Choose a project [1-$count] or n: " selection

    if [[ "$selection" =~ ^[Nn]$ ]]; then
      create_project
      return
    fi

    if [[ "$selection" =~ ^[0-9]+$ ]] && (( selection >= 1 && selection <= count )); then
      PROJECT_ID="$(printf '%s' "$PROJECTS_JSON" | node -e '
const fs = require("fs");
const index = Number(process.argv[1]) - 1;
const data = JSON.parse(fs.readFileSync(0, "utf8"));
const projects = Array.isArray(data.result) ? data.result : [];
process.stdout.write(projects[index]?.projectId || "");
' "$selection")"
      [[ -n "$PROJECT_ID" ]] || die "Could not read the selected Firebase project."
      ok "Selected Firebase project: $PROJECT_ID"
      return
    fi

    warn "Please enter a number from 1 to $count, or n to create a new project."
  done
}

if [[ -z "$PROJECT_ID" ]]; then
  choose_project
elif [[ "$(project_exists "$PROJECT_ID")" == "yes" ]]; then
  ok "Using Firebase project: $PROJECT_ID"
else
  warn "Firebase project '$PROJECT_ID' is not available for the signed-in account."
  if [[ "$ASSUME_YES" == "1" ]]; then
    create_project "$PROJECT_ID"
  else
    read -r -p "Create Firebase project '$PROJECT_ID'? [y/N] " create_answer
    if [[ "$create_answer" =~ ^[Yy]$ ]]; then
      create_project "$PROJECT_ID"
    else
      PROJECT_ID=""
      choose_project
    fi
  fi
fi

info "Using project $PROJECT_ID for the remaining setup."

if fb firestore:databases:get "(default)" --project "$PROJECT_ID" >/dev/null 2>&1; then
  ok "Default Firestore database already exists."
else
  warn "The Firestore database location cannot be changed after creation."
  info "Selected location: $FIRESTORE_LOCATION"

  if [[ "$ASSUME_YES" != "1" ]]; then
    read -r -p "Create the production Firestore database in $FIRESTORE_LOCATION? [y/N] " answer
    [[ "$answer" =~ ^[Yy]$ ]] || die "Cancelled before creating Firestore."
  fi

  fb firestore:databases:create "(default)" \
    --project "$PROJECT_ID" \
    --location "$FIRESTORE_LOCATION" \
    --delete-protection ENABLED
  ok "Firestore database created with delete protection enabled."
fi

info "Looking for the SpaNaz Firebase Web App..."
APPS_JSON="$(fb apps:list --project "$PROJECT_ID" --json)"
APP_ID="$(printf '%s' "$APPS_JSON" | node -e '
const fs = require("fs");
const displayName = process.argv[1];
const data = JSON.parse(fs.readFileSync(0, "utf8"));
const apps = Array.isArray(data.result) ? data.result : [];
const app = apps.find((item) => item.displayName === displayName && String(item.platform || "").toUpperCase() === "WEB");
process.stdout.write(app?.appId || "");
' "$WEB_APP_NAME")"

if [[ -z "$APP_ID" ]]; then
  info "Creating Firebase Web App: $WEB_APP_NAME"
  fb apps:create WEB "$WEB_APP_NAME" --project "$PROJECT_ID"

  APPS_JSON="$(fb apps:list --project "$PROJECT_ID" --json)"
  APP_ID="$(printf '%s' "$APPS_JSON" | node -e '
const fs = require("fs");
const displayName = process.argv[1];
const data = JSON.parse(fs.readFileSync(0, "utf8"));
const apps = Array.isArray(data.result) ? data.result : [];
const app = apps.find((item) => item.displayName === displayName && String(item.platform || "").toUpperCase() === "WEB");
process.stdout.write(app?.appId || "");
' "$WEB_APP_NAME")"
fi

[[ -n "$APP_ID" ]] || die "Could not determine the Firebase Web App ID."
ok "Firebase Web App: $APP_ID"

info "Reading Firebase Web SDK configuration..."
SDK_JSON="$(fb apps:sdkconfig WEB "$APP_ID" --project "$PROJECT_ID" --json)"
API_KEY="$(printf '%s' "$SDK_JSON" | node -e '
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(0, "utf8"));
process.stdout.write(data?.result?.sdkConfig?.apiKey || "");
')"
SDK_PROJECT_ID="$(printf '%s' "$SDK_JSON" | node -e '
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(0, "utf8"));
process.stdout.write(data?.result?.sdkConfig?.projectId || "");
')"

[[ -n "$API_KEY" ]] || die "Firebase CLI did not return a Web API key."
[[ -n "$SDK_PROJECT_ID" ]] || SDK_PROJECT_ID="$PROJECT_ID"

info "Deploying SpaNaz Firestore security rules..."
fb deploy --only firestore:rules --project "$PROJECT_ID"
ok "Firestore security rules deployed."

info "Writing SpaNaz Firebase variables to $ENV_FILE..."
umask 077
TMP_ENV="$(mktemp)"
trap 'rm -f "$TMP_ENV"' EXIT

if [[ -f "$ENV_FILE" ]]; then
  grep -vE '^(VITE_FIREBASE_PROJECT_ID|VITE_FIREBASE_API_KEY)=' "$ENV_FILE" > "$TMP_ENV" || true
fi

if [[ -s "$TMP_ENV" ]]; then
  printf '\n' >> "$TMP_ENV"
fi
printf 'VITE_FIREBASE_PROJECT_ID=%s\n' "$SDK_PROJECT_ID" >> "$TMP_ENV"
printf 'VITE_FIREBASE_API_KEY=%s\n' "$API_KEY" >> "$TMP_ENV"
mv "$TMP_ENV" "$ENV_FILE"
trap - EXIT
chmod 600 "$ENV_FILE" 2>/dev/null || true

printf '\n'
ok "SpaNaz Firebase setup is complete."
printf '\nProject: %s\nFirestore location: %s\nWeb App ID: %s\nEnvironment file: %s\n' \
  "$SDK_PROJECT_ID" "$FIRESTORE_LOCATION" "$APP_ID" "$ENV_FILE"
printf '\nAdd the same two VITE_FIREBASE_* values from %s to the production/Lovable environment, then redeploy the site.\n' "$ENV_FILE"
printf 'You can rerun this script safely; existing Firebase resources are reused.\n'
