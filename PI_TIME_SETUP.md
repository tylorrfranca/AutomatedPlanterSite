# Raspberry Pi Time Configuration

## Why This Matters
The watering countdown system relies on accurate system time. Raspberry Pis don't have a built-in Real-Time Clock (RTC), so they need to sync time from the internet.

## Quick Setup (Run on your Raspberry Pi)

### 1. Enable NTP (Network Time Protocol)
```bash
sudo timedatectl set-ntp true
```

### 2. Set Your Timezone
```bash
# For US Pacific Time:
sudo timedatectl set-timezone America/Los_Angeles

# For US Eastern Time:
sudo timedatectl set-timezone America/New_York

# Or use interactive menu:
sudo dpkg-reconfigure tzdata
```

### 3. Verify Time is Correct
```bash
date
timedatectl status
```

You should see:
- Correct current date/time
- `System clock synchronized: yes`
- `NTP service: active`

### 4. Force Immediate Sync (if needed)
```bash
sudo systemctl restart systemd-timesyncd
sleep 3
timedatectl status
```

## Troubleshooting

### Time is Wrong
```bash
# Check if NTP is active:
timedatectl status

# If not synchronized, restart the service:
sudo systemctl restart systemd-timesyncd

# Check internet connection:
ping -c 3 google.com
```

### Time Resets After Reboot
This is normal if:
- Pi boots without internet connection
- Wait 1-2 minutes after boot for NTP sync
- Or ensure Pi has internet before booting

### Alternative: Install Hardware RTC
If your Pi often runs without internet, consider adding a DS3231 RTC module:
- Cost: ~$5-10
- Connects via I2C pins
- Keeps accurate time even when powered off
- Setup guide: https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#real-time-clock-rtc

## Verification Script

Create a simple check script:

```bash
#!/bin/bash
# check_time.sh

echo "Current time: $(date)"
echo "NTP Status:"
timedatectl status | grep -E "(synchronized|NTP service)"

if timedatectl status | grep -q "synchronized: yes"; then
    echo "✓ Time is synchronized!"
else
    echo "✗ WARNING: Time is NOT synchronized!"
    echo "  Run: sudo systemctl restart systemd-timesyncd"
fi
```

Save as `check_time.sh`, make executable with `chmod +x check_time.sh`, and run with `./check_time.sh`

## What Happens if Time is Wrong?

- **Watering countdown** will be inaccurate
- **"Time to Water" bar** will show wrong values
- **Sensor timestamps** will be incorrect
- **Last updated** display will be wrong

## Best Practice

Add this to your Pi startup script to ensure time sync on boot:

```bash
# In /etc/rc.local (before 'exit 0'):
sleep 30  # Wait for network
timedatectl set-ntp true
systemctl restart systemd-timesyncd
```

Or create a systemd service that waits for network before starting your Node.js server.

