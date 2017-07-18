/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('population');
 * mod.thing == 'a thing'; // true
 */
var construct = {
    extension: function(roomName, x, y, controller_lvl){
        let structure_type = STRUCTURE_EXTENSION;
        let room = Game.rooms[roomName];
        room.createConstructionSite(x-3,y,STRUCTURE_ROAD);
        room.createConstructionSite(x+3,y,STRUCTURE_ROAD);
        room.createConstructionSite(x-2,y-1,STRUCTURE_ROAD);
        room.createConstructionSite(x-1,y-1,STRUCTURE_ROAD);
        room.createConstructionSite(x,y-1,STRUCTURE_ROAD);
        room.createConstructionSite(x+1,y-1,STRUCTURE_ROAD);
        room.createConstructionSite(x+2,y-1,STRUCTURE_ROAD);

        room.createConstructionSite(x-2,y,structure_type);
        room.createConstructionSite(x-1,y,structure_type);
        room.createConstructionSite(x,y,structure_type);
        room.createConstructionSite(x+1,y,structure_type);
        room.createConstructionSite(x+2,y,structure_type);
        if (controller_lvl >= 4){
            y = y+1;
            room.createConstructionSite(x-2,y,structure_type);
            room.createConstructionSite(x-1,y,structure_type);
            room.createConstructionSite(x,y,structure_type);
            room.createConstructionSite(x+1,y,structure_type);
            room.createConstructionSite(x+2,y,structure_type);

            room.createConstructionSite(x-3,y,STRUCTURE_ROAD);
            room.createConstructionSite(x+3,y,STRUCTURE_ROAD);
            room.createConstructionSite(x-2,y+1,STRUCTURE_ROAD);
            room.createConstructionSite(x-1,y+1,STRUCTURE_ROAD);
            room.createConstructionSite(x,y+1,STRUCTURE_ROAD);
            room.createConstructionSite(x+1,y+1,STRUCTURE_ROAD);
            room.createConstructionSite(x+2,y+1,STRUCTURE_ROAD);
        }
    },
    road: function(source, target){
        let path = source.pos.findPathTo(target.pos);
        for (let dot of path){
            source.room.createConstructionSite(dot['x'],dot['y'],STRUCTURE_ROAD);
        }
    },
    container: function(room,target){
        let sites = room.lookForAtArea('terrain', target.pos['y']-1, target.pos['x']-1 ,target.pos['y']+1,target.pos['x']+1, true)
        for (let site of sites){
            if (site['terrain']=='plain' || site['terrain']=='swamp'){
                room.createConstructionSite(site['x'],site['y'],STRUCTURE_CONTAINER);
                break;
            }
        }
    }
}
module.exports = construct;