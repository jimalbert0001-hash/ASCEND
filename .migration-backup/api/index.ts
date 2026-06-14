let appPromise: Promise<import("express").Express> | null = null;

function getApp() {
  if (!appPromise) {
    appPromise = import("../artifacts/api-server/src/app").then((m) => m.default);
  }
  return appPromise;
}

export default async function handler(
  req: import("http").IncomingMessage,
  res: import("http").ServerResponse,
) {
  const app = await getApp();
  app(req, res);
}
