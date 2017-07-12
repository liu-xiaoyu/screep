// create a new function for StructureLink
StructureLink.prototype.transfer =
    function () {
        let target = this.room.memory.linkto;
        if (this.energy > 0.60 * this.energyCapacity){
            this.transferEnergy(target)
        }
    };
