import { app, BrowserWindow, ipcMain, screen } from "electron";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Setup paths
process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
const BACKEND_DIST = path.join(
  process.resourcesPath,
  "backend",
  "dist",
  "main"
);

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let backendProcess: ChildProcessWithoutNullStreams | null = null;

function createWindow() {
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  // Create browser window
  win = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: true,
    icon: path.join(process.env.VITE_PUBLIC, "electron.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load renderer
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.webContents.closeDevTools();
    win.removeMenu();
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  win.webContents.on("did-finish-load", () => {
    // Enable click-through for the entire window initially
    if (win) {
      win.setIgnoreMouseEvents(true, { forward: true });
    }
  });

  // Spawn backend if not in dev
  if (!VITE_DEV_SERVER_URL && !backendProcess) {
    const backendExecutable =
      process.platform === "win32" ? "main.exe" : "main";
    const backendPath = path.join(BACKEND_DIST, backendExecutable);

    backendProcess = spawn(backendPath, [], {
      cwd: path.dirname(backendPath),
      detached: false,
      stdio: "pipe", // Ensure stdio is set to "pipe" for compatibility
    }) as ChildProcessWithoutNullStreams;

    backendProcess.unref();
  }
}

function cleanup() {
  if (backendProcess) {
    try {
      console.log("Killing backend process...");
      backendProcess.kill();
    } catch (err) {
      console.error("Failed to kill backend process:", err);
    }
    backendProcess = null;
  } else {
    console.log("No backend process to clean up.");
  }
}

// Handle process termination and cleanup
process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit();
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    cleanup();
    app.quit();
    win = null;
  }
});

app.on("before-quit", cleanup);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);

// Toggle click-through behavior
ipcMain.on("set-click-through", (_event, ignore: boolean) => {
  if (win) {
    win.setIgnoreMouseEvents(ignore, { forward: true });
  }
});
