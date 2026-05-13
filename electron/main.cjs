const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");
const { spawn } = require("node:child_process");

let apiProcess;

async function isApiRunning() {
  try {
    const response = await fetch("http://127.0.0.1:4100/health");
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForApi() {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (await isApiRunning()) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

async function startApi() {
  if (await isApiRunning()) return;
  const serverPath = path.join(__dirname, "..", "server", "index.cjs");
  const dbPath = app.isPackaged
    ? path.join(app.getPath("userData"), "atithi.db")
    : path.join(__dirname, "..", "prisma", "dev.db");
  const backupDir = app.isPackaged
    ? path.join(app.getPath("userData"), "backups")
    : path.join(__dirname, "..", "backups");
  apiProcess = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      PORT: process.env.PORT || "4100",
      ATITHI_DB_PATH: dbPath,
      ATITHI_BACKUP_DIR: backupDir,
      DATABASE_URL: `file:${dbPath}`
    },
    stdio: "inherit"
  });
  await waitForApi();
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    title: "Atithi PMS",
    backgroundColor: "#f8fafc",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devUrl = "http://127.0.0.1:5173";
  const prodFile = path.join(__dirname, "..", "dist", "index.html");
  if (process.env.NODE_ENV === "production" || app.isPackaged) {
    win.loadFile(prodFile);
  } else {
    win.loadURL(devUrl);
    win.webContents.openDevTools({ mode: "detach" });
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(async () => {
  await startApi();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (apiProcess) apiProcess.kill();
});
