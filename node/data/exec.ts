/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { fs } from '../lib/fs';
import { repos } from './repos';
import { container } from '../ioc';

function show_usage() {
  console.info(`
usage:
  node exec --type=... --conn-str=... --file=... [--db=...]

where:
  --conn-str = mongodb connection string.
  --db = (optional) the database name to execute the commands on. use default database if omitted.
  --file = the path to the json file that contains the commands to run.
  --type = repository type.

note:
  no spaces before or after equal sign (=).
  argument values containing spaces must be fully enclosed in quotation marks (").

example:
  node exec --type=mongodb --conn-str=mongodb://localhost:27017 --file=/usr/tmp/my-commands.json`);
}

export async function run(type: string, conn_str: string, cmd_file: string, db_nm?: string): Promise<void> {
  const data = await fs.read(cmd_file, { encoding: 'utf8' });
  let cmds: object[] = typeof data === 'string' ? JSON.parse(data) : [];
  let cli = await repos.create_repos(type, new container());
  cli = await cli.connect(conn_str);
  let db = await cli.get_db(db_nm);
  let task: Promise<any>[] = [];
  for(let cmd of cmds) {
    task.push(db.exec(cmd).toPromise());
  }
  console.info(await Promise.all(task));
}

const conn_str_pfx = '--conn-str=';
const db_nm_pfx = '--db=';
const file_pfx = '--file=';
const type_pfx = '--type=';
const conn_str = process.argv.find(x => x.startsWith(conn_str_pfx));
const db_nm = process.argv.find(x => x.startsWith(db_nm_pfx));
const file = process.argv.find(x => x.startsWith(file_pfx));
const type = process.argv.find(x => x.startsWith(type_pfx));
const help = process.argv.find(x => x === '--help');

if(help || (conn_str && file && type)) {
  console.info("lytical(r) exec data command utility");
  if(help) {
    show_usage();
  }
  else {
    try {
      run(type!.substr(type_pfx.length), conn_str!.substr(conn_str_pfx.length), file!.substr(file_pfx.length), db_nm ? db_nm.substr(db_nm_pfx.length) : undefined)
        .then(() => {
          console.info('process complete.');
          process.exit(0);
        })
        .catch(err => {
          console.error(err);
          process.exit(-1);
        });
    } catch(err) {
      console.error(err);
      process.exit(-1);
    }
  }
}