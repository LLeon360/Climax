import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

const db = getFirestore();

export async function createUserFirestoreDocument(uid: string, name: string | null, email: string | null, photoURL: string | null) {
    if(!email) throw new Error("Email is required to create user document");
    const userDocRef = doc(db, "accounts", uid);
    try{
        const docSnap = await getDoc(userDocRef);
        if(!docSnap.exists()){
            await setDoc(userDocRef, {
                name: name ?? "Name not found",
                email: email,
                photoURL: photoURL ?? "",
                timeCreated: new Date().toISOString()
            })
            
        }
        return userDocRef;
    } catch(e){
        console.error("Error creating user document", e);
        if (e instanceof Error) {
            throw new Error("Error creating user document", { cause: e });
        } else {
            throw new Error("Error creating user document");
        };
    }
}
   