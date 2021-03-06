'use strict';

require('require');
require('prototype_creep_startup_tasks');
require('prototype_creep_move');
require('prototype_roomPosition');
require('prototype_room_init');
require('prototype_room_costmatrix');
require('visualizer');
require('screepsplus');

console.log('Starting TooAngel AI - Have fun');

brain.stats.init();

if (config.profiler.enabled) {
  try {
    var profiler = require('screeps-profiler');
    for (let role of _.keys(roles)) {
      profiler.registerObject(roles[role], 'Role_' + role);
    }
    profiler.registerObject(PathFinder, 'PathFinder');
    profiler.registerObject(brain, 'Brain');
    profiler.enable();
  } catch (e) {
    console.log('screeps-profiler not found');
    config.profiler.enabled = false;
  }
}

var main = function() {
  if (Game.cpu.bucket < 2 * Game.cpu.tickLimit) {
    console.log('Skipping tick ' + Game.time + ' due to lack of CPU.');
    return;
  }

  brain.prepareMemory();
  brain.handleNextroom();
  brain.handleSquadmanager();
  brain.handleIncomingTransactions();
  brain.handleQuests();

  brain.stats.addRoot();
  Memory.myRooms = _(Game.rooms).filter(r => r.execute()).map(r => r.name).value();

  if (config.visualizer.enabled && config.visualizer.refresh) {
    visualizer.render();
  }
  brain.stats.add(['cpu'], {
    used: Game.cpu.getUsed()
  });
};

module.exports.loop = function() {
  if (config.profiler.enabled) {
    profiler.wrap(function() {
      main();
    });
  } else {
    main();
  }
};
