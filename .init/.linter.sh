#!/bin/bash
cd /home/kavia/workspace/code-generation/notenest-105035-f9e97067/frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

