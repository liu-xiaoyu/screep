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
                if (creep.attack(target)==ERR_NOT_IN_RANGE){
                    creep.moveTo(target);
                }
            }
        }
    }
};