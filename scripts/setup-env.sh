#!/bin/bash

echo " Setting up environment variables..."

if [ ! -f .env ]; then
    echo " Creating .env file from .env.example..."
    cp .env.example .env
fi

echo " Generating strong JWT secrets..."

# Generate random secrets
ACCESS_SECRET=$(openssl rand -base64 32)
REFRESH_SECRET=$(openssl rand -base64 32)

# Update .env file
sed -i.bak "s/JWT_ACCESS_SECRET=.*/JWT_ACCESS_SECRET=$ACCESS_SECRET/" .env
sed -i.bak "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$REFRESH_SECRET/" .env

echo "✅ Environment setup complete!"
echo " You may want to update MONGO_URL in .env if needed."
