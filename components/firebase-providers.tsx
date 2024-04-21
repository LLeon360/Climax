"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  AnalyticsProvider,
  AuthProvider,
  FirebaseAppProvider,
  FirestoreProvider,
  StorageProvider,
  useFirebaseApp,
} from "reactfire";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { isBrowser } from "@/lib/utils";
import { getAnalytics } from "firebase/analytics";
import { FirebaseOptions } from "firebase/app";
import { getStorage } from "firebase/storage";

const config: FirebaseOptions = {
  apiKey: "AIzaSyBI4v7A9WLdYPLlnmgktZswCmKBXA_9yyg",
  authDomain: "lahacks-781bf.firebaseapp.com",
  projectId: "lahacks-781bf",
  storageBucket: "lahacks-781bf.appspot.com",
  messagingSenderId: "767680852844",
  appId: "1:767680852844:web:d29a6e37cda4a08c4c3949",
  measurementId: "G-CTHB74PKF5"
};

const FirebaseProviderSDKs: FC<{ children: ReactNode }> = ({ children }) => {
  const firebase = useFirebaseApp();
  // we have to use getters to pass to providers, children should use hooks
  const auth = useMemo(() => getAuth(), []);
  const firestore = useMemo(() => getFirestore(firebase), []);
  const analytics = useMemo(() => isBrowser() && getAnalytics(firebase), []);
  const storage = useMemo(() => getStorage(firebase), []);

  return (
    <>
      {auth && (
        <AuthProvider sdk={auth}>
          <FirestoreProvider sdk={firestore}>
            <StorageProvider sdk={storage}>
            {/* we can only use analytics in the browser */}
            {analytics ? (
              <AnalyticsProvider sdk={analytics}>{children}</AnalyticsProvider>
            ) : (
              <>{children}</>
            )}
            </StorageProvider>
          </FirestoreProvider>
        </AuthProvider>
      )}
    </>
  );
};

export const MyFirebaseProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <FirebaseAppProvider firebaseConfig={config}>
        <FirebaseProviderSDKs>{children}</FirebaseProviderSDKs>
      </FirebaseAppProvider>
    </>
  );
};
