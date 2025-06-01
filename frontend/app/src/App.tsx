import AverageChart from './components/AverageChart';
import Background from './components/Background';
import MainChart from './components/MainChart';
import './style.scss';

export default function App() {
	return (
		<div
			style={{
				position: 'relative',
				width: '100vw',
				height: '100%',
				display: 'flex',
				margin: 0,
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
			}}
		>
			<Background />
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignSelf: 'center',
					color: 'rbga(255, 255, 255, 0.8)',
					zIndex: 999,
					maxWidth: '1200px',
					width: '100%',
					margin: '0 auto',
					padding: '2rem',
				}}
			>
				<div
					style={{
						textAlign: 'center',
						fontSize: '1.5rem',
						textShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
						color: 'rgba(255, 255, 255, 0.9)',
					}}
				>
					<h1>EEG Data Stream</h1>
					<p>Use the controls to adjust settings and view real-time EEG data.</p>
				</div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'flex-end',
						width: '100%',
						gap: 20,
						justifyContent: 'center',
					}}
				>
					<div
						style={{
							width: '50%',
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<MainChart />
					</div>
					<div
						style={{
							width: '50%',
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<AverageChart />
					</div>
				</div>
			</div>
		</div>
	);
}
