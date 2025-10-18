# Raspberry Pi 5 Setup Commands (run these on your Pi):

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install essential build tools for native compilation
sudo apt install -y build-essential python3 make g++

# 3. Install Node.js (latest LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Verify versions
node --version  # Should be v20.x.x
npm --version

# 5. Install your project dependencies
cd /path/to/your/project
npm install
