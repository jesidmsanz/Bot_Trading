import axios from "axios";

const apiUrl = process.env.API_URL || "http://localhost:3000/";
const fetchApi = axios.create({
  baseURL: `${apiUrl || "/"}api/`,
});

export function getAxiosError({ response }) {
  return response?.data?.error || "Has ocurred an error.";
}

export default fetchApi;
