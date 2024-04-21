"use client";
import React, { useEffect, useRef, useState } from 'react';
import { doc, getDoc, collection, getDocs, DocumentData, Firestore, updateDoc } from 'firebase/firestore';
import { useFirestore } from 'reactfire';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions, Point, Chart, LinearScale, PointElement,LineElement} from 'chart.js';
import ReactPlayer from "react-player";
Chart.register(LinearScale,PointElement,LineElement);
interface HeartRates {
  heartRates: string[];
}
function HeartRate({ params }: { params: { roomcode: string } }) {
    const [heartbeatData, setheartbeatData] = useState<ChartData<"line", (number | null)[], unknown>>({
        labels: [],
        datasets: []
      });
      const firestore: Firestore = useFirestore();
      const roomRef = doc(firestore, "rooms", params.roomcode);
      const options: ChartOptions<'line'>  = {
        scales: {
          x: {
            type: 'linear',
          },
          y: {
            type: 'linear', 
          },
        },
        plugins: {
          legend: {
            display: true,
          }
        }
      };
      useEffect(() => {
        const fetchHighestAverageHeartRateIndex = async () => {
    
          let heartRatesAtEachTimestamp = null;
          const roomSnap = await getDoc(roomRef);
          if (roomSnap.exists() && roomSnap.data().users) {
            let users_room = roomSnap.data().users
            for (const user of users_room) {
              const userRef = doc(firestore, 'accounts', user);
              const userSnap = await getDoc(userRef);
              if(userSnap.exists()){
                const heartRatesRef = doc(userRef, 'heartRates', 'z6uQW3x9N3zfKMBpUGNi');
                const heartRatesSnap = await getDoc(heartRatesRef);
                if (heartRatesSnap.exists() && heartRatesSnap.data().heartRates) {
                  heartRatesSnap.data().heartRates.map((heartRate, index) => {
                    if (heartRatesAtEachTimestamp === null) {
                      heartRatesAtEachTimestamp = Array.from({ length: heartRatesSnap.data().heartRates.length }, () => []);
                      heartRatesAtEachTimestamp[index].push(heartRate)
                    }else{
                      heartRatesAtEachTimestamp[index].push(heartRate)
                    }
                  });
                }
              }
            }
          }
          const rotatedArray = Array.from(
            { length: heartRatesAtEachTimestamp[0].length },
            (_, i) => heartRatesAtEachTimestamp.map(row => row[i])
          );
    
          var colors = ['red', 'blue', 'green', 'purple'];
          console.log(rotatedArray);
          setheartbeatData({
            labels: Array.from({length: rotatedArray[0].length}, (_, i) => i + 1),
            datasets: rotatedArray.map((heartRates, i) => ({
              label: `User ${i + 1}`,
              data: heartRates,
              fill: false,
              backgroundColor: colors[i % colors.length],
              borderColor: colors[i % colors.length],
            })),
          });
        };
        fetchHighestAverageHeartRateIndex();
      }, [firestore]);

      return (
        <div>
          {heartbeatData !== null ? (
            <Line data={heartbeatData} options={options} />
          ):(
            <p>Loading heart rate data...</p>
          )}
          
        </div>
      );
}
export default HeartRate;
