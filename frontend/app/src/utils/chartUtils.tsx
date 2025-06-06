import { useEffect, useRef, useState } from 'react';
import type {DownloadButtonsProps, EEGDataPoint} from '../types';

export const CHANNEL_COUNT = 10;

// Generate colors for each channel. Generated by copilot
export const CHANNEL_COLORS = Array.from(
	{length: CHANNEL_COUNT},
	(_, i) => `hsl(${(i * 36) % 360},70%,60%)`
);

type DownloadFinishedCallback = (finished: boolean) => void;

// Function to download recorded EEG data as CSV. Generated by copilot
export const downloadRecordedData = (
	recordedData: EEGDataPoint[],
	onFinish: DownloadFinishedCallback
): void => {
	if (!recordedData.length) return;
	const headers = Object.keys(recordedData[0]);
	const csvRows = [
		headers.join(','), // header row containing channel names
		...recordedData.map((row) => headers.map((h) => row[h]).join(',')),
	];
	const csvContent = csvRows.join('\n');
	const blob = new Blob([csvContent], {type: 'text/csv'});
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'eeg_recorded_data.csv';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
	onFinish(true);
};

// Custom hook for recording EEG data
export function useRecording(data: any[], visibleLine: boolean[]) {
	const [isRecording, setIsRecording] = useState(false);
	const [recordedData, setRecordedData] = useState<any[]>([]);
	const [recordDownloaded, setRecordDownloaded] = useState(false);
	const recordingRef = useRef<any[]>([]);

	const handleStartRecord = () => {
		recordingRef.current = [];
		setRecordedData([]);
		setRecordDownloaded(false);
		setIsRecording(true);
	};

	const handleStopRecord = () => {
		setIsRecording(false);
		setRecordedData([...recordingRef.current]);
		setRecordDownloaded(false);
	};

	useEffect(() => {
		if (!isRecording) return;
		if (!data.length) return;
		const lastTimestamp = recordingRef.current.length
			? recordingRef.current[recordingRef.current.length - 1].timestamp
			: 0;
		const newPoints = data
			.filter((pt) => pt.timestamp > lastTimestamp)
			.map((pt) => ({
				...pt,
				channels: pt.channels
					? pt.channels.map((val: any, idx: number) => (visibleLine[idx] ? val : null)) // Filter channels based on active visibility
					: pt.channels,
			}));
		if (newPoints.length) {
			recordingRef.current.push(...newPoints);
		}
	}, [data, isRecording, visibleLine]);

	const handleDownloadRecorded = () => {
		downloadRecordedData(recordedData, setRecordDownloaded);
	};

	return {
		isRecording,
		recordedData,
		recordDownloaded,
		handleStartRecord,
		handleStopRecord,
		handleDownloadRecorded,
		setRecordDownloaded,
	};
}

// Legend rendering and toggling to switch visibility of channels on and off
export function useLegend(channelCount: number) {
	const [visibleLines, setVisibleLines] = useState(Array(channelCount).fill(true)); // Initialize all channels as visible
	const handleLegendClick = (idx: number) => {
		setVisibleLines((prev) => prev.map((v, i) => (i === idx ? !v : v)));
	};
	const renderLegend = (colors = CHANNEL_COLORS) => (
		<div
			style={{
				display: 'flex',
				gap: 12,
				flexWrap: 'wrap',
				flexDirection: 'row',
				justifyContent: 'center',
			}}
		>
			{Array.from({length: channelCount}, (_, i) => (
				<span
					key={i}
					onClick={() => handleLegendClick(i)}
					style={{
						cursor: 'pointer',
						color: visibleLines[i] ? colors[i] : 'rgba(0, 0, 0, 0.5)',
						textDecoration: visibleLines[i] ? 'none' : 'line-through',
						fontWeight: 'bold',
						textShadow: visibleLines[i] ? '0 0 2px rgba(0, 0, 0, 7)' : 'none',
						fontSize: '1rem',
					}}
				>
					{`ch${i + 1}`}
				</span>
			))}
		</div>
	);
	return {visibleLines, renderLegend, handleLegendClick, setVisibleLines};
}

export function DownloadButtons({
	isRecording,
	handleStartRecord,
	handleStopRecord,
	handleDownloadRecorded,
	recordedData,
	recordDownloaded,
}: DownloadButtonsProps) {
	const downloadButtonDisabled = isRecording || !(recordedData.length > 0) || recordDownloaded;
	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10}}>
			{!isRecording && <button onClick={handleStartRecord}>Start Record</button>}
			{isRecording && <button onClick={handleStopRecord}>Stop Record</button>}
			<button
				style={{
					backgroundColor: !downloadButtonDisabled
						? 'rgba(255, 255, 255, 0.8)'
						: 'rgba(255, 255, 255, 0.2)',
					color: !downloadButtonDisabled ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',

					padding: '10px 20px',
					border: 'none',
					borderRadius: '4px',
					cursor: downloadButtonDisabled ? 'auto' : 'pointer',
				}}
				disabled={downloadButtonDisabled}
				onClick={handleDownloadRecorded}
			>
				Download Recorded Data (CSV)
			</button>
		</div>
	);
}
