import { Octokit } from "@octokit/core";
import fs from "fs";
import { execSync } from "child_process";

const config_contents = fs.readFileSync("ghwatch.json");
const config = JSON.parse(config_contents);

const client = new Octokit({
  auth: config.Token,
});

function runCommandWithDirectory(cmd, dir) {
  console.log(`Command executed: ${cmd} (directory: ${dir})`);
  execSync(cmd, { cwd: dir });
}

function runCommand(cmd) {
  console.log(`Command executed: ${cmd}`);
  execSync(cmd);
}

async function getLastCommitHash(repo) {
  return await client.request(`GET /repos/${repo}/commits`, {
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  }).data[0].sha;
}

class Repo {
  constructor(name, repo, lastCommitHash) {
    this.name = name;
    this.repo = repo;
    this.lastCommitHash = lastCommitHash;
  }
}

let monitoredRepos = [];

for (const repoName in config.Repos) {
  const repo = config.Repos[repoName];

  if (fs.existsSync(repoName)) {
    runCommandWithDirectory("git pull", repoName);
  } else {
    runCommand(`git clone https://github.com/${repo} ${repoName}`);
  }

  monitoredRepos.push(new Repo(repoName, repo, await getLastCommitHash(repo)));
}

setInterval(async () => {
  for (const repo in monitoredRepos) {
    const currentLastCommitHash = await getLastCommitHash(repo.repo);
    if (currentLastCommitHash != repo.lastCommitHash) {
      console.log(`Detected changes to ${repo.name}, updating...`);

      runCommandWithDirectory("git pull", repo.name);

      repo.lastCommitHash = currentLastCommitHash;
    }
  }
}, 60 * 1000);
