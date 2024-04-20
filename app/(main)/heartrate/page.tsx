"use client";
import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, DocumentData, Firestore } from 'firebase/firestore';
import { useFirestore } from 'reactfire';

interface HeartRates {
  heartRates: string[];
}

const Page: React.FC = () => {
  const [highestAvgRate, setHighestAvgRate] = useState<number | null>(null);
  const [highestAvgRateIndex, setHighestAvgRateIndex] = useState<number | null>(null);

  const firestore: Firestore = useFirestore();

  useEffect(() => {
    const fetchHighestAverageHeartRateIndex = async () => {
      const roomRef = doc(firestore, 'rooms', 'ENbvV9FYG8StR88y4baP');
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists() && roomSnap.data().users) {
        const userIds: string[] = roomSnap.data().users;
        const heartRatesAtEachTimestamp: number[][] = [];

        for (const userId of userIds) {
          const heartRatesRef = collection(firestore, 'accounts', userId, 'heartRates');
          const heartRatesSnap = await getDocs(heartRatesRef);
          heartRatesSnap.forEach((doc: DocumentData) => {
            const rates: number[] = doc.data().heartRates.map((rate: string) => parseInt(rate));
            rates.forEach((rate, index) => {
              if (!heartRatesAtEachTimestamp[index]) {
                heartRatesAtEachTimestamp[index] = [];
              }
              heartRatesAtEachTimestamp[index].push(rate);
            });
          });
        }

        let highestAvg = 0;
        let highestAvgIndex = -1;
        heartRatesAtEachTimestamp.forEach((rates, index) => {
          const sum = rates.reduce((acc, rate) => acc + rate, 0);
          const avg = sum / rates.length;
          if (avg > highestAvg) {
            highestAvg = avg;
            highestAvgIndex = index;
          }
        });

        setHighestAvgRate(highestAvg);
        setHighestAvgRateIndex(highestAvgIndex);
      }
    };

    fetchHighestAverageHeartRateIndex();
  }, [firestore]);

  return (
    <div>
      {highestAvgRate !== null && highestAvgRateIndex !== null ? (
        <p>The highest average heart rate is {highestAvgRate.toFixed(2)} at second {highestAvgRateIndex}.</p>
      ) : (
        <p>Loading heart rate data...</p>
      )}
    </div>
  );
};

export default Page;
