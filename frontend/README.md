# JobHax Frontend application

![JobHax Website](https://img.shields.io/website?label=jobposting.jobhax.com&up_message=Up%20and%20Running&url=https%3A%2F%2Fjobposting.jobhax.com)
![Alt text](https://img.shields.io/github/issues-raw/job-hax/capstone.svg)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/job-hax/capstone?style=plastic)
![GitHub contributors](https://img.shields.io/github/contributors/job-hax/capstone.svg)
![GitHub repo size](https://img.shields.io/github/repo-size/job-hax/capstone.svg)
![GitHub languages](https://img.shields.io/github/languages/count/job-hax/capstone)


## Prerequisites

1. Download nodejs version 10x:
   ```
   https://nodejs.org/en/download/
   ```
2. Install yarn package manager for JavaScript:
   ```
   npm i -g yarn
   ```

## Installation

1.  Clone current repository:

    ```
    git clone https://github.com/job-hax/frontend.git
    ```

2.  Install project dependencies via yarn:

    ```
    yarn install
    ```

3.  Create config/config.js in src/ if non-existant with the following contents:

    ```
    export const IS_MOCKING = {boolean};

    export const IS_RECAPTCHA_ENABLED = {boolean};

    export const googleClientId = '[TODO]';

    export const jobHaxClientId = '[TODO]';

    export const jobHaxClientSecret = '[TODO]';

    export const reCaptchaV3SiteKey = '[TODO]';

    export const googleApiKey = '[TODO]';

    export const googleAnalyticsId = '[TODO]';

    export const linkedInClientId = '[TODO]';

    export const linkedInClientSecret = '[TODO]';

    ```

4.  Run:

        a) for local development:
        	```
        	yarn dev
        	```
        b) for production build:
        	```
        	yarn build
        	```

    Note: Starting file: './src/index.js'
