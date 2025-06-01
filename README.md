# Design Document: Real-Time Data Visualization Dashboard

## Architecture Choices

### Data Handling & Communication

- **Backend:**

  - Implemented with Python and FastAPI.
  - Receives a TCP data stream (100 samples/sec, 10 channels/sample) via a mock data generator.
  - Uses an async generator (`get_data_stream`) to buffer and average data over a configurable window (`time_avg`), emitting JSON objects per batch (more on that in the frontend section).
  - Exposes a WebSocket endpoint (`/ws/eeg-feed`) for real-time streaming to the frontend. The `time_avg` parameter is passed as a query param to control the averaging window.

- **Frontend:**
  - Built with React (Vite + TypeScript).
  - Uses a custom hook (`useEEGStreamHook`) to connect to the backend WebSocket, requesting data with the desired averaging window.
  - Maintains a rolling buffer of the last 30 seconds of data in state.
  - Provides controls for recording, downloading, and toggling channel visibility.

### Rendering Strategy

- **Charting:**
  - Utilizes [Recharts](https://recharts.org/) for performant, responsive line charts (having previous familiarity with Recharts from my current role).
  - Two charts are rendered:
    - **MainChart:** Shows raw (or near real-time) data for all channels, updating as new data arrives.
      The default data visualization had to be aggregated on the server for performance reasons. The user **can** toggle it off to view the raw data as it is being transferred with a refresh rate of one second (also for performance reasons).
    - **AverageChart:** Shows a moving average over a user-configurable window (default 1 second).
  - Legends allow toggling individual channel visibility.

## Challenges & Trade-offs

- **Time Constraints:**

  - Focused on core functionality: real-time streaming, charting, and basic controls.
  - Used in-memory buffers for simplicity; no persistent storage or advanced error handling.
  - Minimal backend validation and reconnection logic.
  - UI/UX is functional but not polished (basic styling, no mobile optimization,inline CSS).
  - Python is not one of the strongest languages I know, but I felt that since it was needed for the job I should learn the basics and learn how to set up a Python server (using FastAPI as well). AI did come in handy here in the form of validation and syntax help (just to save time googling).

- **Performance:**

  - Main issue I faced was visualizing the real data as it was being transferred to the client.
    Having this much data causes a massive FPS drop in the UI.
    Couldn't find any suitable library that would be good enough to show the required amount of data (100 samples/sec _ 10 channels _ 30 seconds timeframe). So I just picked the one I had the most hands-on experience with.
  - All averaging is done server-side for efficiency, but could be moved to the client if needed.

- **Extensibility:**
  - Code is modular (hooks, utils), but lacks comprehensive tests and documentation due to time.

## Improvements with More Time

- **Backend:**

  - Add authentication and robust error handling.
  - Implement persistent storage for recorded sessions.
  - Add unit tests.

- **Frontend:**
  - Improve UI/UX (responsive design, better controls, loading/error states).
  - Add more chart features (zoom, pan, export, annotations).
  - Implement client-side reconnection and buffering for network hiccups.
  - Add tests (unit, integration, e2e).
  - The record and download options for each chart should be performed on the server side.


**Sources of knowledge & ChatGPT links**

[how to create a websocket between a react client and a python server?](https://chatgpt.com/share/683b7a29-bafc-8010-92e3-5b52966030f6)

[fastAPI websockets query params](https://fastapi.tiangolo.com/tutorial/query-params/)

[How to get current time in python?](https://chatgpt.com/share/683b861c-d06c-8010-9e3d-2af736cebd4a)

[How to setup a python listener to a datastream ?](https://chatgpt.com/share/683b8694-651c-8010-ac76-bd108ecdf01b)

*Minor syntax errors were handled by VS Code Copilot.

*There are comments in the code indicating that the code scope below it was created with Copilot (just to save time for small UI solutions).
