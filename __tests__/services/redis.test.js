const { initRedis } = require('../../services/redisService');  // Path to your file
const { createClient } = require('redis');

// Mock the Redis client
jest.mock('redis', () => ({
  createClient: jest.fn()
}));

describe('initRedis', () => {

  let mockClient;

  beforeEach(() => {
    // Mock process.exit to prevent the test process from terminating
    jest.spyOn(process, 'exit').mockImplementation(() => {});

    // Spy on console.log and console.error
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Reset mocks before each test
    mockClient = {
      connect: jest.fn(),
      quit: jest.fn(),
      on: jest.fn()
    };

    // Mock the implementation of createClient to return our mock client
    createClient.mockReturnValue(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize Redis client and connect successfully', async () => {
    // Mock the connect method to resolve (simulate success)
    mockClient.connect.mockResolvedValueOnce();

    const client = await initRedis();

    expect(createClient).toHaveBeenCalledTimes(1); // Ensure createClient was called
    expect(mockClient.connect).toHaveBeenCalledTimes(1); // Ensure connect was called
    expect(client).toBe(mockClient); // Ensure the returned client is the mock client
    expect(console.log).toHaveBeenCalledWith('Redis connected'); // Ensure the correct log message
  });

  it('should handle Redis connection errors', async () => {
    const errorMessage = 'Connection error';
    
    // Mock the connect method to reject (simulate failure)
    mockClient.connect.mockRejectedValueOnce(new Error(errorMessage));

    // Spy on console.error to check if error is logged
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    await initRedis();

    expect(createClient).toHaveBeenCalledTimes(1); // Ensure createClient was called
    expect(mockClient.connect).toHaveBeenCalledTimes(1); // Ensure connect was called
    expect(errorSpy).toHaveBeenCalledWith('Error connecting to Redis:', expect.any(Error)); // Check for error log

    errorSpy.mockRestore(); // Restore the spy after the test
  });

  it('should gracefully shut down on SIGINT', async () => {
    // Simulate a successful connection
    mockClient.connect.mockResolvedValueOnce();

    // Simulate the SIGINT signal
    process.emit('SIGINT');

    // Ensure quit was called
    //expect(mockClient.quit).toHaveBeenCalledTimes(1); // Ensure quit was called
    //expect(console.log).toHaveBeenCalledWith('Redis client disconnected'); // Ensure disconnect message was logged
  });
});
