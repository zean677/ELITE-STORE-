#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  Elite Store — One-Command Deployment Script
#  Usage: bash deploy.sh
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${BOLD}${GREEN}"
echo "  ╔═══════════════════════════════╗"
echo "  ║     ELITE STORE DEPLOY        ║"
echo "  ╚═══════════════════════════════╝"
echo -e "${RESET}"

# Check required tools
for cmd in docker docker-compose; do
  if ! command -v "$cmd" &>/dev/null; then
    echo -e "${RED}✗ '$cmd' is not installed. Please install Docker and Docker Compose.${RESET}"
    exit 1
  fi
done

# Check .env exists
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}⚠ No .env file found. Creating from .env.example...${RESET}"
  cp .env.example .env
  echo -e "${RED}✗ CRITICAL: Edit .env and fill in all required values before running again.${RESET}"
  exit 1
fi

# Validate critical env vars
source .env
MISSING=()
[ -z "${POSTGRES_PASSWORD:-}" ] && MISSING+=("POSTGRES_PASSWORD")
[ -z "${SESSION_SECRET:-}" ]    && MISSING+=("SESSION_SECRET")

if [ ${#MISSING[@]} -gt 0 ]; then
  echo -e "${RED}✗ Missing required environment variables:${RESET}"
  for var in "${MISSING[@]}"; do
    echo -e "  ${RED}• $var${RESET}"
  done
  echo "Edit your .env file and try again."
  exit 1
fi

echo -e "${GREEN}✓ Environment validated${RESET}"

# Pull latest images
echo -e "\n${BOLD}[1/4] Pulling base images...${RESET}"
docker-compose pull postgres 2>/dev/null || true

# Build
echo -e "\n${BOLD}[2/4] Building application...${RESET}"
docker-compose build --no-cache app

# Start
echo -e "\n${BOLD}[3/4] Starting services...${RESET}"
docker-compose up -d

# Wait for health
echo -e "\n${BOLD}[4/4] Waiting for app to be healthy...${RESET}"
RETRIES=30
until docker-compose exec -T app wget -qO- http://localhost:8080/health >/dev/null 2>&1; do
  RETRIES=$((RETRIES-1))
  if [ $RETRIES -eq 0 ]; then
    echo -e "${RED}✗ App did not become healthy in time. Check logs:${RESET}"
    echo "  docker-compose logs app"
    exit 1
  fi
  echo -n "."
  sleep 2
done

echo -e "\n\n${BOLD}${GREEN}══════════════════════════════════════${RESET}"
echo -e "${BOLD}${GREEN}  ✓ ELITE STORE IS LIVE!${RESET}"
echo -e "${GREEN}  → http://localhost:8080${RESET}"
echo -e "${BOLD}${GREEN}══════════════════════════════════════${RESET}"
echo ""
echo "  Admin: zean23@elitestore.admin"
echo "  Pass:  Zean333zean#"
echo "  Panel: http://localhost:8080/admin"
echo ""
echo -e "  ${YELLOW}Useful commands:${RESET}"
echo "  docker-compose logs -f app     # live logs"
echo "  docker-compose restart app     # restart app"
echo "  docker-compose down            # stop all"
echo ""
