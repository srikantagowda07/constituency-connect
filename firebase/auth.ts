import { getAuth, type Auth } from "firebase/auth";
import app from "./config";

const auth: Auth = getAuth(app);

export default auth;
