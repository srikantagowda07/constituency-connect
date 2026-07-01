import { getFirestore, type Firestore } from "firebase/firestore";
import app from "./config";

const db: Firestore = getFirestore(app);

export default db;
