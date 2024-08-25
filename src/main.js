import fs from "fs";
import {
  runCommand,
  runCommandWithDirectory,
  runFileInDirectory,
} from "./command_runner.js";
import { Repository } from "./repository.js";
import { config } from "./config.js";
import { ExitHandler } from "./exit_handler.js";

let monitoredRepos = [];

new ExitHandler(() => {
  for (const repo of monitoredRepos) {
    if (fs.existsSync(`${repo.name}/stop.ghwatch`)) {
      console.log(
        `Found shutdown file ${repo.name}/stop.ghwatch, executing...`
      );
      runFileInDirectory(`${repo.name}/stop.ghwatch`, repo.name);
    }
  }

  console.log("GitHub Watch shutdown cleanly");
});

for (const repoName in config.Repos) {
  const repo = config.Repos[repoName];

  if (fs.existsSync(repoName)) {
    runCommandWithDirectory("git pull", repoName);
  } else {
    runCommand(`git clone https://github.com/${repo} ${repoName}`);
  }

  if (fs.existsSync(`${repoName}/start.ghwatch`)) {
    console.log(`Found startup file ${repoName}/start.ghwatch, executing...`);
    runFileInDirectory(`${repoName}/start.ghwatch`, repoName);
  }

  const repository = new Repository(repoName, repo);

  repository.lastCommitHash = await repository.getLastCommitHash();

  monitoredRepos.push(repository);
}

setInterval(async () => {
  let updated = false;

  for (const repo of monitoredRepos) {
    const currentLastCommitHash = await repo.getLastCommitHash();
    if (currentLastCommitHash != repo.lastCommitHash) {
      console.log(`Detected changes to ${repo.name}, updating...`);

      if (fs.existsSync(`${repo.name}/stop.ghwatch`)) {
        console.log(
          `Found shutdown file ${repo.name}/stop.ghwatch, executing...`
        );
        runFileInDirectory(`${repo.name}/stop.ghwatch`, repo.name);
      }

      runCommandWithDirectory("git pull", repo.name);

      if (fs.existsSync(`${repo.name}/start.ghwatch`)) {
        console.log(
          `Found startup file ${repo.name}/start.ghwatch, executing...`
        );
        runFileInDirectory(`${repo.name}/start.ghwatch`, repo.name);
      }

      repo.lastCommitHash = currentLastCommitHash;

      updated = true;
    }
  }

  if (!updated) {
    console.log("All repos up to date, waiting...");
  }
}, 2 * 60 * 1000);
