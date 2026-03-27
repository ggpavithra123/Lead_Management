import axios from "axios";

export const api = axios.create({
  baseURL: "https://lead-management-ch6p.onrender.com/api",
});

