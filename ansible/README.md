# Ansible tasks
We use ansible as our server build tool.

## Run all playbook against local vm
Prompts for ssh and sudo login details of user `osboxes`
```bash
ansible-playbook -i hosts site.yml -l localhost -k -K -e "variable_host=localhost" -e "ansible_ssh_user=osboxes" -e "letsencrypt_staging=true"
```

### Ansible Options
`letsencrypt_staging=true`:  Run letsencrypt docker run with `--staging --force` flags for generating certs.

## Run only git tag against local vm
This is useful for running specifically tagged tasks. 
In this case it sets up the the main project `git` repo.
```bash
ansible-playbook -i hosts site.yml -l localhost -k -K -e "variable_host=localhost" -e "ansible_ssh_user=osboxes" --tags "git"
```
