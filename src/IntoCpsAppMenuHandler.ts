
import {IViewController} from "./iViewController";
import * as RTesterModalCommandWindow from "./rttester/GenericModalCommand";

export class IntoCpsAppMenuHandler {
    openView: (htmlPath: string, callback?: (mainView: HTMLDivElement) => void | IViewController) => void;
    openHTMLInMainView: (path: string, title: string) => void;

    openCoeView: (path: string) => void;
    openMultiModel: (path: string) => void;
    openSysMlExport: (path: string) => void;
    openFmu: (path: string) => void;
    openDseView: (path: string) => void;
    
    deInitialize: () => boolean;
    
    createDse: (path: string) => void;
    createDsePlain: (path: string) => void;
    createMultiModel: (path: string) => void;
    createCoSimConfiguration: (path: string) => void;

    createTDGProject: (path: string) => void;
    createMCProject: (path: string) => void;
    runRTTesterCommand: (commandSpec: any) => void;
    runTest: (path: string) => void;
    openLTLQuery: (path: string) => void;
    openCTAbstractions: (path: string) => void;
    showAddLTLQuery: (folder: string) => void; 

    deletePath: (path: string)=>void;
    openWithSystemEditor: (path: string)=>void;
    createMultiModelPlain: () =>void;
    rename: (path:string)=>void;
}
