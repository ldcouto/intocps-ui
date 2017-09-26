// Module contaiing valid setting keys
export namespace SettingKeys {
    export var DEVELOPMENT_MODE = "development_mode";
    export var ACTIVE_PROJECT = "active_project";
    export var INSTALL_DIR = "install_dir";
    export var INSTALL_TMP_DIR = "install_tmp_dir";
    export var COE_URL = "coe_host_url";
    export var TRACE_DAEMON_PORT = "traceability_daemon_port";
    export var COE_REMOTE_HOST = "coe_remote_host";
    export var COE_JAR_PATH = "coe_jar_path";
    export var RTTESTER_INSTALL_DIR: string = "RT-Tester Installation Path";
    export var RTTESTER_MBT_INSTALL_DIR: string = "RT-Tester MBT Installation Path";
    export var RTTESTER_RTTUI: string = "RT-Tester RTTUI3 Executable Path";
    export var RTTESTER_PYTHON: string = "Python Executable Path for RT-Tester";
    export var UPDATE_SITE = "update_site";
    export var DEV_UPDATE_SITE = "dev_update_site";
    export var EXAMPLE_REPO = "example_site";
    export var DEV_EXAMPLE_REPO = "dev_example_site";
    export var DEFAULT_PROJECTS_FOLDER_PATH = "default_projects_folder_path";
    export var ENABLE_TRACEABILITY = "enable_traceability";
    export var LOCAL_UPDATE_SITE = "local_update_site";
    export var USE_LOCAL_UPDATE_SITE = "use_local_update_site";

    export var DEFAULT_VALUES: { [key: string]: any; } = {};
    DEFAULT_VALUES[RTTESTER_INSTALL_DIR] = 'C:/opt/rt-tester';
    DEFAULT_VALUES[RTTESTER_MBT_INSTALL_DIR] = "C:/opt/rtt-mbt";
    DEFAULT_VALUES[RTTESTER_RTTUI] = "C:/Program Files (x86)/Verified/RTTUI3/bin/rttui3.exe";
    DEFAULT_VALUES[RTTESTER_PYTHON] = "C:/Python27/python.exe";
    DEFAULT_VALUES[UPDATE_SITE] = "https://raw.githubusercontent.com/into-cps/into-cps.github.io/master/download/";
    DEFAULT_VALUES[DEV_UPDATE_SITE] = "https://raw.githubusercontent.com/into-cps/into-cps.github.io/development/download/";
    DEFAULT_VALUES[EXAMPLE_REPO] = "https://raw.githubusercontent.com/into-cps/into-cps.github.io/master/examples/examples.json";
    DEFAULT_VALUES[DEV_EXAMPLE_REPO] = "https://raw.githubusercontent.com/into-cps/into-cps.github.io/examples-dev/examples/examples.json";
    DEFAULT_VALUES[DEVELOPMENT_MODE] = false;
    DEFAULT_VALUES[COE_URL] = "localhost:8082";
    DEFAULT_VALUES[TRACE_DAEMON_PORT] = "8083";
    DEFAULT_VALUES[COE_REMOTE_HOST] = false;
    DEFAULT_VALUES[ENABLE_TRACEABILITY] = false;
    DEFAULT_VALUES[LOCAL_UPDATE_SITE] = "";
    DEFAULT_VALUES[USE_LOCAL_UPDATE_SITE] = false;

    export var VALUE_DESCRIPTION: { [key: string]: any; } = {};

    VALUE_DESCRIPTION[DEVELOPMENT_MODE] = "This enabled development mode allowing download of development downloads and increases the debug information show.";
    VALUE_DESCRIPTION[ACTIVE_PROJECT] = "Stores the active project. This is meant for internal use only."
    VALUE_DESCRIPTION[INSTALL_DIR] = "The folder where downloads will be installed to"
    VALUE_DESCRIPTION[COE_URL] = "URL used for the COE connection.";
    VALUE_DESCRIPTION[TRACE_DAEMON_PORT] = "The port at which the trace daemon will listen for messages";
    VALUE_DESCRIPTION[COE_REMOTE_HOST] = "Remote host url for the COE. Leave blank to use local host connection";
    VALUE_DESCRIPTION[COE_JAR_PATH] = "Custom jar path for the COE. Leave blank to search install folder instead";
    VALUE_DESCRIPTION[RTTESTER_INSTALL_DIR] = "?";
    VALUE_DESCRIPTION[RTTESTER_MBT_INSTALL_DIR] = "?";
    VALUE_DESCRIPTION[RTTESTER_RTTUI] = "?";
    VALUE_DESCRIPTION[RTTESTER_PYTHON] = "?";
    VALUE_DESCRIPTION[UPDATE_SITE] = "URL for the update site";
    VALUE_DESCRIPTION[DEV_UPDATE_SITE] = "URL for the update site used in development mode";
    VALUE_DESCRIPTION[EXAMPLE_REPO] = "URL for the examples repo";
    VALUE_DESCRIPTION[DEV_EXAMPLE_REPO] = "URL for the examples repo used in development mode";
    VALUE_DESCRIPTION[DEFAULT_PROJECTS_FOLDER_PATH] = "Path of the folder used as default for projects";
    VALUE_DESCRIPTION[ENABLE_TRACEABILITY] = "Enable tracebility tracking in both the app and the daemon which enables remote tools to submit trace info to the open project";
    VALUE_DESCRIPTION[LOCAL_UPDATE_SITE] = "A local URI using schema file to a local downloaded update site";
    VALUE_DESCRIPTION[USE_LOCAL_UPDATE_SITE] = "Enable the use local downloaded repo";

}
