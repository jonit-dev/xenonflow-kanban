import { Router } from 'express';
import columnsRoutes from './columns.routes';
import epicsRoutes from './epics.routes';
import projectsRoutes from './projects.routes';
import ticketsRoutes from './tickets.routes';
import usersRoutes from './users.routes';

const router = Router();

router.use('/users', usersRoutes);
router.use('/projects', projectsRoutes);
router.use('/epics', epicsRoutes);
router.use('/tickets', ticketsRoutes);
router.use('/columns', columnsRoutes);

export default router;
