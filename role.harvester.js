var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function(creep) {
        let weight = _.sum(creep.carry)
        // if creep is bringing energy to a structure but has no energy left
        if (creep.memory.working == true && creep.carry.energy == 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && weight == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }


        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working == true) {
            if (creep.room.controller.tickesToDowngrade < 5000){
                roleUpgrader.run(creep);
            }
            // find closest spawn, extension or tower which is not full
            var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => ( 
                             s.id == creep.room.memory.linkfrom 
                             || s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION
                             || (s.structureType == STRUCTURE_TOWER && s.energy < 0.9 * s.energyCapacity) )
                             && s.energy < s.energyCapacity 
            });

            if (structure == undefined) {
                structure = creep.room.storage;
            }

            if (structure == undefined){
                roleBuilder.run(creep);
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
        // if creep is supposed to harvest energy from source
        else {
            creep.getEnergy(true,true);
        }
    }
};