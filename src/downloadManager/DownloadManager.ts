///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import { IntoCpsApp } from "../IntoCpsApp"
import { SettingKeys } from "../settings/SettingKeys";
import { DialogHandler } from "../DialogHandler";

import Path = require('path');
import fs = require('fs');

import downloader = require("../downloader/Downloader");

function scrollIntoView(eleID: any) {
    var e = document.getElementById(eleID);
    if (!!e && e.scrollIntoView) {
        e.scrollIntoView();
    }
}

function createPanel(title: string, content: HTMLElement): HTMLElement {
    var divPanel = document.createElement("div");
    divPanel.className = "panel panel-default";

    var divTitle = document.createElement("div");
    divTitle.className = "panel-heading";
    divTitle.innerText = title;

    var divBody = document.createElement("div");
    divBody.className = "panel-body";
    divBody.appendChild(content);

    divPanel.appendChild(divTitle);
    divPanel.appendChild(divBody);
    return divPanel;
}

function getTempDir(): string {
    let tempDir = IntoCpsApp.getInstance().getSettings().getValue(SettingKeys.INSTALL_TMP_DIR);
    if (tempDir == null || tempDir == undefined) {
        if (IntoCpsApp.getInstance().getActiveProject() == null) {
            let remote = require("electron").remote;
            let dialog = remote.dialog;
            dialog.showErrorBox("No active project", "No Active project loaded, please load and try again.");
            return;
        }
        tempDir = Path.join(IntoCpsApp.getInstance().getActiveProject().getRootFilePath(), "downloads");
    }
    try {
        // fs.mkdirSync(tempDir);
        var mkdirp = require('mkdirp');
        mkdirp.sync(tempDir);
    } catch (e) {
        console.error(e);
    }
    return tempDir;
}

function progress(state: any) {
    if (state == 1) {
        setProgress(100);
        return;
    }
    let pct = parseInt((state.percentage * 100) + "", 10);
    console.log(pct + "%");
    setProgress(pct);
}

//Set the progress bar 
function setProgress(progress: number) {
    var divProgress = <HTMLInputElement>document.getElementById("coe-progress");
    let tmp = progress.toString() + "%";

    divProgress.style.width = tmp;
    divProgress.innerHTML = tmp;
}

window.onload = function () {
    fetchList();
}

function fetchList() {

    let settings = IntoCpsApp.getInstance().getSettings();

    var url = settings.getValue(SettingKeys.UPDATE_SITE);

    if (url == null || url == undefined) {
        url = "https://raw.githubusercontent.com/into-cps/release-site/master/download/";
        settings.setValue(SettingKeys.UPDATE_SITE, url);

    }

    var panel: HTMLInputElement = <HTMLInputElement>document.getElementById("tool-versions-panel");

    while (panel.hasChildNodes()) {
        panel.removeChild(panel.lastChild);
    }

    downloader.fetchVersionList(url + "versions.json").then(data => {
        //   console.log(JSON.stringify(data) + "\n");
        //   console.log("Fetching version 0.0.6");

        var versions: string[] = [];

        var divVersions = document.createElement("div");

        $.each(Object.keys(data), (j, key) => {
            let version = key;
            versions.push(version);
        });

        //sort
        versions = versions.sort(downloader.compareVersions);
        //highest version first
        versions = versions.reverse();


        var divVersions = document.createElement("div");

        versions.forEach(version => {
            var divStatus = document.createElement("div");
            divStatus.className = "alert alert-info";

            divStatus.innerHTML = version;/// +" - "data[version];
            divStatus.onclick = function (e) {
                downloader.fetchVersion(url + data[version]).then(dataVersion => {
                    showVersion(version, dataVersion);
                });
            };


            divVersions.appendChild(divStatus);
        });


        panel.appendChild(createPanel("Releases", divVersions));
        //return downloader.fetchVersion(data[versions[0]]);
    });

}

function createButton(): HTMLButtonElement {
    let btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-default btn-sm";
    return btn;
}

function showVersion(version: string, data: any) {

    var panel: HTMLInputElement = <HTMLInputElement>document.getElementById("tool-versions-panel");

    var div = document.createElement("ul");
    div.className = "list-group";
    $.each(Object.keys(data.tools), (j, key) => {

        let tool = data.tools[key];

        var supported = false;
        let platform = downloader.getSystemPlatform();
        let platforms = tool.platforms;
        if ("any" in platforms) {
            supported = true
        }
        else {
            Object.keys(tool.platforms).forEach(pl => {
                if (pl.indexOf(platform) == 0) {
                    supported = true;
                }
            });
        }
        if (!supported)
            return;

        var divTool = document.createElement("li");
        divTool.className = "list-group-item";
        divTool.innerText = tool.name + " - " + tool.description + " (" + tool.version + ") ";
        div.appendChild(divTool);

        let btn = createButton();
        var icon = document.createElement("span");
        icon.className = "glyphicon glyphicon-save";
        btn.appendChild(icon);
        divTool.appendChild(btn);
        var progressDiv = <HTMLDivElement>document.getElementById("progress-bars");

        let progressFunction = (downloadName: string, component: HTMLDivElement) => {
            let setProgress = (progress: number) => {
                let styleWidth = progress.toString() + "%";
                let downloadText = styleWidth + " - " + downloadName;

                component.style.width = styleWidth;
                component.innerHTML = downloadText;
            }
            return (state: any) => {
                if (state == 1) {
                    setProgress(100);
                    return;
                }
                let pct = parseInt((state.percentage * 100) + "", 10);
                console.log(pct + "%");
                setProgress(pct);
            }
        }

        btn.onclick = function (e) {
            let remote = require("electron").remote;
            let dialog = remote.dialog;
            let buttons: string[] = ["No", "Yes"];
            dialog.showMessageBox({ type: 'question', buttons: buttons, message: "Download: " + tool.name + " (" + tool.version + ")" }, function (button: any) {
                if (button == 1)//yes
                {
                    $("<div>").load("./progress-bar-component.html", function (event: JQueryEventObject) {
                        let progressBarComponent = <HTMLDivElement>(<HTMLDivElement>this).firstElementChild;
                        //Prepend the child
                        if (progressDiv.hasChildNodes) {
                            progressDiv.insertBefore(progressBarComponent, progressDiv.firstChild)
                        }
                        else { progressDiv.appendChild(progressBarComponent); }

                        //Get the filling div
                        let component = <HTMLDivElement>(<HTMLDivElement>progressBarComponent).querySelector("#coe-progress");
                        component.scrollIntoView();
                        //Start the download
                        downloader.downloadTool(tool, getTempDir(), progressFunction(tool.name, component)).then(function (filePath) {
                            console.log("Download complete: " + filePath);
                            dialog.showMessageBox({ type: 'info', buttons: ["OK"], message: "Download completed: " + filePath }, function (button: any) { });
                            if (downloader.toolRequiresUnpack(tool)) {
                                let installDirectory = IntoCpsApp.getInstance().getSettings().getValue(SettingKeys.INSTALL_DIR)
                                downloader.unpackTool(filePath, installDirectory);
                            }
                        }, function (error) { dialog.showErrorBox("Invalid Checksum", error); });
                    });
                }
            });
        };
        let releasePage = tool.releasepage;
        if (releasePage) {
            let btn = createButton();
            var t = document.createTextNode("Release page");
            btn.appendChild(t);
            let dh = new DialogHandler(releasePage, 640, 400, null, null, null);
            dh.externalUrl = true;
            divTool.appendChild(btn);
            btn.onclick = function (e) {
                dh.openWindow();
            };
        }
    });

    var divT = document.getElementById("toolsversion");
    if (divT == undefined) {
        divT = document.createElement("div");
        divT.id = "toolsversion";
        panel.appendChild(divT);
    }

    while (divT.hasChildNodes()) {
        divT.removeChild(divT.lastChild);
    }

    divT.appendChild(createPanel("Overview - Release: " + data.version, div));
    divT.scrollIntoView();
}

