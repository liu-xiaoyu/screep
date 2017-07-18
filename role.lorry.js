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
            // find closest spawn, extension or tower which is not full
            var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => ( 
                             s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION
                             || ( s.id == creep.room.memory.linkfrom && s.energy < s.energyCapacity )
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
        // if creep is supposed to get energy
        else {
            let dropped_energy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            if (dropped_energy != undefined && dropped_energy.energy > 100){
                if (creep.pickup(dropped_energy) == ERR_NOT_IN_RANGE){
                    creep.moveTo(dropped_energy);
                }
            }
            else{
                let target = undefined;
                // find closest container
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => (s.id == creep.room.memory.linkto && s.energy > 0) || s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
                });
                if (target == undefined) {
                    target = creep.room.storage;
                }

                // if one was found
                if (target != undefined) {
                    // try to withdraw energy, if the container is not in range
                    if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(target);
                    }
                }
            }
        }
    }
};