import proc from 'child_process';
import fs from 'fs';


import {
  APP_DIR,
  SQITCH_CMD,
  PG_DUMP_CMD,
  PG_DUMPALL_CMD,
  DOCKER_APP_DIR,
  DOCKER_IMAGE,
  USE_DOCKER_IMAGE,
  JAVA_CMD
} from './env.js';

export const runCmd = (cmd, params, options, silent) => {
  if(USE_DOCKER_IMAGE && [SQITCH_CMD, PG_DUMP_CMD, PG_DUMPALL_CMD, JAVA_CMD].indexOf(cmd) !== -1){
    //alter the command to run in docker
    let w = (options && options.cwd) ? options.cwd.replace(APP_DIR, DOCKER_APP_DIR) : DOCKER_APP_DIR;
    params = ['run', '-w', w, '-v', `${APP_DIR}:${DOCKER_APP_DIR}`, DOCKER_IMAGE, cmd]
      .concat(params.map(p => p.replace(APP_DIR, DOCKER_APP_DIR)));
    cmd = 'docker';
  }
  let p = proc.spawnSync(cmd, params, options);
  if(silent !== true){
    p.output.forEach(v => console.log(v ? v.toString() : ""));
  }
  if(p.status != 0){
    process.exit(p.status);
  }
}

export const fileExists = path => fs.existsSync(path) && fs.statSync(path).isFile();

export const dirExists = path => fs.existsSync(path) && fs.statSync(path).isDirectory();

// options.key from commander returns bool if a value is not specified(e.g. subzero cloud login -u, options.username gives true), so make sure is a string
export const notEmptyString = s => (typeof s == 'string')&&s.trim().length;
