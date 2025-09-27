const { EnvironmentDefinition, EnvironmentConfiguration, Entity, Event, Scene, Scenario, ScenarioExecution, EventsDefinitions, SceneDefinitions, ScenarioDefinitions, Connection } = require('../sysadl-framework/SysADLBase');
const { TaskExecutor } = require('../sysadl-framework/TaskExecutor');
const { createModel } = require('./AGV-completo');

// Entity: Station
class Station extends Entity {
  constructor(name, opts = {}) {
    // Initialize default properties structure
    const defaultProperties = {};
    defaultProperties.ID = null; // Type: String
    
    // Merge with provided properties (EnvironmentConfiguration values)
    const mergedProperties = { ...defaultProperties, ...(opts.properties || {}) };
    
    super(name, {
      ...opts,
      entityType: 'Station',
      properties: mergedProperties,
      roles: ["signal"]
    });
    
  }
}

// Entity: PartX
class PartX extends Entity {
  constructor(name, opts = {}) {
    // Initialize default properties structure
    const defaultProperties = {};
    defaultProperties.ID = null; // Type: String
    defaultProperties.location = null; // Type: String
    
    // Merge with provided properties (EnvironmentConfiguration values)
    const mergedProperties = { ...defaultProperties, ...(opts.properties || {}) };
    
    super(name, {
      ...opts,
      entityType: 'PartX',
      properties: mergedProperties,
      roles: ["surface"]
    });
    
  }
}

// Entity: Lane
class Lane extends Entity {
  constructor(name, opts = {}) {
    const mergedProperties = opts.properties || {};
    
    super(name, {
      ...opts,
      entityType: 'Lane',
      properties: mergedProperties,
      roles: []
    });
    
    // Composition structure
    this.entities = {};
    this.entities.stations = []; // Array of Station
    this.entities.vehicles = []; // Array of Vehicle
    this.entities.partx = null; // PartX
    
  }
}

// Entity: Supervisory
class Supervisory extends Entity {
  constructor(name, opts = {}) {
    const mergedProperties = opts.properties || {};
    
    super(name, {
      ...opts,
      entityType: 'Supervisory',
      properties: mergedProperties,
      roles: ["inNotification","outCommand"]
    });
    
  }
}

// Entity: Vehicle
class Vehicle extends Entity {
  constructor(name, opts = {}) {
    // Initialize default properties structure
    const defaultProperties = {};
    defaultProperties.location = null; // Type: String
    
    // Merge with provided properties (EnvironmentConfiguration values)
    const mergedProperties = { ...defaultProperties, ...(opts.properties || {}) };
    
    super(name, {
      ...opts,
      entityType: 'Vehicle',
      properties: mergedProperties,
      roles: ["outNotification","inCommand","sensor","arm"]
    });
    
  }
}

// Connection: Notify
class Notify extends Connection {
  constructor(name = 'Notify', opts = {}) {
    super(name, {
      ...opts,
      connectionType: 'connection',
      from: 'Vehicle.outNotification',
      to: 'Supervisory.inNotification'
    });
  }
}

// Connection: Command
class Command extends Connection {
  constructor(name = 'Command', opts = {}) {
    super(name, {
      ...opts,
      connectionType: 'connection',
      from: 'Supervisory.outCommand',
      to: 'Vehicle.inCommand'
    });
  }
}

// Connection: Location
class Location extends Connection {
  constructor(name = 'Location', opts = {}) {
    super(name, {
      ...opts,
      connectionType: 'connection',
      from: 'Station.signal',
      to: 'Vehicle.sensor'
    });
  }
}

// Connection: Atach
class Atach extends Connection {
  constructor(name = 'Atach', opts = {}) {
    super(name, {
      ...opts,
      connectionType: 'connection',
      from: 'Vehicle.arm',
      to: 'PartX.surface'
    });
  }
}

// Connection: Detach
class Detach extends Connection {
  constructor(name = 'Detach', opts = {}) {
    super(name, {
      ...opts,
      connectionType: 'connection',
      from: 'Vehicle.arm',
      to: 'PartX.surface'
    });
  }
}

// Environment Definition: MyFactory
class MyFactory extends EnvironmentDefinition {
  constructor() {
    super('MyFactory');
    
    // Register entity classes for factory usage
    this.registerEntityClass('Station', Station);
    this.registerEntityClass('PartX', PartX);
    this.registerEntityClass('Lane', Lane);
    this.registerEntityClass('Supervisory', Supervisory);
    this.registerEntityClass('Vehicle', Vehicle);
    
    // Register connection classes for factory usage
    this.registerConnectionClass('Notify', Notify);
    this.registerConnectionClass('Command', Command);
    this.registerConnectionClass('Location', Location);
    this.registerConnectionClass('Atach', Atach);
    this.registerConnectionClass('Detach', Detach);
  }
}

// Environment Configuration: MyFactoryConfiguration
class MyFactoryConfiguration extends EnvironmentConfiguration {
  constructor() {
    const environmentDefinition = new MyFactory();
    super('MyFactoryConfiguration', { environmentDef: environmentDefinition });
    
    // Associations (role bindings)
    this.associations = {
      "Vehicle.outNotification": "agvs.in_outDataAgv.outNotifications",
      "Vehicle.inCommand": "agvs.in_outDataAgv.inMoveToStation",
      "Vehicle.sensor": "agvs.as.arrivalDetected",
      "Vehicle.arm": "agvs.ra.start",
      "Supervisory.inNotification": "ss.in_outDataS.inNotifications",
      "Supervisory.outCommand": "ss.in_outDataS.outMoveToStation"
    };
    
    // Entity instances
    this.agv1 = this.createEntity('Vehicle');
    this.agv2 = this.createEntity('Vehicle');
    this.stationA = this.createEntity('Station', { properties: {"ID":"StationA"} });
    this.stationB = this.createEntity('Station', { properties: {"ID":"StationB"} });
    this.stationC = this.createEntity('Station', { properties: {"ID":"StationC"} });
    this.stationD = this.createEntity('Station', { properties: {"ID":"StationD"} });
    this.stationE = this.createEntity('Station', { properties: {"ID":"StationE"} });
    this.supervisor = this.createEntity('Supervisory');
    this.part = this.createEntity('PartX');
    this.lane1 = this.createEntity('Lane');
    this.lane2 = this.createEntity('Lane');
    
    // Compositions
    this.lane1.entities.stations = [this.stationA, this.stationB, this.stationC];
    this.lane2.entities.stations = [this.stationC, this.stationD, this.stationE];
  }
}

// Events Definitions: MyEvents
class MyEvents extends EventsDefinitions {
  constructor(name = 'MyEvents', opts = {}) {
    super(name, {
      ...opts,
      targetConfiguration: 'MyFactoryConfiguration'
    });

    // Initialize TaskExecutor for hybrid execution
    this.taskExecutor = new TaskExecutor({});

    // SupervisoryEvents Event Definition
    this.SupervisoryEvents = {
      name: 'SupervisoryEvents',
      type: 'rule-based',
      target: 'supervisor',
      rules: [
        {
          trigger: 'cmdSupervisor',
          tasks: {
            cmdAGV2toC: (context) => {
              supervisor.outCommand.destination = 'stationC';
              supervisor.outCommand.armCommand = 'idle';
              // Connection: Command(supervisor, agv2)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Command', 'supervisor', 'agv2');
              }
              return true;
            },
            cmdAGV1toA: (context) => {
              supervisor.outCommand.destination = 'stationA';
              supervisor.outCommand.armCommand = 'idle';
              // Connection: Command(supervisor, agv1)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Command', 'supervisor', 'agv1');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing SupervisoryEvents: cmdSupervisor -> cmdAGV2toC, cmdAGV1toA');
            const results = [];
            const currentRule = this.SupervisoryEvents.rules.find(r => r.trigger === 'cmdSupervisor');
            results.push(currentRule.tasks.cmdAGV2toC(context));
            results.push(currentRule.tasks.cmdAGV1toA(context));
            return results;
          }
        },
        {
          trigger: 'AGV1NotifLoad',
          tasks: {
            cmdAGV1toC: (context) => {
              supervisor.outCommand.destination = 'stationA';
              supervisor.outCommand.armCommand = 'idle';
              // Connection: Command(supervisor, agv1)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Command', 'supervisor', 'agv1');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing SupervisoryEvents: AGV1NotifLoad -> cmdAGV1toC');
            const results = [];
            const currentRule = this.SupervisoryEvents.rules.find(r => r.trigger === 'AGV1NotifLoad');
            results.push(currentRule.tasks.cmdAGV1toC(context));
            return results;
          }
        },
        {
          trigger: 'AGV1NotifArriveA',
          tasks: {
            cmdAGV1loadA: (context) => {
              supervisor.outCommand.destination = 'stationA';
              supervisor.outCommand.armCommand = 'load';
              // Connection: Command(supervisor, agv1)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Command', 'supervisor', 'agv1');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing SupervisoryEvents: AGV1NotifArriveA -> cmdAGV1loadA');
            const results = [];
            const currentRule = this.SupervisoryEvents.rules.find(r => r.trigger === 'AGV1NotifArriveA');
            results.push(currentRule.tasks.cmdAGV1loadA(context));
            return results;
          }
        },
        {
          trigger: 'AGV1NotifArriveC',
          tasks: {
            cmdAGV1UnloadA: (context) => {
              supervisor.outCommand.destination = 'stationA';
              supervisor.outCommand.armCommand = 'unload';
              // Connection: Command(supervisor, agv1)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Command', 'supervisor', 'agv1');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing SupervisoryEvents: AGV1NotifArriveC -> cmdAGV1UnloadA');
            const results = [];
            const currentRule = this.SupervisoryEvents.rules.find(r => r.trigger === 'AGV1NotifArriveC');
            results.push(currentRule.tasks.cmdAGV1UnloadA(context));
            return results;
          }
        },
        {
          trigger: 'AGV1NotifArriveAUnoaded',
          tasks: {
            cmdAGV2loadC: (context) => {
              supervisor.outCommand.destination = 'stationC';
              supervisor.outCommand.armCommand = 'load';
              // Connection: Command(supervisor, agv2)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Command', 'supervisor', 'agv2');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing SupervisoryEvents: AGV1NotifArriveAUnoaded -> cmdAGV2loadC');
            const results = [];
            const currentRule = this.SupervisoryEvents.rules.find(r => r.trigger === 'AGV1NotifArriveAUnoaded');
            results.push(currentRule.tasks.cmdAGV2loadC(context));
            return results;
          }
        },
        {
          trigger: 'AGV2NotifLoad',
          tasks: {
            cmdAGV2toE: (context) => {
              supervisor.outCommand.destination = 'stationE';
              supervisor.outCommand.armCommand = 'idle';
              // Connection: Command(supervisor, agv2)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Command', 'supervisor', 'agv2');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing SupervisoryEvents: AGV2NotifLoad -> cmdAGV2toE');
            const results = [];
            const currentRule = this.SupervisoryEvents.rules.find(r => r.trigger === 'AGV2NotifLoad');
            results.push(currentRule.tasks.cmdAGV2toE(context));
            return results;
          }
        },
        {
          trigger: 'AGV2NotifArriveE',
          tasks: {
            cmdAGV2UnloadE: (context) => {
              supervisor.outCommand.destination = 'stationE';
              supervisor.outCommand.armCommand = 'unload';
              // Connection: Command(supervisor, agv2)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Command', 'supervisor', 'agv2');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing SupervisoryEvents: AGV2NotifArriveE -> cmdAGV2UnloadE');
            const results = [];
            const currentRule = this.SupervisoryEvents.rules.find(r => r.trigger === 'AGV2NotifArriveE');
            results.push(currentRule.tasks.cmdAGV2UnloadE(context));
            return results;
          }
        },
      ],
      hasRule: (triggerName) => {
        return this.SupervisoryEvents.rules.some(rule => rule.trigger === triggerName);
      },
      executeRule: (triggerName, context) => {
        const rule = this.SupervisoryEvents.rules.find(r => r.trigger === triggerName);
        return rule ? rule.execute(context) : null;
      }
    };

    // AGV1Events Event Definition
    this.AGV1Events = {
      name: 'AGV1Events',
      type: 'rule-based',
      target: 'agv1',
      rules: [
        {
          trigger: 'cmdAGV1toA',
          tasks: {
            AGV1NotifTravelA: (context) => {
              agv1.outNotification.notification = "traveling";
              // Connection: Notify(agv1, supervisor)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Notify', 'agv1', 'supervisor');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing AGV1Events: cmdAGV1toA -> AGV1NotifTravelA');
            const results = [];
            const currentRule = this.AGV1Events.rules.find(r => r.trigger === 'cmdAGV1toA');
            results.push(currentRule.tasks.AGV1NotifTravelA(context));
            return results;
          }
        },
        {
          trigger: 'AGV1locationStationB',
          tasks: {
            AGV1NotifPassB: (context) => {
              agv1.outNotification.notification = "passed";
              // Connection: Notify(agv1, supervisor)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Notify', 'agv1', 'supervisor');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing AGV1Events: AGV1locationStationB -> AGV1NotifPassB');
            const results = [];
            const currentRule = this.AGV1Events.rules.find(r => r.trigger === 'AGV1locationStationB');
            results.push(currentRule.tasks.AGV1NotifPassB(context));
            return results;
          }
        },
        {
          trigger: 'AGV1locationStationC',
          tasks: {
            AGV1NotifArriveC: (context) => {
              agv1.outNotification.notification = "arrived";
              // Connection: Notify(agv1, supervisor)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Notify', 'agv1', 'supervisor');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing AGV1Events: AGV1locationStationC -> AGV1NotifArriveC');
            const results = [];
            const currentRule = this.AGV1Events.rules.find(r => r.trigger === 'AGV1locationStationC');
            results.push(currentRule.tasks.AGV1NotifArriveC(context));
            return results;
          }
        },
        {
          trigger: 'AGV1locationStationA',
          tasks: {
            AGV1NotifArriveA: (context) => {
              agv1.outNotification.notification = "arrived";
              // Connection: Notify(agv1, supervisor)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Notify', 'agv1', 'supervisor');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing AGV1Events: AGV1locationStationA -> AGV1NotifArriveA');
            const results = [];
            const currentRule = this.AGV1Events.rules.find(r => r.trigger === 'AGV1locationStationA');
            results.push(currentRule.tasks.AGV1NotifArriveA(context));
            return results;
          }
        },
        {
          trigger: 'AGV1atachPartX',
          tasks: {
            AGV1NotifLoad: (context) => {
              agv1.outNotification.notification = "loaded";
              // Connection: Notify(agv1, supervisor)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Notify', 'agv1', 'supervisor');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing AGV1Events: AGV1atachPartX -> AGV1NotifLoad');
            const results = [];
            const currentRule = this.AGV1Events.rules.find(r => r.trigger === 'AGV1atachPartX');
            results.push(currentRule.tasks.AGV1NotifLoad(context));
            return results;
          }
        },
        {
          trigger: 'AGV1detachPartX',
          tasks: {
            AGV1NotifArriveAUnoaded: (context) => {
              agv1.outNotification.notification = "unloaded";
              // Connection: Notify(agv1, supervisor)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Notify', 'agv1', 'supervisor');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing AGV1Events: AGV1detachPartX -> AGV1NotifArriveAUnoaded');
            const results = [];
            const currentRule = this.AGV1Events.rules.find(r => r.trigger === 'AGV1detachPartX');
            results.push(currentRule.tasks.AGV1NotifArriveAUnoaded(context));
            return results;
          }
        },
      ],
      hasRule: (triggerName) => {
        return this.AGV1Events.rules.some(rule => rule.trigger === triggerName);
      },
      executeRule: (triggerName, context) => {
        const rule = this.AGV1Events.rules.find(r => r.trigger === triggerName);
        return rule ? rule.execute(context) : null;
      }
    };

    // AGV2Events Event Definition
    this.AGV2Events = {
      name: 'AGV2Events',
      type: 'rule-based',
      target: 'agv2',
      rules: [
        {
          trigger: 'cmdAGV2toC',
          tasks: {
            AGV2NotifTravelC: (context) => {
              agv2.outNotification.notification = "traveling";
              // Connection: Notify(agv2, supervisor)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Notify', 'agv2', 'supervisor');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing AGV2Events: cmdAGV2toC -> AGV2NotifTravelC');
            const results = [];
            const currentRule = this.AGV2Events.rules.find(r => r.trigger === 'cmdAGV2toC');
            results.push(currentRule.tasks.AGV2NotifTravelC(context));
            return results;
          }
        },
        {
          trigger: 'AGV2locationStationC',
          tasks: {
            AGV2NotifArriveC: (context) => {
              agv2.outNotification.notification = "arrived";
              // Connection: Notify(agv2, supervisor)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Notify', 'agv2', 'supervisor');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing AGV2Events: AGV2locationStationC -> AGV2NotifArriveC');
            const results = [];
            const currentRule = this.AGV2Events.rules.find(r => r.trigger === 'AGV2locationStationC');
            results.push(currentRule.tasks.AGV2NotifArriveC(context));
            return results;
          }
        },
        {
          trigger: 'AGV2atachPartX',
          tasks: {
            AGV2NotifLoad: (context) => {
              agv2.outNotification.notification = "loaded";
              // Connection: Notify(agv2, supervisor)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Notify', 'agv2', 'supervisor');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing AGV2Events: AGV2atachPartX -> AGV2NotifLoad');
            const results = [];
            const currentRule = this.AGV2Events.rules.find(r => r.trigger === 'AGV2atachPartX');
            results.push(currentRule.tasks.AGV2NotifLoad(context));
            return results;
          }
        },
        {
          trigger: 'AGV2locationStationD',
          tasks: {
            AGV2NotifPassD: (context) => {
              agv2.outNotification.notification = "passed";
              // Connection: Notify(agv2, supervisor)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Notify', 'agv2', 'supervisor');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing AGV2Events: AGV2locationStationD -> AGV2NotifPassD');
            const results = [];
            const currentRule = this.AGV2Events.rules.find(r => r.trigger === 'AGV2locationStationD');
            results.push(currentRule.tasks.AGV2NotifPassD(context));
            return results;
          }
        },
        {
          trigger: 'AGV2locationStationE',
          tasks: {
            AGV2NotifArriveE: (context) => {
              agv2.outNotification.notification = "arrived";
              // Connection: Notify(agv2, supervisor)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Notify', 'agv2', 'supervisor');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing AGV2Events: AGV2locationStationE -> AGV2NotifArriveE');
            const results = [];
            const currentRule = this.AGV2Events.rules.find(r => r.trigger === 'AGV2locationStationE');
            results.push(currentRule.tasks.AGV2NotifArriveE(context));
            return results;
          }
        },
        {
          trigger: 'AGV2detachPartX',
          tasks: {
            AGV2NotifArriveAUnoaded: (context) => {
              agv2.outNotification.notification = "unloaded";
              // Connection: Notify(agv2, supervisor)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Notify', 'agv2', 'supervisor');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing AGV2Events: AGV2detachPartX -> AGV2NotifArriveAUnoaded');
            const results = [];
            const currentRule = this.AGV2Events.rules.find(r => r.trigger === 'AGV2detachPartX');
            results.push(currentRule.tasks.AGV2NotifArriveAUnoaded(context));
            return results;
          }
        },
        {
          trigger: 'AGV2atStationD',
          tasks: {
            AGV2DetectedStationD: (context) => {
              agv2.sensor = 'stationD';
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing AGV2Events: AGV2atStationD -> AGV2DetectedStationD');
            const results = [];
            const currentRule = this.AGV2Events.rules.find(r => r.trigger === 'AGV2atStationD');
            results.push(currentRule.tasks.AGV2DetectedStationD(context));
            return results;
          }
        },
      ],
      hasRule: (triggerName) => {
        return this.AGV2Events.rules.some(rule => rule.trigger === triggerName);
      },
      executeRule: (triggerName, context) => {
        const rule = this.AGV2Events.rules.find(r => r.trigger === triggerName);
        return rule ? rule.execute(context) : null;
      }
    };

    // StationAEvents Event Definition
    this.StationAEvents = {
      name: 'StationAEvents',
      type: 'rule-based',
      target: 'stationA',
      rules: [
        {
          trigger: 'agv1.sensor',
          tasks: {
            AGV1locationStationA: (context) => {
              agv1.location = 'stationA.signal';
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing StationAEvents: agv1.sensor -> AGV1locationStationA');
            const results = [];
            const currentRule = this.StationAEvents.rules.find(r => r.trigger === 'agv1.sensor');
            results.push(currentRule.tasks.AGV1locationStationA(context));
            return results;
          }
        },
      ],
      hasRule: (triggerName) => {
        return this.StationAEvents.rules.some(rule => rule.trigger === triggerName);
      },
      executeRule: (triggerName, context) => {
        const rule = this.StationAEvents.rules.find(r => r.trigger === triggerName);
        return rule ? rule.execute(context) : null;
      }
    };

    // StationBEvents Event Definition
    this.StationBEvents = {
      name: 'StationBEvents',
      type: 'rule-based',
      target: 'stationB',
      rules: [
        {
          trigger: 'agv1.sensor',
          tasks: {
            AGV1locationStationB: (context) => {
              agv1.location = 'stationB.signal';
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing StationBEvents: agv1.sensor -> AGV1locationStationB');
            const results = [];
            const currentRule = this.StationBEvents.rules.find(r => r.trigger === 'agv1.sensor');
            results.push(currentRule.tasks.AGV1locationStationB(context));
            return results;
          }
        },
      ],
      hasRule: (triggerName) => {
        return this.StationBEvents.rules.some(rule => rule.trigger === triggerName);
      },
      executeRule: (triggerName, context) => {
        const rule = this.StationBEvents.rules.find(r => r.trigger === triggerName);
        return rule ? rule.execute(context) : null;
      }
    };

    // StationCEvents Event Definition
    this.StationCEvents = {
      name: 'StationCEvents',
      type: 'rule-based',
      target: 'stationC',
      rules: [
        {
          trigger: 'agv1.sensor',
          tasks: {
            AGV1locationStationC: (context) => {
              agv1.location = 'stationC.signal';
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing StationCEvents: agv1.sensor -> AGV1locationStationC');
            const results = [];
            const currentRule = this.StationCEvents.rules.find(r => r.trigger === 'agv1.sensor');
            results.push(currentRule.tasks.AGV1locationStationC(context));
            return results;
          }
        },
        {
          trigger: 'agv2.sensor',
          tasks: {
            AGV2locationStationC: (context) => {
              agv2.location = 'stationC.signal';
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing StationCEvents: agv2.sensor -> AGV2locationStationC');
            const results = [];
            const currentRule = this.StationCEvents.rules.find(r => r.trigger === 'agv2.sensor');
            results.push(currentRule.tasks.AGV2locationStationC(context));
            return results;
          }
        },
      ],
      hasRule: (triggerName) => {
        return this.StationCEvents.rules.some(rule => rule.trigger === triggerName);
      },
      executeRule: (triggerName, context) => {
        const rule = this.StationCEvents.rules.find(r => r.trigger === triggerName);
        return rule ? rule.execute(context) : null;
      }
    };

    // StationDEvents Event Definition
    this.StationDEvents = {
      name: 'StationDEvents',
      type: 'rule-based',
      target: 'stationD',
      rules: [
        {
          trigger: 'agv2.sensor',
          tasks: {
            AGV2locationStationD: (context) => {
              agv2.location = 'stationD.signal';
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing StationDEvents: agv2.sensor -> AGV2locationStationD');
            const results = [];
            const currentRule = this.StationDEvents.rules.find(r => r.trigger === 'agv2.sensor');
            results.push(currentRule.tasks.AGV2locationStationD(context));
            return results;
          }
        },
        {
          trigger: 'SetAGV2SensorStationD',
          tasks: {
            UpdateAGV2SensorToD: (context) => {
              agv2.sensor = 'stationD';
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing StationDEvents: SetAGV2SensorStationD -> UpdateAGV2SensorToD');
            const results = [];
            const currentRule = this.StationDEvents.rules.find(r => r.trigger === 'SetAGV2SensorStationD');
            results.push(currentRule.tasks.UpdateAGV2SensorToD(context));
            return results;
          }
        },
      ],
      hasRule: (triggerName) => {
        return this.StationDEvents.rules.some(rule => rule.trigger === triggerName);
      },
      executeRule: (triggerName, context) => {
        const rule = this.StationDEvents.rules.find(r => r.trigger === triggerName);
        return rule ? rule.execute(context) : null;
      }
    };

    // StationEEvents Event Definition
    this.StationEEvents = {
      name: 'StationEEvents',
      type: 'rule-based',
      target: 'stationE',
      rules: [
        {
          trigger: 'agv2.sensor',
          tasks: {
            agv2locationStationE: (context) => {
              agv2.location = 'stationE.signal';
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing StationEEvents: agv2.sensor -> agv2locationStationE');
            const results = [];
            const currentRule = this.StationEEvents.rules.find(r => r.trigger === 'agv2.sensor');
            results.push(currentRule.tasks.agv2locationStationE(context));
            return results;
          }
        },
      ],
      hasRule: (triggerName) => {
        return this.StationEEvents.rules.some(rule => rule.trigger === triggerName);
      },
      executeRule: (triggerName, context) => {
        const rule = this.StationEEvents.rules.find(r => r.trigger === triggerName);
        return rule ? rule.execute(context) : null;
      }
    };

    // PartXEvents Event Definition
    this.PartXEvents = {
      name: 'PartXEvents',
      type: 'rule-based',
      target: 'part',
      rules: [
        {
          trigger: 'cmdAGV1loadA',
          tasks: {
            AGV1atachPartX: (context) => {
              // Connection: Atach(agv1, part)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Atach', 'agv1', 'part');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing PartXEvents: cmdAGV1loadA -> AGV1atachPartX');
            const results = [];
            const currentRule = this.PartXEvents.rules.find(r => r.trigger === 'cmdAGV1loadA');
            results.push(currentRule.tasks.AGV1atachPartX(context));
            return results;
          }
        },
        {
          trigger: 'cmdAGV1UnloadA',
          tasks: {
            AGV1detachPartX: (context) => {
              // Connection: Detach(agv1, part)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Detach', 'agv1', 'part');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing PartXEvents: cmdAGV1UnloadA -> AGV1detachPartX');
            const results = [];
            const currentRule = this.PartXEvents.rules.find(r => r.trigger === 'cmdAGV1UnloadA');
            results.push(currentRule.tasks.AGV1detachPartX(context));
            return results;
          }
        },
        {
          trigger: 'cmdAGV2loadC',
          tasks: {
            AGV2atachPartX: (context) => {
              // Connection: Atach(agv2, part)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Atach', 'agv2', 'part');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing PartXEvents: cmdAGV2loadC -> AGV2atachPartX');
            const results = [];
            const currentRule = this.PartXEvents.rules.find(r => r.trigger === 'cmdAGV2loadC');
            results.push(currentRule.tasks.AGV2atachPartX(context));
            return results;
          }
        },
        {
          trigger: 'cmdAGV2UnloadE',
          tasks: {
            AGV2detachPartX: (context) => {
              // Connection: Detach(agv2, part)
              if (context.sysadlBase && context.sysadlBase.helpers) {
                context.sysadlBase.helpers.executeConnection('Detach', 'agv2', 'part');
              }
              return true;
            },
          },
          execute: (context) => {
            if (context.sysadlBase && context.sysadlBase.logger) context.sysadlBase.logger.log('⚡ Executing PartXEvents: cmdAGV2UnloadE -> AGV2detachPartX');
            const results = [];
            const currentRule = this.PartXEvents.rules.find(r => r.trigger === 'cmdAGV2UnloadE');
            results.push(currentRule.tasks.AGV2detachPartX(context));
            return results;
          }
        },
      ],
      hasRule: (triggerName) => {
        return this.PartXEvents.rules.some(rule => rule.trigger === triggerName);
      },
      executeRule: (triggerName, context) => {
        const rule = this.PartXEvents.rules.find(r => r.trigger === triggerName);
        return rule ? rule.execute(context) : null;
      }
    };

  }

}

// Enhanced Scene: SCN_MoveAGV1toA
class SCN_MoveAGV1toA extends Scene {
  constructor(name = 'SCN_MoveAGV1toA', opts = {}) {
    super(name, {
      ...opts,
      sceneType: 'scene',
      startEvent: 'cmdSupervisor',
      finishEvent: 'AGV1NotifArriveA',
      entities: [],
      initialStates: {}
    });
  }

  
  validatePreConditions(context) {
    // Enhanced pre-condition validation with context support
    if (!context) {
      throw new Error('Context is required for pre-condition evaluation');
    }

    try {
      // Condition 1: agv1.location == stationC.ID
      const agv1Entity = this.getEntity(context, 'agv1');
      if (!agv1Entity) {
        throw new Error('Entity agv1 not found in context');
      }
      const stationCEntity = this.getEntity(context, 'stationC');
      if (!stationCEntity) {
        throw new Error('Entity stationC not found in context');
      }
      const condition1 = this.compareValues(agv1Entity.location, stationCEntity.properties.ID);
      // Condition 2: part.location == stationA.ID
      const partEntity = this.getEntity(context, 'part');
      if (!partEntity) {
        throw new Error('Entity part not found in context');
      }
      const stationAEntity = this.getEntity(context, 'stationA');
      if (!stationAEntity) {
        throw new Error('Entity stationA not found in context');
      }
      const condition2 = this.compareValues(partEntity.location, stationAEntity.properties.ID);

      // All conditions must be satisfied
      const allConditionsMet = condition1 && condition2;
      return allConditionsMet;
    } catch (error) {
      console.error(`Error evaluating pre-conditions for ${this.name}:`, error.message);
      return false;
    }
  }

  
  validatePostConditions(context) {
    // Enhanced post-condition validation with context support
    if (!context) {
      throw new Error('Context is required for post-condition evaluation');
    }

    try {
      // Condition 1: agv1.location == stationA.ID
      const agv1Entity = this.getEntity(context, 'agv1');
      if (!agv1Entity) {
        throw new Error('Entity agv1 not found in context');
      }
      const stationAEntity = this.getEntity(context, 'stationA');
      if (!stationAEntity) {
        throw new Error('Entity stationA not found in context');
      }
      const condition1 = this.compareValues(agv1Entity.location, stationAEntity.properties.ID);
      // Condition 2: part.location == stationA.ID
      const partEntity = this.getEntity(context, 'part');
      if (!partEntity) {
        throw new Error('Entity part not found in context');
      }
      const condition2 = this.compareValues(partEntity.location, stationAEntity.properties.ID);

      // All conditions must be satisfied
      const allConditionsMet = condition1 && condition2;
      return allConditionsMet;
    } catch (error) {
      console.error(`Error evaluating post-conditions for ${this.name}:`, error.message);
      return false;
    }
  }
}

// Enhanced Scene: SCN_MoveAGV2toC
class SCN_MoveAGV2toC extends Scene {
  constructor(name = 'SCN_MoveAGV2toC', opts = {}) {
    super(name, {
      ...opts,
      sceneType: 'scene',
      startEvent: 'cmdAGV2toC',
      finishEvent: 'AGV2NotifArriveC',
      entities: [],
      initialStates: {}
    });
  }

  
  validatePreConditions(context) {
    // Enhanced pre-condition validation with context support
    if (!context) {
      throw new Error('Context is required for pre-condition evaluation');
    }

    try {
      // Condition 1: agv2.location == stationD.ID
      const agv2Entity = this.getEntity(context, 'agv2');
      if (!agv2Entity) {
        throw new Error('Entity agv2 not found in context');
      }
      const stationDEntity = this.getEntity(context, 'stationD');
      if (!stationDEntity) {
        throw new Error('Entity stationD not found in context');
      }
      const condition1 = this.compareValues(agv2Entity.location, stationDEntity.properties.ID);
      // Condition 2: part.location == stationA.ID
      const partEntity = this.getEntity(context, 'part');
      if (!partEntity) {
        throw new Error('Entity part not found in context');
      }
      const stationAEntity = this.getEntity(context, 'stationA');
      if (!stationAEntity) {
        throw new Error('Entity stationA not found in context');
      }
      const condition2 = this.compareValues(partEntity.location, stationAEntity.properties.ID);

      // All conditions must be satisfied
      const allConditionsMet = condition1 && condition2;
      return allConditionsMet;
    } catch (error) {
      console.error(`Error evaluating pre-conditions for ${this.name}:`, error.message);
      return false;
    }
  }

  
  validatePostConditions(context) {
    // Enhanced post-condition validation with context support
    if (!context) {
      throw new Error('Context is required for post-condition evaluation');
    }

    try {
      // Condition 1: agv2.location == stationC.ID
      const agv2Entity = this.getEntity(context, 'agv2');
      if (!agv2Entity) {
        throw new Error('Entity agv2 not found in context');
      }
      const stationCEntity = this.getEntity(context, 'stationC');
      if (!stationCEntity) {
        throw new Error('Entity stationC not found in context');
      }
      const condition1 = this.compareValues(agv2Entity.location, stationCEntity.properties.ID);
      // Condition 2: part.location == stationA.ID
      const partEntity = this.getEntity(context, 'part');
      if (!partEntity) {
        throw new Error('Entity part not found in context');
      }
      const stationAEntity = this.getEntity(context, 'stationA');
      if (!stationAEntity) {
        throw new Error('Entity stationA not found in context');
      }
      const condition2 = this.compareValues(partEntity.location, stationAEntity.properties.ID);

      // All conditions must be satisfied
      const allConditionsMet = condition1 && condition2;
      return allConditionsMet;
    } catch (error) {
      console.error(`Error evaluating post-conditions for ${this.name}:`, error.message);
      return false;
    }
  }
}

// Enhanced Scene: SCN_AGV1movePartToC
class SCN_AGV1movePartToC extends Scene {
  constructor(name = 'SCN_AGV1movePartToC', opts = {}) {
    super(name, {
      ...opts,
      sceneType: 'scene',
      startEvent: 'AGV1NotifArriveA',
      finishEvent: 'AGV1detachPartX',
      entities: [],
      initialStates: {}
    });
  }

  
  validatePreConditions(context) {
    // Enhanced pre-condition validation with context support
    if (!context) {
      throw new Error('Context is required for pre-condition evaluation');
    }

    try {
      // Condition 1: agv1.location == stationA.ID
      const agv1Entity = this.getEntity(context, 'agv1');
      if (!agv1Entity) {
        throw new Error('Entity agv1 not found in context');
      }
      const stationAEntity = this.getEntity(context, 'stationA');
      if (!stationAEntity) {
        throw new Error('Entity stationA not found in context');
      }
      const condition1 = this.compareValues(agv1Entity.location, stationAEntity.properties.ID);
      // Condition 2: part.location == stationA.ID
      const partEntity = this.getEntity(context, 'part');
      if (!partEntity) {
        throw new Error('Entity part not found in context');
      }
      const condition2 = this.compareValues(partEntity.location, stationAEntity.properties.ID);

      // All conditions must be satisfied
      const allConditionsMet = condition1 && condition2;
      return allConditionsMet;
    } catch (error) {
      console.error(`Error evaluating pre-conditions for ${this.name}:`, error.message);
      return false;
    }
  }

  
  validatePostConditions(context) {
    // Enhanced post-condition validation with context support
    if (!context) {
      throw new Error('Context is required for post-condition evaluation');
    }

    try {
      // Condition 1: agv1.location == stationC.ID
      const agv1Entity = this.getEntity(context, 'agv1');
      if (!agv1Entity) {
        throw new Error('Entity agv1 not found in context');
      }
      const stationCEntity = this.getEntity(context, 'stationC');
      if (!stationCEntity) {
        throw new Error('Entity stationC not found in context');
      }
      const condition1 = this.compareValues(agv1Entity.location, stationCEntity.properties.ID);
      // Condition 2: part.location == stationC.ID
      const partEntity = this.getEntity(context, 'part');
      if (!partEntity) {
        throw new Error('Entity part not found in context');
      }
      const condition2 = this.compareValues(partEntity.location, stationCEntity.properties.ID);

      // All conditions must be satisfied
      const allConditionsMet = condition1 && condition2;
      return allConditionsMet;
    } catch (error) {
      console.error(`Error evaluating post-conditions for ${this.name}:`, error.message);
      return false;
    }
  }
}

// Enhanced Scene: SCN_AGV2movePartToE
class SCN_AGV2movePartToE extends Scene {
  constructor(name = 'SCN_AGV2movePartToE', opts = {}) {
    super(name, {
      ...opts,
      sceneType: 'scene',
      startEvent: 'AGV2NotifArriveC',
      finishEvent: 'AGV2detachPartX',
      entities: [],
      initialStates: {}
    });
  }

  
  validatePreConditions(context) {
    // Enhanced pre-condition validation with context support
    if (!context) {
      throw new Error('Context is required for pre-condition evaluation');
    }

    try {
      // Condition 1: agv2.location == stationC.ID
      const agv2Entity = this.getEntity(context, 'agv2');
      if (!agv2Entity) {
        throw new Error('Entity agv2 not found in context');
      }
      const stationCEntity = this.getEntity(context, 'stationC');
      if (!stationCEntity) {
        throw new Error('Entity stationC not found in context');
      }
      const condition1 = this.compareValues(agv2Entity.location, stationCEntity.properties.ID);
      // Condition 2: part.location == stationC.ID
      const partEntity = this.getEntity(context, 'part');
      if (!partEntity) {
        throw new Error('Entity part not found in context');
      }
      const condition2 = this.compareValues(partEntity.location, stationCEntity.properties.ID);

      // All conditions must be satisfied
      const allConditionsMet = condition1 && condition2;
      return allConditionsMet;
    } catch (error) {
      console.error(`Error evaluating pre-conditions for ${this.name}:`, error.message);
      return false;
    }
  }

  
  validatePostConditions(context) {
    // Enhanced post-condition validation with context support
    if (!context) {
      throw new Error('Context is required for post-condition evaluation');
    }

    try {
      // Condition 1: agv2.location == stationE.ID
      const agv2Entity = this.getEntity(context, 'agv2');
      if (!agv2Entity) {
        throw new Error('Entity agv2 not found in context');
      }
      const stationEEntity = this.getEntity(context, 'stationE');
      if (!stationEEntity) {
        throw new Error('Entity stationE not found in context');
      }
      const condition1 = this.compareValues(agv2Entity.location, stationEEntity.properties.ID);
      // Condition 2: part.location == stationE.ID
      const partEntity = this.getEntity(context, 'part');
      if (!partEntity) {
        throw new Error('Entity part not found in context');
      }
      const condition2 = this.compareValues(partEntity.location, stationEEntity.properties.ID);

      // All conditions must be satisfied
      const allConditionsMet = condition1 && condition2;
      return allConditionsMet;
    } catch (error) {
      console.error(`Error evaluating post-conditions for ${this.name}:`, error.message);
      return false;
    }
  }
}

// Scene Definitions: MyScenes
class MyScenes extends SceneDefinitions {
  constructor(name = 'MyScenes', opts = {}) {
    super(name, {
      ...opts,
      targetEvents: 'MyEvents',
      scenes: {}
    });
  }
}

class Scenario1 extends Scenario {
  constructor(name = 'Scenario1', opts = {}) {
    super(name, {
      ...opts,
      scenarioType: 'scenario'
    });
  }

  async execute(context) {
    if (!context || !context.scenes) {
      throw new Error('Context with scenes registry is required for scenario execution');
    }

    await this.executeScene('SCN_MoveAGV1toA', context);
    await this.executeScene('SCN_MoveAGV2toC', context);
    await this.executeScene('SCN_AGV1movePartToC', context);
    await this.executeScene('SCN_AGV2movePartToE', context);

    return { success: true, message: 'Scenario completed successfully' };
  }
}

class Scenario2 extends Scenario {
  constructor(name = 'Scenario2', opts = {}) {
    super(name, {
      ...opts,
      scenarioType: 'scenario'
    });
  }

  async execute(context) {
    if (!context || !context.scenes) {
      throw new Error('Context with scenes registry is required for scenario execution');
    }

    await this.executeScene('SCN_MoveAGV1toA', context);
    await this.executeScene('SCN_MoveAGV2toC', context);
    await this.executeScene('SCN_AGV2movePartToE', context);
    await this.executeScene('SCN_AGV1movePartToC', context);

    return { success: true, message: 'Scenario completed successfully' };
  }
}

class Scenario3 extends Scenario {
  constructor(name = 'Scenario3', opts = {}) {
    super(name, {
      ...opts,
      scenarioType: 'scenario'
    });
  }

  async execute(context) {
    if (!context || !context.scenes) {
      throw new Error('Context with scenes registry is required for scenario execution');
    }

    let i = 1;
    while (i < 5) {
      await this.executeScene('SCN_MoveAGV1toA', context);
      await this.executeScene('SCN_AGV1movePartToC', context);
      i++;
    }

    return { success: true, message: 'Scenario completed successfully' };
  }
}

class Scenario4 extends Scenario {
  constructor(name = 'Scenario4', opts = {}) {
    super(name, {
      ...opts,
      scenarioType: 'scenario'
    });
  }

  async execute(context) {
    if (!context || !context.scenes) {
      throw new Error('Context with scenes registry is required for scenario execution');
    }

    let i = 1;
    while (i < 5) {
      await this.executeScenario('Scenario1', context);
      i++;
    }

    return { success: true, message: 'Scenario completed successfully' };
  }
}

class MyScenarios extends ScenarioDefinitions {
  constructor(name = 'MyScenarios', opts = {}) {
    super(name, {
      ...opts,
      targetScenes: 'MyScenes',
      scenarios: {}
    });

    this.addScenario('Scenario1', Scenario1);
    this.addScenario('Scenario2', Scenario2);
    this.addScenario('Scenario3', Scenario3);
    this.addScenario('Scenario4', Scenario4);
  }
}

// Scenario Execution with Explicit Programming: MyScenariosExecution
class MyScenariosExecution extends ScenarioExecution {
  constructor(name = 'MyScenariosExecution', opts = {}) {
    super(name, {
      ...opts,
      targetScenarios: 'MyScenarios'
    });
    
    // Initialize execution mode
    this.executionMode = 'sequential';
    this.status = 'inactive';
  }

  // Override start method to handle custom execution logic
  start(context = {}) {
    console.log('[MyScenariosExecution] Starting custom scenario execution');
    this.status = 'running';
    
    // Log start event
    if (this.model && this.model.logEvent) {
      this.model.logEvent({
        elementType: 'scenario_execution_start',
        execution: this.name,
        when: Date.now()
      });
    }
    
    // Execute scenarios asynchronously
    this.execute(context).then(result => {
      console.log('[MyScenariosExecution] Execution completed:', result);
      this.complete();
    }).catch(error => {
      console.error('[MyScenariosExecution] Execution failed:', error);
      this.status = 'failed';
    });
    
    return true; // Indicate successful start
  }

  // Complete execution
  complete() {
    this.status = 'completed';
    
    if (this.model && this.model.logEvent) {
      this.model.logEvent({
        elementType: 'scenario_execution_complete',
        execution: this.name,
        when: Date.now()
      });
    }
  }

  async execute(context) {
    console.log('[MyScenariosExecution] Starting scenario execution with context:', Object.keys(context || {}));
    
    // Initialize environment state
    if (context.model && context.model.environmentConfiguration) {
      const envConfig = context.model.environmentConfiguration;
      if (envConfig.agv1) envConfig.agv1.location = 'StationC';
      if (envConfig.agv2) envConfig.agv2.location = 'StationD';
      if (envConfig.part) envConfig.part.location = 'StationA';
    }

    // Event injections
    // inject AGV2atStationD after SCN_MoveAGV1toA;
    if (context.eventScheduler) {
      context.eventScheduler.scheduleAfterScenario('AGV2atStationD', 'SCN_MoveAGV1toA');
      // inject SetAGV2SensorStationD when agv1.location == stationA.ID;
      context.eventScheduler.scheduleOnCondition('SetAGV2SensorStationD', () => {
        return context.model?.environmentConfiguration?.agv1?.location === 'StationA';
      });
    }

    // Execute scenarios using context.model if available
    const model = context.model;
    if (model && model.executeScenario) {
      await model.executeScenario('Scenario1', context);
      await model.executeScenario('Scenario2', context);
      await model.executeScenario('Scenario3', context);
      await model.executeScenario('Scenario4', context);

      // Repeat executions
      for (let i = 0; i < 5; i++) {
        await model.executeScenario('Scenario1', context);
      }
    } else {
      console.warn('[MyScenariosExecution] No model or executeScenario method found in context');
    }

    return { success: true, message: 'Scenario execution completed successfully' };
  }
}

function createEnvironmentModel() {
  const model = createModel(); // Get traditional model
  
  // Initialize scenario execution capabilities
  model.initializeScenarioExecution();
  
  // Add environment/scenario elements to model
  model.environments = {};
  model.events = {};
  model.scenes = {};
  model.scenarios = {};
  model.scenarioExecutions = {};
  
  model.environments['MyFactory'] = new MyFactory();
  model.environments['MyFactoryConfiguration'] = new MyFactoryConfiguration();
  model.events['MyEvents'] = new MyEvents();
  model.scenes['MyScenes'] = new MyScenes();
  model.scenarios['MyScenarios'] = new MyScenarios();
  model.scenes['SCN_MoveAGV1toA'] = SCN_MoveAGV1toA;
  model.scenes['SCN_MoveAGV2toC'] = SCN_MoveAGV2toC;
  model.scenes['SCN_AGV1movePartToC'] = SCN_AGV1movePartToC;
  model.scenes['SCN_AGV2movePartToE'] = SCN_AGV2movePartToE;
  model.scenarios['Scenario1'] = Scenario1;
  model.scenarios['Scenario2'] = Scenario2;
  model.scenarios['Scenario3'] = Scenario3;
  model.scenarios['Scenario4'] = Scenario4;
  model.scenarioExecutions['MyScenariosExecution'] = new MyScenariosExecution();
  model.registerScenarioExecution(model.scenarioExecutions['MyScenariosExecution']);
  
  // Setup environment bindings if needed
  // TODO: Implement automatic binding setup based on model analysis
  
  return model;
}

module.exports = { createEnvironmentModel, MyFactory, MyFactoryConfiguration, MyEvents, MyScenes, MyScenarios, MyScenariosExecution, SCN_MoveAGV1toA, SCN_MoveAGV2toC, SCN_AGV1movePartToC, SCN_AGV2movePartToE, Scenario1, Scenario2, Scenario3, Scenario4 };