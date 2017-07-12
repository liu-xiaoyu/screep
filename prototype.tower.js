// create a new function for StructureTower
StructureTower.prototype.defend =
    function () {
        // find closes hostile creep
        var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        // if one is found...
        if (target != undefined) {
            // ...FIRE!
            this.attack(target);
        }
        // repair
        if (!(target>0)){
            target = this.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART});
            if(target != undefined) {
                this.repair(target);
            }
        }
    };
