#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

# Run from Termux after extracting the repo/build artifact.
# Usage: su -c 'bash /data/data/com.termux/files/home/install-vmoscloud.sh "/storage/emulated/0/Download/ForgottenWorld.mcaddon"'

ARCHIVE="${1:-/storage/emulated/0/Download/ForgottenWorld.mcaddon}"
APP_DATA="/data/user/0/com.mojang.minecraftpe"
PACK_ROOT="$APP_DATA/games/com.mojang"
TERMUX_BIN="/data/data/com.termux/files/usr/bin"
export PATH="$TERMUX_BIN:/system/bin:/system/xbin:$PATH"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this installer from a Toolbox-rooted Termux shell."
  exit 1
fi
if [ ! -f "$ARCHIVE" ]; then
  echo "Add-on archive not found: $ARCHIVE"
  exit 1
fi
if [ ! -d "$PACK_ROOT" ]; then
  echo "Minecraft application-storage folder not found: $PACK_ROOT"
  exit 1
fi

APP_UID="$(stat -c '%u' "$APP_DATA")"
APP_GID="$(stat -c '%g' "$APP_DATA")"
TMP="$(mktemp -d /data/local/tmp/forgotten-world.XXXXXX)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

# Minecraft must be closed before replacing packs or clearing its manifest cache.
am force-stop com.mojang.minecraftpe >/dev/null 2>&1 || true
mkdir -p "$TMP/container" "$TMP/bp" "$TMP/rp"
unzip -oq "$ARCHIVE" -d "$TMP/container"

BP_ARCHIVE="$(find "$TMP/container" -maxdepth 1 -type f -name '*BP.mcpack' -print -quit)"
RP_ARCHIVE="$(find "$TMP/container" -maxdepth 1 -type f -name '*RP.mcpack' -print -quit)"
if [ -z "$BP_ARCHIVE" ] || [ -z "$RP_ARCHIVE" ]; then
  echo "The .mcaddon must contain one BP.mcpack and one RP.mcpack."
  exit 1
fi

unzip -oq "$BP_ARCHIVE" -d "$TMP/bp"
unzip -oq "$RP_ARCHIVE" -d "$TMP/rp"
if [ ! -f "$TMP/bp/manifest.json" ] || [ ! -f "$TMP/rp/manifest.json" ]; then
  echo "A pack manifest.json is missing from the archive root."
  exit 1
fi

BP_TARGET="$PACK_ROOT/behavior_packs/ForgottenWorld_BP"
RP_TARGET="$PACK_ROOT/resource_packs/ForgottenWorld_RP"
mkdir -p "$PACK_ROOT/behavior_packs" "$PACK_ROOT/resource_packs"
rm -rf "$BP_TARGET" "$RP_TARGET"
mkdir -p "$BP_TARGET" "$RP_TARGET"
cp -a "$TMP/bp/." "$BP_TARGET/"
cp -a "$TMP/rp/." "$RP_TARGET/"

chown -R "$APP_UID:$APP_GID" "$BP_TARGET" "$RP_TARGET"
find "$BP_TARGET" "$RP_TARGET" -type d -exec chmod 755 {} +
find "$BP_TARGET" "$RP_TARGET" -type f -exec chmod 644 {} +
restorecon -RF "$BP_TARGET" "$RP_TARGET"

# Force Bedrock to rebuild its cached pack-manifest index on next launch.
CACHE="$APP_DATA/PackManifestFactoryCache"
if [ -d "$CACHE" ] && [ ! -L "$CACHE" ]; then
  find "$CACHE" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
fi

echo "Installed behavior and resource packs."
echo "Behavior manifest: $BP_TARGET/manifest.json"
echo "Resource manifest: $RP_TARGET/manifest.json"
echo "Minecraft is stopped. Reopen it and check World Settings > Behavior Packs / Resource Packs > My Packs."
