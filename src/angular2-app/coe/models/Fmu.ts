import * as fs  from 'fs';

// Holds information about a .fmu container
export class Fmu {
    platforms: Platforms[];
    scalarVariables: ScalarVariable[] = [];

    constructor(
        public name: string = "{FMU}",
        public path: string = ""
    ) {

    }

    public updatePath(path: string): Promise<void> {
        this.path = path;
        this.scalarVariables.forEach(sv => {
            sv.isConfirmed = false;
        });
        this.platforms = [];
        return this.populate();
    }

    public populate(): Promise<void> {
        let self = this;
        let checkFileExists = new Promise<Buffer>(function (resolve, reject) {
            try {
                if (fs.accessSync(self.path, fs.R_OK)) {
                    reject();
                }
                resolve();
            } catch (e) {
                reject(e);
            }
        });

        //wrap readFile in a promise
        let fileReadPromise = new Promise<Buffer>(function (resolve, reject) {
            fs.readFile(self.path, function (err, data) {
                if (err !== null) {
                    return reject(err);
                }
                resolve(data);
            });
        });

        return checkFileExists.then(() => {
            var JSZip = require("jszip");
            var zip = new JSZip();
            // read a zip file
            return fileReadPromise.then(data => {
                return zip.loadAsync(data);
            }).then(function (k: any) {
                return zip.file("modelDescription.xml").async("string")
            }).then(function (content: string) {
                self.populateFromModelDescription(content);
            });;
        });
    }

    private populateFromModelDescription(content: string) {
        var oParser = new DOMParser();
        var oDOM = oParser.parseFromString(content, "text/xml");

        //output
        var iterator = document.evaluate('//ScalarVariable', oDOM, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

        var thisNode = iterator.iterateNext();

        while (thisNode) {


            let causalityNode = thisNode.attributes.getNamedItem("causality");
            let nameNode = thisNode.attributes.getNamedItem("name");
            var type: ScalarVariableType;

            var tNode = document.evaluate('Real', thisNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            if (tNode != null) {
                type = ScalarVariableType.Real;
            } else {
                tNode = document.evaluate('Boolean', thisNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (tNode != null) {
                    type = ScalarVariableType.Bool;
                } else {
                    tNode = document.evaluate('Integer', thisNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    if (tNode != null) {
                        type = ScalarVariableType.Int;
                    } else {
                        tNode = document.evaluate('String', thisNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if (tNode != null) {
                            type = ScalarVariableType.String;
                        }
                    }
                }
            }

            var causality: CausalityType;

            if (causalityNode != undefined) {
                let causalityText = causalityNode.textContent;

                if ("output" == causalityText) {
                    causality = CausalityType.Output;
                }
                else if ("input" == causalityText) {
                    causality = CausalityType.Input;
                }
                else if ("parameter" == causalityText) {
                    causality = CausalityType.Parameter;
                }
                else if ("calculatedParameter" == causalityText) {
                    causality = CausalityType.CalculatedParameter;
                }
                else if ("local" == causalityText){
                    causality = CausalityType.Local;
                }
            }

            let sv = this.getScalarVariable(nameNode.textContent);
            sv.type = type;
            sv.causality = causality;
            sv.isConfirmed = true;

            thisNode = iterator.iterateNext();
        }
    }

    public getScalarVariable(name: string): ScalarVariable {
        let res = this.scalarVariables.find(function (s) { return s.name == name; });
        if (res == undefined) {
            // scalar variable does not exist so make new unlinked variable
            let sv : ScalarVariable = { name: name, type: ScalarVariableType.Unknown, causality: CausalityType.Unknown, isConfirmed: false };
            this.scalarVariables.push(sv);
            return sv;
        }
        return res;
    }
}

// Defined enums for all FMI supported platforms
export enum Platforms { Mac64, Linux32, Linux64, Win32, Win64 }

// Represents a FMI ScalarVariable
export class ScalarVariable {
    public name: string;

    public type: ScalarVariableType;
    public causality: CausalityType;

    //none FMI specific
    public isConfirmed: boolean;
}
export enum ScalarVariableType { Real, Bool, Int, String, Unknown }
export enum CausalityType { Output, Input, Parameter, CalculatedParameter ,Local, Unknown }

export function isTypeCompatiple(t1: ScalarVariableType, t2: ScalarVariableType): boolean {
    if (t1 == ScalarVariableType.Unknown || t2 == ScalarVariableType.Unknown) {
        return true;
    } else if(t1 ==ScalarVariableType.Bool && (t2==ScalarVariableType.Int || t2==ScalarVariableType.Real)) {
        // bool -> number
        return true;
    }else if(t2 ==ScalarVariableType.Bool && (t1==ScalarVariableType.Int || t1==ScalarVariableType.Real)) {
        //number -> bool
          return true;
    }else
    {
        return t1 == t2;
    }
}

export function isCausalityCompatible(t1: CausalityType, t2: CausalityType): boolean {
    if(t1 == CausalityType.Unknown || t2 == CausalityType.Unknown){
        return true;
    }
    else {
        return t1 == t2;
    }
}

function isInteger(x:any) { return !isNaN(x) && isFinite(x) && Math.floor(x) === x; }
function isFloat(x:any) { return !!(x % 1); }
function isString(value:any) {return typeof value === 'string';}

export function convertToType(type: ScalarVariableType, value: any): any{
    if(type == ScalarVariableType.Bool)
    {
        return Boolean(value);
    }
    else if(type == ScalarVariableType.Int)
    {
        let mValue = Number(value);
        if(isInteger(mValue)){
            return mValue;   
        }
    }
    else if(type == ScalarVariableType.Real)
    {
        let mValue = Number(value);
        if(isFloat(mValue) || isInteger(mValue)){
            return mValue;
        }
    }
    else if(type == ScalarVariableType.String)
    {
        let mValue = value.toString();
        if(isString(mValue)){
            return mValue;
        }
    }
    return null;
}

export function isTypeCompatipleWithValue(t1: ScalarVariableType, value: any): boolean {

    switch (t1) {
        case ScalarVariableType.Unknown:
            return true;

        case ScalarVariableType.Real:
            return isFloat(value) || isInteger(value);
        case ScalarVariableType.Bool:
            return typeof(value) === "boolean" || isInteger(value);
        case ScalarVariableType.Int:
            return isInteger(value);
        case ScalarVariableType.String:
            return isString(value);
    }
    return false;
}

// Repersents an instance of an FMU, including initial parameters and a mapping from outputs to InstanceScalarPair
export class Instance {
    //the fmu which this is an instance of
    fmu: Fmu;
    //the instance name
    name: string;

    //mapping from output to FmuConnection where connection holds an instane and input scalarVariable
    outputsTo: Map<ScalarVariable, InstanceScalarPair[]> = new Map<ScalarVariable, InstanceScalarPair[]>();

    // initial parameter values
    initialValues: Map<ScalarVariable, any> = new Map<ScalarVariable, any>();

    constructor(fmu: Fmu, name: string) {
        this.fmu = fmu;
        this.name = name;
    }

    public addOutputToInputLink(source: ScalarVariable, target: InstanceScalarPair) {

        if (this.outputsTo.has(source)) {
            let list = this.outputsTo.get(source);

            let match = list.find(function (pair) { return pair.instance == target.instance && pair.scalarVariable == target.scalarVariable });

            if (match == undefined) {
                list.push(target);
            }

        } else {
            this.outputsTo.set(source, [target]);
        }
    }
}

// Represents a link pair (FmuInstances, scalarVariable)
export class InstanceScalarPair {
    instance: Instance;
    scalarVariable: ScalarVariable;

    constructor(instance: Instance, scalarVariable: ScalarVariable) {
        this.instance = instance;
        this.scalarVariable = scalarVariable;
    }
}

