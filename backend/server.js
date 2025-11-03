const express = require('express');
const cors = require('cors');
const kafka = require('kafka-node');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'connect4',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Kafka Setup (optional - will work without Kafka)
let kafkaProducer;
try {
  const kafkaClient = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_HOST || 'localhost:9092' });
  kafkaProducer = new kafka.Producer(kafkaClient);
  
  kafkaProducer.on('ready', () => {
    console.log('✓ Kafka Producer is ready');
  });
  
  kafkaProducer.on('error', (err) => {
    console.log('⚠ Kafka not available:', err.message);
  });
} catch (err) {
  console.log('⚠ Kafka setup skipped - running without messaging');
}

// Initialize Database
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT NOW(),
        winner VARCHAR(10)
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS moves (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id),
        row INTEGER NOT NULL,
        col INTEGER NOT NULL,
        player VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✓ Database tables initialized');
  } catch (err) {
    console.log('⚠ Database init skipped:', err.message);
  }
}

initDatabase();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      database: pool ? 'connected' : 'disconnected',
      kafka: kafkaProducer ? 'connected' : 'disconnected'
    }
  });
});

app.post('/api/game/new', async (req, res) => {
  try {
    const result = await pool.query('INSERT INTO games DEFAULT VALUES RETURNING id');
    res.json({ gameId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

app.post('/api/move', async (req, res) => {
  const { row, col, player, gameId } = req.body;
  
  try {
    // Save to database
    if (pool) {
      const result = await pool.query(
        'INSERT INTO moves (game_id, row, col, player) VALUES ($1, $2, $3, $4) RETURNING id',
        [gameId || 1, row, col, player]
      );
      
      // Send to Kafka
      if (kafkaProducer) {
        const payload = [{
          topic: 'game-moves',
          messages: JSON.stringify({ row, col, player, timestamp: new Date() })
        }];
        
        kafkaProducer.send(payload, (err) => {
          if (err) console.log('Kafka send error:', err);
        });
      }
      
      res.json({ success: true, moveId: result.rows[0].id });
    } else {
      res.json({ success: true, message: 'Move received (DB not configured)' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save move' });
  }
});

app.get('/api/game/:id/moves', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM moves WHERE game_id = $1 ORDER BY created_at',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch moves' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log('✓ CORS enabled');
  console.log('✓ API endpoints ready\n');
});