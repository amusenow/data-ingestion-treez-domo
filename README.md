# Fivetran Lambda Connector for Treez Domo Datasets

## Background
Ingest Treez Domo datasets into your data warehouse via an ELT platform such as Fivetran.

This project implements an AWS Lambda function Fivetran connector that uses the Treez Data API to incrementally fetch data from a Domo dataset. The Serverless Framework is used to package the Lambda function and deploy it to AWS. 

## Prerequisites 

- A Fivetran account
- A destination warehouse such as Snowflake 
- An AWS subscription 
- Node.js 

## Setup

- Clone the repo
- Run `npm i` to download project dependencies
- Open `serverless.yml` 
    - Set the value of `DOMO_CLIENT_ID` to the Treez Data API Client ID that was provided by Treez
    - Set the value of `DOMO_SECRET` to the Treez Data API secret that was provided by  Treez
- The project uses the `serverless-dotenv-plugin` Serverless Framework plugin to manage configuration settings for different environments
    - The environment specific settings are stores in `.env` files; e.g.: `.env.development` and `.env.production`
    - Set the values in the `.env` files as needed:
        - `PROVIDER_PROFILE`: the name of the AWS CLI profile you'll use to deploy the project. Get this from your AWS `credentials` file
        - `PROVIDER_STAGE`: set to `prod` or `dev` depending on the environment that you're deploying to
        - `START_FROM`: use this to set a start date to fetch data from. This is only used when Fivetran performs a historical sync.
        - `PAGE_SIZE`: play with this setting to ensure that you're staying within allowable Lambda function response sizes.
        - `DATASET_ID`: the ID of the Treez Domo dataset

## Deployment

- Deploy using the Serverless Framework; e.g.: `sls deploy --env production` 
- In Fivetran, create a new AWS Lambda connector and point it to your new function 