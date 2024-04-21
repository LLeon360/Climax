"use client";

import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, DocumentData, Firestore, updateDoc } from 'firebase/firestore';
import { useFirestore } from 'reactfire';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions, Point, Chart, LinearScale, PointElement,LineElement} from 'chart.js';
Chart.register(LinearScale,PointElement,LineElement);

interface HeartRates {
  heartRates: string[];
}

const HeartRate: React.FC = () => {
  const [highestAvgRate, setHighestAvgRate] = useState<number | null>(null);

  const [highestAvgRateIndex, setHighestAvgRateIndex] = useState<number | null>(null);
  const [heartbeatData, setheartbeatData] = useState<ChartData<"line", (number | null)[], unknown>>({
    labels: [],
    datasets: []
  });

  const firestore: Firestore = useFirestore();
  const options: ChartOptions<'line'>  = {
    scales: {
      x: {
        type: 'linear',
      },
      y: {
        type: 'linear', 
      },
    },
  };

  useEffect(() => {
    const fetchHighestAverageHeartRateIndex = async () => {
      let heartRatesAtEachTimestamp = Array(10).fill(null).map(() => []);
      const roomRef = doc(firestore, 'rooms', 'z6uQW3x9N3zfKMBpUGNi');
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists() && roomSnap.data().users) {
        let users_room = roomSnap.data().users
        let i = 0
        for (const user of users_room) {
          console.log(users_room.length)
          const userRef = doc(firestore, 'accounts', user);
          const userSnap = await getDoc(userRef);
          if(userSnap.exists()){
            const heartRatesRef = doc(userRef, 'heartRates', 'z6uQW3x9N3zfKMBpUGNi');
            const heartRatesSnap = await getDoc(heartRatesRef);
            if (heartRatesSnap.exists() && heartRatesSnap.data().heartRates) {
              console.log("pre-data",heartRatesSnap.data().heartRates)
              heartRatesSnap.data().heartRates.map((heartRate, index) => {
                heartRatesAtEachTimestamp[index].push(heartRate)
              });
              console.log("post-data",heartRatesAtEachTimestamp)
            }
          }
          i += 1
        }
      }
      const rotatedArray = Array.from(
        { length: heartRatesAtEachTimestamp[0].length },
        (_, i) => heartRatesAtEachTimestamp.map(row => row[i])
      );
      setheartbeatData({
        labels: Array.from({length: rotatedArray[0].length}, (_, i) => i + 1),
        datasets: rotatedArray.map((heartRates, i) => ({
          label: `User ${i + 1}`,
          data: heartRates,
          fill: false,
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgba(255, 99, 132, 0.2)',
        })),
      });
      const averages = heartRatesAtEachTimestamp.map(row => {
        const sum = row.reduce((a, b) => a + b, 0);
        const avg = sum / row.length;
        return avg;
      });
      console.log("data",heartRatesAtEachTimestamp)
      
      const highestAvgRateIndex = averages.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
      console.log("max",highestAvgRateIndex)
      const highestAvgRate = averages[highestAvgRateIndex]
      await updateDoc(roomRef, {highestAvgRate});
      await updateDoc(roomRef, {highestAvgRateIndex});
      setHighestAvgRate(averages[highestAvgRateIndex])
      setHighestAvgRateIndex(highestAvgRateIndex);
    };

    fetchHighestAverageHeartRateIndex();
  }, [firestore]);

  return (
    <div>
      {highestAvgRate !== null && highestAvgRateIndex !== null ? (
        <p>
          The highest average heart rate is {highestAvgRate.toFixed(2)} at
          second {highestAvgRateIndex}.
        </p>
      ) : (
        <p>Loading heart rate data...</p>
      )}
      {highestAvgRate !== null && highestAvgRateIndex !== null ? (
        <Line data={heartbeatData} options={options} />
      ):(
        <p>Loading heart rate data...</p>
      )}
      
    </div>
  );
};


export default Page;


