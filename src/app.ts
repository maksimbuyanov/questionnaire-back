import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import questionRoutes from './routes/questionRoutes';
import optionsRoutes from './routes/optionsRoutes';
import answerRoutes from './routes/answerRoutes';
import jokeRoutes from './routes/jokeRoutes';

const app = express();
app.use(express.json());
app.use(cors());

// Роуты для работы с пользователями и вопросами
app.use('/user', userRoutes);
app.use('/questions', questionRoutes);
app.use('/options', optionsRoutes);
app.use('/answer', answerRoutes);
app.use('/joke', jokeRoutes);

// Стартуем сервер
const port = 5001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
