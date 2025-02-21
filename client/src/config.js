const config = {
  apiUrl:
    window.location.hostname !== "localhost"
      ? window.location.origin + "/api"
      : "http://localhost:5000/api",
};

export default config;
