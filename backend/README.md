### Quickstart
![JobHax Website](https://img.shields.io/website?label=jobposting-be.jobhax.com/admin&up_message=Up%20and%20Running&url=https%3A%2F%2Fjobposting.jobhax.com)
![Alt text](https://img.shields.io/github/issues-raw/job-hax/backend.svg)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/job-hax/backend.svg?style=plastic)
![GitHub contributors](https://img.shields.io/github/contributors/job-hax/backend.svg)
![GitHub repo size](https://img.shields.io/github/repo-size/job-hax/backend.svg)


1. Install python3 on your [OS](https://realpython.com/installing-python/):

2. Install Postgres database depending on your [OS](https://www.postgresql.org/download/):
```
brew install postgres
```

3. Make sure your Postgres is running:
```
# Start Postgres
initdb /usr/local/var/postgres
pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start
```

4. Add the variables below to your environment variables (all of them are optional but you need to add them to use/develop these features):
```
export JOBHAX_CLEARBIT_KEY=/*key*/ # to get/verify company logo&name from ClearBit API.
export EMAIL_HOST_USER=/*test@gmail.com*/ # to send activation or reset password email to the user (should be Google Mail)
export EMAIL_HOST_PASSWORD=/*password*/  # to send activation or reset password email to the user
export JOBHAX_RECAPTCHA_SECRET=/*recaptcha_secret*/ # to verify recaptcha token coming from the user request
export JOBHAX_LINKEDIN_CLIENT_KEY=/*linkedin application client_id*/ #to generate access_token from linkedin
export JOBHAX_LINKEDIN_CLIENT_SECRET=/*linkedin application client_secret*/ #to generate access_token from linkedin
```
[How to add variables to your Environment Variables](https://medium.com/@himanshuagarwal1395/setting-up-environment-variables-in-macos-sierra-f5978369b255)

5. Run install script located in root directory:
```
./install.sh
```

6. Start server located in root directory:
```
./start.sh
```

7. To use Rest API you need to create oauth2 credentials.
```
-   Under http://localhost:8001/admin/oauth2_provider/application/ click 'ADD APPLICATION'

-   Do not change 'client_id' & 'client_secret' (They will be used for generate access token to use in your requests header)

-   Select the following settings to create application:
    Client Type -> Confidential
    Authorization grant type ->  Resource owner password-based
    Name -> Whatever you want   
```

8. AUTHENTICATION (Google Auth only. You can skip this part if you want to use regular registration/authenticating process)
```
You need to generate an access token and add it as a Bearer header in your requests. See the Postman Collection for how to
generate an access token.

For testing purposes Google's playground system can be used for gathering dummy access tokens to use on this API.

You will need to grant following permissions:
- https://www.googleapis.com/auth/userinfo.email
- https://www.googleapis.com/auth/userinfo.profile
- https://www.googleapis.com/auth/gmail.readonly
```

[OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) 


## Documentation
* [JobHax REST API Docs](https://documenter.getpostman.com/view/3396184/SVmvRyKp)
