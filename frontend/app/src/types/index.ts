export type EEGDataPoint = {
    timestamp: number; // ms since epoch
    channels: number[]; // length 10, values 0-20
}
