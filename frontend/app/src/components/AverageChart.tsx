import { TextField } from '@mui/material';
import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
	CHANNEL_COLORS,
	CHANNEL_COUNT,
	DownloadButtons,
	useLegend,
	useRecording,
} from '../utils/chartUtils';
import { useEEGStreamHook } from '../utils/dataStreamHook';

export default function AverageChart() {
	// Custom hook to manage EEG data stream and average time
	const {data, setTimeAvg} = useEEGStreamHook();
	// Custom hook to manage legend visibility and rendering
	const {visibleLines, renderLegend} = useLegend(CHANNEL_COUNT);
	// Custom hook to handle recording logic
	const {
		isRecording,
		recordedData,
		recordDownloaded,
		handleStartRecord,
		handleStopRecord,
		handleDownloadRecorded,
	} = useRecording(data, visibleLines);

	const now = data.length ? data[data.length - 1].timestamp : Date.now();
	const WINDOW_MS = 30 * 1000;
	// Filter data to only include points within the last 30 seconds
	const filteredData = useMemo(
		() => data.filter((pt) => pt.timestamp >= now - WINDOW_MS && pt.timestamp <= now),
		[data, now]
	);

	// Generate x-axis ticks for the last 30 seconds
	const TICK_INTERVAL_MS = 1000; // 1 second
	const tickStart = now - 29 * 1000; // Start at 30 seconds ago (inclusive)
	const xTicks = useMemo(
		() => Array.from({length: 30}, (_, i) => tickStart + i * TICK_INTERVAL_MS),
		[tickStart]
	);

	return (
		<>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					gap: 12,
					flexWrap: 'wrap',
					justifyContent: 'center',
					alignItems: 'center',
					marginBottom: '1rem',
				}}
			>
				<p style={{color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center'}}>
					Choose data‐averaging period (seconds) Defaults to 1 second
				</p>

				<TextField
					size='small'
					id='filled-basic'
					label='AVG'
					variant='filled'
					type='number'
					onChange={(e) => setTimeAvg(Number(e.target.value))}
					style={{width: 80}}
				/>
			</div>
			{renderLegend(CHANNEL_COLORS)}
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					gap: 12,
					backgroundColor: 'rgba(255, 255, 255, 0.8)',
					justifyContent: 'center',
					alignItems: 'center',
					width: '100%',
					height: 400,
				}}
			>
				<ResponsiveContainer width='100%' height='100%'>
					<LineChart data={filteredData}>
						<CartesianGrid stroke='#444' strokeDasharray='3 3' />
						<XAxis
							dataKey='timestamp'
							type='number'
							domain={[now - 29 * 1000, now]}
							ticks={xTicks}
							minTickGap={0}
							tickFormatter={(t) => new Date(t).toLocaleTimeString()}
						/>
						<YAxis
							domain={[0, 20]}
							tick={{fill: '#000'}}
							axisLine={{stroke: '#888'}}
							tickLine={{stroke: '#888'}}
						/>
						<Tooltip
							contentStyle={{background: '#222', border: 'none', color: '#000'}}
							labelStyle={{color: '#000'}}
						/>
						{Array.from({length: CHANNEL_COUNT}, (_, i) =>
							visibleLines[i] ? (
								<Line
									key={i}
									type='monotone'
									dataKey={`ch${i + 1}`}
									stroke={CHANNEL_COLORS[i]}
									dot={false}
									strokeWidth={2}
									isAnimationActive={false}
								/>
							) : null
						)}
					</LineChart>
				</ResponsiveContainer>
			</div>
			{DownloadButtons({
				isRecording,
				recordedData,
				recordDownloaded,
				handleStartRecord,
				handleStopRecord,
				handleDownloadRecorded,
			})}
		</>
	);
}
