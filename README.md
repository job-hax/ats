# ats
Applicant Tracking System

1. Install Postgres and PIP3 for Python package management and NPM for Node and NGINX:
```
sudo apt-get update
sudo apt install -y postgresql postgresql-contrib python3-pip npm nginx
```
2. Connect to PostgreSQL:
```
sudo su - postgres
psql
```

3. Check login info:
```
postgres-# \conninfo
```

4. Disconnect from PostgreSQL server:
```
postgres-# \q
```

Install backend:

1. 
sudo su - postgres

2. Create :
```
psql postgres -c "CREATE USER jobhaxdbuser WITH PASSWORD '123456';"
psql postgres -c "CREATE DATABASE jobhaxdb WITH OWNER 'jobhaxdbuser';"
psql postgres -c "ALTER USER jobhaxdbuser CREATEDB;"
```


3. Export Envs in ~/.bashrc file:
export JOBHAX_CLEARBIT_KEY=''
export EMAIL_HOST_USER=jobhaxuser@gmail.com
export EMAIL_HOST_PASSWORD=''
export JOBHAX_RECAPTCHA_SECRET=''
export reCaptchaV3SiteKey=''
export JOBHAX_LINKEDIN_CLIENT_KEY=''
export JOBHAX_LINKEDIN_CLIENT_SECRET=''

4. Refresh env file:
```source ~/.bashrc
```

5. 

Install frontend
1. Install yarn
```
npm i -g yarn
```

2. 
```
 yarn install
```

3. Create config/config.js as in config/example.js:
```

```

Install nginx:

Add Certbot PPA
sudo apt install -y software-properties-common
sudo add-apt-repository universe
sudo add-apt-repository ppa:certbot/certbot

Install Certbot
sudo apt install -y certbot python-certbot-nginx

Renew:
sudo certbot renew --dry-run

Confirm that Certbot worked:
https://www.ssllabs.com/ssltest/

Reference: https://certbot.eff.org/lets-encrypt/ubuntuxenial-nginx

Create JobHax application:
