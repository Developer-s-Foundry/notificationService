import express from 'express';
import dotenv from 'dotenv';
import db from './database';
import notificationService from './services/notification';
import notificationRoutes from './routes/notification.routes';
import { errorHandler, notFound } from './middlewares/error.middleware';


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


db.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to database');
    release();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Notification Service API');
});


app.use('/api/notifications', notificationRoutes);


app.use(notFound);

app.use(errorHandler);


app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    
    try {
        await notificationService.connect();
        console.log('Notification service started');
    } catch (error) {
        console.error('Failed to start notification service:', error);
    }
});

// Handle process termination
process.on('SIGINT', async () => {
    try {
        await notificationService.close();
        console.log('Notification service stopped');
        process.exit(0);
    } catch (error) {
        console.error('Error stopping notification service:', error);
        process.exit(1);
    }
});