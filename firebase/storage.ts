import { getStorage, type FirebaseStorage } from "firebase/storage";
import app from "./config";

const storage: FirebaseStorage = getStorage(app);

export default storage;
