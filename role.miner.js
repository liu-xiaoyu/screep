module.exports = {
    // a function to run the logic for this role
    run: function (creep) {
        // get source
        let source = Game.getObjectById(creep.memory.sourceId);
//        console.log("source: "+creep.memory.sourceId);
        // find container next to source
        let closecontainers = source.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_CONTAINER 
        });
 //       console.log("closecontainers: "+closecontainers);

        for (let container of closecontainers){
        // if creep is on top of the container
            if (creep.pos.isEqualTo(container.pos)) {
                // harvest source
                creep.harvest(source);
            }
            // if creep is not on top of the container
            else {
                // move towards it
                creep.moveTo(container);
            }
        }
    }
};