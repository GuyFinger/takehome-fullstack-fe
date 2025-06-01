from fastapi import FastAPI, WebSocket, Query
import asyncio
from utils.datagen_client import get_data_stream
from starlette.websockets import WebSocketDisconnect 

app = FastAPI()
TIME_AVG_DEFAULT = 0.1  # Default time average in seconds
RETRY_INTERVAL = 5  # seconds
SAMPLE_RATE = 100   #used to calculate batch size
PORT = 8000 # Default port for the WebSocket server
@app.websocket("/ws/eeg-feed")
async def eeg_feed(websocket: WebSocket,time_avg:float=TIME_AVG_DEFAULT):
    print(f"WebSocket connection established with time_avg={time_avg} seconds")
    await websocket.accept()  # Accept the WebSocket connection   
    if time_avg == 0:
        batch_size = 1
    else:
        batch_size = int(time_avg * SAMPLE_RATE)
    print(f"Batch size set to: {batch_size}")
    while True:
        try:
            async for data in get_data_stream(time_avg=time_avg):  # Pass time_avg here
                await websocket.send_text(data)  # Send data to the connected client
        except WebSocketDisconnect:
            print("WebSocket disconnected by client.")
            break  # Exit the loop gracefully
        except Exception as e:
            print("Exception occurred: connection closed or error in data stream", e)
            try:
                await websocket.send_text('{"error": "CONNECTION_TO_DATA_GEN_TERMINATED"}')
            except Exception:
                break  # If sending fails, client is gone
            await asyncio.sleep(RETRY_INTERVAL)  # Wait before retrying
            continue  # Try to reconnect to the data stream 
        else:
            # If the generator ends without exception, notify the client
            await websocket.send_text('{"error": "CONNECTION_TERMINATED"}')
            break
    await websocket.close()  # Close the WebSocket connection when done
