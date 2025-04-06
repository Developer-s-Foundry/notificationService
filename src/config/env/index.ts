import { configDotenv } from "dotenv";
import development from "./dev";

configDotenv()
 export default {
    development:{...development},

 }[process.env.NODE_ENV || 'development']