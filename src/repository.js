import { Octokit } from "@octokit/core";
import { randomInt } from "crypto";
import fs from "fs";

const config_contents = fs.readFileSync("ghwatch.json");
const config = JSON.parse(config_contents);

const client = new Octokit({
  auth: config.Token,
});

class Repository {
  constructor(name, repo) {
    this.name = name;
    this.repo = repo;
    this.lastCommitHash = "";
  }

  async getLastCommitHash() {
    let response = await client.request(`GET /repos/${this.repo}/commits`, {
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
}

export { Repository };
