#!/bin/bash

echo "🗄️  Setting up MySQL database for Daycare Management System"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    echo "   Ubuntu/Debian: sudo apt-get install mysql-server"
    echo "   macOS: brew install mysql"
    echo "   Windows: Download from https://dev.mysql.com/downloads/mysql/"
    exit 1
fi

# Database configuration
DB_NAME="daycare_management"
DB_USER="root"
DB_PASSWORD="password"

echo "📦 Creating database: $DB_NAME"

# Create database
mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Database '$DB_NAME' created successfully"
else
    echo "❌ Failed to create database. Please check your MySQL credentials."
    echo "   Default credentials: username=root, password=password"
    echo "   Update the credentials in apps/api/.env if different"
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd "$(dirname "$0")/.."
npm run db:generate

# Push database schema
echo "📋 Pushing database schema..."
npm run db:push

# Seed database with initial data
echo "🌱 Seeding database with initial data..."
npm run db:seed

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📊 Database Details:"
echo "   Database: $DB_NAME"
echo "   URL: mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME"
echo ""
echo "👥 Sample Users Created:"
echo "   Super Admin: admin@daycare-platform.com / admin123"
echo "   Demo Admin: admin@demo-daycare.com / admin123" 
echo "   Demo Educator: sarah@demo-daycare.com / educator123"
echo "   Demo Parent: parent@demo-daycare.com / parent123"
echo ""
echo "🏢 Sample Businesses:"
echo "   Demo Daycare Center (subdomain: demo)"
echo "   Sunshine Daycare (subdomain: sunshine-daycare)"
echo ""
echo "🚀 You can now start the API server: npm run dev"
echo "🔍 Open Prisma Studio: npm run db:studio"