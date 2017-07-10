var roleBuilder = require('role.builder');

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function(creep) {
        let weight = _.sum(creep.carry)
        // if creep is trying to repair something but has no energy left
        if (creep.memory.working == true && creep.carry.energy == 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && weight == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to repair something
        if (creep.memory.working == true) {
            var ramparts = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_RAMPART
            });

            var target = undefined;

            if (ramparts.length==0){
                // loop with increasing percentages
                for (let percentage = 0.00001; percentage <= 0.0001; percentage = percentage + 0.000001){
                    // find a wall with less than percentage hits
                    for (let rampart of ramparts) {
                        if (rampart.hits / ramparts.hitsMax < percentage) {
                            target = rampart;
                            break;
                        }
                    }
                    // if there is one
                    if (target != undefined) {
                        // break the loop
                        break;
                    }
                }
            }
            else{
                // find closest structure with less than max hits
                // Exclude walls because they have way too many max hits and would keep
                // our repairers busy forever. We have to find a solution for that later.
                target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    // the second argument for findClosestByPath is an object which takes
                    // a property called filter which can be a function
                    // we use the arrow operator to define it
                    filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
                });
            }

            // if we find one
            if (target != undefined) {
                // try to repair it, if it is out of range
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(target);
                }
            }
            // if we can't fine one
            else {
                // look for construction sites
                roleBuilder.run(creep);
            }
        }
            // if creep is supposed to get energy
        else {
            creep.getEnergy(true, true);
        }
    }
};