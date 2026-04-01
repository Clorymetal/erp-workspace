import { Router } from 'express';
import { listParameters, createNewParameter, updateExistingParameter, deleteParameter } from '../controllers/parameterController';

const router = Router();

router.get('/', listParameters);
router.post('/', createNewParameter);
router.patch('/:id', updateExistingParameter);
router.delete('/:id', deleteParameter);

export default router;
