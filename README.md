bardly-api server
=================

Basic MVP content api server.  

Built with nodejs and express. Provides user authentication and authorisation. Json Web Tokens (JWTs) are used for authentication of api calls.

CI/CD is achieved using Drone. Force change 7.

##versions
Current global version dependencies:
* node -v `v11.8.0`
* npm -v `6.6.0`

#Usage 

* Docker Prod
  * build app and dependencies from project root `docker-compose build`
  * run app `docker-compose up`
* Docker Dev
  * build and run development instance (couchdb and redis dependencies are launched with ports mapped locally)
  * `docker-compose -f docker-compose-dev.yml build`
  * `docker-compose -f docker-compose-dev.yml up`
* Start local bardly server from root `grunt serve`
* Host
  * http://servername:9000
* Monitoring available via[https://app.keymetrics.io/](https://app.keymetrics.io/)

#Deploy

Deploy to pre-configured remote repo with: 

```
git push prod-deploy-vultr-au master
git push prod-deploy-vultr-us master
```

#Ansible

To auto provision servers from scratch and bring up the docker services run:
```$bash
ansible-playbook -i hosts site.yml --ask-vault-pass
```

To help debug tasks quicker, limit the executed tasks with the `--tags` option
```$bash
ansible-playbook -i hosts site.yml --ask-vault-pass --tags "docker" -vvv
```

