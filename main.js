"use strict";

const electron = require("electron");
const path = require("path");
const { app, BrowserWindow, Menu,Tray,Notification, remote, desktopCapturer } = electron;
const screenshot = require("screenshot-desktop");
const ActiveWin = require("active-win");
const gkm = require("gkm");
const ioHook = require("iohook");

var mainWindow = null;
var keyBoardactivity = false;
var count = 0;
var activeData = null;
var trayIcon = null

var interval = null;
var iconPath = path.join(__dirname, "/time.png")

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
    title: "Time Tracker",
    width: 800,
    height: 600,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true
    }
  });
  console.log(app.getName())
  app.setName("Blossom")
  app.allowRendererProcessReuse = true

  mainWindow.loadURL("file://" + __dirname + "/showTime.html");

  trayIcon = new Tray( iconPath)

  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: function() {
        mainWindow.show()
      }
    },
    {
      label: 'Quit',
      click: function() {
        app.isQuiting = true
        app.quit()
      }
    }
  ])

  trayIcon.setToolTip('This is my application.')

  trayIcon.setContextMenu(contextMenu)

  mainWindow.on("closed", function(event = {}) {
    ioHook.stop()
    mainMenu = null
    return false
  });

  const mainMenu = Menu.buildFromTemplate(windowMenu);
  Menu.setApplicationMenu(mainMenu);
  show("App started");
  ioHook.on('mouseclick', event => {
   console.log(event); // { type: 'mousemove', x: 700, y: 400 }
  });
  ioHook.on('keydown', event => {
   console.log(event); // { type: 'mousemove', x: 700, y: 400 }
  });
  ioHook.on('mousewheel', event => {
   console.log(event); // { type: 'mousemove', x: 700, y: 400 }
  });
  ioHook.on('mousemove', event => {
   console.log(event); // { type: 'mousemove', x: 700, y: 400 }
  });
});

function show(msg) {
  let notification = new Notification('Title', {
    body: 'Lorem Ipsum Dolor Sit Amet',
    icon: iconPath
  })

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
  count++;
  document.getElementById("timer").value = count;
  if (count % 10 == 0) takescreenShot();
  if (count % 5 == 0) {
    (async () => {
     console.log(await ActiveWin());
    })();
  }
  if (count % 60 == 0) {
    if (keyBoardactivity) {
      keyBoardactivity = false;
    } else {
      show("no activities in last min.")
      document.getElementById("lastactivity").value=activeData.owner.name;
    }
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

function handleLogin() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  if (username == "admin" && password == "12345") {
    remote.getCurrentWindow().loadURL("file://" + __dirname + "/showTime.html");
  } else {
    document.getElementById("username").style.color = "red";
    document.getElementById("password").style.color = "red";
  }
}

function takescreenShot() {
 /*  remote.getCurrentWindow().capturePage().then((img) => {
    document.getElementById("screen-view").setAttribute("src", img);
  }); */
  screenshota()
 /*  screenshot()
    .then(() => {
      call();
    })
    .catch(err => {
      console.log(err);
    }); */
}

// // Listen to all key events (pressed, released, typed)
// gkm.events.on("key.*", function(data) {
//   console.log("key",data)
// });

// // Listen to all mouse events (click, pressed, released, moved, dragged)
// gkm.events.on("mousewheel.*", function(data) {
//   console.log("mousewheel",data)
// });

// gkm.events.onAny(function(data) {
// 	console.log(this.event + ' ' + data);
// });


function screenshota() {
  desktopCapturer.getSources({
    types: ['window','screen'],
    thumbnailSize: {width: 1200, height: 1200},
    fetchWindowIcons : true
  }).then((sources) => {
    
    document.getElementById("screen-view").setAttribute("src", sources[0].thumbnail.toDataURL());
    convertURIToImageData(sources[0].thumbnail.toDataURL()).then((imageData) => {
      // Here you can use imageData
      console.log(imageData);
  });
});
}

function convertURIToImageData(URI) {
  return new Promise(function(resolve, reject) {
    if (URI == null) return reject();
    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        image = new Image();
    image.addEventListener('load', function() {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(context.getImageData(0, 0, canvas.width, canvas.height));
    }, false);
    image.src = URI;
  });
}
