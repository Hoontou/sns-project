#!/bin/bash
#! not used now

# Start mongod in the background with the specified options
mongod --replSet rs0 --bind_ip_all

# Wait for 10 seconds
sleep 10

# Run mongosh with the provided script file
mongosh /usr/src/config/set.js