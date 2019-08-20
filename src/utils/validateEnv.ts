// import {
//   cleanEnv, str, port
// } from 'envalid';
const envalid = require('envalid')
const { str, cleanEnv, port } = envalid;

export default function validateEnv() {
  cleanEnv(process.env, {
    MONGODB_URL: str(),
    PORT: port()
  })
}