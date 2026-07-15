import { spawn } from "node:child_process";
import path from "node:path";

export function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", windowsHide: true, ...options });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} failed with ${signal ? `signal ${signal}` : `exit code ${code}`}`));
    });
  });
}

export function npmCommand(args) {
  if (process.platform !== "win32") return { command: "npm", args };
  const cli = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
  return { command: process.execPath, args: [cli, ...args] };
}
