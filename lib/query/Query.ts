import { Buffer } from "node:buffer";

export enum QueryType {
  SELECT,
  INSERT,
  UPDATE,
  DELETE,
  UNKNOWN
}

export class Query {
  public query: string;
  public parameters?: string[];

  constructor(query: string, parameters?: string[]) {
    this.query = query;
    this.parameters = parameters;
  }

  public getQueryType() {
    if (this.query.toLowerCase().startsWith('select')) {
      return QueryType.SELECT;
    } else if (this.query.toLowerCase().startsWith('insert')) {
      return QueryType.INSERT;
    } else if (this.query.toLowerCase().startsWith('update')) {
      return QueryType.UPDATE;
    } else if (this.query.toLowerCase().startsWith('delete')) {
      return QueryType.DELETE;
    } else {
      return QueryType.UNKNOWN;
    }
  }

  public static fromPayload(query: string | Buffer) {
    if (typeof query === 'string') {
      return new Query(query);
    } else {
      return new Query(query.toString('utf8', 1));
    }
  }

  public toString() {
    return this.query;
  }
}
