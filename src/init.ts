import { IntoCpsAppEvents } from "./IntoCpsAppEvents";
import { IntoCpsApp } from "./IntoCpsApp";
import { CreateTDGProjectController } from "./rttester/CreateTDGProject";
import { CreateMCProjectController } from "./rttester/CreateMCProject";
import { RunTestController } from "./rttester/RunTest";
import { LTLEditorController } from "./rttester/LTLEditor";
import { CTAbstractionsView } from "./rttester/CTAbstractionsView";
import * as RTesterModalCommandWindow from "./rttester/GenericModalCommand";
import * as AddLTLQueryDialog from "./rttester/AddLTLQueryDialog";
import { BrowserController } from "./proj/projbrowserview";
import { IntoCpsAppMenuHandler } from "./IntoCpsAppMenuHandler";
import { ViewController, IViewController } from "./iViewController";
import * as CustomFs from "./custom-fs";
import { IProject } from "./proj/IProject";
import * as SystemUtil from "./SystemUtil";
import { bootstrap } from '@angular/platform-browser-dynamic';
import { AppComponent } from './angular2-app/app.component';
import * as fs from 'fs';
import * as Path from 'path';
import { DseConfiguration } from "./intocps-configurations/dse-configuration"

import {TraceMessager} from "./traceability/trace-messenger"

interface MyWindow extends Window {
    ng2app: AppComponent;
}

declare var window: MyWindow;

import * as Menus from "./menus";
import { provideForms, disableDeprecatedForms } from "@angular/forms";
import { CoeViewController } from "./angular2-app/coe/CoeViewController";
import { MmViewController } from "./angular2-app/mm/MmViewController";
import { DseViewController } from "./angular2-app/dse/DseViewController";

class InitializationController {
    // constants
    mainViewId: string = "mainView";
    layout: W2UI.W2Layout;
    title: HTMLTitleElement;
    mainView: HTMLDivElement;

    constructor() {
        $(document).ready(() => this.initialize());
    }
    private initialize() {
        this.setTitle();
        this.configureLayout();
        this.loadViews();
    }
    private configureLayout() {
        let layout: HTMLDivElement = <HTMLDivElement>document.querySelector("#layout");
        let pstyle = "border: 1px solid #dfdfdf; padding: 5px; background-color: #FFFFFF";
        this.layout = $(layout).w2layout({
            name: "layout",
            padding: 4,
            panels: [
                { type: "left", size: 200, resizable: true, style: pstyle },
                { type: "main", style: pstyle },
            ]
        });
    }
    private setTitle() {
        // Set the title to the project name
        this.title = <HTMLTitleElement>document.querySelector("title");
        let app: IntoCpsApp = IntoCpsApp.getInstance();
        let p = app.getActiveProject();
        if (p != null) {
            this.title.innerText = "Project: " + p.getName() + " - " + p.getRootFilePath();
        }
        let ipc: Electron.IpcRenderer = require("electron").ipcRenderer;
        ipc.on(IntoCpsAppEvents.PROJECT_CHANGED, (event, arg) => {
            let p = app.getActiveProject();
            this.title.innerText = "Project: " + p.getName() + " - " + p.getRootFilePath();
        });
    }

    private loadViews() {
        this.layout.load("main", "main.html", "", () => {
            this.mainView = (<HTMLDivElement>document.getElementById(this.mainViewId));
            var appVer = (<HTMLSpanElement>document.getElementById('appVersion'));
            appVer.innerText = IntoCpsApp.getInstance().app.getVersion();

            // Start Angular 2 application
            bootstrap(AppComponent, [disableDeprecatedForms(), provideForms()]);
        });
        this.layout.load("left", "proj/projbrowserview.html", "", () => {
            browserController.initialize();
        });
    }
}

// Initialise controllers
let menuHandler: IntoCpsAppMenuHandler = new IntoCpsAppMenuHandler();
let browserController: BrowserController = new BrowserController(menuHandler);
let init = new InitializationController();
let controller: IViewController;

function closeView(): boolean {
    if (controller && controller.deInitialize) {
        let canClose = controller.deInitialize();

        if (canClose)
            controller = null;

        return canClose;
    }

    return true;
}

function openView(htmlPath: string, callback?: (mainView: HTMLDivElement) => void | IViewController) {
    if (!closeView()) return;

    function onLoad() {
        if (!callback) return;

        let newController = callback(init.mainView);

        if (newController) {
            controller = <IViewController>newController;
            if (controller.initialize) {
                controller.initialize();
            }
        }
    }

    if (htmlPath) {
        $(init.mainView).load(htmlPath, () => onLoad());
    } else {
        $(init.mainView).empty();
        onLoad();
    }
}

menuHandler.openView = openView;

menuHandler.openCoeView = (path: string) => {
    openView(null, view => new CoeViewController(view, path));
};

menuHandler.openHTMLInMainView = (path: string, title: string) => {
    openView(null, (div: HTMLDivElement) => {
        IntoCpsApp.setTopName(title);
        let f: HTMLIFrameElement = document.createElement("iframe");
        f.src = path;
        f.style.width = "100%";
        f.style.height = "100%";
        div.appendChild(f);
    });
};

menuHandler.openMultiModel = (path: string) => {
    openView(null, view => new MmViewController(view, path));
};

menuHandler.openDseView = (path: string) => {
    openView(null, view => new DseViewController(view, path));
};

menuHandler.runRTTesterCommand = (commandSpec: any) => {
    RTesterModalCommandWindow.runCommand(commandSpec);
};

menuHandler.createTDGProject = (path: string) => {
    openView("rttester/CreateTDGProject.html", view => new CreateTDGProjectController(view, menuHandler, path));
};

menuHandler.createMCProject = (path: string) => {
    openView("rttester/CreateMCProject.html", view => new CreateMCProjectController(view, menuHandler, path));
};

menuHandler.runTest = (path: string) => {
    openView("rttester/RunTest.html", view => new RunTestController(view, menuHandler, path));
};

menuHandler.openLTLQuery = (folder: string) => {
    openView("rttester/LTLEditor.html", view => new LTLEditorController(view, menuHandler, folder));
};

menuHandler.openCTAbstractions = (fileName: string) => {
    openView("rttester/CTAbstractionsView.html", view => new CTAbstractionsView(view, fileName));
};

menuHandler.showAddLTLQuery = (folder: string) => {
    $("#modalDialog").load("rttester/AddLTLQueryDialog.html", (event: JQueryEventObject) => {
        AddLTLQueryDialog.display(folder);
        (<any>$("#modalDialog")).modal({ keyboard: false, backdrop: false });
    });
};

menuHandler.openSysMlExport = () => {
    openView("sysmlexport/sysmlexport.html");
    IntoCpsApp.setTopName("SysML Export");
};

menuHandler.openSysMlDSEExport = () => {
    openView("sysmlexport/sysmldseexport.html");
    IntoCpsApp.setTopName("SysML DSE Export");
};

menuHandler.openFmu = () => {
    openView("fmus/fmus.html");
    IntoCpsApp.setTopName("FMUs");
};

//menuHandler.createDse = (path) => {
//    // create empty DSE file and load it.
//    openView("dse/dse.html", () => {
//        menuHandler.openDseView("");
//    });
//};
//

menuHandler.createMultiModel = (path) => {
    let appInstance = IntoCpsApp.getInstance();
    let project = appInstance.getActiveProject();

    if (project) {
        let name = Path.basename(path, ".sysml.json");
        let content = fs.readFileSync(path, "UTF-8");
        let mmPath = <string>project.createMultiModel(`mm-${name} (${Math.floor(Math.random() * 100)})`, content);
        menuHandler.openMultiModel(mmPath);
        //Create the trace 
        let message = TraceMessager.submitSysMLToMultiModelMessage(mmPath,path);
        //console.log("RootMessage: " + JSON.stringify(message));    
    }
};


menuHandler.createSysMLDSEConfig = (path) => {
    let project = IntoCpsApp.getInstance().getActiveProject();

    if (project) {
        let name = Path.basename(path, ".sysml-dse.json");
        let content = fs.readFileSync(path, "UTF-8");
        let dsePath = <string>project.createSysMLDSEConfig(`dse-${name}-${Math.floor(Math.random() * 100)}`, content);
        menuHandler.openDseView(dsePath);
    }
};

menuHandler.createDsePlain = () => {
    let project = IntoCpsApp.getInstance().getActiveProject();
    if (project) {
        let name = "new";
        let dseConfig = new DseConfiguration()
        let dseObject = dseConfig.toObject();
        let dseJson = JSON.stringify(dseObject);
        let dsePath = <string>project.createDse("dse-" + name + " (" + Math.floor(Math.random() * 100) + ")", dseJson);
        menuHandler.openDseView(dsePath);
    }
}

menuHandler.createMultiModelPlain = () => {
    let project = IntoCpsApp.getInstance().getActiveProject();

    if (project) {
        let mmPath = <string>project.createMultiModel(`mm-new (${Math.floor(Math.random() * 100)})`, "{}");
        menuHandler.openMultiModel(mmPath);
    }
};

menuHandler.createCoSimConfiguration = (path) => {
    let project = IntoCpsApp.getInstance().getActiveProject();

    if (project) {
        let coePath = project.createCoSimConfig(path, `co-sim-${Math.floor(Math.random() * 100)}`, null).toString();
        menuHandler.openCoeView(coePath);
        let message = TraceMessager.submitCoeConfigMessage(path,coePath);
    }
};

menuHandler.deletePath = (path) => {
    let name = Path.basename(path);
    if (name.indexOf('R_') >= 0) {
        console.info("Deleting " + path);
        CustomFs.getCustomFs().removeRecursive(path, function (err: any, v: any) {
            if (err != null) {
                console.error(err);
            }
            IntoCpsApp.getInstance().emit(IntoCpsAppEvents.PROJECT_CHANGED);
        });

    } else if (name.endsWith("coe.json") || name.endsWith("mm.json") || name.endsWith(".dse.json")) {
        let dir = Path.dirname(path);
        console.info("Deleting " + dir);
        CustomFs.getCustomFs().removeRecursive(dir, function (err: any, v: any) {
            if (err != null) {
                console.error(err);
            }
            IntoCpsApp.getInstance().emit(IntoCpsAppEvents.PROJECT_CHANGED);
        });
    }
};

menuHandler.openWithSystemEditor = (path) => {
    SystemUtil.openPath(path);
};

menuHandler.rename = (path: string) => {
    var DialogHandler = require("./DialogHandler").default;
    let renameHandler = new DialogHandler("proj/rename.html", 300, 200, null, null, null);

    if (path.endsWith("coe.json") || path.endsWith("mm.json")) {
        renameHandler.openWindow(Path.dirname(path));
    }
};
menuHandler.showTraceView = () => {
    var DialogHandler = require("./DialogHandler").default;
    let renameHandler = new DialogHandler("traceability/traceHints.html", 600, 800, null, null, null);

    renameHandler.openWindow();
    menuHandler.openHTMLInMainView("http://localhost:7474/browser/","Traceability Graph View");
};


Menus.configureIntoCpsMenu();
