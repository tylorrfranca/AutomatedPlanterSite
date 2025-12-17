#!/bin/bash
chmod +x loop_sensor_read.sh
nohup ./loop_sensor_read.sh > /dev/null 2>&1 &