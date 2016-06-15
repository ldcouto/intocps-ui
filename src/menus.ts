


const fs = require('fs');
const path = require('path');
var settings = require("./settings/settings").default;
var SettingKeys = require("./settings/SettingKeys");
var IntoCpsApp = require("./IntoCpsApp").default;
import * as SystemUtil from "./SystemUtil";

var DialogHandler = require("./DialogHandler").default;
var IntoCpsAppEvents = require("./IntoCpsAppEvents");
var ProjectFetcher = require("./proj/ProjectFetcher");

const intoCpsApp = IntoCpsApp.getInstance();


let createProjectHandler = new DialogHandler("proj/new-project.html", 300, 200, IntoCpsAppEvents.OPEN_CREATE_PROJECT_WINDOW, "new-project-create", (arg: any) => {
  intoCpsApp.createProject(arg.name, arg.path);
});

let openProjectHandler = new DialogHandler("proj/open-project.html", 300, 200, IntoCpsAppEvents.OPEN_OPEN_PROJECT_WINDOW, "open-project-open", (arg: any) => {
  intoCpsApp.setActiveProject(intoCpsApp.loadProject(arg.path));
});

let openDownloadManagerHandler = new DialogHandler("downloadManager/DownloadManager.html", 500, 500, null, null, null);
let coeServerStatusHandler = new DialogHandler("coe-server-status/CoeServerStatus.html", 500, 500, null, null, null);
let fmuBuilderHandler = new DialogHandler("http://sweng.au.dk/fmubuilder/", 500, 500, null, null, null);
fmuBuilderHandler.externalUrl = true;
let reportIssueHandler = new DialogHandler("http://github.com/into-cps/INTO-CPS_Application/issues/new", 600, 600, null, null, null);
reportIssueHandler.externalUrl = true;


let fetchProjectFromGitHandler = new DialogHandler("proj/ProjectFetcher.html", 500, 300, null, null, null);
let openExamplesFromGitHandler = new DialogHandler("examples/examples.html", 500, 400, null, null, null);
let openSettingsHandler = new DialogHandler("settings/settings.html", 500, 600, null, null, null);

createProjectHandler.install();
openProjectHandler.install();
openDownloadManagerHandler.install();





export function configureIntoCpsMenu() {
  const {remote} = require('electron');
  const {Menu, MenuItem} = remote;

  // Definitions needed for menu construction
  var defaultMenu = require('electron-default-menu')
  // Get template for default menu 
  var menu: any[] = defaultMenu();


  //let mw = mainWindow;


  var fileMenuPos = 0;

  if (process.platform === 'darwin') {
    fileMenuPos = 1;

    menu[0].submenu.splice(1, 0, {
      type: 'separator'

    });

    menu[0].submenu.splice(2, 0, {
      label: 'Preferences...',
      accelerator: 'Cmd+,',
      click: function (item: any, focusedWindow: any) {
        openSettingsHandler.openWindow();
      }
    });

    menu[0].submenu.splice(3, 0, {
      type: 'separator'

    });
  }

  // Add custom menu 
  menu.splice(fileMenuPos, 0, {
    label: 'File',
    submenu: [

      {
        label: 'New Project',
        accelerator: 'CmdOrCtrl+N',
        click: function (item: any, focusedWindow: any) {
          createProjectHandler.openWindow();
        }

      },
      {
        type: 'separator'
      },
      {
        label: 'Show Project Folder',
        click: function (item: any, focusedWindow: any) {
          let activeProject = IntoCpsApp.getInstance().getActiveProject();
          if (activeProject != null)
            SystemUtil.openPath(activeProject.rootPath);
        }

      },
      {
        type: 'separator'
      },
      {
        label: 'Open Project',
        accelerator: 'CmdOrCtrl+O',
        click: function (item: any, focusedWindow: any) {
          openProjectHandler.openWindow();
        }

      },
      {
        label: 'Open Project from Git',

        click: function (item: any, focusedWindow: any) {
          fetchProjectFromGitHandler.openWindow();
        }

      },
      {
        label: 'Open Project Examples',

        click: function (item: any, focusedWindow: any) {
          openExamplesFromGitHandler.openWindow();
        }

      }
    ]
  })

  menu.forEach(m => {
    if (m.label == "View") {

      if (!(process.platform === 'darwin')) {
        m.submenu.splice(0, 0, {
          label: 'Settings',
          accelerator: 'Alt+S',
          click: function (item: any, focusedWindow: any) {
            openSettingsHandler.openWindow();
          }
        });

      }


      m.submenu.splice(m.submenu.length - 1, 0, {
        type: 'separator'

      });

      m.submenu.splice(m.submenu.length - 1, 0, {
        label: 'COE Server Status',
        accelerator: 'Alt+O',
        click: function (item: any, focusedWindow: any) {
          coeServerStatusHandler.openWindow();
        }
      });


      m.submenu.splice(m.submenu.length - 1, 0, {
        label: 'Open Download Manager',
        accelerator: 'Alt+D',
        click: function (item: any, focusedWindow: any) {
          openDownloadManagerHandler.openWindow();
        }
      });

      m.submenu.splice(m.submenu.length - 1, 0, {
        label: 'Open FMU Builder',
        click: function (item: any, focusedWindow: any) {
          fmuBuilderHandler.openWindow();
        }
      });
      m.submenu.splice(m.submenu.length - 1, 0, {
        type: 'separator'

      });

    } else if (m.label == "Help") {
      m.submenu.splice(m.submenu.length - 1, 0, {
        label: 'Report Issue',
        click: function (item: any, focusedWindow: any) {
          reportIssueHandler.openWindow();
        }
      });
    }

  });



  // Set top-level application menu, using modified template 
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));


}