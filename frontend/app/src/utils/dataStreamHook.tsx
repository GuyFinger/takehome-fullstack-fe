import { useEffect, useRef, useState } from 'react';
import type { EEGDataPoint } from '../types';

export function useEEGStreamHook() {
	const wsRef = useRef<WebSocket | null>(null);
	const dataRef = useRef<EEGDataPoint[]>([]);
	const [data, setData] = useState<EEGDataPoint[]>([]);
	const [timeAvg, setTimeAvg] = useState<number>(1);

	useEffect(() => {
		const ws = new WebSocket(`ws://localhost:8000/ws/eeg-feed?time_avg=${timeAvg}`);
		wsRef.current = ws;

		ws.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data);
				dataRef.current.push(msg);
				//if timeAvg is higher than 0, we will only update the data when new msg comes in
				if (timeAvg !== 0 && dataRef.current.length > 0) {
					setData([...dataRef.current]);
				}
			} catch (e) {
				console.error('Invalid EEG data', e);
			}
		};

		ws.onerror = (err) => {
			console.error('WebSocket error', err);
		};

		ws.onclose = () => {
			console.warn('WebSocket closed');
		};

		let intervalId: NodeJS.Timeout | null = null;
		// If timeAvg is 0, we will update the data every second for performance reasons
		if (timeAvg === 0) {
			intervalId = setInterval(() => {
				setData([...dataRef.current]);
			}, 1000);
		}

		return () => {
			ws.close();
			if (intervalId) clearInterval(intervalId);
		};
	}, [timeAvg]);

	return {data, setTimeAvg};
}
