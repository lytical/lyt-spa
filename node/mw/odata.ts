/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { Observable, Observer } from 'rxjs';
import { plain_object } from '../lib/plain-object';
import { state_machine } from '../lib/state-machine';
import { text } from '../lib/text';
import { RequestHandler } from 'express';

export interface $filter extends plain_object {
}

export interface $orderby extends plain_object<-1 | 1> {
}

export interface $select extends plain_object<0 | 1 | { $slice?: number | [number, number], $elemMatch?: any, $?: any }> {
}

export function odata(): RequestHandler {
  return (rqs, rsp, next) => {
    if(rqs.query.$top)
      try {
        rqs.query.$top = Number.parseInt(rqs.query.$top);
      } catch(err) { next(err); }
    if(rqs.query.$skip)
      try {
        rqs.query.$skip = Number.parseInt(rqs.query.$skip);
      } catch(err) { next(err); }
    if(rqs.query.$timeout)
      try {
        rqs.query.$timeout = Number.parseInt(rqs.query.$timeout);
      } catch(err) { next(err); }
    if(rqs.query.$select)
      try {
        rqs.query.$select = get_select(rqs.query.$select);
      } catch(err) { next(err); }
    if(rqs.query.$orderby)
      try {
        rqs.query.$orderby = get_orderby(rqs.query.$orderby);
      } catch(err) { next(err); }
    if(rqs.query.$filter)
      try {
        rqs.query.$filter = get_filter(rqs.query.$filter);
      } catch(err) { next(err); }
    next();
  }
}

function cast(arg: string): any {
  let rs = text.cast(arg);
  //return rs === arg && ObjectId.isValid(arg) ? ObjectId.createFromHexString(arg) : rs;
  return rs;
}

/**
  * $filter=[not] FIELD [eq|ne|gt|ge|lt|le|exist|type|size|has] VALUE [and|or]...
  *               text search VALUE[,CASE[,LANG[,DIACRITIC]]]
  *               FIELD [all|mod|in|bitsallclear|bitsallset|bitsanyclear|bitsanyset] (VALUE,...)
  * 
  * @param criteria
  */
function get_filter(criteria: string): $filter {
  console.assert(typeof criteria === 'string');
  enum state {
    set_left_operand,
    set_operator,
    set_right_operand,
    done
  }

  let level = 0;
  let stack: { level: number, type?: string, obj: any }[] = [];
  let scope: any | undefined;
  let scope_type: string | undefined;
  let operand: string | undefined;
  let operator: string | undefined;
  let expect_comma: boolean;

  const pop_scope = () => {
    console.assert(stack.length);
    let last = stack.length - 1;
    let x = stack[last];
    if(x.level === level) {
      stack.splice(last, 1);
      scope = x.obj;
      scope_type = x.type;
    }
  };

  const is_list_operator = (arg: string) => {
    switch(arg) {
      case '$in':
      case '$nin':
      case '$all':
      case '$mod':
      case '$search':
      case '$bitsAllClear':
      case '$bitsAllSet':
      case '$bitsAnyClear':
      case '$bitsAnySet':
        return true;
    }
    return false;
  }

  const pop_stack_till = (predicate: (obj: any) => boolean) => {
    if(predicate(scope)) {
      return scope;
    }
    for(let x = stack.length - 1; x >= 0; --x) {
      let rt = stack[x];
      if(rt.level !== level) {
        break;
      }
      if(predicate(rt.obj)) {
        stack.splice(x, stack.length - x);
        scope = rt.obj;
        scope_type = rt.type;
        return rt;
      }
    }
    return undefined;
  };

  const init_text_search = () => {
    if(scope_type === '$search') {
      if(!Array.isArray(scope) || scope.length === 0 || scope.length > 4) {
        throw new SyntaxError('text search syntax error in filter. expected \'text search search-for,case,lang,diacritic\'.');
      }
      let tmp = scope;
      pop_scope();
      let text = (<any>scope).$text;
      text.$search = tmp[0];
      if(tmp.length > 1 && tmp[1] !== undefined) {
        text.$caseSensitive = tmp[1];
      }
      if(tmp.length > 2 && tmp[2] !== undefined) {
        text.$language = tmp[2];
      }
      if(tmp.length == 4 && tmp[3] !== undefined) {
        text.$diacriticSensitive = tmp[3];
      }
    }
  };

  const get_result = () => {
    switch(sm.current_state) {
      case state.set_right_operand:
        if(!is_list_operator(scope_type!) || !Array.isArray(scope) || scope.length === 0) {
          throw new Error(`expected missing right operand in filter statement.`);
        }
        init_text_search();
        pop_stack_till(obj => Array.isArray(obj));
        break;
      case state.set_left_operand:
        if(scope === undefined && stack.length === 0) {
          throw new Error(`expected missing statement in filter.`);
        }
        break;
      default:
        throw new Error(`expected missing operator in filter statement.`);
    }
    pop_stack_till(obj => !Array.isArray(obj));
    console.assert(scope && !Array.isArray(scope));
    return scope;
  };

  const set_scope = (type: string | undefined, obj: any, push_scope: boolean = true) => {
    if(push_scope && scope) {
      stack.push({ level: level, type: scope_type, obj: scope });
    }
    scope_type = type;
    scope = obj;
  };

  const is_delimeter = (arg: string) => {
    switch(arg) {
      case '(':
      case ')':
      case ',':
        return true;
    }
    return false;
  };

  const set_left_operand = (token: string) => {
    operand = undefined;
    operator = undefined;
    if(token === '(') {
      set_scope(undefined, undefined);
      ++level;
      return state.set_left_operand;
    }
    if(token === ')') {
      let rs = get_result();
      if(--level < 0) {
        throw new Error(`unexpected token ')' in filter. expected left or logical statement.`);
      }
      pop_stack_till(obj => Array.isArray(obj));
      if(Array.isArray(scope)) {
        scope.push(rs);
      }
      else {
        scope = rs;
        scope_type = undefined;
      }
      return state.set_left_operand;
    }
    if(!is_delimeter(token)) {
      let tmp = token.toLowerCase();
      switch(tmp) {
        case 'and':
        case 'or':
        case 'nor':
          if(!scope) {
            throw new Error(`unexpected token '${token}' in filter. expected left statement.`);
          }
          tmp = `$${tmp}`;
          if(scope_type !== tmp) {
            if(scope_type !== undefined) {
              pop_scope();
            }
            set_scope(undefined, { [tmp]: [scope] }, false);
            set_scope(tmp, scope[tmp]);
          }
          return state.set_left_operand;
      }
      operand = token;
      return state.set_operator;
    }
    throw new Error(`unexpected token '${token}' in filter. expected left operand.`);
  };

  const set_operator = (token: string) => {
    console.assert(operand);
    if(!is_delimeter(token)) {
      let tmp = token.toLowerCase();
      switch(tmp) {
        case 'eq':
        case 'ne':
        case 'gt':
        case 'lt':
        case 'exists':
        case 'type':
        case 'size':
          operator = `$${tmp}`;
          return state.set_right_operand;
        case 'ge':
          operator = '$gte';
          return state.set_right_operand;
        case 'le':
          operator = '$lte';
          return state.set_right_operand;
        case 'in':
        case 'nin':
        case 'all':
        case 'mod':
        case 'search':
        case 'bitsallclear':
        case 'bitsallset':
        case 'bitsanyclear':
        case 'bitsanyset':
          if(tmp === 'search') {
            if(operand !== 'text') {
              throw new SyntaxError('unexpected token \'search\' must follow \'text\' only.');
            }
            operand = `$${operand}`;
          }
          operator = `$${token.startsWith('bits') ? token : tmp}`;
          let obj = { [operand!]: { [operator]: [] } };
          expect_comma = false;
          if(Array.isArray(scope)) {
            scope.push(obj);
          }
          set_scope(undefined, obj);
          set_scope(operator, obj[operand!][operator]);
          return state.set_right_operand;
      }
    }
    throw new Error(`unexpected token '${token}' in filter. expected operator.`);
  };

  const set_right_operand = (token: string) => {
    console.assert(operand && operator);
    if(is_list_operator(operator!)) {
      switch(token) {
        case '(':
          expect_comma = false;
          if((<any[]>scope).length) {
            throw new Error(`unexpected token '(' in filter. expected list item.`);
          }
          return state.set_right_operand;
        case ',':
          if(expect_comma) {
            expect_comma = false;
            return state.set_right_operand;
          }
          throw new Error(`unexpected token ',' in filter. expected list item.`);
        case ')':
          if(!expect_comma) {
            throw new Error(`unexpected token ')' in filter. expected list item.`);
          }
          init_text_search();
          pop_stack_till(obj => Array.isArray(obj));
          return state.set_left_operand;
      }
      (<any[]>scope).push(cast(token));
      expect_comma = true;
      return state.set_right_operand;
    }
    if(!is_delimeter(token)) {
      if(Array.isArray(scope)) {
        scope.push({ [operand!]: { [operator!]: cast(token) } });
      }
      else {
        set_scope(undefined, { [operand!]: { [operator!]: cast(token) } });
      }
      return state.set_left_operand;
    }
    throw new Error(`unexpected token '${token}' in filter. expected right operand.`);
  };

  let sm = new state_machine(state.set_left_operand,
    set_left_operand,
    set_operator,
    set_right_operand
  );

  let zzz: $filter;
  tokenize(criteria.trim()).subscribe(
    token => sm.invoke(null, token),
    err => {
      throw err;
    },
    () => {
      if(level) {
        throw new Error(`expected missing token ')' in filter statement.`);
      }
      zzz = get_result();
    });
  return zzz!;
}

function get_orderby(val: string): $orderby {
  let rt: $orderby = {};
  for(let i of decodeURI(val).split(',').map(x => x.trim())) {
    let x = i.split(' ');
    rt[x[0]] = x.length > 1 && x[1] == 'desc' ? -1 : 1;
  }
  return rt;
}

/**
  * $select=include_field, -exclude_field, array_field_top_n[n], array_field_bottom_n[-n], array_field_skip_limit[s l], array_first_field(field [eq|ne|gt|lt|ge|le] value [and ...])
  * 
  * @param val
  */
function get_select(val: string): $select {
  let rt: $select = {};
  for(let i of decodeURI(val).split(',').map(x => x.trim())) {
    let idx = 0;
    let chr: string | undefined;
    for(let x of i) {
      if(x === '[') {
        chr = '[';
        break;
      }
      if(x === '(') {
        chr = '(';
        break;
      }
      ++idx;
    }
    if(chr === '[') {
      let m = i.substr(idx).match(/-?\d+/g);
      if(m) {
        switch(m.length) {
          case 1:
            rt[i.substr(0, idx)] = {
              $slice: Number.parseInt(m[0])
            };
            break;
          case 2:
            rt[i.substr(0, idx)] = {
              $slice: [Number.parseInt(m[0]), Number.parseInt(m[1])]
            };
            break;
        }
      }
    }
    else if(chr === '(') {
      rt[i.substr(0, idx)] = {
        $elemMatch: get_filter(i.substr(idx))
      };
    }
    else {
      if(i.startsWith('-')) {
        rt[i.substr(1)] = 0;
      }
      else {
        rt[i] = 1;
      }
    }
  }
  return rt;
}

function tokenize(criteria: string): Observable<string> {
  return Observable.create((obs: Observer<string>) => {
    let buf = Array.from(criteria);
    let in_quote: '\'' | '"' | undefined;
    let is_esc = false;
    let cur = 0;
    const set_chr = (chr: string) => {
      if(in_quote) {
        buf[cur++] = chr;
      }
      else if(cur !== 0) {
        obs.next(buf.slice(0, cur).join(''));
        cur = 0;
      }
    };
    for(let i = 0, ub = criteria.length; !obs.closed && i < ub; ++i) {
      let chr = criteria[i];
      if(is_esc) {
        is_esc = false;
        switch(chr) {
          case 'b':
            set_chr('\b');
            continue;
          case 't':
            set_chr('\t');
            continue;
          case 'n':
            set_chr('\n');
            continue;
          case 'v':
            set_chr('\v');
            continue;
          case 'f':
            set_chr('\f');
            continue;
          case 'r':
            set_chr('\r');
            continue;
          default:
            if(in_quote) {
              buf[cur++] = chr;
            }
            continue;
        }
      }
      if(in_quote) {
        if(chr === '\\') {
          is_esc = true;
          continue;
        }
        if(chr === in_quote) {
          in_quote = undefined;
          buf[cur++] = chr;
          obs.next(buf.slice(0, cur).join(''));
          cur = 0;
          continue;
        }
        buf[cur++] = chr;
        continue;
      }
      switch(chr) {
        case '\\':
          is_esc = true;
          break;
        case '\'':
        case '"':
          if(cur !== 0) {
            obs.next(buf.slice(0, cur).join(''));
            cur = 0;
          }
          buf[cur++] = chr;
          in_quote = chr;
          break;
        case ' ':
          if(cur !== 0) {
            obs.next(buf.slice(0, cur).join(''));
            cur = 0;
          }
          break;
        case '(':
        case ')':
        case ',':
          if(cur !== 0) {
            obs.next(buf.slice(0, cur).join(''));
            cur = 0;
          }
          obs.next(chr);
          break;
        default:
          buf[cur++] = chr;
          break;
      }
    }
    if(!obs.closed) {
      if(in_quote || is_esc) {
        obs.error(new SyntaxError('unexpected end of string'));
      }
      else {
        if(cur !== 0) {
          obs.next(buf.slice(0, cur).join(''));
          cur = 0;
        }
        obs.complete();
      }
    }
  });
}