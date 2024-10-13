# GitHub Watch

A small program for automatically deploying the newest commit of a program

Please make an issue if you find any problems and feel free to submit pull requests with any improvements you might have

## Usage

First, download the latest release zip file and unzip it

Then install the proper dependencies

From the command line in the directory (and with Node.js and NPM installed) run

```
npm i
```

The program is then run with the command

```
node .
```

### Creating a configuration file

GitHub Watch relies on a configuration file (ghwatch.json) to determine which repos it should watch

A simple ghwatch.json would look something like this

```json
{
  "Token": "YOUR_GITHUB_TOKEN",
  "Repos": {
    "GithubWatch": "PY44N/GithubWatch"
  }
}
```

This configuration would make GitHub Watch monitor itself for changes. The repositories must be listed in Author/Repo format for the GitHub Watch to work

Note: A GitHub token is only required if you wish to monitor private repositories

### Creating start and end scripts

GitHub Watch also supports scripts that run on start and stop. Both scripts run on each pull (stop before the pull and start after the pull)

These scripts can be found in the root directory of the repo and are named `start.ghwatch` and `stop.ghwatch` respectivly

They are standard scripts and will be executed line by line in your terminal

#### Examples:

start.ghwatch:

```
docker compose up -d
```

stop.ghwatch:

```
docker compose stop
```
