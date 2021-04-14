import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'Contact',
  connector: 'postgresql',
  url: 'postgres://postgres:P@ssw0rd@localhost:5432/api',
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'P@ssw0rd',
  database: 'api'
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class ContactDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'Contact';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.Contact', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
