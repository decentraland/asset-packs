#!/bin/sh
npm run build
npx concurrently "npm run start:catalog" "npm run start"
