import { Proxy } from './lib';

const PROXY_PORT = 3307;
const PROXY_URL = 'localhost';
const MYSQL_PORT = 3306;
const MYSQL_URL = 'localhost';

const proxy = new Proxy(PROXY_URL, PROXY_PORT, MYSQL_URL, MYSQL_PORT);
