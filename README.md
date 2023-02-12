# Discord Webhook

> All credits go to the initial release by [baked-libs/discord-webhook](https://github.com/baked-libs/discord-webhook)
> and the fork where this repo is based off [johnnyhuy/actions-discord-git-webhook](https://github.com/johnnyhuy/actions-discord-git-webhook)

This is fork of the original Discord Webhook GitHub Action, but with changes to the embed message.

![preview](./docs/preview.png)

## :mailbox_with_no_mail: Inputs

### `webhook_url`

**Required** The GitHub webhook URL comprised of both `id` and `token` fields.

### `status`

The GitHub job status: `${{ job.status }}`

## :scroll: Usage

To set up this Action, create a new workflow file under `.github/workflows/workflow_name.yml`.

```yaml
name: Discord Webhook

on: [push]

jobs:
  git:
    runs-on: ubuntu-latest
    steps:

    - uses: actions/checkout@v2

    - name: Run Discord Webhook
      uses: Tim203/actions-git-discord-webhook@main 
      with:
        webhook_url: ${{ secrets.YOUR_DISCORD_WEBHOOK_URL }}
        status: ${{ job.status }}

```

## Development

NodeJS should be the only hard requirement to get this project working to make changes. Optionally, we can use Docker Compose to provide this dependency in container with a volume to our host to make additional code changes.

```bash
# Local
npm ci

# Docker
docker-compose build workspace
docker-compose run --rm workspace
npm ci
```

### Versioning

Changes are versioned via GitHub Actions that use [`standard-version`](https://github.com/conventional-changelog/standard-version) to create Git tags and [`conventional-github-releaser`](https://github.com/conventional-changelog/releaser-tools/tree/master/packages/conventional-github-releaser) to submit GitHub releases.

We follow the [`Conventional Commits`](https://www.conventionalcommits.org/en/v1.0.0/#summary) standard where commit messages get *automatically* analysed to produce a generated semantic version.
