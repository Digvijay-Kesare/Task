﻿# Node.js API Cluster with Rate Limiting and Task Queueing

## Requirements:
- Node.js
- Redis (make sure you have Redis installed and running)

## Setup:

1. Clone the repository and install the dependencies:
    ```bash
    npm install
    ```

2. Start Redis:
    ```bash
    redis-server
    ```

3. Run the application:
    ```bash
    node cluster.js
    ```

4. Use the API:
    - Endpoint: `/task`
    - Method: POST
    - Body: `{ "user_id": "123" }`
    
    Example using `curl`:
    ```bash
    curl -X POST http://localhost:3000/task -H "Content-Type: application/json" -d '{"user_id": "123"}'
    ```

## Explanation:

- The API is clustered using two replica sets.
- Rate limiting is applied: 1 task per second and 20 tasks per minute per user.
- If the rate limit is exceeded, tasks are added to a queue (managed by Redis) and processed in order.
- Task completion is logged in `task_log.txt` with the user ID and timestamp.
