interface AppConfig {
  apiUrl: string;
}

const config: AppConfig = {
  apiUrl:
    globalThis.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : `${globalThis.location.origin}/api`,
};

export default config;
