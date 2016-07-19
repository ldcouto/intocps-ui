import {Component, Input, NgZone} from "@angular/core";
import {MultiModelConfig} from "../../intocps-configurations/MultiModelConfig";
import IntoCpsApp from "../../IntoCpsApp";
import {
    Instance, ScalarVariable, CausalityType, InstanceScalarPair, isCausalityCompatible, isTypeCompatiple,
    Fmu, ScalarValuePair, isFloat, isInteger
} from "../coe/models/Fmu";
import {FileBrowserComponent} from "./inputs/file-browser.component";
import {IProject} from "../../proj/IProject";
import {FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES, FormArray, FormControl, Validators} from "@angular/forms";
import {uniqueValidator, uniqueControlValidator} from "../shared/validators";

@Component({
    selector: "mm-configuration",
    templateUrl: "./angular2-app/mm/mm-configuration.component.html",
    directives: [
        FORM_DIRECTIVES,
        REACTIVE_FORM_DIRECTIVES,
        FileBrowserComponent
    ]
})
export class MmConfigurationComponent {
    private _path:string;

    @Input()
    set path(path:string) {
        this._path = path;

        if (path)
            this.parseConfig();
    }
    get path():string {
        return this._path;
    }

    form: FormGroup;
    parseError: string = null;

    private config:MultiModelConfig;

    private selectedParameterInstance:Instance;
    private selectedOutputInstance:Instance;
    private selectedOutput:ScalarVariable;
    private selectedInputInstance:Instance;
    private selectedInstanceFmu:Fmu;

    private newParameter:ScalarVariable;

    constructor(private zone:NgZone) {

    }

    parseConfig() {
        let project:IProject = IntoCpsApp.getInstance().getActiveProject();

        MultiModelConfig
            .parse(this.path, project.getFmusPath())
            .then(config => {
                this.zone.run(() => {
                    this.parseError = null;

                    this.config = config;

                    // Create a form group for validation
                    this.form = new FormGroup({
                        fmus: new FormArray(this.config.fmus.map(fmu => new FormControl(fmu.name, [Validators.required, Validators.pattern("[^{^}]*")])), uniqueControlValidator),
                        instances: new FormArray(this.config.fmus.map(fmu => new FormArray(this.getInstances(fmu).map(instance => new FormControl(instance.name))))),

                    });
                });
            }, error => this.zone.run(() => this.parseError = error));
    }

    onSubmit() {
        this.config.save();
    }

    getFmuName(fmu: Fmu): string {
        return fmu.name.substring(1, fmu.name.length -1);
    }

    setFmuName(fmu: Fmu, name: string) {
        fmu.name = `{${name}}`;
    }

    getInstances(fmu:Fmu) {
        return this.config.fmuInstances.filter(instance => instance.fmu === fmu);
    }

    selectInstanceFmu(fmu:Fmu) {
        this.selectedInstanceFmu = fmu;
    }

    selectParameterInstance(instance:Instance) {
        this.selectedParameterInstance = instance;
        this.newParameter = this.getParameters()[0];
    }

    selectOutputInstance(instance:Instance) {
        this.selectedOutputInstance = instance;
        this.selectedOutput = null;
        this.selectedInputInstance = null;
    }

    selectOutput(variable:ScalarVariable) {
        this.selectedOutput = variable;
        this.selectedInputInstance = null;
    }

    selectInputInstance(instance:Instance) {
        this.selectedInputInstance = instance;
    }

    getInitialValues():Array<ScalarValuePair> {
        let initialValues:Array<ScalarValuePair> = [];

         this.selectedParameterInstance.initialValues.forEach((value, variable) => {
             initialValues.push(new ScalarValuePair(variable, value));
        });

        return initialValues;
    }

    addParameter() {
        if (!this.newParameter) return;

        this.selectedParameterInstance.initialValues.set(this.newParameter, '');
        this.newParameter = this.getParameters()[0];
    }

    setParameter(parameter:ScalarVariable, value:any) {
        if (isInteger(value))
            value = parseInt(value);
        else if (isFloat(value))
            value = parseFloat(value);

        this.selectedParameterInstance.initialValues.set(parameter, value);
    }

    removeParameter(parameter:ScalarVariable) {
        this.selectedParameterInstance.initialValues.delete(parameter);
        this.newParameter = this.getParameters()[0];
    }

    getParameters() {
        return this.selectedParameterInstance.fmu.scalarVariables
            .filter(variable => isCausalityCompatible(variable.causality, CausalityType.Parameter) && !this.selectedParameterInstance.initialValues.has(variable));
    }

    getOutputs() {
        return this.selectedOutputInstance.fmu.scalarVariables
            .filter(variable => isCausalityCompatible(variable.causality, CausalityType.Output));
    }

    getInputs() {
        return this.selectedInputInstance.fmu.scalarVariables
            .filter(variable => isCausalityCompatible(variable.causality, CausalityType.Input) && isTypeCompatiple(variable.type, this.selectedOutput.type));
    }

    isInputConnected(input:ScalarVariable) {
        let pairs = this.selectedOutputInstance.outputsTo.get(this.selectedOutput);

        if (!pairs)
            return false;

        return pairs.filter(pair => pair.instance === this.selectedInputInstance && pair.scalarVariable === input).length > 0;
    }

    onConnectionChange(checked:boolean, input:ScalarVariable) {
        let outputsTo = this.selectedOutputInstance.outputsTo.get(this.selectedOutput);

        if (checked) {
            if (outputsTo == null) {
                outputsTo = <Array<InstanceScalarPair>> [];
                this.selectedOutputInstance.outputsTo.set(this.selectedOutput, outputsTo);
            }
            outputsTo.push(new InstanceScalarPair(this.selectedInputInstance, input));
        } else {
            outputsTo.splice(outputsTo.findIndex(pair => pair.instance === this.selectedInputInstance && pair.scalarVariable === input), 1);
        }
    }
}