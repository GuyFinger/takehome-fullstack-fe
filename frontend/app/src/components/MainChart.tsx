import { Button } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
	CHANNEL_COLORS,
	CHANNEL_COUNT,
	DownloadButtons,
	useLegend,
	useRecording,
} from '../utils/chartUtils';
import { useEEGStreamHook } from '../utils/dataStreamHook';

export default function MainChart() {
	const {data, setTimeAvg} = useEEGStreamHook();
	const {visibleLines, renderLegend} = useLegend(CHANNEL_COUNT);
	const [realTimeStream, setRealTimeStream] = useState<boolean>(false);

	const {
		isRecording,
		recordedData,
		recordDownloaded,
		handleStartRecord,
		handleStopRecord,
		handleDownloadRecorded,
	} = useRecording(data, visibleLines);

	useEffect(() => {
		setTimeAvg(realTimeStream ? 0 : 0.1);
	}, [realTimeStream]);

	const now = Date.now();
	const WINDOW_MS = 30 * 1000;
	const filteredData = useMemo(
		() => data.filter((pt) => pt.timestamp >= now - WINDOW_MS && pt.timestamp <= now),
		[data, now]
	);

	return (
		<>
			<Button
				variant='contained'
				size='small'
				onClick={() => {
					setRealTimeStream(!realTimeStream);
				}}
				style={{
					backgroundColor: 'rgba(255, 255, 255, 0.8)',
					color: 'rgba(0, 0, 0, 0.8)',
					marginBottom: '1rem',
				}}
			>
				Toggle Real-time Stream
			</Button>

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
							domain={[now - WINDOW_MS, now]}
							minTickGap={40}
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
