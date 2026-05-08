import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { solicitationRoutes } from './routes/solicitation';
import { categoryRoutes } from './routes/category';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/solicitations', solicitationRoutes);
app.use('/reimbursements', solicitationRoutes);
app.use('/categories', categoryRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app };
