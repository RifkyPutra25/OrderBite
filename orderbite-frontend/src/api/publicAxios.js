import axios from "axios";

const publicApi = axios.create({
  baseURL: "http://orderbite-backend.test/api/public",
  headers: { "Accept": "application/json" },
});

export default publicApi;