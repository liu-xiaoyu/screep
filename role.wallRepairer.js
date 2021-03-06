var roleRepairer = require('role.repairer');

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function(creep) {
        let weight = _.sum(creep.carry);
        let new_build_percentage = 0.0001
        let max_percentage = 0.005 * creep.room.controller.level
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

            if (ramparts.length!=0){
                // loop with increasing percentages
                for (let percentage = 0.00001; percentage <= new_build_percentage; percentage = percentage + 0.000001){
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
            if (target == undefined){
                // find all walls in the room
                var walls = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_WALL
                });

                // loop with increasing percentages
                for (let percentage = 0.0001; percentage <= new_build_percentage; percentage = percentage + 0.0001){
                    // find a wall with less than percentage hits
                    for (let wall of walls) {
                        if (wall.hits / wall.hitsMax < percentage) {
                            target = wall;
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
            if (target == undefined){
                // find all walls or ramparts in the room
                var walls = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_RAMPART || s.structure == STRUCTURE_WALL
                });

                // loop with increasing percentages
                for (let percentage = new_build_percentage; percentage <= max_percentage; percentage = percentage + 0.0001){
                    // find a wall with less than percentage hits
                    for (let wall of walls) {
                        if (wall.hits / wall.hitsMax < percentage) {
                            target = wall;
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


            // if we find a wall that has to be repaired
            if (target != undefined) {
                // try to repair it, if not in range
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(target);
                }
            }
            // if we can't fine one
            else {
                // look for construction sites
                roleRepairer.run(creep);
            }
        }
        // if creep is supposed to get energy
        else {
            creep.getEnergy(true, true);
        }
    }
};