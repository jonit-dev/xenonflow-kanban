import { Router } from 'express';
import usersRoutes from './users.routes';
import projectsRoutes from './projects.routes';
import epicsRoutes from './epics.routes';
import ticketsRoutes from './tickets.routes';

const router = Router();

router.use('/users', usersRoutes);
router.use('/projects', projectsRoutes);
router.use('/epics', epicsRoutes);
router.use('/tickets', ticketsRoutes);

export default router;
