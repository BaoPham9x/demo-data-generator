#!/bin/bash
# macOS launcher for Steep Alerts GUI
# Double-click this file to start the server (browser opens automatically)

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.." || exit

# Run the server (it will open browser automatically)
deno task alerts-gui
