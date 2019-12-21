#!/usr/bin/env bash
# Set Postgres
initdb /usr/local/var/postgres

# Create db user and database with owner privileges
psql postgres -c "CREATE USER jobhaxdbuser WITH PASSWORD '123456';"
psql postgres -c "CREATE DATABASE jobhaxdb WITH OWNER 'jobhaxdbuser';"
psql postgres -c "ALTER USER jobhaxdbuser CREATEDB;"

# Install python dependencies for application:
pip3 install -r requirements.txt

# Migrate application data changes to postgres:
python3 manage.py makemigrations
python3 manage.py migrate

# Create superuser for admin panel:
python3 manage.py createsuperuser
