import 'reflect-metadata';
import { Container } from 'typedi';
import { DatabaseClient } from './database/database.client';

// Import all repositories, services, and controllers to register them with TypeDI
import './repositories/base.repository';
import './repositories/columns.repository';
import './repositories/epics.repository';
import './repositories/projects.repository';
import './repositories/tickets.repository';
import './repositories/users.repository';

import './services/columns.service';
import './services/epics.service';
import './services/projects.service';
import './services/tickets.service';
import './services/users.service';

import './controllers/columns.controller';
import './controllers/epics.controller';
import './controllers/projects.controller';
import './controllers/tickets.controller';
import './controllers/users.controller';

export function setupDI(): void {
  // Get DatabaseClient to initialize it
  const db = Container.get(DatabaseClient);

  // Run migrations
  db.runMigrations();
}
