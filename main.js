import { Octokit } from "@octokit/core";
import fs from "fs";
import { execSync } from "child_process";
import { randomInt } from "crypto";

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
  let response = await client.request(`GET /repos/${repo}/commits`, {
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  try {
    return response.data[0].sha;
  } catch {
    console.log(`Unable to fetch last commit hash from data: ${response}`);
    return randomInt(2048).toString();
  }
}

function executeFile(file, dir) {
  let contents = fs.readFileSync(file).toString();
  for (const rawLine of contents.split("\n")) {
    const line = rawLine.replace("\r", "");
    runCommandWithDirectory(line, dir);
  }
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

  if (fs.existsSync(`${repoName}/start.ghwatch`)) {
    console.log(`Found startup file ${repoName}/start.ghwatch, executing...`);
    executeFile(`${repoName}/start.ghwatch`, repoName);
  }

  monitoredRepos.push(new Repo(repoName, repo, await getLastCommitHash(repo)));
}

setInterval(async () => {
  let updated = false;

  for (const repo of monitoredRepos) {
    const currentLastCommitHash = await getLastCommitHash(repo.repo);
    if (currentLastCommitHash != repo.lastCommitHash) {
      console.log(`Detected changes to ${repo.name}, updating...`);

      if (fs.existsSync(`${repo.name}/stop.ghwatch`)) {
        console.log(
          `Found shutdown file ${repo.name}/stop.ghwatch, executing...`
        );
        executeFile(`${repo.name}/stop.ghwatch`, repo.name);
      }

      runCommandWithDirectory("git pull", repo.name);

      if (fs.existsSync(`${repo.name}/start.ghwatch`)) {
        console.log(
          `Found startup file ${repo.name}/start.ghwatch, executing...`
        );
        executeFile(`${repo.name}/start.ghwatch`, repo.name);
      }

      repo.lastCommitHash = currentLastCommitHash;

      updated = true;
    }
  }

  if (!updated) {
    console.log("All repos up to date, waiting...");
  }
}, 2 * 60 * 1000);
