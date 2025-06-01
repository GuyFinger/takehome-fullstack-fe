export interface DownloadButtonsProps {
	isRecording: boolean;
	handleStartRecord: () => void;
	handleStopRecord: () => void;
	handleDownloadRecorded: () => void;
	recordedData: any[];
	recordDownloaded: boolean;
}

export interface EEGDataPoint {
	timestamp: number;
	[key: string]: any;
}
