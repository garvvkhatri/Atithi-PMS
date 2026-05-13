const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("atithi", {
  apiBaseUrl: "http://localhost:4100"
});
