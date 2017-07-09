var listOfRoles = [
    {name:'harvester', min:'1'},
    {name:'upgrader', min: '1'},
    {name:'claimer', min: '1'},
    {name:'repairer', min: '1'},
    {name:'builder', min: '1'},
    {name:'wallRepairer', min:'1'},
    {name:'lorry', min:'2'},
    ];

var undocumented = [ {name: 'miner', min:'1'},
                     {name: 'longDistanceHarvester', min:'1'}
                     ];
var minLDHarvesters = { 'W6N8': 2,
                        'W4N8': 1,
                        'W5N7': 2}

// create a new function for StructureSpawn
StructureSpawn.prototype.spawnCreepsIfNecessary =
    function () {
        /** @type {Room} */
        let room = this.room;
        // find all creeps in room
        /** @type {Array.<Creep>} */
        let creepsInRoom = room.find(FIND_MY_CREEPS);
        // count the number of creeps alive for each role in this room
        // _.sum will count the number of properties in Game.creeps filtered by the
        //  arrow function, which checks for the creep being a specific role
        /** @type {Object.<string, number>} */
        let numberOfCreeps = {};
        for (let role of listOfRoles) { 
            let rolename = role['name'];
            numberOfCreeps[rolename] = _.sum(creepsInRoom, 
                (c) => c.memory.role == rolename);
        }
        for (let role of undocumented) {
            let rolename = role['name'];
            numberOfCreeps[rolename] = _.sum(creepsInRoom, 
                (c) => c.memory.role == rolename);
        }
        let maxEnergy = room.energyCapacityAvailable;
        let name = undefined;
        // Emergency switch to harvester
        if (numberOfCreeps['harvester'] < 1 && (numberOfCreeps['miner']==0 || numberOfCreeps['lorry']==0)){
            name = this.createCustomCreep(room.energyAvailable, 'harvester');
            if (!(name>0)){
                for (let creep of creepsInRoom){
                    if (creep.memory.role == 'builder' || creep.memory.role == 'repairer' || creep.memory.role == 'upgrader'){
                        creep.memory.role = 'harvester';
                        break;
                    }
                }
            }
        }       
        // check if all sources have miners
        let sources = room.find(FIND_SOURCES);
        // iterate over all sources
        for (let source of sources) {
            // if the source has no miner
            if (!_.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceId == source.id)) {
                // check whether or not the source has a container
                /** @type {Array.StructureContainer} */
                let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER
                });
                // if there is a container next to the source
                if (containers.length > 0) {
                    // spawn a miner
                    name = this.createMiner(source.id);
                    break;
                }
            }
        }

        // if there's no lorry, check if we have a miner
        //  create a backup creep
        if (numberOfCreeps['miner']>0 && !(numberOfCreeps['lorry'] > 0)) {
            // if there are still miners or enough energy in Storage left
            if (numberOfCreeps['miner'] > 0 ||
                (room.storage != undefined && room.storage.store[RESOURCE_ENERGY] >= 150 + 550)) {
                // create a lorry
                name = this.createLorry(maxEnergy);
                if (!(name>0)){
                    name = this.createLorry(room.eneryAvailable);
                }
            }
            // if there is no miner and not enough energy in Storage left
            else if (numberOfCreeps['harvester']<=2){
                // create a harvester because it can work on its own
                name = this.createCustomCreep(room.energyAvailable, 'harvester');
            }
        }
        // if no backup creep is required

        // if none of the above caused a spawn command check for other roles
        if (name == undefined || !(name>0)) {
            for (let role of listOfRoles){
                let rolename = role['name']
                if (rolename != 'claimer' && rolename != 'lorry' && rolename != 'miner' && numberOfCreeps[rolename]==0){
                    name = this.createCustomCreep(maxEnergy, rolename);
                    break;
                }
            }
        }

        if (name == undefined || !(name>0)) {
            // check for claim order
            if (this.room.memory.claimRoom != undefined) {
                // try to spawn a claimer
                name = this.createClaimer(this.room.memory.claimRoom);
                // if that worked
                if (name != undefined && _.isString(name)) {
                    // delete the claim order
                    delete this.memory.claimRoom;
                }
            }
        }

        if (name == undefined || !(name>0)) {
            for (let role of listOfRoles) {
                let rolename = role['name'];
                if (numberOfCreeps[rolename] < role['min'] && rolename != 'claimer') {
                    if (rolename == 'lorry' ) {
                        name = this.createLorry(maxEnergy);
                    }
                    else {
                        name = this.createCustomCreep(maxEnergy, rolename);
                    }
                    break;
                }
            }
        }
        
        // if none of the above caused a spawn command check for LongDistanceHarvesters
        /** @type {Object.<string, number>} */
        let numberOfLongDistanceHarvesters = {};
        if (name == undefined || !(name>0)) {
            // count the number of long distance harvesters globally
            for (let roomName in minLDHarvesters) {
                numberOfLongDistanceHarvesters[roomName] = _.sum(Game.creeps, (c) =>
                    c.memory.role == 'longDistanceHarvester' && c.memory.target == roomName)

                if (minLDHarvesters[roomName] > numberOfLongDistanceHarvesters[roomName]) {
                    name = this.createLongDistanceHarvester(maxEnergy, 2, room.name, roomName, 0);
                }
            }
        }

        // print name to console if spawning was a success
        if (name != undefined && _.isString(name)) {
            console.log(this.name + " spawned new creep: " + name + " (" + Game.creeps[name].memory.role + ")");
            for (let role of listOfRoles) {
                let rolename = role['name'];
                console.log(rolename + ": " + numberOfCreeps[rolename]);
            }
            for (let role of undocumented) {
                let rolename = role['name'];
                console.log(rolename + ": " + numberOfCreeps[rolename]);
            }
        }
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createCustomCreep =
    function (energy, roleName) {
        // create a balanced body as big as possible with the given energy
        var numberOfParts = Math.floor(energy / 200);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        var body = [];
        for (let i = 0; i < numberOfParts; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body and the given role
        return this.createCreep(body, undefined, { role: roleName, working: false });
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createLongDistanceHarvester =
    function (energy, numberOfWorkParts, home, target, sourceIndex) {
        // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
        var body = [];
        for (let i = 0; i < numberOfWorkParts; i++) {
            body.push(WORK);
        }

        // 150 = 100 (cost of WORK) + 50 (cost of MOVE)
        energy -= 150 * numberOfWorkParts;

        var numberOfParts = Math.floor(energy / 100);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor((50 - numberOfWorkParts * 2) / 2));
        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts + numberOfWorkParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body
        return this.createCreep(body, undefined, {
            role: 'longDistanceHarvester',
            home: home,
            target: target,
            sourceIndex: sourceIndex,
            working: false
        });
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createClaimer =
    function (target) {
        let name = this.createCreep([CLAIM, MOVE, MOVE], undefined, { role: 'claimer', target: target });
        return name;
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createMiner =
    function (sourceId) {
        return this.createCreep([WORK, WORK, WORK, WORK, WORK, MOVE], undefined,
                                { role: 'miner', sourceId: sourceId });
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createLorry =
    function (energy) {
        // create a body with twice as many CARRY as MOVE parts
        var numberOfParts = Math.floor(energy / 150);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        var body = [];
        for (let i = 0; i < numberOfParts * 2; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body and the role 'lorry'
        return this.createCreep(body, undefined, { role: 'lorry', working: false });
    };
