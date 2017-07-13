var roleBuilder = require('role.builder');
var roleHarvester = require('role.harvester');
module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function(creep) {
        // if creep is bringing energy to a structure but has no energy left
        if (creep.memory.working == true && creep.carry.energy == 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }
        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working == true) {
            // if in home room
            if (creep.room.name == creep.memory.home) {
                // find closest spawn, extension or tower which is not full
                var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    // the second argument for findClosestByPath is an object which takes
                    // a property called filter which can be a function
                    // we use the arrow operator to define it
                    filter: (s) => (s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION
                             || s.structureType == STRUCTURE_LINK
                             || s.structureType == STRUCTURE_TOWER)
                             && s.energy < s.energyCapacity
                });

                if (structure == undefined) {
                    structure = creep.room.storage;
                }

                // if we found one
                if (structure != undefined) {
                    // try to transfer energy, if it is not in range
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(structure);
                    }
                }
            }
            // if not in home room...
            else {
                if (creep.room.controller.my){
                    if (!(creep.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_SPAWN}})>0)){
                        roleBuilder.run(creep);
                    }else{
                        roleHarvester.run(creep);
                    }
                }else{
                    // find exit to home room
                    var exit = creep.room.findExitTo(creep.memory.home);
                    // and move to exit
                    creep.moveTo(creep.pos.findClosestByRange(exit));
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            // if in target room
            if (creep.room.name == creep.memory.target) {
                // find source
                if (creep.room.controller.my){
                    if (!(creep.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_SPAWN}})>0)){
                        roleHarvester.run(creep);
                    }else{
                        roleBuilder.run(creep);
                    }
                }else{
                    creep.getEnergy(false,true);
                }
            }
            // if not in target room
            else {
                // find exit to target room
                var exit = creep.room.findExitTo(creep.memory.target);
                // move to exit
                creep.moveTo(creep.pos.findClosestByRange(exit));
            }
        }
    }
};