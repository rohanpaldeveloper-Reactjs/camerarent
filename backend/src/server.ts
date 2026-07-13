import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  CameraRent API Server is running!`);
  console.log(`  Environment: development`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Local Endpoint: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
