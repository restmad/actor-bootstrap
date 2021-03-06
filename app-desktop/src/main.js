//change to your own web app url
const appUrl = 'https://app.actor.im/'

const app = require('app');  // Module to control application life.
const BrowserWindow = require('browser-window');  // Module to create native browser window.
const Menu = require('menu');
const Dialog = require('dialog');
const MenuItem = require('menu-item');
const ipc = require('ipc');
const updater = require('auto-updater');

// Report crashes to our server.
// require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Disabling battery optimizations while in background
app.commandLine.appendSwitch("disable-renderer-backgrounding");

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  //if (process.platform != 'darwin')
  app.quit();
});

function showWindow() {
  if (mainWindow != null) {
    return;
  }
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 750,
    'min-width': 800,
    'min-height': 500,
    preload: 'file://' + __dirname + '/preload.js'
  });

  // and load app
  mainWindow.loadUrl(appUrl);

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.webContents.session.on('will-download', function(e, item) {

    // By default electron doesn't
    var dialog = require('dialog');
    var savePath = dialog.showSaveDialog(mainWindow, { defaultPath: item.getFilename() });
    if (savePath != undefined) {
      item.setSavePath(savePath)
    } else {
      item.cancel()
      return
    }

    console.log(item.getMimeType());
    console.log(item.getFilename());
    console.log(item.getTotalBytes());
    item.on('updated', function() {
      console.log('Received bytes: ' + item.getReceivedBytes());
    });
    item.on('done', function(e, state) {
      if (state == "completed") {
        console.log("Download successfully");
      } else {
        console.log("Download is cancelled or interrupted that can't be resumed");
      }
    })
  })
}

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the Application's main menu
  var template = [{
    label: 'Electron',
    submenu: [
      {
        label: 'About Actor',
        selector: 'orderFrontStandardAboutPanel:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide Actor',
        accelerator: 'Command+H',
        selector: 'hide:'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:'
      },
      {
        label: 'Show All',
        selector: 'unhideAllApplications:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { app.quit(); }
      },
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'Command+Z',
        selector: 'undo:'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'Command+X',
        selector: 'cut:'
      },
      {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:'
      },
      {
        label: 'Paste',
        accelerator: 'Command+V',
        selector: 'paste:'
      },
      {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:'
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload Actor',
        accelerator: 'Command+R',
        click: function() { BrowserWindow.getFocusedWindow().reloadIgnoringCache(); }
      },
      {
        label: 'Toggle DevTools',
        accelerator: 'Alt+Command+I',
        click: function() { BrowserWindow.getFocusedWindow().toggleDevTools(); }
      },
    ]
  },
  {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:'
      },
      {
        label: 'Close',
        accelerator: 'Command+W',
        selector: 'performClose:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        selector: 'arrangeInFront:'
      },
    ]
  },
  {
    label: 'Help',
    submenu: []
  }];

  if (process.platform == 'darwin') {
    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  showWindow();
});

app.on('activate-with-no-open-windows', showWindow);

// Adding tray

ipc.on('new-messages-show', function(event, arg) {
  if (process.platform == 'darwin') {
    app.dock.bounce();
    app.dock.setBadge('.');
   }
});

ipc.on('tray-badge', function(event, arg) {
  if (process.platform == 'darwin') {
    app.dock.bounce();
    app.dock.setBadge(arg.count.toString());
  }
});

ipc.on('new-messages-hide', function(event, arg) {
  if (process.platform == 'darwin') {
    app.dock.setBadge('');
  }
});

ipc.on('tray-bounce', function(event, arg) {
  if (process.platform == 'darwin') {
    app.dock.bounce();
  }
});

// configure updates for mac os and remove && false
if (process.platform == 'darwin' && false) {
  updater.setFeedURL('https://update.actor.im/?url=https%3A%2F%2Fstorage.googleapis.com%2Factor-squirrel%2Fmac-app.json&version=' + app.getVersion());
  updater.checkForUpdates();
  updater
    .on('checking-for-update', function() {
      console.log('Checking for update');
    })
    .on('update-available', function() {
      console.log('Update available');
    })
    .on('update-not-available', function() {
      console.log('Update not available');
    })
    .on('update-downloaded', function() {
      console.log('Update downloaded');
    });
}