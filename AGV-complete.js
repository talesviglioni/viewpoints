const { Model, Component, Port, SimplePort, CompositePort, Connector, Activity, Action, Enum, Int, Boolean, String, Real, Void, valueType, dataType, dimension, unit, Constraint, Executable } = require('../sysadl-framework/SysADLBase');

// Types
const EN_NotificationToSupervisory = new Enum("departed", "arrived", "passed", "traveling");
const EN_NotificationFromArm = new Enum("loaded", "unloaded");
const EN_CommandToArm = new Enum("load", "unload", "idle");
const EN_NotificationFromMotor = new Enum("started", "stopped");
const EN_CommandToMotor = new Enum("start", "stop");
const DT_Location = dataType('Location', { location: String });
const DT_Status = dataType('Status', { location: DT_Location, destination: DT_Location, command: EN_CommandToArm });
const DT_VehicleData = dataType('VehicleData', { destination: DT_Location, command: EN_CommandToArm });

// Ports
class PT_ComponentsAGV_inLocation extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "in", { ...{ expectedType: "Location" }, ...opts });
  }
}
class PT_ComponentsAGV_outLocation extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "out", { ...{ expectedType: "Location" }, ...opts });
  }
}
class PT_PortsAGV_inStatus extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "in", { ...{ expectedType: "Status" }, ...opts });
  }
}
class PT_PortsAGV_outStatus extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "out", { ...{ expectedType: "Status" }, ...opts });
  }
}
class PT_PortsAGV_inVehicleData extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "in", { ...{ expectedType: "VehicleData" }, ...opts });
  }
}
class PT_PortsAGV_outVehicleData extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "out", { ...{ expectedType: "VehicleData" }, ...opts });
  }
}
class PT_PortsAGV_inNotificationFromMotor extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "in", { ...{ expectedType: "NotificationFromMotor" }, ...opts });
  }
}
class PT_PortsAGV_outNotificationFromMotor extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "out", { ...{ expectedType: "NotificationFromMotor" }, ...opts });
  }
}
class PT_PortsAGV_inCommandToMotor extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "in", { ...{ expectedType: "CommandToMotor" }, ...opts });
  }
}
class PT_PortsAGV_outCommandToMotor extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "out", { ...{ expectedType: "CommandToMotor" }, ...opts });
  }
}
class PT_PortsAGV_inNotificationFromArm extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "in", { ...{ expectedType: "NotificationFromArm" }, ...opts });
  }
}
class PT_PortsAGV_outNotificationFromArm extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "out", { ...{ expectedType: "NotificationFromArm" }, ...opts });
  }
}
class PT_PortsAGV_inCommandToArm extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "in", { ...{ expectedType: "CommandToArm" }, ...opts });
  }
}
class PT_PortsAGV_outCommandToArm extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "out", { ...{ expectedType: "CommandToArm" }, ...opts });
  }
}
class PT_PortsAGV_inNotificationToSupervisory extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "in", { ...{ expectedType: "NotificationToSupervisory" }, ...opts });
  }
}
class PT_PortsAGV_outNotificationToSupervisory extends SimplePort {
  constructor(name, opts = {}) {
    super(name, "out", { ...{ expectedType: "NotificationToSupervisory" }, ...opts });
  }
}
class PT_PortsAGV_IAGVSystem extends CompositePort {
  constructor(name, opts = {}) {
    super(name, 'composite', opts);
    // Add sub-ports
    this.addSubPort("inMoveToStation", new SimplePort("inMoveToStation", "in", { ...{ expectedType: "VehicleData" }, owner: this.owner }));
    this.addSubPort("outNotifications", new SimplePort("outNotifications", "out", { ...{ expectedType: "NotificationToSupervisory" }, owner: this.owner }));
  }
}
class PT_PortsAGV_ISupervisorySystem extends CompositePort {
  constructor(name, opts = {}) {
    super(name, 'composite', opts);
    // Add sub-ports
    this.addSubPort("outMoveToStation", new SimplePort("outMoveToStation", "out", { ...{ expectedType: "VehicleData" }, owner: this.owner }));
    this.addSubPort("inNotifications", new SimplePort("inNotifications", "in", { ...{ expectedType: "NotificationToSupervisory" }, owner: this.owner }));
  }
}

// Connectors
class CN_ConnectorsAGV_notifySupervisory extends Connector {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      participantSchema: {
        nsIPT: {
          portClass: 'PT_PortsAGV_inNotificationToSupervisory',
          direction: 'out',
          dataType: 'NotificationToSupervisory',
          role: 'source'
        },
        nsOPT: {
          portClass: 'PT_PortsAGV_outNotificationToSupervisory',
          direction: 'out',
          dataType: 'NotificationToSupervisory',
          role: 'target'
        }
      },
      flowSchema: [
        {
          from: 'nsOPT',
          to: 'nsIPT',
          dataType: 'NotificationToSupervisory'
        }
      ]
    });
  }
}
class CN_ConnectorsAGV_sendVehicleData extends Connector {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      participantSchema: {
        vdOPT: {
          portClass: 'PT_PortsAGV_outVehicleData',
          direction: 'out',
          dataType: 'VehicleData',
          role: 'source'
        },
        vdIPT: {
          portClass: 'PT_PortsAGV_inVehicleData',
          direction: 'out',
          dataType: 'VehicleData',
          role: 'target'
        }
      },
      flowSchema: [
        {
          from: 'vdOPT',
          to: 'vdIPT',
          dataType: 'VehicleData'
        }
      ]
    });
  }
}
class CN_ConnectorsAGV_notificationMotor extends Connector {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      participantSchema: {
        nmOPT: {
          portClass: 'PT_PortsAGV_outNotificationFromMotor',
          direction: 'out',
          dataType: 'NotificationFromMotor',
          role: 'source'
        },
        nmIPT: {
          portClass: 'PT_PortsAGV_inNotificationFromMotor',
          direction: 'out',
          dataType: 'NotificationFromMotor',
          role: 'target'
        }
      },
      flowSchema: [
        {
          from: 'nmOPT',
          to: 'nmIPT',
          dataType: 'NotificationFromMotor'
        }
      ]
    });
  }
}
class CN_ConnectorsAGV_commandArm extends Connector {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      participantSchema: {
        caOPT: {
          portClass: 'PT_PortsAGV_outCommandToArm',
          direction: 'out',
          dataType: 'CommandToArm',
          role: 'source'
        },
        caIPT: {
          portClass: 'PT_PortsAGV_inCommandToArm',
          direction: 'out',
          dataType: 'CommandToArm',
          role: 'target'
        }
      },
      flowSchema: [
        {
          from: 'caOPT',
          to: 'caIPT',
          dataType: 'CommandToArm'
        }
      ]
    });
  }
}
class CN_ConnectorsAGV_notificationArm extends Connector {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      participantSchema: {
        naIPT: {
          portClass: 'PT_PortsAGV_inNotificationFromArm',
          direction: 'out',
          dataType: 'NotificationFromArm',
          role: 'source'
        },
        naOPT: {
          portClass: 'PT_PortsAGV_outNotificationFromArm',
          direction: 'out',
          dataType: 'NotificationFromArm',
          role: 'target'
        }
      },
      flowSchema: [
        {
          from: 'naOPT',
          to: 'naIPT',
          dataType: 'NotificationFromArm'
        }
      ]
    });
  }
}
class CN_ConnectorsAGV_commandMotor extends Connector {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      participantSchema: {
        cmOPT: {
          portClass: 'PT_PortsAGV_outCommandToMotor',
          direction: 'out',
          dataType: 'CommandToMotor',
          role: 'source'
        },
        cmIPT: {
          portClass: 'PT_PortsAGV_inCommandToMotor',
          direction: 'out',
          dataType: 'CommandToMotor',
          role: 'target'
        }
      },
      flowSchema: [
        {
          from: 'cmOPT',
          to: 'cmIPT',
          dataType: 'CommandToMotor'
        }
      ]
    });
  }
}
class CN_ConnectorsAGV_interactionAGVAndSupervisory extends Connector {
  constructor(name, port1, port2, opts = {}) {
    super(name, opts);
    // Composite connector with internal connectors
    this.port1 = port1;
    this.port2 = port2;
    this.nS = new CN_ConnectorsAGV_notifySupervisory("nS");
    this.sVD = new CN_ConnectorsAGV_sendVehicleData("sVD");
    
    // Extract sub-ports and bind to internal connectors
    if (port1 && port2) {
      // notifySupervisory: nsOPT -> nsIPT
      this.nS.bind(
        this.port1.getSubPort('nsOPT'),
        this.port2.getSubPort('nsIPT')
      );
      // sendVehicleData: vdOPT -> vdIPT
      this.sVD.bind(
        this.port1.getSubPort('vdOPT'),
        this.port2.getSubPort('vdIPT')
      );
    }
    
    this.connectors = this.connectors || {};
    this.connectors["nS"] = this.nS;
    this.connectors = this.connectors || {};
    this.connectors["sVD"] = this.sVD;
  }
}
class CN_ConnectorsAGV_locationVehicle extends Connector {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      participantSchema: {
        lOPT: {
          portClass: 'PT_ComponentsAGV_outLocation',
          direction: 'out',
          dataType: 'Location',
          role: 'source'
        },
        lIPT: {
          portClass: 'PT_ComponentsAGV_inLocation',
          direction: 'out',
          dataType: 'Location',
          role: 'target'
        }
      },
      flowSchema: [
        {
          from: 'lOPT',
          to: 'lIPT',
          dataType: 'Location'
        }
      ]
    });
  }
}
class CN_ComponentsAGV_status extends Connector {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      participantSchema: {
        sOPT: {
          portClass: 'PT_PortsAGV_outStatus',
          direction: 'out',
          dataType: 'Status',
          role: 'source'
        },
        sIPT: {
          portClass: 'PT_PortsAGV_inStatus',
          direction: 'out',
          dataType: 'Status',
          role: 'target'
        }
      },
      flowSchema: [
        {
          from: 'sOPT',
          to: 'sIPT',
          dataType: 'Status'
        }
      ]
    });
  }
}

// Components
class CP_ComponentsAGV_SupervisorySystem extends Component {
  constructor(name, opts={}) {
      super(name, { ...opts, isBoundary: true });
      // Add ports from component definition
      this.addPort(new PT_PortsAGV_ISupervisorySystem("in_outDataSup", { owner: name }));
    }
}
class CP_ComponentsAGV_AGVSystem extends Component {
  constructor(name, opts={}) {
      super(name, opts);
      // Add ports from component definition
      this.addPort(new PT_PortsAGV_outStatus("sendStatus", { owner: name }));
      this.addPort(new PT_PortsAGV_IAGVSystem("in_outDataAGV", { owner: name }));
    }
}
class CP_ComponentsAGV_DisplaySystem extends Component {
  constructor(name, opts={}) {
      super(name, { ...opts, isBoundary: true });
      // Add ports from component definition
      this.addPort(new PT_PortsAGV_inStatus("receiveStatus", { owner: name }));
    }
}
class CP_ComponentsAGV_Motor extends Component {
  constructor(name, opts={}) {
      super(name, { ...opts, isBoundary: true });
      // Add ports from component definition
      this.addPort(new PT_PortsAGV_inCommandToMotor("start_stop", { owner: name }));
      this.addPort(new PT_PortsAGV_outNotificationFromMotor("started_stopped", { owner: name }));
    }
}
class CP_ComponentsAGV_ArrivalSensor extends Component {
  constructor(name, opts={}) {
      super(name, { ...opts, isBoundary: true });
      // Add ports from component definition
      this.addPort(new PT_ComponentsAGV_outLocation("arrivalDetected", { owner: name }));
    }
}
class CP_ComponentsAGV_RobotArm extends Component {
  constructor(name, opts={}) {
      super(name, { ...opts, isBoundary: true });
      // Add ports from component definition
      this.addPort(new PT_PortsAGV_inCommandToArm("start", { owner: name }));
      this.addPort(new PT_PortsAGV_outNotificationFromArm("started", { owner: name }));
    }
}
class CP_ComponentsAGV_VehicleControl extends Component {
  constructor(name, opts={}) {
      super(name, opts);
      // Add ports from component definition
      this.addPort(new PT_PortsAGV_outStatus("sendStatus", { owner: name }));
      this.addPort(new PT_ComponentsAGV_inLocation("arrivalDetected", { owner: name }));
      this.addPort(new PT_PortsAGV_outCommandToArm("startArm", { owner: name }));
      this.addPort(new PT_PortsAGV_inNotificationFromArm("startedArm", { owner: name }));
      this.addPort(new PT_PortsAGV_inNotificationFromMotor("started_stopped", { owner: name }));
      this.addPort(new PT_PortsAGV_outCommandToMotor("start_stop", { owner: name }));
      this.addPort(new PT_PortsAGV_IAGVSystem("in_outDataAGV", { owner: name }));
    }
}
class CP_ComponentsAGV_CheckStation extends Component {
  constructor(name, opts={}) {
      super(name, { ...opts, activityName: "CheckStationAC" });
      // Add ports from component definition
      this.addPort(new PT_PortsAGV_inNotificationFromMotor("ack", { owner: name }));
      this.addPort(new PT_ComponentsAGV_outLocation("location", { owner: name }));
      this.addPort(new PT_ComponentsAGV_inLocation("destination", { owner: name }));
      this.addPort(new PT_PortsAGV_outCommandToMotor("stop", { owner: name }));
      this.addPort(new PT_ComponentsAGV_inLocation("arrivalDetected", { owner: name }));
      this.addPort(new PT_PortsAGV_outNotificationToSupervisory("passed", { owner: name }));
    }
}
class CP_ComponentsAGV_ControlArm extends Component {
  constructor(name, opts={}) {
      super(name, { ...opts, activityName: "ControlArmAC" });
      // Add ports from component definition
      this.addPort(new PT_PortsAGV_inCommandToArm("cmd", { owner: name }));
      this.addPort(new PT_PortsAGV_inNotificationFromMotor("ack", { owner: name }));
      this.addPort(new PT_PortsAGV_outCommandToArm("startArm", { owner: name }));
    }
}
class CP_ComponentsAGV_NotifierMotor extends Component {
  constructor(name, opts={}) {
      super(name, { ...opts, activityName: "NotifierMotorAC" });
      // Add ports from component definition
      this.addPort(new PT_PortsAGV_inNotificationFromMotor("inAck", { owner: name }));
      this.addPort(new PT_PortsAGV_outNotificationToSupervisory("ack", { owner: name }));
      this.addPort(new PT_PortsAGV_outNotificationFromMotor("outAck", { owner: name }));
    }
}
class CP_ComponentsAGV_StartMoving extends Component {
  constructor(name, opts={}) {
      super(name, { ...opts, activityName: "StartMovingAC" });
      // Add ports from component definition
      this.addPort(new PT_PortsAGV_inVehicleData("move", { owner: name }));
      this.addPort(new PT_PortsAGV_outCommandToArm("cmd", { owner: name }));
      this.addPort(new PT_ComponentsAGV_outLocation("destination", { owner: name }));
      this.addPort(new PT_PortsAGV_outCommandToMotor("start", { owner: name }));
    }
}
class CP_ComponentsAGV_NotifierArm extends Component {
  constructor(name, opts={}) {
      super(name, { ...opts, activityName: "NotifierArmAC" });
      // Add ports from component definition
      this.addPort(new PT_PortsAGV_outNotificationToSupervisory("arrivedStatus", { owner: name }));
      this.addPort(new PT_PortsAGV_inNotificationFromArm("loaded_unloaded", { owner: name }));
    }
}
class CP_ComponentsAGV_VehicleTimer extends Component {
  constructor(name, opts={}) {
      super(name, { ...opts, activityName: "VehicleTimerAC" });
      // Add ports from component definition
      this.addPort(new PT_PortsAGV_outStatus("AGVStatus", { owner: name }));
      this.addPort(new PT_ComponentsAGV_inLocation("location", { owner: name }));
      this.addPort(new PT_ComponentsAGV_inLocation("destination", { owner: name }));
      this.addPort(new PT_PortsAGV_inCommandToArm("cmd", { owner: name }));
    }
}
class CP_ComponentsAGV_FactoryAutomationSystem extends Component { }

// ===== Behavioral Element Classes =====
// Activity class: StartMovingAC
class AC_ComponentsAGV_StartMovingAC extends Activity {
  constructor(name, component = null, inputPorts = [], delegates = [], opts = {}) {
    super(name, component, inputPorts, delegates, {
      ...opts,
      inParameters: [{"name":"move","type":"Pin","direction":"in"},{"name":"cmd","type":"Pin","direction":"in"},{"name":"destination","type":"Pin","direction":"in"},{"name":"start","type":"Pin","direction":"in"}],
      outParameters: []
    });
  }
}

// Activity class: NotifierMotorAC
class AC_ComponentsAGV_NotifierMotorAC extends Activity {
  constructor(name, component = null, inputPorts = [], delegates = [], opts = {}) {
    super(name, component, inputPorts, delegates, {
      ...opts,
      inParameters: [{"name":"inStatusMotor","type":"Pin","direction":"in"},{"name":"outStatusMotor","type":"Pin","direction":"in"},{"name":"ack","type":"Pin","direction":"in"}],
      outParameters: []
    });
  }
}

// Activity class: CheckStationAC
class AC_ComponentsAGV_CheckStationAC extends Activity {
  constructor(name, component = null, inputPorts = [], delegates = [], opts = {}) {
    super(name, component, inputPorts, delegates, {
      ...opts,
      inParameters: [{"name":"statusMotor","type":"Pin","direction":"in"},{"name":"destination","type":"Pin","direction":"in"},{"name":"inLocation","type":"Pin","direction":"in"},{"name":"stopMotor","type":"Pin","direction":"in"},{"name":"outLocation","type":"Pin","direction":"in"},{"name":"passed","type":"Pin","direction":"in"}],
      outParameters: []
    });
  }
}

// Activity class: ControlArmAC
class AC_ComponentsAGV_ControlArmAC extends Activity {
  constructor(name, component = null, inputPorts = [], delegates = [], opts = {}) {
    super(name, component, inputPorts, delegates, {
      ...opts,
      inParameters: [{"name":"cmd","type":"Pin","direction":"in"},{"name":"statusMotor","type":"Pin","direction":"in"},{"name":"startArm","type":"Pin","direction":"in"}],
      outParameters: []
    });
  }
}

// Activity class: NotifierArmAC
class AC_ComponentsAGV_NotifierArmAC extends Activity {
  constructor(name, component = null, inputPorts = [], delegates = [], opts = {}) {
    super(name, component, inputPorts, delegates, {
      ...opts,
      inParameters: [{"name":"statusArm","type":"Pin","direction":"in"},{"name":"ack","type":"Pin","direction":"in"}],
      outParameters: []
    });
  }
}

// Activity class: VehicleTimerAC
class AC_ComponentsAGV_VehicleTimerAC extends Activity {
  constructor(name, component = null, inputPorts = [], delegates = [], opts = {}) {
    super(name, component, inputPorts, delegates, {
      ...opts,
      inParameters: [{"name":"destination","type":"Pin","direction":"in"},{"name":"location","type":"Pin","direction":"in"},{"name":"cmd","type":"Pin","direction":"in"},{"name":"status","type":"Pin","direction":"in"}],
      outParameters: []
    });
  }
}

// Action class: SendStartMotorAN
class AN_ComponentsAGV_SendStartMotorAN extends Action {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [{"name":"move","type":"Pin","direction":"in"}],
      outParameters: [],
      delegates: [{"from":"SendStartMotorAN","to":"cmd"}],
      constraints: ["SendStartMotorEQ"],
      executableName: "SendStartMotorEX",
    });
  }
}

// Action class: SendCommandAN
class AN_ComponentsAGV_SendCommandAN extends Action {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [{"name":"move","type":"Pin","direction":"in"}],
      outParameters: [],
      delegates: [{"from":"SendCommandAN","to":"cmd"},{"from":"move","to":"move"}],
      constraints: ["SendCommandEQ"],
      executableName: "SendCommandEX",
    });
  }
}

// Action class: SendDestinationAN
class AN_ComponentsAGV_SendDestinationAN extends Action {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [{"name":"move","type":"Pin","direction":"in"}],
      outParameters: [],
      delegates: [{"from":"SendDestinationAN","to":"destination"},{"from":"move","to":"move"}],
      constraints: ["SendDestinationEQ"],
      executableName: "SendDestinationEX",
    });
  }
}

// Action class: NotifyAGVFromMotorAN
class AN_ComponentsAGV_NotifyAGVFromMotorAN extends Action {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [{"name":"statusMotor","type":"Pin","direction":"in"}],
      outParameters: [],
      delegates: [{"from":"NotifyAGVFromMotorAN","to":"outStatusMotor"},{"from":"statusMotor","to":"inStatusMotor"}],
      constraints: ["NotifyAGVFromMotorEQ"],
      executableName: "NotifyAGVFromMotorEX",
    });
  }
}

// Action class: NotifySupervisoryFromMotorAN
class AN_ComponentsAGV_NotifySupervisoryFromMotorAN extends Action {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [{"name":"statusMotor","type":"Pin","direction":"in"}],
      outParameters: [],
      delegates: [{"from":"NotifySupervisoryFromMotorAN","to":"ack"},{"from":"statusMotor","to":"statusMotor"}],
      constraints: ["NotifySupervisoryFromMotorEQ"],
      executableName: "NotifySupervisoryFromMotorEX",
    });
  }
}

// Action class: CompareStationsAN
class AN_ComponentsAGV_CompareStationsAN extends Action {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [{"name":"statusMotor","type":"Pin","direction":"in"},{"name":"destination","type":"Pin","direction":"in"},{"name":"location","type":"Pin","direction":"in"}],
      outParameters: [],
      delegates: [{"from":"CompareStationsAN","to":"result"},{"from":"location","to":"loc"},{"from":"destination","to":"dest"},{"from":"statusMotor","to":"statusMotor"}],
      constraints: ["CompareStationsEQ","NotificationMotorIsStartedEQ"],
      executableName: "CompareStationsEX",
    });
  }
}

// Action class: StopMotorAN
class AN_ComponentsAGV_StopMotorAN extends Action {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [{"name":"comparisonResult","type":"Pin","direction":"in"}],
      outParameters: [],
      delegates: [{"from":"comparisonResult","to":"result"},{"from":"StopMotorAN","to":"cmd"}],
      constraints: ["StopMotorEQ"],
      executableName: "StopMotorEX",
    });
  }
}

// Action class: PassedMotorAN
class AN_ComponentsAGV_PassedMotorAN extends Action {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [{"name":"comparisonResult","type":"Pin","direction":"in"}],
      outParameters: [],
      delegates: [{"from":"PassedMotorAN","to":"ack"},{"from":"comparisonResult","to":"result"}],
      constraints: ["PassedMotorEQ"],
      executableName: "PassedMotorEX",
    });
  }
}

// Action class: SendCurrentLocationAN
class AN_ComponentsAGV_SendCurrentLocationAN extends Action {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [{"name":"location","type":"Pin","direction":"in"}],
      outParameters: [],
      delegates: [{"from":"location","to":"inLocation"},{"from":"SendCurrentLocationAN","to":"outLocation"}],
      constraints: ["SendCurrentLocationEQ"],
      executableName: "SendCurrentLocationEX",
    });
  }
}

// Action class: ControlArmAN
class AN_ComponentsAGV_ControlArmAN extends Action {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [{"name":"cmd","type":"Pin","direction":"in"},{"name":"statusMotor","type":"Pin","direction":"in"}],
      outParameters: [],
      delegates: [{"from":"ControlArmAN","to":"startArm"},{"from":"statusMotor","to":"statusMotor"},{"from":"cmd","to":"cmd"}],
      constraints: ["ControlArmEQ"],
      executableName: "ControlArmEX",
    });
  }
}

// Action class: NotifierArmAN
class AN_ComponentsAGV_NotifierArmAN extends Action {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [{"name":"statusArm","type":"Pin","direction":"in"}],
      outParameters: [],
      delegates: [{"from":"NotifierArmAN","to":"ack"}],
      constraints: ["NotifierArmEQ"],
      executableName: "NotifierArmEX",
    });
  }
}

// Action class: VehicleTimerAN
class AN_ComponentsAGV_VehicleTimerAN extends Action {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [{"name":"destination","type":"Pin","direction":"in"},{"name":"location","type":"Pin","direction":"in"},{"name":"cmd","type":"Pin","direction":"in"}],
      outParameters: [],
      delegates: [{"from":"VehicleTimerAN","to":"s"},{"from":"location","to":"loc"},{"from":"destination","to":"dest"},{"from":"cmd","to":"cmd"}],
      constraints: ["VehicleTimerEQ"],
      executableName: "VehicleTimerEX",
    });
  }
}

// Constraint class: SendStartMotorEQ
class CT_ComponentsAGV_SendStartMotorEQ extends Constraint {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      outParameters: [],
      equation: "(cmd == CommandToMotor.start)",
      constraintFunction: function(params) {// Constraint equation: (cmd == CommandToMotor.start)
          const { CommandToMotor, start } = params;
          
          // Type validation
          if (typeof CommandToMotor !== 'number') throw new Error('Parameter CommandToMotor must be a Real (number)');
          if (typeof start !== 'number') throw new Error('Parameter start must be a Real (number)');
          return cmd == CommandToMotor.start;
        }
    });
  }
}

// Constraint class: SendDestinationEQ
class CT_ComponentsAGV_SendDestinationEQ extends Constraint {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      outParameters: [],
      equation: "(destination == move.destination)",
      constraintFunction: function(params) {// Constraint equation: (destination == move.destination)
          const { move } = params;
          
          // Type validation
          if (typeof move !== 'number') throw new Error('Parameter move must be a Real (number)');
          return destination == move.destination;
        }
    });
  }
}

// Constraint class: NotifyAGVFromMotorEQ
class CT_ComponentsAGV_NotifyAGVFromMotorEQ extends Constraint {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      outParameters: [],
      equation: "(outStatusMotor == inStatusMotor)",
      constraintFunction: function(params) {// Constraint equation: (outStatusMotor == inStatusMotor)
          const { inStatusMotor } = params;
          
          // Type validation
          if (typeof inStatusMotor !== 'number') throw new Error('Parameter inStatusMotor must be a Real (number)');
          return outStatusMotor == inStatusMotor;
        }
    });
  }
}

// Constraint class: SendCommandEQ
class CT_ComponentsAGV_SendCommandEQ extends Constraint {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      outParameters: [],
      equation: "(cmd == move.command)",
      constraintFunction: function(params) {// Constraint equation: (cmd == move.command)
          const { move, command } = params;
          
          // Type validation
          if (typeof move !== 'number') throw new Error('Parameter move must be a Real (number)');
          if (typeof command !== 'number') throw new Error('Parameter command must be a Real (number)');
          return cmd == move.command;
        }
    });
  }
}

// Constraint class: NotifySupervisoryFromMotorEQ
class CT_ComponentsAGV_NotifySupervisoryFromMotorEQ extends Constraint {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      outParameters: [],
      equation: "((statusMotor == NotificationFromMotor.started) ? (ack == NotificationToSupervisory.departed) : (ack == NotificationToSupervisory.traveling))",
      constraintFunction: function(params) {// Conditional constraint: ((statusMotor == NotificationFromMotor.started) ? (ack == NotificationToSupervisory.departed) : (ack == NotificationToSupervisory.traveling))
          const { statusMotor, NotificationFromMotor, started, ack, NotificationToSupervisory, departed, traveling } = params;
          
          // Type validation
          if (typeof statusMotor !== 'number') throw new Error('Parameter statusMotor must be a Real (number)');
          if (typeof NotificationFromMotor !== 'number') throw new Error('Parameter NotificationFromMotor must be a Real (number)');
          if (typeof started !== 'number') throw new Error('Parameter started must be a Real (number)');
          if (typeof ack !== 'number') throw new Error('Parameter ack must be a Real (number)');
          if (typeof NotificationToSupervisory !== 'number') throw new Error('Parameter NotificationToSupervisory must be a Real (number)');
          if (typeof departed !== 'number') throw new Error('Parameter departed must be a Real (number)');
          if (typeof traveling !== 'number') throw new Error('Parameter traveling must be a Real (number)');
          return (statusMotor == NotificationFromMotor.started) ? (ack == NotificationToSupervisory.departed) : (ack == NotificationToSupervisory.traveling);
        }
    });
  }
}

// Constraint class: NotificationMotorIsStartedEQ
class CT_ComponentsAGV_NotificationMotorIsStartedEQ extends Constraint {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      outParameters: [],
      equation: "(statusMotor == NotificationFromMotor.started)",
      constraintFunction: function(params) {// Constraint equation: (statusMotor == NotificationFromMotor.started)
          const { NotificationFromMotor, started } = params;
          
          // Type validation
          if (typeof NotificationFromMotor !== 'number') throw new Error('Parameter NotificationFromMotor must be a Real (number)');
          if (typeof started !== 'number') throw new Error('Parameter started must be a Real (number)');
          return statusMotor == NotificationFromMotor.started;
        }
    });
  }
}

// Constraint class: CompareStationsEQ
class CT_ComponentsAGV_CompareStationsEQ extends Constraint {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      outParameters: [],
      equation: "((dest == loc) ? (result == true) : (result == false))",
      constraintFunction: function(params) {// Conditional constraint: ((dest == loc) ? (result == true) : (result == false))
          const { dest, loc, result } = params;
          
          // Type validation
          if (typeof dest !== 'number') throw new Error('Parameter dest must be a Real (number)');
          if (typeof loc !== 'number') throw new Error('Parameter loc must be a Real (number)');
          if (typeof result !== 'number') throw new Error('Parameter result must be a Real (number)');
          return (dest == loc) ? (result == true) : (result == false);
        }
    });
  }
}

// Constraint class: StopMotorEQ
class CT_ComponentsAGV_StopMotorEQ extends Constraint {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      outParameters: [],
      equation: "((result == true) ? (cmd == CommandToMotor.stop) : (cmd == SysADL.types.Void))",
      constraintFunction: function(params) {// Conditional constraint: ((result == true) ? (cmd == CommandToMotor.stop) : (cmd == SysADL.types.Void))
          const { result, cmd, CommandToMotor, stop, SysADL, Void } = params;
          
          // Type validation
          if (typeof result !== 'number') throw new Error('Parameter result must be a Real (number)');
          if (typeof cmd !== 'number') throw new Error('Parameter cmd must be a Real (number)');
          if (typeof CommandToMotor !== 'number') throw new Error('Parameter CommandToMotor must be a Real (number)');
          if (typeof stop !== 'number') throw new Error('Parameter stop must be a Real (number)');
          if (typeof SysADL !== 'number') throw new Error('Parameter SysADL must be a Real (number)');
          if (typeof Void !== 'number') throw new Error('Parameter Void must be a Real (number)');
          return (result == true) ? (cmd == CommandToMotor.stop) : (cmd == SysADL.types.Void);
        }
    });
  }
}

// Constraint class: PassedMotorEQ
class CT_ComponentsAGV_PassedMotorEQ extends Constraint {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      outParameters: [],
      equation: "((result == false) ? (ack == NotificationToSupervisory.passed) : (ack == SysADL.types.Void))",
      constraintFunction: function(params) {// Conditional constraint: ((result == false) ? (ack == NotificationToSupervisory.passed) : (ack == SysADL.types.Void))
          const { result, ack, NotificationToSupervisory, passed, SysADL, Void } = params;
          
          // Type validation
          if (typeof result !== 'number') throw new Error('Parameter result must be a Real (number)');
          if (typeof ack !== 'number') throw new Error('Parameter ack must be a Real (number)');
          if (typeof NotificationToSupervisory !== 'number') throw new Error('Parameter NotificationToSupervisory must be a Real (number)');
          if (typeof passed !== 'number') throw new Error('Parameter passed must be a Real (number)');
          if (typeof SysADL !== 'number') throw new Error('Parameter SysADL must be a Real (number)');
          if (typeof Void !== 'number') throw new Error('Parameter Void must be a Real (number)');
          return (result == false) ? (ack == NotificationToSupervisory.passed) : (ack == SysADL.types.Void);
        }
    });
  }
}

// Constraint class: SendCurrentLocationEQ
class CT_ComponentsAGV_SendCurrentLocationEQ extends Constraint {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      outParameters: [],
      equation: "(outLocation == inLocation)",
      constraintFunction: function(params) {// Constraint equation: (outLocation == inLocation)
          const { inLocation } = params;
          
          // Type validation
          if (typeof inLocation !== 'number') throw new Error('Parameter inLocation must be a Real (number)');
          return outLocation == inLocation;
        }
    });
  }
}

// Constraint class: ControlArmEQ
class CT_ComponentsAGV_ControlArmEQ extends Constraint {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      outParameters: [],
      equation: "((statusMotor == NotificationFromMotor.stopped) ? (startArm == cmd) : (startArm == CommandToArm.idle))",
      constraintFunction: function(params) {// Conditional constraint: ((statusMotor == NotificationFromMotor.stopped) ? (startArm == cmd) : (startArm == CommandToArm.idle))
          const { statusMotor, NotificationFromMotor, stopped, startArm, cmd, CommandToArm, idle } = params;
          
          // Type validation
          if (typeof statusMotor !== 'number') throw new Error('Parameter statusMotor must be a Real (number)');
          if (typeof NotificationFromMotor !== 'number') throw new Error('Parameter NotificationFromMotor must be a Real (number)');
          if (typeof stopped !== 'number') throw new Error('Parameter stopped must be a Real (number)');
          if (typeof startArm !== 'number') throw new Error('Parameter startArm must be a Real (number)');
          if (typeof cmd !== 'number') throw new Error('Parameter cmd must be a Real (number)');
          if (typeof CommandToArm !== 'number') throw new Error('Parameter CommandToArm must be a Real (number)');
          if (typeof idle !== 'number') throw new Error('Parameter idle must be a Real (number)');
          return (statusMotor == NotificationFromMotor.stopped) ? (startArm == cmd) : (startArm == CommandToArm.idle);
        }
    });
  }
}

// Constraint class: NotifierArmEQ
class CT_ComponentsAGV_NotifierArmEQ extends Constraint {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      outParameters: [],
      equation: "(ack == NotificationToSupervisory.arrived)",
      constraintFunction: function(params) {// Constraint equation: (ack == NotificationToSupervisory.arrived)
          const { NotificationToSupervisory, arrived } = params;
          
          // Type validation
          if (typeof NotificationToSupervisory !== 'number') throw new Error('Parameter NotificationToSupervisory must be a Real (number)');
          if (typeof arrived !== 'number') throw new Error('Parameter arrived must be a Real (number)');
          return ack == NotificationToSupervisory.arrived;
        }
    });
  }
}

// Constraint class: VehicleTimerEQ
class CT_ComponentsAGV_VehicleTimerEQ extends Constraint {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      outParameters: [],
      equation: "(((s.destination == dest) && (s.location == loc)) && (s.command == cmd))",
      constraintFunction: function(params) {// Executable expression: (((s.destination == dest) && (s.location == loc)) && (s.command == cmd))
          const {  } = params;
          
          return (((s.destination == dest) && (s.location == loc)) && (s.command == cmd));
        }
    });
  }
}

// Executable class: SendStartMotorEX
class EX_ComponentsAGV_SendStartMotorEX extends Executable {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      body: "executable def SendStartMotorEX ( in move : VehicleData) : out CommandToMotor {\n\t\treturn CommandToMotor::start;\n\t}",
      executableFunction: function(params) {
          // Type validation
          // Type validation for move: (auto-detected from usage)
          const { move } = params;
          return CommandToMotor.start;
        }
    });
  }
}

// Executable class: SendCommandEX
class EX_ComponentsAGV_SendCommandEX extends Executable {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      body: "executable def SendCommandEX ( in move : VehicleData) : out CommandToArm {\n\t\treturn move->command;\n\t}",
      executableFunction: function(params) {
          // Type validation
          // Type validation for move: (auto-detected from usage)
          const { move } = params;
          return move.command;
        }
    });
  }
}

// Executable class: SendDestinationEX
class EX_ComponentsAGV_SendDestinationEX extends Executable {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      body: "executable def SendDestinationEX ( in move : VehicleData) : out Location {\n\t\treturn move->destination;\n\t}",
      executableFunction: function(params) {
          // Type validation
          // Type validation for move: (auto-detected from usage)
          const { move } = params;
          return move.destination;
        }
    });
  }
}

// Executable class: NotifyAGVFromMotorEX
class EX_ComponentsAGV_NotifyAGVFromMotorEX extends Executable {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      body: "executable def NotifyAGVFromMotorEX ( in statusMotor : NotificationFromMotor) : \n\tout NotificationFromMotor{\n\t\treturn statusMotor;\n\t}",
      executableFunction: function(params) {
          // Type validation
          // Type validation for statusMotor: (auto-detected from usage)
          const { statusMotor } = params;
          return statusMotor;
        }
    });
  }
}

// Executable class: NotifySupervisoryFromMotorEX
class EX_ComponentsAGV_NotifySupervisoryFromMotorEX extends Executable {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      body: "executable def NotifySupervisoryFromMotorEX ( in statusMotor : NotificationFromMotor) : \n\t\tout\tNotificationToSupervisory {\n\t\tif (statusMotor == NotificationFromMotor::started) \n\t\t\treturn NotificationToSupervisory::departed;\n\t\telse\n\t\t\treturn NotificationToSupervisory::traveling;\n\t}",
      executableFunction: function(params) {
          // Type validation
          // Type validation for statusMotor: (auto-detected from usage)
          const { statusMotor } = params;
          if (statusMotor == NotificationFromMotor.started) {
          return NotificationToSupervisory.departed;
        } else {
          return NotificationToSupervisory.traveling;
        }
        }
    });
  }
}

// Executable class: CompareStationsEX
class EX_ComponentsAGV_CompareStationsEX extends Executable {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      body: "executable def CompareStationsEX ( in destination : Location, in location : Location, \n\t\tin statusMotor : NotificationFromMotor) : \tout Boolean {\n\t\tif(statusMotor == NotificationFromMotor::started && destination == location)\n\t\t\treturn true;\n\t\telse\n\t\t\treturn false;\n\t}",
      executableFunction: function(params) {

          const { destination, location, statusMotor } = params;
          if(statusMotor == NotificationFromMotor.started && destination == location) {
          return true;
        } else {
          return false;
        }
        }
    });
  }
}

// Executable class: StopMotorEX
class EX_ComponentsAGV_StopMotorEX extends Executable {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      body: "executable def StopMotorEX ( in comparisonResult : Boolean) :\n\tout CommandToMotor {\n\t\tif(comparisonResult == true)\n\t\t\treturn CommandToMotor::stop;\n\t\telse\n\t\t\treturn null;\n\t}",
      executableFunction: function(params) {

          const { comparisonResult } = params;
          if(comparisonResult == true) {
          return CommandToMotor.stop;
        } else {
          return null;
        }
        }
    });
  }
}

// Executable class: PassedMotorEX
class EX_ComponentsAGV_PassedMotorEX extends Executable {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      body: "executable def PassedMotorEX ( in comparisonResult : Boolean) :\n\tout NotificationToSupervisory {\n\t\tif(comparisonResult == false)\n\t\t\treturn NotificationToSupervisory::passed;\n\t\telse\n\t\t\treturn null;\n\t}",
      executableFunction: function(params) {

          const { comparisonResult } = params;
          if(comparisonResult == false) {
          return NotificationToSupervisory.passed;
        } else {
          return null;
        }
        }
    });
  }
}

// Executable class: SendCurrentLocationEX
class EX_ComponentsAGV_SendCurrentLocationEX extends Executable {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      body: "executable def SendCurrentLocationEX ( in location : Location)\n\t: out Location {\n\t\treturn location;\n\t}",
      executableFunction: function(params) {

          const { location } = params;
          return location;
        }
    });
  }
}

// Executable class: ControlArmEX
class EX_ComponentsAGV_ControlArmEX extends Executable {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      body: "executable def ControlArmEX ( in statusMotor : NotificationFromMotor, in cmd : CommandToArm) : out CommandToArm {\n\t\tif(statusMotor == NotificationFromMotor::stopped)\n\t\t\treturn cmd;\n\t\telse\n\t\t\treturn CommandToArm::idle;\n\t}",
      executableFunction: function(params) {
 
          const { statusMotor, cmd } = params;
          if(statusMotor == NotificationFromMotor.stopped) {
          return cmd;
        } else {
          return CommandToArm.idle;
        }
        }
    });
  }
}

// Executable class: NotifierArmEX
class EX_ComponentsAGV_NotifierArmEX extends Executable {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      body: "executable def NotifierArmEX ( in statusArm : NotificationFromArm) : \n\tout\tNotificationToSupervisory {\n\t\treturn NotificationToSupervisory::arrived;\n\t}",
      executableFunction: function(params) {

          const { statusArm } = params;
          return NotificationToSupervisory.arrived;
        }
    });
  }
}

// Executable class: VehicleTimerEX
class EX_ComponentsAGV_VehicleTimerEX extends Executable {
  constructor(name, opts = {}) {
    super(name, {
      ...opts,
      inParameters: [],
      body: "executable def VehicleTimerEX ( in location : Location, in cmd : CommandToArm, \n\t\tin destination : Location) : out Status {\n\t\t\n\t\tlet s : Status;\n\t\ts->destination = destination;\n\t\ts->location = location;\n\t\ts->command = cmd;\n\t\t\n\t\treturn s;\n\t}",
      executableFunction: function(params) {

          const { location, cmd, destination } = params;
          let s;
		s.destination = destination;
		s.location = location;
		s.command = cmd;
		
		return s;
        }
    });
  }
}

// ===== End Behavioral Element Classes =====

class SysADLArchitecture extends Model {
  constructor(){
    super("SysADLArchitecture");
    this.FactoryAutomationSystem = new CP_ComponentsAGV_FactoryAutomationSystem("FactoryAutomationSystem", { sysadlDefinition: "FactoryAutomationSystem" });
    this.addComponent(this.FactoryAutomationSystem);
    this.FactoryAutomationSystem.agvs = new CP_ComponentsAGV_AGVSystem("agvs", { sysadlDefinition: "AGVSystem" });
    this.FactoryAutomationSystem.addComponent(this.FactoryAutomationSystem.agvs);
    this.FactoryAutomationSystem.ds = new CP_ComponentsAGV_DisplaySystem("ds", { isBoundary: true, sysadlDefinition: "DisplaySystem" });
    this.FactoryAutomationSystem.addComponent(this.FactoryAutomationSystem.ds);
    this.FactoryAutomationSystem.ss = new CP_ComponentsAGV_SupervisorySystem("ss", { isBoundary: true, sysadlDefinition: "SupervisorySystem" });
    this.FactoryAutomationSystem.addComponent(this.FactoryAutomationSystem.ss);
    this.FactoryAutomationSystem.agvs.as = new CP_ComponentsAGV_ArrivalSensor("as", { isBoundary: true, sysadlDefinition: "ArrivalSensor" });
    this.FactoryAutomationSystem.agvs.addComponent(this.FactoryAutomationSystem.agvs.as);
    this.FactoryAutomationSystem.agvs.m = new CP_ComponentsAGV_Motor("m", { isBoundary: true, sysadlDefinition: "Motor" });
    this.FactoryAutomationSystem.agvs.addComponent(this.FactoryAutomationSystem.agvs.m);
    this.FactoryAutomationSystem.agvs.ra = new CP_ComponentsAGV_RobotArm("ra", { isBoundary: true, sysadlDefinition: "RobotArm" });
    this.FactoryAutomationSystem.agvs.addComponent(this.FactoryAutomationSystem.agvs.ra);
    this.FactoryAutomationSystem.agvs.vc = new CP_ComponentsAGV_VehicleControl("vc", { sysadlDefinition: "VehicleControl" });
    this.FactoryAutomationSystem.agvs.addComponent(this.FactoryAutomationSystem.agvs.vc);
    this.FactoryAutomationSystem.agvs.vc.ca = new CP_ComponentsAGV_ControlArm("ca", { sysadlDefinition: "ControlArm" });
    this.FactoryAutomationSystem.agvs.vc.addComponent(this.FactoryAutomationSystem.agvs.vc.ca);
    this.FactoryAutomationSystem.agvs.vc.cs = new CP_ComponentsAGV_CheckStation("cs", { sysadlDefinition: "CheckStation" });
    this.FactoryAutomationSystem.agvs.vc.addComponent(this.FactoryAutomationSystem.agvs.vc.cs);
    this.FactoryAutomationSystem.agvs.vc.na = new CP_ComponentsAGV_NotifierArm("na", { sysadlDefinition: "NotifierArm" });
    this.FactoryAutomationSystem.agvs.vc.addComponent(this.FactoryAutomationSystem.agvs.vc.na);
    this.FactoryAutomationSystem.agvs.vc.nm = new CP_ComponentsAGV_NotifierMotor("nm", { sysadlDefinition: "NotifierMotor" });
    this.FactoryAutomationSystem.agvs.vc.addComponent(this.FactoryAutomationSystem.agvs.vc.nm);
    this.FactoryAutomationSystem.agvs.vc.sm = new CP_ComponentsAGV_StartMoving("sm", { sysadlDefinition: "StartMoving" });
    this.FactoryAutomationSystem.agvs.vc.addComponent(this.FactoryAutomationSystem.agvs.vc.sm);
    this.FactoryAutomationSystem.agvs.vc.vt = new CP_ComponentsAGV_VehicleTimer("vt", { sysadlDefinition: "VehicleTimer" });
    this.FactoryAutomationSystem.agvs.vc.addComponent(this.FactoryAutomationSystem.agvs.vc.vt);

    this.FactoryAutomationSystem.agvs.addConnector(new CN_ConnectorsAGV_locationVehicle("arrived"));
    const arrived = this.FactoryAutomationSystem.agvs.connectors["arrived"];
    arrived.bind(this.FactoryAutomationSystem.getPort("arrivalDetected_out"), this.FactoryAutomationSystem.getPort("arrivalDetected_in"));
    this.FactoryAutomationSystem.agvs.addConnector(new CN_ConnectorsAGV_notificationArm("ackArm"));
    const ackArm = this.FactoryAutomationSystem.agvs.connectors["ackArm"];
    ackArm.bind(this.FactoryAutomationSystem.agvs.ra.getPort("started"), this.FactoryAutomationSystem.agvs.vc.getPort("startedArm"));
    this.FactoryAutomationSystem.agvs.addConnector(new CN_ConnectorsAGV_commandArm("cmdArm"));
    const cmdArm = this.FactoryAutomationSystem.agvs.connectors["cmdArm"];
    cmdArm.bind(this.FactoryAutomationSystem.agvs.vc.getPort("startArm"), this.FactoryAutomationSystem.agvs.ra.getPort("start"));
    this.FactoryAutomationSystem.agvs.addConnector(new CN_ConnectorsAGV_notificationMotor("ackMotor"));
    const ackMotor = this.FactoryAutomationSystem.agvs.connectors["ackMotor"];
    ackMotor.bind(this.FactoryAutomationSystem.getPort("started_stopped_out"), this.FactoryAutomationSystem.getPort("started_stopped_in"));
    this.FactoryAutomationSystem.agvs.addConnector(new CN_ConnectorsAGV_commandMotor("cmdMotor"));
    const cmdMotor = this.FactoryAutomationSystem.agvs.connectors["cmdMotor"];
    cmdMotor.bind(this.FactoryAutomationSystem.getPort("start_stop_out"), this.FactoryAutomationSystem.getPort("start_stop_in"));
    this.FactoryAutomationSystem.agvs.vc.addConnector(new CN_ConnectorsAGV_locationVehicle("destinationStation2"));
    const destinationStation2 = this.FactoryAutomationSystem.agvs.vc.connectors["destinationStation2"];
    destinationStation2.bind(this.FactoryAutomationSystem.agvs.vc.cs.getPort("destination"), this.FactoryAutomationSystem.agvs.getPort("destination_vt"));
    this.FactoryAutomationSystem.agvs.vc.addConnector(new CN_ConnectorsAGV_locationVehicle("destinationStation"));
    const destinationStation = this.FactoryAutomationSystem.agvs.vc.connectors["destinationStation"];
    destinationStation.bind(this.FactoryAutomationSystem.agvs.vc.cs.getPort("destination"), this.FactoryAutomationSystem.agvs.getPort("destination_cs"));
    this.FactoryAutomationSystem.agvs.vc.addConnector(new CN_ConnectorsAGV_commandArm("command"));
    const command = this.FactoryAutomationSystem.agvs.vc.connectors["command"];
    command.bind(this.FactoryAutomationSystem.agvs.getPort("cmd_sm"), this.FactoryAutomationSystem.agvs.vc.ca.getPort("cmd"));
    this.FactoryAutomationSystem.agvs.vc.addConnector(new CN_ConnectorsAGV_commandArm("command2"));
    const command2 = this.FactoryAutomationSystem.agvs.vc.connectors["command2"];
    command2.bind(this.FactoryAutomationSystem.agvs.getPort("cmd_sm"), this.FactoryAutomationSystem.agvs.getPort("cmd_ca"));
    this.FactoryAutomationSystem.agvs.vc.addConnector(new CN_ConnectorsAGV_locationVehicle("currentLocation"));
    const currentLocation = this.FactoryAutomationSystem.agvs.vc.connectors["currentLocation"];
    currentLocation.bind(this.FactoryAutomationSystem.agvs.getPort("location_cs"), this.FactoryAutomationSystem.agvs.getPort("location_vt"));
    this.FactoryAutomationSystem.agvs.vc.addConnector(new CN_ConnectorsAGV_notificationMotor("sendNotificationMotor"));
    const sendNotificationMotor = this.FactoryAutomationSystem.agvs.vc.connectors["sendNotificationMotor"];
    sendNotificationMotor.bind(this.FactoryAutomationSystem.agvs.vc.nm.getPort("outAck"), this.FactoryAutomationSystem.agvs.getPort("ack_ca"));
    this.FactoryAutomationSystem.agvs.vc.addConnector(new CN_ConnectorsAGV_notificationMotor("sendNotificationMotor2"));
    const sendNotificationMotor2 = this.FactoryAutomationSystem.agvs.vc.connectors["sendNotificationMotor2"];
    sendNotificationMotor2.bind(this.FactoryAutomationSystem.agvs.vc.nm.getPort("outAck"), this.FactoryAutomationSystem.agvs.getPort("ack_cs"));
    this.FactoryAutomationSystem.addConnector(new CN_ConnectorsAGV_interactionAGVAndSupervisory("dataExchange"));
    const dataExchange = this.FactoryAutomationSystem.connectors["dataExchange"];
    dataExchange.bind(this.getPort("in_outDataS"), this.getPort("in_outDataAgv"));
    this.FactoryAutomationSystem.addConnector(new CN_ComponentsAGV_status("updateStatus"));
    const updateStatus = this.FactoryAutomationSystem.connectors["updateStatus"];
    updateStatus.bind(this.FactoryAutomationSystem.agvs.getPort("sendStatus"), this.FactoryAutomationSystem.ds.getPort("receiveStatus"));

    const ac_StartMoving = new AC_ComponentsAGV_StartMovingAC(
      "StartMovingAC",
      "StartMoving",
      [],
      [{"from":"destination","to":"sc"},{"from":"cmd","to":"sd"},{"from":"start","to":"ssm"},{"from":"move","to":"moveSD"},{"from":"move","to":"moveSC"},{"from":"move","to":"moveSSM"}]
    );
    const ssm = new AN_ComponentsAGV_SendStartMotorAN("ssm");
    ac_StartMoving.registerAction(ssm);
    const sc = new AN_ComponentsAGV_SendCommandAN("sc");
    ac_StartMoving.registerAction(sc);
    const sd = new AN_ComponentsAGV_SendDestinationAN("sd");
    ac_StartMoving.registerAction(sd);
    this.registerActivity("StartMovingAC", ac_StartMoving);
    const ac_NotifierMotor = new AC_ComponentsAGV_NotifierMotorAC(
      "NotifierMotorAC",
      "NotifierMotor",
      [],
      [{"from":"outStatusMotor","to":"nagvm"},{"from":"ack","to":"nsm"},{"from":"inStatusMotor","to":"statusMotor"},{"from":"inStatusMotor","to":"statusMotor"}]
    );
    const nagvm = new AN_ComponentsAGV_NotifyAGVFromMotorAN("nagvm");
    ac_NotifierMotor.registerAction(nagvm);
    const nsm = new AN_ComponentsAGV_NotifySupervisoryFromMotorAN("nsm");
    ac_NotifierMotor.registerAction(nsm);
    this.registerActivity("NotifierMotorAC", ac_NotifierMotor);
    const ac_CheckStation = new AC_ComponentsAGV_CheckStationAC(
      "CheckStationAC",
      "CheckStation",
      [],
      [{"from":"statusMotor","to":"NotificationsMotor"},{"from":"destination","to":"Destinations"},{"from":"inLocation","to":"location"},{"from":"outLocation","to":"scl"},{"from":"inLocation","to":"location"},{"from":"stopMotor","to":"sm"},{"from":"passed","to":"pm"}]
    );
    const cs = new AN_ComponentsAGV_CompareStationsAN("cs");
    ac_CheckStation.registerAction(cs);
    const sm = new AN_ComponentsAGV_StopMotorAN("sm");
    ac_CheckStation.registerAction(sm);
    const pm = new AN_ComponentsAGV_PassedMotorAN("pm");
    ac_CheckStation.registerAction(pm);
    const scl = new AN_ComponentsAGV_SendCurrentLocationAN("scl");
    ac_CheckStation.registerAction(scl);
    this.registerActivity("CheckStationAC", ac_CheckStation);
    const ac_ControlArm = new AC_ComponentsAGV_ControlArmAC(
      "ControlArmAC",
      "ControlArm",
      [],
      [{"from":"startArm","to":"ca"},{"from":"cmd","to":"cmd"},{"from":"statusMotor","to":"statusMotor"}]
    );
    const ca = new AN_ComponentsAGV_ControlArmAN("ca");
    ac_ControlArm.registerAction(ca);
    this.registerActivity("ControlArmAC", ac_ControlArm);
    const ac_NotifierArm = new AC_ComponentsAGV_NotifierArmAC(
      "NotifierArmAC",
      "NotifierArm",
      [],
      [{"from":"ack","to":"na"},{"from":"statusArm","to":"statusArm"}]
    );
    const na = new AN_ComponentsAGV_NotifierArmAN("na");
    ac_NotifierArm.registerAction(na);
    this.registerActivity("NotifierArmAC", ac_NotifierArm);
    const ac_VehicleTimer = new AC_ComponentsAGV_VehicleTimerAC(
      "VehicleTimerAC",
      "VehicleTimer",
      [],
      [{"from":"status","to":"vt"},{"from":"cmd","to":"cmd"},{"from":"destination","to":"destination"},{"from":"location","to":"location"}]
    );
    const vt = new AN_ComponentsAGV_VehicleTimerAN("vt");
    ac_VehicleTimer.registerAction(vt);
    this.registerActivity("VehicleTimerAC", ac_VehicleTimer);
  }

}

function createModel(){ 
  const model = new SysADLArchitecture();
  
  model.typeRegistry = {
    'NotificationToSupervisory': 'EN_NotificationToSupervisory',
    'NotificationFromArm': 'EN_NotificationFromArm',
    'CommandToArm': 'EN_CommandToArm',
    'NotificationFromMotor': 'EN_NotificationFromMotor',
    'CommandToMotor': 'EN_CommandToMotor',
  };
  
  // Module context for class resolution
  model._moduleContext = {
    PT_ComponentsAGV_inLocation,
    PT_ComponentsAGV_outLocation,
    PT_PortsAGV_inStatus,
    PT_PortsAGV_outStatus,
    PT_PortsAGV_inVehicleData,
    PT_PortsAGV_outVehicleData,
    PT_PortsAGV_inNotificationFromMotor,
    PT_PortsAGV_outNotificationFromMotor,
    PT_PortsAGV_inCommandToMotor,
    PT_PortsAGV_outCommandToMotor,
    PT_PortsAGV_inNotificationFromArm,
    PT_PortsAGV_outNotificationFromArm,
    PT_PortsAGV_inCommandToArm,
    PT_PortsAGV_outCommandToArm,
    PT_PortsAGV_inNotificationToSupervisory,
    PT_PortsAGV_outNotificationToSupervisory,
    PT_PortsAGV_IAGVSystem,
    PT_PortsAGV_ISupervisorySystem,
    CN_ConnectorsAGV_notifySupervisory,
    CN_ConnectorsAGV_sendVehicleData,
    CN_ConnectorsAGV_notificationMotor,
    CN_ConnectorsAGV_commandArm,
    CN_ConnectorsAGV_notificationArm,
    CN_ConnectorsAGV_commandMotor,
    CN_ConnectorsAGV_interactionAGVAndSupervisory,
    CN_ConnectorsAGV_locationVehicle,
    CN_ComponentsAGV_status,
  };
  
  return model;
}

module.exports = { createModel, SysADLArchitecture, EN_NotificationToSupervisory, EN_NotificationFromArm, EN_CommandToArm, EN_NotificationFromMotor, EN_CommandToMotor, DT_Status, DT_Location, DT_VehicleData, PT_ComponentsAGV_inLocation, PT_ComponentsAGV_outLocation, PT_PortsAGV_inStatus, PT_PortsAGV_outStatus, PT_PortsAGV_inVehicleData, PT_PortsAGV_outVehicleData, PT_PortsAGV_inNotificationFromMotor, PT_PortsAGV_outNotificationFromMotor, PT_PortsAGV_inCommandToMotor, PT_PortsAGV_outCommandToMotor, PT_PortsAGV_inNotificationFromArm, PT_PortsAGV_outNotificationFromArm, PT_PortsAGV_inCommandToArm, PT_PortsAGV_outCommandToArm, PT_PortsAGV_inNotificationToSupervisory, PT_PortsAGV_outNotificationToSupervisory, PT_PortsAGV_IAGVSystem, PT_PortsAGV_ISupervisorySystem };