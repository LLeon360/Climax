Made for LA Hacks 2024

# An AI twist on Watch Parties

## Inspiration 💡
Digital interactions often fall short of replicating the emotional depth of in-person experiences, especially during shared activities like watching films. This gap can leave friends and family feeling disconnected when engaging online. Our app directly addresses this by integrating live heart rate monitoring into watch parties, which is particularly compelling for high-emotion content such as horror films, tear-jerking dramas, and action-packed thrillers. Viewing each participant's heart rate adds a layer of emotional insight, enhancing the sense of connection and making the experience not only more engaging but also a lot more fun. The excitement or fear of a jump scare in a horror movie, the adrenaline during an action sequence, or the emotional swell in a drama can be shared and felt, bridging the emotional gap that often accompanies digital interactions. Additionally, the Gemini API enriches these moments with humorous commentary, adding a light-hearted touch to the shared experience, making it both a meaningful and entertaining way to stay connected with loved ones.

## What it does 💪
Our app enhances the watch party experience by allowing you and your friends to view each other’s heart rates live as you enjoy a YouTube video together. After logging in through a secure authentication system, users connect their Apple Watches to track heart rate data. One friend can create a room and share a room code, allowing others to join. The party can then control the video playback together while also being on voice call through the web app. Once the video concludes, the app presents a heart rate graph and replays the most thrilling moments (based on peak avg heart rate), complemented by candid photos and Google's LLM Gemini's witty video commentary.

## How we built it 🛠️
We developed the frontend using Next.js, while the backend is powered by Flask and Python, with Firebase handling data storage and user authentication. Real-time data and video feeds are managed through socket.io. Swift iOS app is used to pair with Apple Watches and post live heartrate data to the backend database when a user joins a room.

## Demo Recording 
https://www.loom.com/share/5d3bbf6f52a04a4f9d349780f2b38370

## Devpost
https://devpost.com/software/climax-dfc5qt 

