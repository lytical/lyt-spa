/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { Db, MongoClient, ObjectID, Binary } from 'mongodb';
import { URL } from 'url';
import { db } from '../db';
import { repos } from '../repos';
import { plain_object } from '../../lib/plain-object';
import { Observable, Observer } from 'rxjs';
import { cancellation_token, cancellation } from '../../lib/cancellation';

class db_mongodb implements db {
  constructor(private mdb: Db) {
  }

  private ingress(value: any): any {
    switch(typeof value) {
      case 'string':
        try { return ObjectID.createFromHexString(value); } catch(err) { }
        break;
      case 'object':
        if(Array.isArray(value)) {
          for(let i = 0; i < value.length; ++i) {
            value[i] = this.ingress(value[i]);
          }
        }
        else if(value instanceof Buffer && value.length === 16) {
          return new Binary(value, Binary.SUBTYPE_UUID_OLD);
        }
        else if(value !== null) {
          for(let item of Object.getOwnPropertyNames(value)) {
            value[item] = this.ingress(value[item]);
          }
        }
        break;
    }
    return value;
  }

  private async do_exec<_t_ = any>(cmd: plain_object | string, cancel: cancellation_token, obs: Observer<_t_>) {
    while(!cancel.is_cancelled) {
      try {
        let rs = await this.mdb.command(this.ingress(typeof cmd === 'string' ? JSON.parse(cmd) : cmd));
        if(rs.ok === 1 && rs.cursor) {
          for(let i of rs.cursor.firstBatch || rs.cursor.nextBatch) {
            obs.next(i);
          }
          if(rs.cursor.firstBatch) {
            if(rs.cursor.id) {
              cmd = {
                getMore: rs.cursor.id,
                collection: /\.([^\.]+)$/.exec(rs.cursor.ns)![1]
              };
              continue;
            }
          }
          else if(rs.cursor.id) {
            continue;
          }
        }
        else {
          obs.next(rs);
        }
        obs.complete();
        break;
      }
      catch(err) {
        obs.error(err);
        break;
      }
    }
  }

  exec<_t_ = any>(cmd: plain_object | string): Observable<_t_> {
    return new Observable<_t_>(obs => {
      const c = new cancellation();
      this.do_exec<_t_>(cmd, c.token, obs).catch(err => obs.error(err));
      return () => c.cancel();
    });
  }
}

export default class repos_mongodb implements repos {
  async close(force?: boolean): Promise<any> {
    if(this.cli) {
      await this.cli.close(force);
      this.cli = undefined;
    }
  }

  async connect(url: URL | string): Promise<repos> {
    console.assert(!this.cli, 'already-connected');
    this.cli = await MongoClient.connect(typeof url === 'string' ? url : url.href!,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    return this;
  }

  async drop_db(id: string): Promise<any> {
    if(!this.cli) {
      throw new Error('not-connected');
    }
    return await (await this.cli.db(id)).dropDatabase();
  }

  async get_db(id?: string): Promise<db> {
    if(!this.cli) {
      throw new Error('not-connected');
    }
    return new db_mongodb(this.cli.db(id ? id : 'admin'));
  }

  async list_dbs(): Promise<any> {
    if(!this.cli) {
      throw new Error('not-connected');
    }
    let db: { databases: { name: string }[] } = await this.cli.db('admin')
      .admin()
      .listDatabases();
    return db.databases.map(x => x.name);
  }

  private cli?: MongoClient;
}