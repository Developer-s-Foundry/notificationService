import express from 'express';
import dotenv from 'dotenv';
import db from './database';
import notificationService from './services/notification';
import notificationRoutes from './routes/notification.routes';
import { errorHandler, notFound } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// DB Connection Check (optional but helpful)
db.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error acquiring DB client:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL');
  }
  release();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
  app.get('/', (req, res) => {
    res.send('Test route works');
  });
  
app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
  });
// Start the server
app.listen(port, async () => {
  console.log(`🌐 Server running on port ${port}`);

  try {
    await notificationService.connect();
    console.log('📨 Notification service connected to RabbitMQ');
  } catch (error) {
    console.error('❌ Failed to start notification service:', error);
  }
});

//shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received. Shutting down gracefully...');
  try {
    await notificationService.close();
    console.log('✅ Notification service stopped');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});
