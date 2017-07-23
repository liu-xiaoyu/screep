// create a new function for StructureTower
StructureTower.prototype.defend =
    function () {
        // find closes hostile creep
        var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        // if one is found...
        if (target != undefined && this.room.find(FIND_HOSTILE_CREEPS).length <= 1) {
            // ...FIRE!
            this.attack(target);
        }
        // repair
        else if (!(target>0) && this.energy > 0.3 * this.energyCapacity){
            target = this.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.hits < 0.7 * s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART});
            if(target != undefined) {
                this.repair(target);
            }
        }
        if (!(target>0) && this.energy > 0.9 * this.energyCapacity){
            // fix walls
            let new_build_percentage = 0.0001
            let max_percentage = 0.005 * this.room.controller.level
            var walls = this.room.find(FIND_STRUCTURES, {
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
            }
            this.repair(target);
        }
    };
