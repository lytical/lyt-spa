/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { Observable, Subscriber } from 'rxjs';
import * as _fs from 'fs';
import * as _path from 'path';

export const file_invalid_path_pattern = /(?:^\s*\w+:|^\s*\\\\|^\s*\/|\.\.)/;

export class fs {
  static find_ancestor(name: string, path: string, root: string = '/', access: number = _fs.constants.F_OK): Observable<string> {
    return Observable.create((sub: Subscriber<string>) => {
      let seg = _path.resolve(path).split(_path.sep);
      if(seg.some((value, i) => file_invalid_path_pattern.test(value))) {
        sub.error(new Error('path contains invalid (..)'));
      }
      fs.find_ancestor_seg(seg, name, _path.resolve(root), access, sub);
    });
  }

  private static find_ancestor_seg(seg: string[], name: string, root: string, access: number, sub: Subscriber<string>) {
    if(!sub.closed) {
      let path = seg.join(_path.sep);
      if(!path.startsWith(root)) {
        sub.complete();
        return;
      }
      path = _path.normalize(`${path}/${name}`);
      _fs.access(path, err => {
        if(!sub.closed) {
          if(!err) {
            sub.next(path);
          }
          if(!sub.closed) {
            if(seg.length) {
              fs.find_ancestor_seg(seg.slice(0, seg.length - 1), name, root, access, sub);
            }
            else {
              sub.complete();
            }
          }
        }
      });
    }
  }

  static exists(path: _fs.PathLike) {
    return new Promise<boolean>((res, rej) => {
      _fs.exists(path, res);
    });
  }

  static ls(path: string): Promise<string[]>;
  static ls(path: string, opts: string): Promise<string[]>;
  static ls(path: string, opts: { encoding?: string | null, withFileTypes: true }): Promise<_fs.Dirent[]>;
  static ls(path: string, opts?: any): Promise<any[]> {
    return new Promise<(string | _fs.Dirent)[]>((res, rej) => _fs.readdir(path, opts || {}, (err, rs) => {
      if(err) {
        rej(err);
      }
      else {
        res(rs);
      }
    }));
  }

  static mkdir(path: string): Promise<void> {
    return new Promise<void>((res, rej) => {
      path = _path.normalize(path);
      let seg = path.split(_path.sep);
      let stack: string[] = [];
      const build_dir = () => {
        if(stack.length) {
          seg.push(stack.pop()!);
          path = seg.join(_path.sep);
          _fs.mkdir(path, err => {
            if(err) {
              rej(err);
            }
            else {
              build_dir();
            }
          });
        }
        else {
          res();
        }
      };
      const chk_dir = () => {
        _fs.stat(path, (err, stat) => {
          if(err) {
            if(err.code === 'ENOENT') {
              stack.push(seg.pop()!);
              path = seg.join(_path.sep);
              chk_dir();
            }
            else {
              rej(err);
            }
          }
          else {
            build_dir();
          }
        });
      }
      chk_dir();
    });
  }

  static read(path: _fs.PathLike | number, options: { encoding?: string | null; flag?: string; } | string | undefined | null): Promise<string | Buffer> {
    return new Promise<any>((res, rej) => {
      _fs.readFile(path, options, (err, data) => err ? rej(err) : res(data));
    });
  }

  static write(path: _fs.PathLike | number, data: any, options?: _fs.WriteFileOptions): Promise<void> {
    return new Promise<void>((res, rej) => {
      if(options) {
        _fs.writeFile(path, data, options, (err) => err ? rej(err) : res());
      }
      else {
        _fs.writeFile(path, data, (err) => err ? rej(err) : res());
      }
    });
  }
}