import * as TraceProtocol from "./trace-protocol"
import * as GitConn from "./git-connection"
import * as Path from 'path';
import { IntoCpsApp } from "./../IntoCpsApp";

export function sysMlToMM(mmPath: string, sysmlPath:string) : any {
    let project = IntoCpsApp.getInstance().getActiveProject();
    var rootMessage = new TraceProtocol.RootMessage();
    var activity = new TraceProtocol.Activity();
    var ef = new TraceProtocol.EntityFile();
    var et = new TraceProtocol.EntityTool();
    var ea = new TraceProtocol.EntityAgent();
    var efDerived = new TraceProtocol.EntityFile();

    rootMessage.activity = activity;
    rootMessage.entities.push(ef);
    rootMessage.agents.push(ea);

    activity.setTimeToNow();
    activity.type = "configurationCreation"
    activity.used.push(et);
    activity.wasAssociatedWith = ea;
    activity.calcAndSetAbout();

    ef.hash = GitConn.GitCommands.getHashOfFile(mmPath);
    ef.path = encodeURI(Path.relative(project.getRootFilePath(), mmPath).replace(/\\/g, "/"));
    ef.type = "configuration";
    ef.wasGeneratedBy = activity;
    ef.wasAttributedTo = ea;
    ef.wasDerivedFrom = efDerived;
    ef.comment = "Derived multi model configuration from SysML configuration";
    ef.calcAbout();

    return rootMessage.serialize();
}