"use strict";

const electron = require("electron");
const path = require("path");
const {
  app,
  BrowserWindow,
  Menu,
  Notification,
  dialog,
} = electron;
const screenshot = require("screenshot-desktop");
const ActiveWin = require('active-win');
const gkm = require('gkm');


var mainWindow = null;
var keyBoardactivity = false;

var notification = null;
var interval = null;

const windowMenu = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
        click() {
          addWindow("addItem");
        }
      },
      { label: "Clear Item" },
      { role: "quit" }
    ]
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forcereload" },
      { type: "separator" },
      { role: "resetzoom" },
      { role: "zoomin" },
      { role: "zoomout" },
      { type: "separator" },
      { role: "togglefullscreen" }
    ]
  }
];

function addWindow(filename) {
  show("added window");
  mainWindow = new BrowserWindow({
    backgroundColor: "#e2dcdc",
    width: 300,
    height: 200,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL("file://" + __dirname + "/" + filename + ".html");

  mainWindow.on("closed", function() {
    mainWindow = null;
  });
}

app.on("ready", function() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "/time.png"),
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL("file://" + __dirname + "/index.html");

  mainWindow.on("closed", function() {
    mainWindow = null;
  });

  const mainMenu = Menu.buildFromTemplate(windowMenu);
  Menu.setApplicationMenu(mainMenu);
  show("App started");

});

function show(msg) {
  notification = new Notification({
    title: "jnji",
    body: msg,
    icon: path.join(__dirname, "/time.png")
  });

  notification.show();
  notification.onclick = () => {
    console.log("clicked");
  };
}

app.on("browser-window-blur", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    addWindow();
  }
});

if (process.env.NODE_ENV !== "production") {
  windowMenu.push({
    label: "Dev Tools",
    submenu: [
      {
        label: "Toggle Dev tool",
        accelerator: process.platform == "darwin" ? "Command+i" : "Ctrl+i",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: "reload"
      }
    ]
  });
}

function counts() {
  var data = document.getElementById("timer").value;
  data++;
  document.getElementById("timer").value = data;
  if (data % 10 == 0) takescreenShot();
  if (data % 5 == 0) {
    (async () => {
      console.log(await ActiveWin());
      
       })();
}
}

function timestart() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  document.getElementById("timer").value = 0;
  interval = setInterval(counts, 1000);
}

function timestop() {
  clearInterval(interval);
  interval = null;
}

function call(data) {
  screenshot.listDisplays().then(displays => {
    // displays: [{ id, name }, { id, name }]
    const imgpath = path.join(__dirname, "softsuave" + Date.now() + ".png");
    screenshot({
      screen: displays[displays.length - 1].id,
      filename: imgpath
    }).then(img => {
      document.getElementById("screen-view").setAttribute("src", img);
    });
  });
}

function takescreenShot() {
  screenshot()
    .then(() => {
      call();
    })
    .catch(err => {
      console.log(err);
    });
}
 
// Listen to all key events (pressed, released, typed)
gkm.events.on('key.*', function(data) {
    console.log(this.event + ' ' + data);
});
 
// Listen to all mouse events (click, pressed, released, moved, dragged)
gkm.events.on('mouse.*', function(data) {
    console.log(this.event + ' ' + data);
});



