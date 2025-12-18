export const theme = {
  bg: {
    primary: "#0a0e14",
    panel: "#0d1117",
    selected: "#2a3a50",
  },
  fg: {
    primary: "#c5c8c6",
    secondary: "#6e7681",
    accent: "#00ff9f",
    muted: "#3d444c",
  },
  packet: {
    message: "#00ff9f",
    position: "#00bfff",
    telemetry: "#ff9f00",
    nodeinfo: "#bf00ff",
    routing: "#666666",
    traceroute: "#ffff00",
    encrypted: "#ff0040",
    unknown: "#404040",
    direct: "#00ff00",
    config: "#8080ff",
  },
  // Cypherpunk palette for data differentiation
  data: {
    time: "#666688",        // Subdued blue-gray for timestamps
    arrow: "#ff00ff",       // Magenta for direction arrows
    nodeFrom: "#00ffff",    // Cyan for source node
    nodeTo: "#ff66ff",      // Pink for destination
    channel: "#ffff00",     // Yellow for channel
    snr: "#00ff88",         // Green for good SNR
    snrBad: "#ff6600",      // Orange for poor SNR
    coords: "#00ddff",      // Light blue for coordinates
    altitude: "#88ff88",    // Light green for altitude
    battery: "#00ff00",     // Green for battery
    batteryLow: "#ff4400",  // Red-orange for low battery
    voltage: "#ffcc00",     // Gold for voltage
    percent: "#ff88ff",     // Pink for percentages
    hardware: "#8888ff",    // Lavender for hardware model
    hops: "#ff8800",        // Orange for hop count
    quote: "#00ffaa",       // Mint for quoted text
  },
  border: {
    normal: "#2d333b",
    focused: "#00ff9f",
  },
  status: {
    online: "#00ff9f",
    offline: "#ff0040",
  },
};
