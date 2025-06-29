import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// import realmRoutes from './routes/realm.route';
import ruleRoutes from './src/routes/rules.route';
import userRoutes from './src/routes/user.route';
import realmRoutes from './src/routes/realm.route'
import groupRoutes from './src/routes/group.route';


dotenv.config();

const app = express();
const PORT = 4002;

app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.json());
app.use(bodyParser.json());

// app.use('/api/realms', realmRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/realm', realmRoutes);
app.use('/api/groups', groupRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
