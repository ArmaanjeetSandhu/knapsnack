#!/bin/bash

cd client
npm install
npm run build
cd ..

cd server
pip freeze > requirements.txt
cd ..