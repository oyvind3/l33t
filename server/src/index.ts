import express from 'express';
import cors from 'cors';
import userRoutes from './routes/users.js';
import pollRoutes from './routes/polls.js';
import voteRoutes from './routes/votes.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(authMiddleware);

app.use('/api/users', userRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/polls', voteRoutes);

app.listen(PORT, () => {
  console.log(`🎮 LAN Party Poll Server running on http://localhost:${PORT}`);
});
