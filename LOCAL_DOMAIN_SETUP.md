# Local Domain Setup for Sproutly.com

## Setting up sproutly.com for local development

To use `sproutly.com` locally instead of `localhost:3000`, you need to modify your system's hosts file.

### On macOS (and most Unix systems):

1. Open Terminal
2. Edit your hosts file:
   ```bash
   sudo nano /etc/hosts
   ```

3. Add this line at the end:
   ```
   127.0.0.1 sproutly.com
   ```

4. Save and exit (Ctrl+X, then Y, then Enter)

### On Windows:

1. Open Notepad as Administrator
2. Open the file `C:\Windows\System32\drivers\etc\hosts`
3. Add this line at the end:
   ```
   127.0.0.1 sproutly.com
   ```
4. Save the file

### Testing the Setup

After setting up the hosts file:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://sproutly.com:3000` in your browser
3. The main site will be at `http://sproutly.com:3000`
4. The Pi display will be at `http://sproutly.com:3000/pi`

### Network Access

To make the site accessible from other devices on your local network:

1. Start the development server with network access:
   ```bash
   npm run start:pi
   ```

2. Find your computer's IP address:
   ```bash
   # On macOS/Linux:
   ifconfig | grep inet
   # On Windows:
   ipconfig
   ```

3. Other devices on the same WiFi can access:
   - Main site: `http://[YOUR_IP]:3000`
   - Pi display: `http://[YOUR_IP]:3000/pi`

### For Production on Raspberry Pi

The Pi should automatically boot to `http://sproutly.com/pi` or the local IP equivalent.
