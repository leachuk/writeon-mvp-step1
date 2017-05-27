writeon-mvp-step1
=================

Basic MVP content api server.

Built with nodejs and express. Provides user authentication and authorisation. Json Web Tokens (JWTs) are used for authentication of api calls.

#Usage

* Host
  * http://servername:9000
* Monitoring available via[https://app.keymetrics.io/](https://app.keymetrics.io/)
* Docker 
  * build app and dependencies from project root `docker-compose build`
  * run app `docker-compose up`
* Docker Dev
  * build and run development instance (couchdb and redis dependencies are launched with ports mapped locally)
  * `docker-compose build -f docker-compose-dev.yml`
  * `docker-compose up -f docker-compose-dev.yml`

#Deploy

Deploy to pre-configured remote repo with: 

```
git push prod-deploy master
```
