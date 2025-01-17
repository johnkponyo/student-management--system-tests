const { createClient } = require('redis');

exports.initRedis = async () => {
  try {

    const client = createClient();

    //Error listener
    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    // Connection
    await client.connect();
    console.log('Redis connected');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await client.quit();
      console.log('Redis client disconnected');
      process.exit(0);
    });

    return client;
    
  } catch (err) {
    console.error('Error connecting to Redis:', err);
    process.exit(1);
  }

};

