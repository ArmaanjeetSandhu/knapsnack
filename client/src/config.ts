interface AppConfig {
  apiUrl: string;
}

const config: AppConfig = {
  apiUrl:
    globalThis.location.hostname !== "localhost"
      ? `${globalThis.location.origin}/api`
      : "http://localhost:5000/api",
};

export default config;
