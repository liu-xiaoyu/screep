/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('population');
 * mod.thing == 'a thing'; // true
 */
var construct = {
    extension: function(flag, structure_type){
        let x = flag.pos['x'];
        let y = flag.pos['y'];
        flag.room.createConstructionSite(x-2,y,structure_type);
        flag.room.createConstructionSite(x-1,y,structure_type);
        flag.room.createConstructionSite(x,y,structure_type);
        flag.room.createConstructionSite(x+1,y,structure_type);
        flag.room.createConstructionSite(x+2,y,structure_type);
    },
    road: function(source, target){
        let path = source.pos.findPathTo(target.pos);
        for (let dot of path){
            source.room.createConstructionSite(dot['x'],dot['y'],STRUCTURE_ROAD);
        }
    },
    container: function(flag){

    }
}
module.exports = construct;