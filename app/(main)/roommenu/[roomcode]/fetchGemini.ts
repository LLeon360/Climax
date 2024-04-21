export const fetchGemini = async (video_url: string, timestamp: number) => {
	const response = await fetch(
		"http://localhost:3000/api/flask/process_video",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				video_url: video_url,
				timestamp: timestamp,
			}),
		}
	);
	const data = await response.json();

	return data;
};
