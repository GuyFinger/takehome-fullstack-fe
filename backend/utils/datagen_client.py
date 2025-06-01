import asyncio
import json
import time
from typing import AsyncGenerator

DEFAULT_TIMEOUT = 10  # Default timeout for reading data in seconds
async def get_data_stream(
    host: str = 'localhost',
    port: int = 9000,
    time_avg: float = 1.0  # seconds
) -> AsyncGenerator[str, None]:
    reader, writer = await asyncio.open_connection(host, port)
    buffer: list[float] = [0.0] * 10
    channels = 10
    samples = 0
    last_emit = time.time()

    try:
        while True:
            try:
                line = await asyncio.wait_for(reader.readline(), timeout=DEFAULT_TIMEOUT)
            except asyncio.TimeoutError:
                continue
            if not line:
                break

            try:
                sample = json.loads(line.decode().strip())
            except json.JSONDecodeError:
                continue

            if len(sample) != channels:
                # Inconsistent sample size, skip this sample but we should log it
                continue
            
            # Add each channel’s value into the running sum
            for idx, value in enumerate(sample):
                buffer[idx] += value
            samples += 1

            # Check if enough time has passed to emit an averaged result
            now = time.time()
            if (now - last_emit) >= time_avg:
                if samples > 0:
                    # Compute per-channel average and round to nearest integer
                    avg = [round(channelValue / samples, 1) for channelValue in buffer]  
                    msg = {"timestamp": int(now * 1000)}
                    msg.update({f"ch{i+1}": avg[i] for i in range(channels)})
                    yield json.dumps(msg)

                    # Reset sums and counters for the next interval
                    buffer = [0.0] * channels
                    samples = 0
                    last_emit = now
    finally:
        writer.close()
        await writer.wait_closed()
