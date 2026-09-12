// Original Rice Bar Unbound model code. MIT licensed.
function isObject(value) { return !!value && typeof value === "object" && !Array.isArray(value); }
function entryId(entry) {
  if (typeof entry === "string") return entry;
  if (!isObject(entry)) return "";
  var value = entry.id;
  return value === undefined || value === null ? "" : String(value);
}
function normalizeStyle(value) {
  return String(value || "").trim().toLowerCase() === "nisfere-inspired" ? "nisfere-inspired" : "nisfere-inspired";
}
var LEFT = {"omarchy.menu":true,"omarchy.workspaces":true};
var CENTER = {"omarchy.clock":true};
var STATUS = {
  "omarchy.indicators":true,"omarchy.keyboard-layout":true,"omarchy.system-update":true,
  "omarchy.agents":true,"omarchy.tray":true,"omarchy.tailscale":true,"omarchy.dropbox":true,
  "omarchy.bluetooth":true,"omarchy.network":true,"omarchy.audio":true,"omarchy.microphone":true,
  "omarchy.monitor":true,"omarchy.power":true,"omarchy.media":true
};
function rawLayout(value) {
  var layout=isObject(value)?value:{};
  return {
    left:Array.isArray(layout.left)?layout.left.slice():[],
    center:Array.isArray(layout.center)?layout.center.slice():[],
    right:Array.isArray(layout.right)?layout.right.slice():[]
  };
}
function mapFixedClusters(layout) {
  var groups={left:[],center:[],status:[],extension:[]};
  var source=isObject(layout)?layout:{};
  ["left","center","right"].forEach(function(region){
    var entries=Array.isArray(source[region])?source[region]:[];
    entries.forEach(function(entry,index){
      var id=entryId(entry), row={entry:entry,sourceRegion:region,sourceIndex:index,visualRegion:"extension",instanceKey:region+":"+index};
      var target=LEFT[id]?"left":CENTER[id]?"center":STATUS[id]?"status":"extension";
      row.visualRegion=target; groups[target].push(row);
    });
  });
  return groups;
}
// Keep the user's left/center/right order. Extensions get their own capsule
// in place, rather than being collected into an unrelated right-hand bucket.
function mapSectionCapsules(layout) {
  var source = rawLayout(layout), sections = {left:[], center:[], right:[]};
  ["left", "center", "right"].forEach(function(region) {
    source[region].forEach(function(entry, index) {
      var id = entryId(entry);
      var extension = !(LEFT[id] === true || CENTER[id] === true || STATUS[id] === true);
      var groups = sections[region], group = groups[groups.length - 1];
      if (!group || group.extension !== extension) {
        group = {extension:extension, rows:[]};
        groups.push(group);
      }
      group.rows.push({entry:entry, sourceRegion:region, sourceIndex:index, instanceKey:region + ":" + index});
    });
  });
  return sections;
}
function safeIconName(value) {
  var name=String(value||"").trim();
  return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name)?name:"application-x-executable";
}
function cleanTitle(value) {
  return String(value === undefined || value === null ? "" : value).replace(/[\r\n\t]+/g," ").replace(/\s+/g," ").trim().slice(0,512);
}
function topGeometry(width, requestedCenterWidth) {
  var w=Math.max(0,Number(width)||0), edge=w<900?12:20, gap=w<900?8:15;
  var center=Math.min(Math.max(120,Number(requestedCenterWidth)||320),Math.max(120,w/2));
  var protectedHalf=center/2+30;
  return {edgeInset:edge,gap:gap,barHeight:40,capsuleHeight:30,centerWidth:center,protectedHalf:protectedHalf,sideMax:Math.max(0,Math.floor(w/2-protectedHalf-edge-gap))};
}
var CONTROLS = [
  {id:"omarchy.audio",label:"Audio",icon:"󰕾"},
  {id:"omarchy.network",label:"Network",icon:"󰤨"},
  {id:"omarchy.bluetooth",label:"Bluetooth",icon:"󰂯"},
  {id:"omarchy.monitor",label:"Display",icon:"󰍹"},
  {id:"omarchy.power",label:"Power",icon:"󰐥"}
];
function controlDestinations(layout) {
  var configured={};
  var source=isObject(layout)?layout:{};
  ["left","center","right"].forEach(function(region){
    var entries=Array.isArray(source[region])?source[region]:[];
    entries.forEach(function(entry){ configured[entryId(entry)]=true; });
  });
  return CONTROLS.filter(function(row){ return configured[row.id]===true; }).map(function(row){
    return {id:row.id,label:row.label,icon:row.icon};
  });
}
if(typeof module!=="undefined") module.exports={mapSectionCapsules:mapSectionCapsules,normalizeStyle:normalizeStyle,rawLayout:rawLayout,mapFixedClusters:mapFixedClusters,safeIconName:safeIconName,cleanTitle:cleanTitle,topGeometry:topGeometry,controlDestinations:controlDestinations,entryId:entryId};
