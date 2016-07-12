import {Component, Input, OnInit, NgZone} from "@angular/core";
import {MultiModelConfig} from "../../intocps-configurations/MultiModelConfig";
import IntoCpsApp from "../../IntoCpsApp";
import {
    Instance, ScalarVariable, CausalityType, InstanceScalarPair, isCausalityCompatible, isTypeCompatiple,
    Fmu
} from "../coe/models/Fmu";
import {FileBrowserComponent} from "./inputs/file-browser.component";
import {IProject} from "../../proj/IProject";

@Component({
    selector: "mm-configuration",
    templateUrl: "./angular2-app/mm/mm-configuration.component.html",
    directives: [FileBrowserComponent]
})
export class MmConfigurationComponent implements OnInit {
    @Input()
    path:string;

    private config:MultiModelConfig;

    private selectedParameterInstance:Instance;
    private selectedOutputInstance:Instance;
    private selectedOutput:ScalarVariable;
    private selectedInputInstance:Instance;

    constructor(private zone:NgZone) {

    }

    ngOnInit() {
        let project:IProject = IntoCpsApp.getInstance().getActiveProject();

        MultiModelConfig
            .parse(this.path, project.getFmusPath())
            .then(config => this.zone.run(() => this.config = config));
    }

    onSubmit() {
        this.config.save();
    }

    addFmu() {
        this.config.fmus.push(new Fmu());
    }

    removeFmu(fmu:Fmu) {
        this.config.fmus.splice(this.config.fmus.indexOf(fmu), 1);
    }

    selectParameterInstance(instance:Instance) {
        this.selectedParameterInstance = instance;
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