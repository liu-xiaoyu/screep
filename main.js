// import modules
require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');
var construct = require('construct');

module.exports.loop = function() {
    // check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            console.log("cleaning memory of "+name);
            delete Memory.creeps[name];
        }
    }

    // for each creeps
    for (let name in Game.creeps) {
        // run creep logic
        Game.creeps[name].runRole();
    }

    for (let spawnName in Game.spawns) {
        let spawn = Game.spawns[spawnName];
        if (spawn.room.memory.sources == undefined){
            spawn.room.memory.sources = spawn.room.find(FIND_SOURCES);
        }
        //for (let source of spawn.memory.sources){
        //    if (spawn.room.memory.waitinglist == undefined){
        //        spawn.room.memory.waitinglist = [0,0,0];
        //    }
        //}
        if (spawn.memory.highestlvl == undefined){
            spawn.memory.highestlvl = spawn.room.controller.level;
        }else if (spawn.memory.highestlvl < spawn.room.controller.level){
            /*
            let x = spawn.pos['x']-3;
            //let y = spawn.pos['y']+spawn.memory.highestlvl+spawn.memory.highestlvl%2;
            let y = spawn.pos['y']
            spawn.room.createFlag(x,y,'extensionSites',8,9);
            for (let source of spawn.room.memory.sources){
                spawn.room.createFlag(source['x'], source['y'], source['x']+source['y'], 7,8);
            }
            */
            spawn.memory.highestlvl = spawn.room.controller.level;
        }
        let brownGreyFlags = _.filter(Game.flags, f => f.color == 8 && f.secondaryColor == 9);
        for (let flag of brownGreyFlags){
            construct.extension(flag, STRUCTURE_EXTENSION);
            flag.remove();
        }
        if (spawn.room.controller.level == 3 && spawn.memory.road == undefined){
            spawn.memory.road = 3;
        }
        if (spawn.memory.road > 0){
//            for (let source of spawn.room.memory.sources){
            for (let source of spawn.room.find(FIND_SOURCES)){
                construct.road(spawn, source);
            }
            construct.road(spawn, spawn.room.controller);
            spawn.memory.road --;
        }
    }
    // find all towers
    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    // for each tower
    for (let tower of towers) {
        // run tower logic
        tower.defend();
    }

    // for each spawn
    for (let spawnName in Game.spawns) {
        // run spawn logic
        Game.spawns[spawnName].spawnCreepsIfNecessary();
    }
};