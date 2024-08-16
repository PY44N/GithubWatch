import { execSync } from "child_process";
import fs from "fs";

function runCommandWithDirectory(cmd, dir) {
  console.log(`Command executed: ${cmd} (directory: ${dir})`);
  execSync(cmd, { cwd: dir });
}

function runCommand(cmd) {
  console.log(`Command executed: ${cmd}`);
  execSync(cmd);
}

function runFileInDirectory(file, dir) {
  let contents = fs.readFileSync(file).toString();
  for (const rawLine of contents.split("\n")) {
    const line = rawLine.replace("\r", "");
    runCommandWithDirectory(line, dir);
  }
}

export { runCommand, runCommandWithDirectory, runFileInDirectory };
