import fs from "fs";

const config = JSON.parse(fs.readFileSync("ghwatch.json"));

export { config };
