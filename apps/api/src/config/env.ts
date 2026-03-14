import path from 'path';
import dotenv from 'dotenv';

// Load apps/api/.env first for local development, then allow default dotenv behavior.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();
