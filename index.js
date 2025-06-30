import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { authRouter } from "./routes/userRoutes.js";
import { connectToDB } from "./config/connectToDb.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
	origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
	credentials: true,
	optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: {
		success: false,
		error: {
			message: 'Too many requests from this IP, please try again later.'
		}
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// More strict rate limiting for auth routes
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // limit each IP to 5 requests per windowMs
	message: {
		success: false,
		error: {
			message: 'Too many authentication attempts, please try again later.'
		}
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
} else {
	app.use(morgan('combined', {
		stream: {
			write: (message) => logger.info(message.trim())
		}
	}));
}

// Health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({
		success: true,
		message: "Server is running",
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || 'development'
	});
});

// API routes
app.use('/api', authLimiter, authRouter);

// 404 handler
app.use('*', (req, res) => {
	res.status(404).json({
		success: false,
		error: {
			message: `Route ${req.originalUrl} not found`
		}
	});
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
	logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
	connectToDB();
});

// Graceful shutdown
process.on('SIGTERM', () => {
	logger.info('SIGTERM received. Shutting down gracefully...');
	server.close(() => {
		logger.info('Process terminated');
		process.exit(0);
	});
});

process.on('SIGINT', () => {
	logger.info('SIGINT received. Shutting down gracefully...');
	server.close(() => {
		logger.info('Process terminated');
		process.exit(0);
	});
});

export default app;