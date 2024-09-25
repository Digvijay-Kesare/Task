const express = require('express');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const fs = require('fs');
const app = express();
app.use(express.json());

// Create a rate limiter for 20 requests per minute
const rateLimiterMinute = new RateLimiterMemory({
  points: 20, // 20 requests
  duration: 60, // per 60 seconds
});

// Create a rate limiter for 1 request per second
const rateLimiterSecond = new RateLimiterMemory({
  points: 1, // 1 request
  duration: 1, // per second
});

const taskQueue = {}; // Simple task queue
const processing = {}; // Tracks if user task processing is ongoing

app.post('/task', (req, res) => {
  const userId = req.body.user_id;

  if (!taskQueue[userId]) {
    taskQueue[userId] = [];
  }

  // Add the task to the user's queue
  taskQueue[userId].push(Date.now());

  // Attempt to process the task
  if (!processing[userId]) {
    processing[userId] = true; // Mark that this user is being processed
    processTask(userId);
  }

  res.send({ message: 'Task received' });
});

const processTask = (userId) => {
  if (taskQueue[userId].length === 0) {
    processing[userId] = false; // No more tasks, processing done
    return;
  }

  // Check rate limits for minute and second
  Promise.all([
    rateLimiterMinute.consume(userId),
    rateLimiterSecond.consume(userId)
  ])
    .then(() => {
      // Rate limit allowed, process the task
      const taskTime = taskQueue[userId].shift(); // Get the task time
      task(userId, taskTime); // Pass the taskTime to the task function

      // Process the next task after a delay
      setTimeout(() => {
        processTask(userId);
      }, 1000); // Delay for 1 second after processing the task
    })
    .catch(() => {
      // Rate limit exceeded, re-queue the task
      console.log(`Rate limit exceeded for user: ${userId}. Re-queuing task.`);

      // Re-try processing the queue after 1 second
      setTimeout(() => {
        processTask(userId); // Retry processing after some time
      }, 1000);
    });
};

async function task(user_id, taskTime) {
  console.log(`${user_id}-task completed at-${Date.now()}`);
  // Append to log file
  fs.appendFileSync('task_log.txt', `${user_id}-task completed at-${Date.now()}\n`);
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
