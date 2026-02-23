interface AppConfig {
  apiUrl: string;
}

const config: AppConfig = {
  apiUrl:
    window.location.hostname !== "localhost"
      ? `${window.location.origin}/api`
      : "http://localhost:5000/api",
};

export default config;
