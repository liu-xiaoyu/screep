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
            //console.log("cleaning memory of "+name);
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
        if (spawn.memory.highestlvl == undefined){
            spawn.memory.highestlvl = spawn.room.controller.level;
        }else if (spawn.memory.highestlvl < spawn.room.controller.level){
            let purpleBlueFlags = _.filter(Game.flags, f => f.color == 2 && f.secondaryColor == 3 && f.room.name == spawn.room.name);
            let extensionFlag = purpleBlueFlags[0];
            let x = extensionFlag.pos['x'];
            let y = extensionFlag.pos['y'];
            //spawn.room.createFlag(x,y,'extensionSites',8,9);
            construct.extension(spawn.room.name, x, y, spawn.memory.highestlvl);
            extensionFlag.remove()
            //lvl2 move 1, lvl3 move 2, rest move 3
            let newy = spawn.memory.highestlvl;
            if (spawn.memory.highestlvl>=4){
                newy = 3;
            }
            spawn.room.createFlag(x,y+newy,undefined,2,3);
            spawn.memory.highestlvl = spawn.room.controller.level;
        }

        if (spawn.room.controller.level == 3 && spawn.memory.container == undefined){
            spawn.memory.container = false;
        }
        if (spawn.memory.container == false){
            for (let source of spawn.room.memory.sources){
                construct.container(spawn.room, Game.getObjectById(source.id))
            }
            spawn.memory.container = true;
        }
        if (spawn.room.controller.level == 2 && spawn.memory.road == undefined){
            spawn.memory.road = false;
        }
        if (spawn.memory.road == false){
            for (let source of spawn.room.find(FIND_SOURCES)){
                construct.road(spawn, source);
            }
            construct.road(spawn, spawn.room.controller);
            spawn.memory.road = true;
        }
        let linkfromFlag = _.filter(Game.flags, f => f.color == 1 && f.secondaryColor == 1 && f.room.name == spawn.room.name)[0];
        let linktoFlag = _.filter(Game.flags, f => f.color == 1 && f.secondaryColor == 2 && f.room.name == spawn.room.name)[0];
        if (!(linkfromFlag==undefined) && !(linktoFlag==undefined)){
            let linkfrom = linkfromFlag.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: {structureType: STRUCTURE_LINK}})[0]
            let linkto = linktoFlag.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: {structureType: STRUCTURE_LINK}})[0]
            if (!(linkfrom==undefined)&&!(linkto==undefined)){
                spawn.room.memory.linkfrom = linkfrom.id;
                spawn.room.memory.linkto = linkto.id;
                if (linkfrom.energy > 0.60 * linkfrom.energyCapacity){
                    linkfrom.transferEnergy(linkto);
                }
            }
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