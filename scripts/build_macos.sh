#!/bin/bash
set -e

echo "👑 RexCode macOS Build Script"
echo "=============================="

if ! command -v brew &>/dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
else
    echo "✅ Homebrew already installed"
fi

if ! command -v node &>/dev/null; then
    echo "📦 Installing Node.js..."
    brew install node
else
    echo "✅ Node.js $(node --version)"
fi

if ! command -v rustc &>/dev/null; then
    echo "📦 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "✅ Rust $(rustc --version)"
fi

rustup target add x86_64-apple-darwin aarch64-apple-darwin

if ! command -v python3 &>/dev/null; then
    brew install python@3.12
fi
pip3 install --break-system-packages fastapi uvicorn pydantic requests numpy psutil toml pyinstaller 2>/dev/null || pip3 install fastapi uvicorn pydantic requests numpy psutil toml pyinstaller

BUILD_DIR="$HOME/Desktop/rexcode-build"
if [ -d "$BUILD_DIR" ]; then
    cd "$BUILD_DIR" && git pull
else
    git clone https://github.com/reggierexai-design/rexhub.git "$BUILD_DIR"
    cd "$BUILD_DIR"
fi

npm install

cd backend
pyinstaller --onefile --name rexcode-backend --distpath dist rexcode_entry.py
cd ..

echo "🔨 Building RexCode for macOS (universal binary)..."
echo "⏳ This takes 5-15 minutes on first build..."
cd src-tauri
cargo tauri build --target universal-apple-darwin
cd ..

echo ""
echo "✅ BUILD COMPLETE"
echo "📦 Find your .dmg at: src-tauri/target/universal-apple-darwin/release/bundle/dmg/"
echo "⚠️  UNSIGNED: Right-click → Open to bypass Gatekeeper"