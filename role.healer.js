module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // if in target room
        if (creep.room.name != creep.memory.target) {
            // find exit to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            // move to exit
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
        else {
            if (creep.room.underattack == true){
                let myCreeps = creep.room.find(FIND_MY_CREEPS);
                for (let percentage = 0.1; percentage < 1; percentage=percentage+0.1)
                for (myCreep of myCreeps){
                    if (myCreep.hits < myCreep.hitsMax && myCreep.ticksToLive > 100 &&
                        (myCreep.memory.role == 'healer'
                        || myCreep.memory.role == 'attacker'
                        || myCreep.memory.role == 'rangeattacker'
                        || myCreep.memory.role == 'wallRepairer')){
                            while (creep.heal(myCreep)==ERR_NOT_IN_RANGE){
                                creep.moveTo(myCreep);
                            }
                    }
                }
            }
        }
    }
};