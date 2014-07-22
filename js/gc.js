
var localsite = "";
var remotesite = "http://gccards.web.fc2.com/";
var sitebase = localsite;
var selfcheck = false;
var image_ext = ".jpg";

/**
 * General purpose functions.
 */
var List = {
    fold_left: function(f, x, l) {
        if (l.length == 0)
            return x;
        else
            return List.fold_left(f, f(x, l[0]), l.slice(1));
    },
    filter: function(f, l) {
        return List.fold_left(function(res, x) {
            if (f(x))
                res.push(x);
            return res;
        }, [], l);
    },
    /** A map function that automatically ignores null. */
    map: function(f, l) {
        if (l.length == 0)
            return l;
        else {
            var res = List.map(f, l.slice(1));
            var x = f(l[0]);
            if (x != null)
                res.unshift(x);
            return res;
        }
    },
    clear: function(l) {
        while(l.length > 0)
            l.pop();
    },
    seq: function(x, y) {
        var res = [];
        for (var i = x; i < y; i++)
            res.push(i);
        return res;
    },
    mem: function(x, l) {
        for (var k in l) {
            var v = l[k];
            if (x == v)
                return true;
        }
        return false;
    },
    iter: function(f, l) {
        for (var i = 0; i < l.length; i++)
            f(l[i]);
    },
    exists: function(f, l) {
        for (var i = 0; i < l.length; i++)
            if (f(l[i]))
                return true;
        return false;
    },
    flatten: function(l) {
        var res = [];
        for (var i = 0; i < l.length; i++)
            res = res.concat(l[i]);
        return res;
    }
}

Array.prototype.remove = function(v) {
    if (v == null)
        return;
    var idx = this.indexOf(v);
    this.splice(idx == -1 ? this.length : idx, 1); 
}

function getStarsText(stars) {
    var str = "<span class='stars" + stars + "'>";
    for (var i = 0; i < stars; i++)
        str += "★";
    str += "</span>";
    return str;
}

/** Apply buff/debuff skills. */
function applySkills(skills, stats) {
    var hp = 0;
    var mp = 0;
    var atk = 0;
    var def = 0;
    var agi = 0;
    var wis = 0;
    
    for (var i = 0; i < skills.length; i++) {
        var s = skills[i];
        hp += s.buff.self.hp;
        mp += s.buff.self.mp;
        atk += s.buff.self.atk;
        def += s.buff.self.def;
        agi += s.buff.self.agi;
        wis += s.buff.self.wis;
    }
    stats.hp = Math.floor(stats.hp * (1 + hp));
    stats.mp = Math.floor(stats.mp * (1 + mp));
    stats.atk = Math.floor(stats.atk * (1 + atk));
    stats.def = Math.floor(stats.def * (1 + def));
    stats.agi = Math.floor(stats.agi * (1 + agi));
    stats.wis = Math.floor(stats.wis * (1 + wis));
}



/** ======================================== Places ======================================== */
/*
 * Place: ID, Sorting ID, Aliases 
 * The ID will be used as the index in locale.places.
 */
var PlaceClass = function(d) {
    this.id = d[0];
    this.sid = d[1]; /* Sorting order. */
    this.name = locale.places[d[0]];
};
PlaceClass.prototype.mklnk = function() {
    return "<a href='cards.html?place=" + this.id + "'>" + this.name + "</a>";
};
var Place = (function() {
    var data = [
        [0,  0,   ["plains"]],             // Berneside Plains
        [1,  1,   ["plains_night"]],       // Berneside Plains (Night)
        [2,  2,   ["volcano"]],            // Glaverow Volcanic Zone
        [3,  3,   ["volcano_night"]],      // Glaverow Volcanic Zone (Night)
        [4,  4,   ["snowfield"]],          // Storm Reach Snowfield
        [5,  5,   ["snowfield_night"]],    // Storm Reach Snowfield (Night)
        [6,  6,   ["desert"]],             // Deadmoon Desert
        [7,  7,   ["desert_night"]],       // Deadmoon Desert (Night)
        [8,  8,   ["ocean"]],              // Cerulean Deep
        [9,  9,   ["ocean_night"]],        // Cerulean Deep (Night)
        [10, 100, ["invitation"]],         // Invitation Bonus
        [11, 101, ["coliseum"]],           // Coliseum Rewards
        [12, 102, ["golbez"]],             // Grab-a-Golbez Campaign
        [13, 103, ["fp"]],                 // Friend Points
        [14, 104, ["trials"]],             // Hall of Trials
        [15, 105, ["trials2"]],            // Hall of Trials II
        [16, 106, ["gold_slime"]],         // Special Gold Present
        [17, 107, ["others"]],             // Other Bonus
        [18, 108, ["quests"]],             // Quests
        [19, 109, ["login"]],              // Login Rewards
        [20, 110, ["grounds"]],            // All Hunting Grounds
        [21, 111, ["crimson_keep"]],       // Crimson Keep
        [22, 112, ["black_snow"]],         // The Guardians Who Stole Christmas
        [23, 10,  ["zeus"]]                // Zeus Nebula
    ];

    var places = {
        all: []
    };
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        var place = new PlaceClass(d);
        places.all[i] = place;
        for (var j = 0; j < d[2].length; j++) {
            var alias = d[2][j];
            places[alias] = place;
        }
    }

    return places;
})();
/** ======================================== End of Places ======================================== */



/** ======================================== Events ======================================== */
/* 
 * Event: ID, Aliases 
 * The ID will be used as the index in locale.events.
 */
var EventClass = function(d) {
    this.id = d[0];
    this.name = locale.events[d[0]];
};
var Event = (function() {
    var data = [
        [0,  ["none"]],                         // None
        [1,  ["ff4"]],                          // FFIV
        [2,  ["ff5"]],                          // FFV
        [3,  ["dragon"]],                       // Wild Dragon Hunter
        [4,  ["bahamut"]],                      // Bahamut's Descent
        [5,  ["gilgamesh"]],                    // Epic of Gilgamesh
        [6,  ["trials"]],                       // Hall of Trials
        [7,  ["pixie"]],                        // Rainbow Pixie Event
        [8,  ["serpents"]],                     // Sevenstone Serpents Event
        [9,  ["weapons"]],                      // Seven Deadly Weapons Event
        [10, ["slime"]],                        // Mass Slime Panic
        [11, ["trials2"]],                      // Hall of Trials II
        [12, ["gold_slime"]],                   // Gold Slime
        [13, ["dengeki"]],                      // Dengeki Game Appli
        [14, ["okaeri"]],                       // Okaeri
        [15, ["famitsu"]],                      // Famitsu App Bonus
        [16, ["chess"]],                        // Chess Guardians
        [17, ["ff11"]],                         // FFXI 10 Years
        [18, ["bugbear"]],                      // Bugbear's Nightmare
        [19, ["kingdom_conquest2"]],            // Kingdom Conquest II
        [20, ["fisherman"]],                    // Fisherman's Cup
        [21, ["summer"]],                       // Summer Hunt
        [22, ["stinging"]],                     // On Stinging Tides
        [23, ["ff14"]],                         // Final Fantasy XIV
        [24, ["tgs2012"]],                      // Tokyo Game Show 2012
        [25, ["graeae"]],                       // Graeae
        [26, ["tgs2013"]],                      // Tokyo Game Show 2013
        [27, ["sweet_nightmare"]],              // Sweet Nightmare
        [28, ["iphone_cover"]],
        [29, ["pink_slime"]],
        [30, ["ff13"]],                         // Lightning Returns FFXIII
        [31, ["crimson_keep"]],                 // Crimson Keep
        [32, ["chocobo_eater"]],                // Chocobo Eater
        [33, ["black_snow"]],                   // The Guardians Who Stole Christmas
        [34, ["famitsu10"]],                    // ファミ通App vol.10 購入特典
        [35, ["ffx_x2_hd_remaster_bonus"]],     // FINAL FANTASY X | X-2 HD Remaster 購入特典
        [36, ["famitsu12"]],                    // ファミ通App vol.12 購入特典
        [37, ["newyear2014"]],                  // 新春ハント
        [38, ["ffx_x2_hd_remaster"]],           // FINAL FANTASY X | X-2 HD Remaster / Aeons in the FINAL FANTASY frontier!
        [39, ["survey2014"]],                   // Survey 2014
        [40, ["titan_legend"]],
        [41, ["valentine"]],                    // Valentine Hunt Event 2014
        [42, ["bahamut_returns"]],              // Bahamut Returns!
        [43, ["moondust"]],                     // 月下の砂塵
        [44, ["darktrap"]],                     // 暗黑の罠
        [45, ["rise_of_mana"]],                 // 聖剣伝説 RISE of MANA
        [46, ["orion"]],                        // 流星のオリオン
        [47, ["isarika"]],                      // 魔を誘う漁火
        [48, ["lightdarkness"]],                // 白光極夜
        [49, ["juggernaut_hunting"]],           // 凍土の機神
        [50, ["doubled2"]],                     // Week #2 Spawn rates now doubled!
        [51, ["desert_wind"]],                  // 砂海を彷徨う風精
        [52, ["lightning_wind"]],               // 蒼雷黑風
        [53, ["dragon_sky"]],                   // 竜空を生きる者達
        [54, ["goldendawn"]],                   // Popular Guardians Gather The Goldendawn Hunt!
        [55, ["anniversary2"]],                 // 2nd Anniversary - ゴールドハント
        [56, ["blackwing"]]                     // 2nd Anniversary - 黑翼の墮天使
    ];

    var events = {
        all: []
    };
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        var event = new EventClass(d);
        events.all[i] = event;
        for (var j = 0; j < d[1].length; j++) {
            var alias = d[1][j];
            events[alias] = event;
        }
    }

    return events;
})();
/** ======================================== End of Events ======================================== */



/** ======================================== Borders ======================================== */
/*
 * Border: ID, Aliases 
 * The ID will be used as the index in locale.borders.
 */
var BorderClass = function(d) {
    this.id = d[0];
    this.name = locale.borders[d[0]];
};
var Border = (function() {
    var data = [
        [0, ["none"]],     // None
        [1, ["lesser"]],   // Lesser
        [2, ["great"]],    // Great
        [3, ["mighty"]],   // Mighty
        [4, ["almighty"]]  // Almighty
    ];

    var borders = {
        all: []
    };
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        var border = new BorderClass(d);
        borders.all[i] = border;
        for (var j = 0; j < d[1].length; j++) {
            var alias = d[1][j];
            borders[alias] = border;
        }
    }

    return borders;
})();
/** ======================================== End of Borders ======================================== */




/** ======================================== Attributes ======================================== */
/*
 * Attribute: ID, Aliases, Criticals, Weaks
 * The ID will be used as the index in locale.attributes.
 */
var AttributeClass = function(d) {
    this.id = d[0];
    this.name = locale.attributes[d[0]];
    this.criticals = d[2];
    this.weaks = d[3];
};
/** Returne true if this attribute has strength over the specified attribute. */
AttributeClass.prototype.isCriticalTo = function (e) {
    return List.exists(function(aid) { return aid == e.id; }, this.criticals);
};
/** Returne true if this attribute is blocked by the specified attribute. */
AttributeClass.prototype.isBlockedBy = function(e) {
    return List.exists(function(aid) { return aid == e.id; }, this.weaks);
};
AttributeClass.prototype.getImage = function() {
    width = typeof(width) == 'undefined' ? 20 : width;
    return "<img width='" + width + "px' src='images/attributes/" + this.id + image_ext + "' />";
};
AttributeClass.prototype.getCriticalTo = function() {
    var that = this;
    return List.filter(function(attr) { return that.isCriticalTo(attr); }, Attribute.all);
};
AttributeClass.prototype.getBlockedBy = function() {
    var that = this;
    return List.filter(function(attr) { return that.isBlockedBy(attr); }, Attribute.all);
};
/** Returns the attributes that have strength over this one. */
AttributeClass.prototype.getCriticalBy = function() {
    var that = this;
    return List.filter(function(attr) { return attr.isCriticalTo(that); }, Attribute.all);
};
/** Returns the attributes that are blocked by this one. */
AttributeClass.prototype.getBlocks = function() {
    var that = this;
    return List.filter(function(attr) { return attr.isBlockedBy(that); }, Attribute.all);
};
var Attribute = (function() {
    var data = [
        [0,  ["fire"],      [4,  6],  [0,  1,  8]], // Fire
        [1,  ["water"],     [0,  7],  [1,  3,  5]], // Water
        [2,  ["earth"],     [3,  5],  [2,  4,  9]], // Earth
        [3,  ["lightning"], [1,  7],  [2,  3,  8]], // Lightning
        [4,  ["wind"],      [2,  9],  [0,  4,  6]], // Wind
        [5,  ["poison"],    [1,  9],  [2,  5,  6]], // Poison
        [6,  ["death"],     [4,  5],  [0,  6,  7]], // Death
        [7,  ["mecha"],     [6,  8],  [1,  3,  7]], // Mecha
        [8,  ["light"],     [0,  3],  [7,  8,  9]], // Light
        [9,  ["darkness"],  [2,  8],  [4,  5,  9]], // Darkness
        [10, ["none"],      [],       []]           // None
    ];

    var attributes = {
        all: []
    };
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        var attr = new AttributeClass(d);
        attributes.all[i] = attr;
        for (var j = 0; j < d[1].length; j++) {
            var alias = d[1][j];
            attributes[alias] = attr;
        }
    }

    return attributes;
})();
/** ======================================== End of Attributes ======================================== */



/** ======================================== Types ======================================== */
/*
 * Type: ID Name Shortname Aliases HP MP ATK DEF AGI WIS RebirthType NormalType
 */
var TypeClass = function(d) {
    this.id = d[0];
    this.name = d[1];
    this.shortname = d[2];
    this.hp = d[4];
    this.mp = d[5];
    this.atk = d[6];
    this.def = d[7];
    this.agi = d[8];
    this.wis = d[9];
    this.rb = d[10];
    this.norm = d[11];
};
TypeClass.prototype.getRebirthType = function() {
    return this.rb == -1 ? null : Type.all[this.rb];
};
TypeClass.prototype.getNormalType = function() {
    return this.norm == -1 ? null : Type.all[this.norm];
};
TypeClass.prototype.isRebirthType = function() {
    return this.getRebirthType() == null;
};
var Type = (function() {
    var data = [
        [0,  locale.types[0],   "C", ["cool"],           1,    1,    1,    1,    1,    1,  8, -1], // Cool
        [1,  locale.types[1],   "O", ["chaotic"],      1.1,    1,    1,    1,    1,  0.9,  9, -1], // Chaotic
        [2,  locale.types[2],   "X", ["sexy"],         0.9,  1.1,    1,    1,    1,    1, 10, -1], // Sexy
        [3,  locale.types[3],   "P", ["powerful"],       1,    1,  1.1,    1,  0.9,    1, 11, -1], // Powerful
        [4,  locale.types[4],   "R", ["brave"],          1,  0.9,    1,  1.1,    1,    1, 12, -1], // Brave
        [5,  locale.types[5],   "F", ["fast"],           1,    1,    1,  0.9,  1.1,    1, 13, -1], // Fast
        [6,  locale.types[6],   "I", ["intelligent"],    1,    1,  0.9,    1,    1,  1.1, 14, -1], // Intelligent
        [7,  locale.types[7],   "A", ["ace"],          1.1,  1.1,  1.1,  1.1,  1.1,  1.1, 15, -1], // Ace
        [8,  locale.types[8],   "C", ["coolr"],          1,    1,    1,    1,    1,    1, -1,  0], // Cool
        [9,  locale.types[9],   "D", ["bold"],        1.15,    1,    1,    1,    1, 0.85, -1,  1], // Bold
        [10, locale.types[10],  "E", ["erotic"],      0.85, 1.15,    1,    1,    1,    1, -1,  2], // Erotic
        [11, locale.types[11],  "B", ["berserk"],        1,    1, 1.15,    1, 0.85,    1, -1,  3], // Berserk
        [12, locale.types[12],  "T", ["stalwart"],       1, 0.85,    1, 1.15,    1,    1, -1,  4], // Stalwart
        [13, locale.types[13],  "S", ["sonic"],          1,    1,    1, 0.85, 1.15,    1, -1,  5], // Sonic
        [14, locale.types[14],  "W", ["wise"],           1,    1, 0.85,    1,    1, 1.15, -1,  6], // Wise
        [15, locale.types[15],  "A", ["acer"],         1.1,  1.1,  1.1,  1.1,  1.1,  1.1, -1,  7]  // Ace
    ];
    var hete_types = [
        [16, locale.types[16],  "O", ["chaoticr"],     1.1,    1,    1,    1,    1,  0.9, -1, 1],  // ChaoticR
        [17, locale.types[17],  "X", ["sexyr"],        0.9,  1.1,    1,    1,    1,    1, -1, 2],  // SexyR
        [18, locale.types[18],  "P", ["powerfulr"],      1,    1,  1.1,    1,  0.9,    1, -1, 3],  // PowerfulR
        [19, locale.types[19],  "R", ["braver"],         1,  0.9,    1,  1.1,    1,    1, -1, 4],  // BraveR
        [20, locale.types[20],  "F", ["fastr"],          1,    1,    1,  0.9,  1.1,    1, -1, 5],  // FastR
        [21, locale.types[21],  "I", ["intelligentr"],   1,    1,  0.9,    1,    1,  1.1, -1, 6]   // IntelligentR
    ];
    if (getCookie(COOKIE_LOAD_HETEROGENEOUS_TYPES, "") == "true")
        data = data.concat(hete_types);

    var types = {
        all: []
    };
    var types_map = {};
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        var type = new TypeClass(d);
        types.all[i] = type;
        types_map[type.id] = type;
        for (var j = 0; j < d[3].length; j++) {
            var alias = d[3][j];
            types[alias] = type;
        }
    }

    types.get = function(id) {
        return id in types_map ? types_map[id] : null;
    };

    types.except = function(ts) {
        var res = [];
        for (var i = 0; i < types.all.length; i++) {
            var t = types.all[i];
            if (!List.mem(t, ts))
                res.push(t);
        }
        return res;
    };

    return types;
})();
/** ======================================== End of Types ======================================== */



/** ======================================== Skills ======================================== */
var SKILL_ATTACK = 0;
var SKILL_BUFF = 1;
var SKILL_OTHER = 2;
var SkillClass = function(d) {
    this.id = d[0];
    this.type = d[1];
    this.name = locale.skills[d[0]][0];
    this.description = locale.skills[d[0]][1];
    this.cost = d[3];
    this.stone = d[4];
    this.buff = d[5];
    this.attribute = d[6];
    this.level = d[7];
};
SkillClass.prototype.isBuff = function() {
    return this.type == SKILL_BUFF;
};
SkillClass.prototype.isPhysical = function() {
    return this.type == SKILL_ATTACK && this.attribute == Attribute.none;
};
SkillClass.prototype.isElemental = function() {
    return this.type == SKILL_ATTACK && this.attribute != Attribute.none;
};
SkillClass.prototype.isDeath = function() {
    return this == Skill.death1 || this == Skill.death2 || this == Skill.death3 || this == Skill.death4;
};
SkillClass.prototype.getLink = function() {
    return "<a href='cards.html?skill=" + this.id + "' target='_blank' title='" + this.description + "' class='skill-link'>" + this.name + "</a>";
};
var Skill = (function() {
    var stone_no = 0;
    var stone_yes = 1;
    var COST_UNKNOWN = 0;
    var BuffClass = function(o) {
        this.hp = 'hp' in o ? o.hp : 0;
        this.mp = 'mp' in o ? o.mp : 0;
        this.atk = 'atk' in o ? o.atk : 0;
        this.def = 'def' in o ? o.def : 0;
        this.agi = 'agi' in o ? o.agi : 0;
        this.wis = 'wis' in o ? o.wis : 0;
        this.dhp = 'dhp' in o ? o.dhp : 0;
        this.dmp = 'dmp' in o ? o.dmp : 0;
        this.datk = 'datk' in o ? o.datk : 0;
        this.ddef = 'ddef' in o ? o.ddef : 0;
        this.dagi = 'dagi' in o ? o.dagi : 0;
        this.dwis = 'dwis' in o ? o.dwis : 0;
    };
    var nbuff = function(o) {
        var b = new BuffClass(o);
        return {
            /* Buffs applied to a caed itself. */
            self: b,
            /* Buffs and debuffs applied to two cards. */
            versus: function(c1, c2) {
                return b;
            }
        };
    };
    var Cost = function(hp, mp) {
        this.hp = hp;
        this.mp = mp;
    };
    /*
     * Skill: ID Type Aliases Cost(HP,MP) Stone Buff(SelfBuff VersusBuff) BuffCondition Attribute Level
     * SelfBuff: buffs applied to a card itself.
     * VersusBuff: buffs and debuffs when a card faces another card.
     */
    var data = [
        [0,  SKILL_ATTACK, "slash1",               new Cost(0,  150), stone_yes, nbuff({}),                   Attribute.none, 1], // Slash
        [1,  SKILL_ATTACK, "slash2",               new Cost(0,  300), stone_yes, nbuff({}),                   Attribute.none, 2], // Cross Slash
        [2,  SKILL_ATTACK, "slash3",               new Cost(0,  600), stone_yes, nbuff({}),                   Attribute.none, 3], // Hard Slash
        [3,  SKILL_ATTACK, "slash4",               new Cost(0, 1200), stone_yes, nbuff({}),                   Attribute.none, 4], // Thousand Slash
        [4,  SKILL_ATTACK, "physical1",            new Cost(0,  150), stone_yes, nbuff({}),                   Attribute.none, 1], // Hard Blow
        [5,  SKILL_ATTACK, "physical2",            new Cost(0,  300), stone_yes, nbuff({}),                   Attribute.none, 2], // Heavy Blow
        [6,  SKILL_ATTACK, "physical3",            new Cost(0,  600), stone_yes, nbuff({}),                   Attribute.none, 3], // Double Impact
        [7,  SKILL_ATTACK, "physical4",            new Cost(0, 1200), stone_yes, nbuff({}),                   Attribute.none, 4], // Storm Impact
        [8,  SKILL_ATTACK, "fire1",                new Cost(0,  150), stone_yes, nbuff({}),                   Attribute.fire, 1], // Burning Beat (Fire +1)
        [9,  SKILL_ATTACK, "fire2",                new Cost(0,  300), stone_yes, nbuff({}),                   Attribute.fire, 2], // Burning Strike (Fire +2)
        [10, SKILL_ATTACK, "fire3",                new Cost(0,  600), stone_yes, nbuff({}),                   Attribute.fire, 3], // Explosion (Fire +3)
        [11, SKILL_ATTACK, "fire4",                new Cost(0, 1200), stone_yes, nbuff({}),                   Attribute.fire, 4], // Meteor Storm (Fire +4)
        [12, SKILL_ATTACK, "fire4x",               new Cost(0, 1300), stone_yes, nbuff({}),                   Attribute.fire, 5], // Meteor Swarm (Fire +4x)
        [13, SKILL_ATTACK, "water1",               new Cost(0,  150), stone_yes, nbuff({}),                   Attribute.water, 1], // Aqua Splash
        [14, SKILL_ATTACK, "water2",               new Cost(0,  300), stone_yes, nbuff({}),                   Attribute.water, 2], // Aqua Shot
        [15, SKILL_ATTACK, "water3",               new Cost(0,  600), stone_yes, nbuff({}),                   Attribute.water, 3], // Aqua Burst
        [16, SKILL_ATTACK, "water4",               new Cost(0, 1200), stone_yes, nbuff({}),                   Attribute.water, 4], // Maelstrom
        [17, SKILL_ATTACK, "earth1",               new Cost(0,  150), stone_yes, nbuff({}),                   Attribute.earth, 1], // Ice Needle
        [18, SKILL_ATTACK, "earth2",               new Cost(0,  300), stone_yes, nbuff({}),                   Attribute.earth, 2], // Ice Spike
        [19, SKILL_ATTACK, "earth3",               new Cost(0,  600), stone_yes, nbuff({}),                   Attribute.earth, 3], // Rock Bite
        [20, SKILL_ATTACK, "earth4",               new Cost(0, 1200), stone_yes, nbuff({}),                   Attribute.earth, 4], // Earthquake
        [21, SKILL_ATTACK, "lightning1",           new Cost(0,  150), stone_yes, nbuff({}),                   Attribute.lightning, 1], // Thunderbolt
        [22, SKILL_ATTACK, "lightning2",           new Cost(0,  300), stone_yes, nbuff({}),                   Attribute.lightning, 2], // Thunder Strike
        [23, SKILL_ATTACK, "lightning3",           new Cost(0,  600), stone_yes, nbuff({}),                   Attribute.lightning, 3], // Call Lightning
        [24, SKILL_ATTACK, "lightning4",           new Cost(0, 1200), stone_yes, nbuff({}),                   Attribute.lightning, 4], // Chain Lightning
        [25, SKILL_ATTACK, "wind1",                new Cost(0,  150), stone_yes, nbuff({}),                   Attribute.wind, 1], // Wind Cutter
        [26, SKILL_ATTACK, "wind2",                new Cost(0,  300), stone_yes, nbuff({}),                   Attribute.wind, 2], // Wind Edge
        [27, SKILL_ATTACK, "wind3",                new Cost(0,  600), stone_yes, nbuff({}),                   Attribute.wind, 3], // Whirlwind
        [28, SKILL_ATTACK, "wind4",                new Cost(0, 1200), stone_yes, nbuff({}),                   Attribute.wind, 4], // Tornado
        [29, SKILL_ATTACK, "poison1",              new Cost(0,  150), stone_yes, nbuff({}),                   Attribute.poison, 1], // Poison Bubble
        [30, SKILL_ATTACK, "poison2",              new Cost(0,  300), stone_yes, nbuff({}),                   Attribute.poison, 2], // Poison Mist
        [31, SKILL_ATTACK, "poison3",              new Cost(0,  600), stone_yes, nbuff({}),                   Attribute.poison, 3], // Poison Field
        [32, SKILL_ATTACK, "poison4",              new Cost(0, 1200), stone_yes, nbuff({}),                   Attribute.poison, 4], // Venom Riot
        [33, SKILL_ATTACK, "death1",               new Cost(0,  150), stone_no,  nbuff({}),                   Attribute.death, 1], // Gaze of Death
        [34, SKILL_ATTACK, "death2",               new Cost(0,  300), stone_no,  nbuff({}),                   Attribute.death, 2], // Touch of Death
        [35, SKILL_ATTACK, "death3",               new Cost(0,  600), stone_no,  nbuff({}),                   Attribute.death, 3], // Embrace of Death
        [36, SKILL_ATTACK, "death4",               new Cost(0, 1200), stone_no,  nbuff({}),                   Attribute.death, 4], // Kiss of Death
        [37, SKILL_ATTACK, "light1",               new Cost(0,  150), stone_yes, nbuff({}),                   Attribute.light, 1], // Holy Light
        [38, SKILL_ATTACK, "light2",               new Cost(0,  300), stone_yes, nbuff({}),                   Attribute.light, 2], // Shine Smite
        [39, SKILL_ATTACK, "light3",               new Cost(0,  600), stone_yes, nbuff({}),                   Attribute.light, 3], // Shine Burst
        [40, SKILL_ATTACK, "light4",               new Cost(0, 1200), stone_yes, nbuff({}),                   Attribute.light, 4], // Vanish
        [41, SKILL_ATTACK, "darkness1",            new Cost(0,  150), stone_yes, nbuff({}),                   Attribute.darkness, 1], // Darkness
        [42, SKILL_ATTACK, "darkness2",            new Cost(0,  300), stone_yes, nbuff({}),                   Attribute.darkness, 2], // Dark Pain
        [43, SKILL_ATTACK, "darkness3",            new Cost(0,  600), stone_yes, nbuff({}),                   Attribute.darkness, 3], // Dark Psalm
        [44, SKILL_ATTACK, "darkness4",            new Cost(0, 1200), stone_yes, nbuff({}),                   Attribute.darkness, 4], // Nightmare
        [45, SKILL_BUFF, "atk10",                  new Cost(0,  100), stone_no,  nbuff({atk: 0.1}),           Attribute.none, 0], // Might
        [46, SKILL_BUFF, "atk20",                  new Cost(0,  200), stone_no,  nbuff({atk: 0.2}),           Attribute.none, 0], // Greater Might
        [47, SKILL_BUFF, "atk25",                  new Cost(0,  locale.getLanguage() == LANG_JP ? 600 : 400), 
                                                                      stone_no,  nbuff({atk: 0.25}),          Attribute.none, 0], // Fount of Strength
        [48, SKILL_BUFF, "def10",                  new Cost(0,  100), stone_no,  nbuff({def: 0.1}),           Attribute.none, 0], // Protect
        [49, SKILL_BUFF, "def20",                  new Cost(0,  200), stone_no,  nbuff({def: 0.2}),           Attribute.none, 0], // Greater Protect
        [50, SKILL_BUFF, "def25",                  new Cost(0,  locale.getLanguage() == LANG_JP ? 600 : 400), 
                                                                      stone_no,  nbuff({def: 0.25}),          Attribute.none, 0], // Stoic Stance
        [51, SKILL_BUFF, "def40",                  new Cost(0, 1000), stone_no,  nbuff({def: 0.4}),           Attribute.none, 0], // Ultimate Guard
        [52, SKILL_BUFF, "agi10",                  new Cost(0,  100), stone_no,  nbuff({agi: 0.1}),           Attribute.none, 0], // Haste
        [53, SKILL_BUFF, "agi20",                  new Cost(0,  200), stone_no,  nbuff({agi: 0.2}),           Attribute.none, 0], // Greater Haste
        [54, SKILL_BUFF, "agi25",                  new Cost(0,  locale.getLanguage() == LANG_JP ? 600 : 400), 
                                                                      stone_no,  nbuff({agi: 0.25}),          Attribute.none, 0], // Quickstride
        [55, SKILL_BUFF, "wis10",                  new Cost(0,  100), stone_no,  nbuff({wis: 0.1}),           Attribute.none, 0], // Cunning
        [56, SKILL_BUFF, "wis20",                  new Cost(0,  200), stone_no,  nbuff({wis: 0.2}),           Attribute.none, 0], // Greater Cunning
        [57, SKILL_BUFF, "wis25",                  new Cost(0,  locale.getLanguage() == LANG_JP ? 600 : 400), 
                                                                      stone_no,  nbuff({wis: 0.25}),          Attribute.none, 0], // Mental Geyser
        [58, SKILL_BUFF, "atkdef10",               new Cost(0,  400), stone_no,  nbuff({atk: 0.1, def: 0.1}), Attribute.none, 0], // Ursince Aspect
        [59, SKILL_BUFF, "atkagi10",               new Cost(0,  400), stone_no,  nbuff({atk: 0.1, agi: 0.1}), Attribute.none, 0], // Feline Aspect
        [60, SKILL_BUFF, "atkwis10",               new Cost(0,  400), stone_no,  nbuff({atk: 0.1, wis: 0.1}), Attribute.none, 0], // Simian Aspect
        [61, SKILL_BUFF, "defagi10",               new Cost(0,  400), stone_no,  nbuff({def: 0.1, agi: 0.1}), Attribute.none, 0], // Avian Aspect
        [62, SKILL_BUFF, "defwis10",               new Cost(0,  400), stone_no,  nbuff({def: 0.1, wis: 0.1}), Attribute.none, 0], // Chelonian Aspect
        [63, SKILL_BUFF, "agiwis10",               new Cost(0,  400), stone_no,  nbuff({agi: 0.1, wis: 0.1}), Attribute.none, 0], // Vulpine Aspect
        [64, SKILL_BUFF, "datk20",                 new Cost(0,  150), stone_no,  nbuff({datk: -0.2}),         Attribute.none, 0], // Weakness
        [65, SKILL_BUFF, "ddef20",                 new Cost(0,  150), stone_no,  nbuff({ddef: -0.2}),         Attribute.none, 0], // Lower Defense
        [66, SKILL_BUFF, "dagi20",                 new Cost(0,  150), stone_no,  nbuff({dagi: -0.2}),         Attribute.none, 0], // Slow
        [67, SKILL_BUFF, "dagi40",                 new Cost(0, 1000), stone_no,  nbuff({dagi: -0.4}),         Attribute.none, 0], // Gravity Wave
        [68, SKILL_BUFF, "dwis20",                 new Cost(0,  150), stone_no,  nbuff({dwis: -0.2}),         Attribute.none, 0], // Mind Blast
        [69, SKILL_BUFF, "dwis40",                 new Cost(0, 1000), stone_no,  nbuff({dwis: -0.4}),         Attribute.none, 0], // Psychic Blast
        [70, SKILL_OTHER, "heal",                  new Cost(0,  100), stone_no,  nbuff({}),                   Attribute.none, 0], // Heal
        [71, SKILL_OTHER, "majorheal",             new Cost(0,  300), stone_no,  nbuff({}),                   Attribute.none, 0], // Greater Heal
        [72, SKILL_OTHER, "life",                  new Cost(0,  450), stone_no,  nbuff({}),                   Attribute.none, 0], // Life Drain
        [73, SKILL_OTHER, "mana",                  new Cost(0,   20), stone_no,  nbuff({}),                   Attribute.none, 0], // Energy Drain
        [74, SKILL_OTHER, "ls",                    new Cost(0,    1), stone_no,  nbuff({}),                   Attribute.none, 0], // Last Stand
        [75, SKILL_OTHER, "sd",                    new Cost(0,    0), stone_no,  nbuff({}),                   Attribute.none, 0], // Self-destruct
        [76, SKILL_OTHER, "qs",                    new Cost(0,  300), stone_no,  nbuff({}),                   Attribute.none, 0], // Quick Strike
        [77, SKILL_OTHER, "revival",               new Cost(0,    1), stone_no,  nbuff({}),                   Attribute.none, 0], // Revival
        [78, SKILL_OTHER, ["ep", "pulse"],         new Cost(0,  300), stone_no,  nbuff({}),                   Attribute.none, 0], // Ethereal Pulse
        [79, SKILL_ATTACK, ["gs", "smash"],        new Cost(0, 1200), stone_no,  nbuff({}),                   Attribute.none, 0], // Gigant Smash
        [80, SKILL_OTHER, "ds",                    new Cost(0,  300), stone_no,  nbuff({}),                   Attribute.none, 0], // Deft Step
        [81, SKILL_OTHER, "sap",                   new Cost(0,  600), stone_no,  nbuff({}),                   Attribute.none, 0], // Sap
        [82, SKILL_OTHER, ["fb", "multiblock"],    new Cost(0,  600), stone_no,  nbuff({}),                   Attribute.none, 0], // Full Barrier (Attribute resistance)
        [83, SKILL_OTHER, ["mr", "mindbreak"],     new Cost(0,  600), stone_no,  nbuff({}),                   Attribute.none, 0], // Mind Rift (Confusion)
        [84, SKILL_OTHER, ["dr", "counter"],       new Cost(0,  300), stone_no,  nbuff({}),                   Attribute.none, 0], // Deadly Reflex (Counterattack)
        [85, SKILL_ATTACK, "mecha4",               new Cost(0, 1200), stone_no,  nbuff({}),                   Attribute.mecha, 4], // Phantom Gear (Mecha + 4)
        [86, SKILL_ATTACK, ["bg", "soulslash"],    new Cost(1000, 0), stone_no,  nbuff({}),                   Attribute.none, 4], // Blood Gambit
        [87, SKILL_OTHER, "curse",                 new Cost(0,    0), stone_no,  nbuff({}),                   Attribute.none, 0], // Mana Martyr (Deals MP damage on death)
        [88, SKILL_BUFF, "datk40",                 new Cost(0, 1000), stone_no,  nbuff({datk: -0.4}),         Attribute.none, 0], // Stifle (Enemy ATK -40%)
        [89, SKILL_ATTACK, "cd",                   new Cost(0, 1400), stone_no,  nbuff({}),                   Attribute.none, 4], // Lifeleech (Absorbs enemy HP), Crash Drain
        [90, SKILL_OTHER, ["tb", "poisonattack"],  new Cost(0,    0), stone_no,  nbuff({}),                   Attribute.none, 0], // Toxic Blast (Damage over time)
        [91, SKILL_OTHER, ["nervepinch", "np",
                                         "sleep"], new Cost(0,    0), stone_no,  nbuff({}),                   Attribute.none, 0], // Nerve Pinch (Inflicts paralysis)
        [92, SKILL_ATTACK, "lightning4x",          new Cost(0, 1300), stone_yes, nbuff({}),                   Attribute.lightning, 5], // Ball Lightning (Lightning +4x)
        [93, SKILL_ATTACK, ["deathpredator", "dp"],new Cost(0, 1400), stone_no, 
                                                   { self: new BuffClass({atk: 0.2, def: 0.2, agi: 0.2, wis: 0.2}), 
                                                     versus: function(c1, c2) {
                                                         if (c1.attribute.isCriticalTo(c2.attribute))
                                                             return new BuffClass({atk: 0.2, def: 0.2, agi: 0.2, wis: 0.2});
                                                         else if (c1.attribute.isBlockedBy(c2.attribute) || c1.attribute == c2.attribute)
                                                             return new BuffClass({atk: -0.1, def: -0.1, agi: -0.1, wis: -0.1});
                                                         else
                                                             return new BuffClass({atk: 0.1, def: 0.1, agi: 0.1, wis: 0.1});
                                                     } 
                                                   },                                                         Attribute.none, 4], // Reaper's Luck
        [94, SKILL_OTHER, "transposition",         new Cost(0, 300), stone_no,   nbuff({}),                   Attribute.none, 0], // Manavita Shift
        [95, SKILL_BUFF, ["powershift"],           new Cost(0, 600), stone_no, nbuff({atk: 0.2, ddef: -0.2}), Attribute.none, 0], // Might Reave
        [96, SKILL_BUFF, ["mindshift"],            new Cost(0, 600), stone_no, nbuff({wis: 0.2, dwis: -0.2}), Attribute.none, 0], // Mind Reave
        [97, SKILL_OTHER, ["resistant"],           new Cost(0, 600), stone_no, nbuff({}),                     Attribute.none, 0], // Resistant
        [98, SKILL_BUFF, ["fastshift"],            new Cost(0, 600), stone_no, nbuff({agi: 0.2, dwis: -0.2}), Attribute.none, 0], // Fast Shift
        [99, SKILL_OTHER, ["sds"],                 new Cost(0, COST_UNKNOWN), stone_no, nbuff({}),            Attribute.none, 0]  // Shadow Deft Step
    ];

    var skills = {
        all: []
    };
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        var skill = new SkillClass(d);
        skills.all[i] = skill;
        
        var aliases = d[2];
        if (typeof aliases == 'string')
            aliases = [aliases];
        for (var j = 0; j < aliases.length; j++)
            skills[aliases[j]] = skill;
    }

    skills.get = (function() {
        var skills_map = {};
        for (var i = 0; i < skills.all.length; i++)
            skills_map[skills.all[i].id] = skills.all[i];
        return function(id) {
            return id in skills_map ? skills_map[id] : null;
        };
    })();
    skills.toString = function(skills, delim) {
        if (skills.length == 0)
            return "";
        var s = skills[0].name + " (" + skills[0].description + ")";
        for (var i = 1; i < skills.length; i++)
            s += delim + skills[i].name + " (" + skills[i].description + ")";
        return s;
    };
    /* Skills that have stones. */
    skills.getLearnableSkills = (function() {
        var stone_skills = [];
        for (var i = 0; i < skills.all.length; i++) {
            if (skills.all[i].stone == 1)
                stone_skills.push(skills.all[i]);
        }
        return function() {
            return stone_skills;
        };
    })();

    return skills;
})();
/** ======================================== End of Skills ======================================== */



/** ======================================== Shapes ======================================== */
/*
 * Shape: ID Name Aliases
 */
var ShapeClass = function(d) {
    this.id = d[0];
    this.name = d[1];
};
ShapeClass.prototype.getImage = function(width) {
    width = typeof(width) == 'undefined' ? 100 : width;
    return this.id == -1 ? "" : "<img width='" + width + "px' src='images/silhouettes/book_silhouette" + this.id + image_ext + "' />";
};
var Shape = (function() {
    var data = [
        [1,   "Slime",                 ["slime"]],
        [2,   "Floating Orbs",         ["orbs", "circular"]],
        [3,   "Humanoid",              ["humanoid"]],
        [4,   "Giant",                 ["giant"]],
        [6,   "Bird",                  ["bird", "avian"]],
        [7,   "Wolf",                  ["wolf", "canine"]],
        [8,   "Dragon",                ["dragon"]],
        [9,   "Female",                ["female"]],
        [10,  "Beast",                 ["beast"]],
        [11,  "Shark",                 ["shark"]],
        [12,  "Mermaid",               ["mermaid"]],
        [13,  "Merman",                ["merman"]],
        [14,  "Serpent",               ["serpent"]],
        [15,  "Jellyfish",             ["jellyfish"]],
        [16,  "Pumpkin-head",          ["pumpkinhead"]],
        [17,  "Pumpkin",               ["pumpkin"]],
        [18,  "Cactuar",               ["cactuar"]],
        [19,  "Valentine",             ["valentine"]],
        [20,  "zorbs",                 ["zorbs"]],
        [23,  "zhumanoid",             ["zhumanoid"]],
        [24,  "zfemale",               ["zfemale"]],
        [25,  "pegasus",               ["pegasus"]],
        [27,  "zdragon",               ["zdragon"]],
        [102, "Large Floating Orbs",   ["lorbs"]],
        [104, "Large Giant",           ["lgiant"]],
        [106, "Large Bird",            ["lbird"]],
        [107, "Large Wolf",            ["lwolf"]],
        [108, "Large Dragon",          ["ldragon"]],
        [109, "Large Female",          ["lfemale"]],
        [-1,  "None",                  ["none"]]
    ];
    var shapes = {
        all: []
    };
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        var shape = new ShapeClass(d);
        shapes.all[i] = shape;
        for (var j = 0; j < d[2].length; j++) {
            var alias = d[2][j];
            shapes[alias] = shape;
        }
    }
    return shapes;
})();
/** ======================================== End of Shapes ======================================== */




/** ======================================== Cards ======================================== */
var StatsClass = function(hp, mp, atk, def, agi, wis) {
    this.hp = hp;
    this.mp = mp;
    this.atk = atk;
    this.def = def;
    this.agi = agi;
    this.wis = wis;
    this.fields = ["hp", "mp", "atk", "def", "agi", "wis"];
};
StatsClass.prototype.total = function() {
    return this.hp + this.mp + this.atk + this.def + this.agi + this.wis;
};
StatsClass.prototype.plus = function(stats) {
    var that = this;
    List.iter(function(field) {
        if (field in stats)
            that[field] += stats[field];
    }, this.fields);
};
/*
 * Card:
 *   ID Name Description Event Border Stars Place Place2 Prototype Shape Attribute HP MP ATK DEF AGI WIS 
 *   Skills Recommends RecommendsRB
 * Note: Place2 may be an array
 */
var CardClass = function(d) {
    /** Skills learnt at what levels. */
    var skill_levels = [
        [1, 15, 30],
        [1, 15, 30, 40],
        [1, 15, 30, 40, 50],
        [1, 15, 30, 40, 50, 60],
        [1, 15, 30, 40, 50, 70]
    ];
    var max_levels = [40, 45, 50, 55, 60];
    var rebirth_levels = [40, 45, 50, 60, 70];

    if (selfcheck && d.length != 20)
        console.log("Missing some data of card: " + d);
    var learns = new Object();
    for (var j = 0; j < d[17].length; j++)
        learns[skill_levels[d[5] - 1][j]] = d[17][j];
    this.id = d[0];
    this.name = d[1];
    this.description = d[2];
    this.level = 1;                          /* Current level */
    this.max = max_levels[d[5] - 1];         /* Max level */
    this.rbmax = rebirth_levels[d[5] - 1];   /* Max level after rebirth */
    this.stoned = false;                     /* Fully stoned? */
    this.type = Type.cool;                   /* Current type */
    this.event = d[3];
    this.border = d[4];
    this.stars = d[5];
    this.place = d[6];
    this.place2 = d[7];
    this.proto = d[8];
    this.shape = d[9];
    this.attribute = d[10];
    this.hp = d[11];  /* HP at level 1 */
    this.mp = d[12];  /* MP at level 1 */
    this.atk = d[13]; /* ATK at level 1 */
    this.def = d[14]; /* DEF at level 1 */
    this.agi = d[15]; /* AGI at level 1 */
    this.wis = d[16]; /* WIS at level 1 */
    this.skills = d[17];         /* All skills that can be learned */
    this.recommends = d[18];     /* Recommended skills */
    this.recommendsrb = d[19];   /* Recommended skills after rebirth */
    this.learns = learns;        /* All skills with the learnt level. */
    this.cskills = d[18];        /* Current skills */
};
CardClass.prototype.canRebirth = function() { 
    return this.stars > 3 &&
        /* Gold Slime */
    this.id != "30019" &&
        /* Godvessel Vimana */
    this.id != "40085" &&
        /* Prismatic Slime */
    this.id != "40233" &&
        /* Black Slime */
    this.id != "40271";
};
CardClass.prototype.getMaxLevel = function() { 
    /* Special cases for silver slime and gold slime. */
    if (this.id == "20024" || this.id == "20144" || this.id == "30019" || this.id == "40233" || this.id == "40271")
        return 1;
    else
        return this.type.isRebirthType() ? this.rbmax : this.max; 
};
CardClass.prototype.getLargeImageLink = function() {
    return sitebase + "images/" + locale.getLanguage() + "/guardians/card" + this.id + ".png";
};
CardClass.prototype.getImage = function(width) {
    width = typeof(width) == 'undefined' ? 100 : width;
    return "<img width='" + width + "px' src='" + sitebase + "images/" + locale.getLanguage() + "/guardians/card" + this.id + image_ext + "' />";
};
CardClass.prototype.getLink = function(with_type) {
    with_type = typeof with_type == 'undefined' || with_type == null ? false : with_type;
    return "?" + locale.getURLArgs("id=" + this.id + (with_type ? "&type=" + this.type.id : ""));
};
CardClass.prototype.getAvatar = function(width) {
    width = typeof(width) == 'undefined' ? 100 : width;
    return "<img width='" + width + "px' src='" + sitebase + "images/" + locale.getLanguage() + "/avatars/card_thu" + this.id + image_ext + "' />";
};
CardClass.prototype.getBattleImage = function(width) {
    width = typeof(width) == 'undefined' ? 128 : width;
    return "<img width='" + width + "px' src='" + sitebase + "images/" + locale.getLanguage() + "/battle/battle_" + this.id + image_ext + "' />";
};
CardClass.prototype.getStarsImage = function(width) {
    width = typeof(width) == 'undefined' ? 20 : width;
    s = "";
    for (var j = 0; j < this.stars; j++)
        s += "<img width='" + width + "px' src='images/rare_star" + image_ext + "' />";
    return s;
};
CardClass.prototype.isLimited = function() {
    return this.border != Border.none;
};
CardClass.prototype.hasType = function(t) {
    if (Card.limitation[this.id] != null)
        return List.mem(t, Card.limitation[this.id]);

    /* Limited cards do not have ace type. */
    if (this.isLimited() && (t == Type.ace || t == Type.acer))
        return false;

    if (!this.canRebirth() && t.isRebirthType())
        return false;

    return true;
};
CardClass.prototype.setLevel = function(lv) {
    if (lv <= 0 || lv > this.rbmax)
        return;
    this.level = lv;
};
CardClass.prototype.getLevel = function() {
    return this.level;
};
CardClass.prototype.setStoned = function(b) {
    this.stoned = b;
};
CardClass.prototype.isStoned = function() {
    return this.stoned;
};
CardClass.prototype.setType = function(t) {
    if (!this.hasType(t))
        return;
    this.type = t;
};
CardClass.prototype.getType = function() {
    return this.type;
};
CardClass.prototype.setSkills = function(sks) {
    this.cskills = sks;
};
CardClass.prototype.getSkills = function() {
    return this.cskills;
};
/* Returns true if this card has a specified skill in its current skill set. */
CardClass.prototype.hasSkill = function(s) {
    return List.mem(s, this.getSkills());
};
CardClass.prototype.canLearnSkill = function(s) {
    return List.mem(s, this.skills);
};
CardClass.prototype.getLearntSkillSize = function() {
    if (this.stars == 1)
        return 3;
    else if (this.stars == 2)
        return 4;
    else if (this.stars == 3)
        return 5;
    else if (this.stars == 4 || this.stars == 5)
        return this.type.isRebirthType() && !this.isLimited() ? 6 : 5;
};
CardClass.prototype.getRecommends = function() {
    var cname = locale.getLanguage() + ".recommends." + this.id + "." + this.type.id;
    var customs = $.jStorage.get(cname);
    
    if (customs != null && Array.isArray(customs))
        return List.map(Skill.get, customs);
    else
        return this.type.isRebirthType() ? this.recommendsrb : this.recommends;
};
CardClass.prototype.setCustomRecommends = function(skills, options) {
    var local = typeof options == 'object' && 'local' in options && options.local;
    var ts = [];
    if (local)
        ts.push(this.type);
    else
        ts = ts.concat(Type.all);
    
    var ids = [];
    for (var i = 0; i < skills.length; i++) {
        var skill = skills[i];
        if (typeof skill != 'object')
            skill = Skill.get(skill);
        if (skill != null)
            ids.push(skill.id)
    }
    
    for (var i = 0; i < ts.length; i++) {
        var t = ts[i];
        var cname = locale.getLanguage() + ".recommends." + this.id + "." + t.id;
        $.jStorage.set(cname, ids);
    }
};
CardClass.prototype.clearCustomRecommends = function(options) {
    var local = typeof options == 'object' && 'local' in options && options.local;
    var ts = [];
    if (local)
        ts.push(this.type);
    else
        ts = ts.concat(Type.all);
    
    for (var i = 0; i < ts.length; i++) {
        var t = ts[i];
        var cname = locale.getLanguage() + ".recommends." + this.id + "." + t.id;
        $.jStorage.deleteKey(cname);
    }
};
CardClass.prototype.getPlaceName = function() {
    var res = this.place.name;
    var helper = function(n) {
        var m = n % 10;
        var suffix = m == 1 ? "st" : (m == 2 ? "nd " : (m == 3 ? "rd" : "th"));
        return n + suffix;                
    };
    if (this.place2) {
        var arr = [];
        if (Array.isArray(this.place2))
            arr = arr.concat(this.place2)
        else
            arr.push(this.place2);
        res = List.map(helper, arr).join(", ") + " " + res;
    }
    return res;
};
CardClass.prototype.calc = function(base, mult, level, stoned) {
    var v = base * mult;
    if (this.getMaxLevel() > 1)
        v = Math.floor(1.5 * v * (level - 1) / (this.max - 1) + v);
    if (stoned) {
        var stone = base * (this.getMaxLevel() == 1 ? 0.2 : 0.5);
        if (this.type.isRebirthType()) {
            if (this.stars == 5)
                stone += stone * 0.1;
            else if (this.stars == 4)
                stone += stone * 0.05;
        }
        v += Math.floor(stone);
    }
    return Math.floor(v);
};
CardClass.prototype.canCast = function(n) {
    var need_mp = 0;
    var max_attack = null;
    var selected_skills = this.getSkills();
    for (var i = 0; i < selected_skills.length; i++) {
        var skill = selected_skills[i];
        if (skill.type == 0) {
            if (max_attack == null || skill.cost.mp > max_attack)
                max_attack = skill.cost.mp;
        } else
            need_mp += skill.cost.mp;
    }
    max_attack = max_attack == null ? 0 : max_attack;
    for (var i = 1; i <= n; i++)
        need_mp += max_attack;
    return this.getMP() >= need_mp;
};
CardClass.prototype.getStats = function() {
    return new StatsClass(this.getHP(), this.getMP(), this.getATK(), this.getDEF(), this.getAGI(), this.getWIS());
};
CardClass.prototype.getHP = function() {
    return this.calc(this.hp, this.type.hp, this.level, this.stoned);
};
CardClass.prototype.getMP = function() {
    return this.calc(this.mp, this.type.mp, this.level, this.stoned);
};
CardClass.prototype.getATK = function() {
    return this.calc(this.atk, this.type.atk, this.level, this.stoned);
};
CardClass.prototype.getDEF = function() {
    return this.calc(this.def, this.type.def, this.level, this.stoned);
};
CardClass.prototype.getAGI = function() {
    return this.calc(this.agi, this.type.agi, this.level, this.stoned);
};
CardClass.prototype.getWIS = function() {
    return this.calc(this.wis, this.type.wis, this.level, this.stoned);
};
CardClass.prototype.getStoneStats = function() {
    return new StatsClass(this.getStoneHP(), this.getStoneMP(), this.getStoneATK(), this.getStoneDEF(), this.getStoneAGI(), this.getStoneWIS());
};
CardClass.prototype.getStoneHP = function() {
    return this.calc(this.hp, 0, this.level, true);
};
CardClass.prototype.getStoneMP = function() {
    return this.calc(this.mp, 0, this.level, true);
};
CardClass.prototype.getStoneATK = function() {
    return this.calc(this.atk, 0, this.level, true);
};
CardClass.prototype.getStoneDEF = function() {
    return this.calc(this.def, 0, this.level, true);
};
CardClass.prototype.getStoneAGI = function() {
    return this.calc(this.agi, 0, this.level, true);
};
CardClass.prototype.getStoneWIS = function() {
    return this.calc(this.wis, 0, this.level, true);
};
CardClass.prototype.getMinStats = function() {
    return new StatsClass(this.getMinHP(), this.getMinMP(), this.getMinATK(), this.getMinDEF(), this.getMinAGI(), this.getMinWIS());
};
CardClass.prototype.getMinHP = function() {
    return this.calc(this.hp, this.type.hp, 1, false);
};
CardClass.prototype.getMinMP = function() {
    return this.calc(this.mp, this.type.mp, 1, false);
};
CardClass.prototype.getMinATK = function() {
    return this.calc(this.atk, this.type.atk, 1, false);
};
CardClass.prototype.getMinDEF = function() {
    return this.calc(this.def, this.type.def, 1, false);
};
CardClass.prototype.getMinAGI = function() {
    return this.calc(this.agi, this.type.agi, 1, false);
};
CardClass.prototype.getMinWIS = function() {
    return this.calc(this.wis, this.type.wis, 1, false);
};
CardClass.prototype.getMaxStats = function(buff) {
    var stats = new StatsClass(this.getMaxHP(), this.getMaxMP(), this.getMaxATK(), this.getMaxDEF(), this.getMaxAGI(), this.getMaxWIS());
    if (typeof buff == 'undefined' || buff == 0)
        return stats;

    var m = 1;
    var skills = List.filter(function(skill) { return skill.isBuff(); }, buff == 1 ? this.getRecommends() : this.skills);
    applySkills(skills, stats);
    return stats;
};
CardClass.prototype.getMaxHP = function() {
    return this.calc(this.hp, this.type.hp, this.getMaxLevel(), false);
};
CardClass.prototype.getMaxMP = function() {
    return this.calc(this.mp, this.type.mp, this.getMaxLevel(), false);
};
CardClass.prototype.getMaxATK = function() {
    return this.calc(this.atk, this.type.atk, this.getMaxLevel(), false);
};
CardClass.prototype.getMaxDEF = function() {
    return this.calc(this.def, this.type.def, this.getMaxLevel(), false);
};
CardClass.prototype.getMaxAGI = function() {
    return this.calc(this.agi, this.type.agi, this.getMaxLevel(), false);
};
CardClass.prototype.getMaxWIS = function() {
    return this.calc(this.wis, this.type.wis, this.getMaxLevel(), false);
};
CardClass.prototype.getMaxStonedStats = function(buff) {
    var stats = new StatsClass(this.getMaxStonedHP(), this.getMaxStonedMP(), this.getMaxStonedATK(), this.getMaxStonedDEF(), this.getMaxStonedAGI(), this.getMaxStonedWIS());
    if (typeof buff == 'undefined' || buff == 0)
        return stats;
    
    var m = 1;
    var skills = List.filter(function(skill) { return skill.isBuff(); }, buff == 1 ? this.getRecommends() : this.skills);
    applySkills(skills, stats);
    return stats;
};
CardClass.prototype.getMaxStonedHP = function() {
    return this.calc(this.hp, this.type.hp, this.getMaxLevel(), true);
};
CardClass.prototype.getMaxStonedMP = function() {
    return this.calc(this.mp, this.type.mp, this.getMaxLevel(), true);
};
CardClass.prototype.getMaxStonedATK = function() {
    return this.calc(this.atk, this.type.atk, this.getMaxLevel(), true);
};
CardClass.prototype.getMaxStonedDEF = function() {
    return this.calc(this.def, this.type.def, this.getMaxLevel(), true);
};
CardClass.prototype.getMaxStonedAGI = function() {
    return this.calc(this.agi, this.type.agi, this.getMaxLevel(), true);
};
CardClass.prototype.getMaxStonedWIS = function() {
    return this.calc(this.wis, this.type.wis, this.getMaxLevel(), true);
};
var Card = (function() {
    /** A map from a card ID to its restricted types. */
    var limitation = {};

    /** A map from a card ID to the card. */
    var cmap = {};

    /** A map from a card ID to its notes. */
    var notes = {};

    var cards = {
        /** All cards. */
        all: [],

        limitation: limitation,

        notes: notes,

        iter: function(f) {
            for (var i = 0; i < this.all.length; i++) {
                var card = this.all[i];
                f(card, i);
            }
        },

        /** Add a card, which is represented by an array of raw data. */
        add: function(d) {
            var card = new CardClass(d);
            this.all.push(card);
            if (selfcheck) {
                if (cmap[card.id] != null)
                    console.log("Duplicate card ID: " + card.id);
                for (var j = 0; j < card.recommends; j++) {
                    if (card.skills.indexOf(card.recommends[j]) == -1)
                        console.log("Skill " + card.recommends[j].name + " is not learnt by " + card.name + ".");
                }
                for (var j = 0; j < card.recommendsrb; j++) {
                    if (card.skills.indexOf(card.recommendsrb[j]) == -1)
                        console.log("Skill " + card.recommendsrb[j].name + " is not learnt by " + card.name + ".");
                }
            }
            cmap[card.id] = card;
        },

        /** Add a list of cards. */
        addAll: function(ds) {
            for (var i = 0; i < ds.length; i++)
                this.add(ds[i]);
        },

        /** Returns the card of a specified ID. */
        get: function(id) {
            var g =  cmap[id];
            if (typeof g == 'undefined')
                g = null;
            return g;
        },
        
        addLimitedTypes: function(ts) {
            for (var key in ts)
                limitation[key] = ts[key];
        },

        addNotes: function(ns) {
            for (var key in ns)
                notes[key] = ns[key];
        },

        mklnk: function(gc, with_type) {
            if (typeof(gc) == 'number' || typeof(gc) == 'string') {
                gc = this.get(gc);
            }
            if (gc != null && 'id' in gc && 'name' in gc) {
                // Translate the name of the card to English.
                var en = goptions.isTranslationNeeded() && gc.id in ename.guardians ? " (" + ename.guardians[gc.id] + ")" : "";
                return "<a href='javascript:insertGuardian(\"" + gc.id + 
                    (typeof with_type != 'undefined' && with_type ? ", " + gc.type.id : "") + 
                    "\")' class='gclnk'>" + gc.name + en + "</a>" + 
                    " " + 
                    "<a href='index.html" + gc.getLink(with_type) + "' target='_blank'><img src='images/external-link.png' /></a>";
            } else
                return "<span class='warning'>[CARD NOT LOADED]</span>";
        },

        mkextlnk: function(gc, with_type) {
            if (typeof(gc) == 'number' || typeof(gc) == 'string') {
                gc = this.get(gc);
            }
            if (gc != null && 'id' in gc && 'name' in gc) {
                // Translate the name of the card to English.
                var en = goptions.isTranslationNeeded() && gc.id in ename.guardians ? " (" + ename.guardians[gc.id] + ")" : "";
                return "<a href='index.html" + gc.getLink(with_type) + "' class='gclnk'>" + gc.name + en + "</a>" + 
                    " " + 
                    "<a href='index.html" + gc.getLink(with_type) + "' target='_blank'><img src='images/external-link.png' /></a>";
            } else
                return "<span class='warning'>[CARD NOT LOADED]</span>";
        },

        mklnks: function(query, description) {
            return "<a href='cards.html?" + query + "' class='gclnk'>" + description + "</a>" +
                " " +
                "<a href='cards.html?" + query + "' target='_blank'><img src='images/external-link.png' /></a>";
        },

        getTop: function(v, size, options) {
            var tops = [
                { name: "5★ (All)", title: getStarsText(5) + " (All)", 
                  selector: Selector.stars(5), cards: [] },
                { name: "5★ (Normal)", title: getStarsText(5) + " (Normal)", 
                  selector: Selector.and(Selector.stars(5), Selector.border(Border.none.id)), cards: [] },
                { name: "5★ (Limited)", title: getStarsText(5) + " (Limited)", 
                  selector: Selector.and(Selector.stars(5), Selector.not(Selector.border(Border.none.id))), cards: [] },
                { name: "4★", title: getStarsText(4), selector: Selector.stars(4), cards: [] },
                { name: "3★", title: getStarsText(3), selector: Selector.stars(3), cards: [] },
                { name: "2★", title: getStarsText(2), selector: Selector.stars(2), cards: [] },
                { name: "1★", title: getStarsText(1), selector: Selector.stars(1), cards: [] }
            ];
            var sorting = null;
            var buff = options.buff == "all" ? 2 : (options.buff == "recommended" ? 1 : 0);

            v = v.toLowerCase();
            if (v == "hp") { sorting = Sorting.compose(Sorting.reverse(Sorting.hp(buff)), Sorting.name); }
            else if (v == "mp") { sorting = Sorting.compose(Sorting.reverse(Sorting.mp(buff)), Sorting.name); }
            else if (v == "atk") { sorting = Sorting.compose(Sorting.reverse(Sorting.atk(buff)), Sorting.name); }
            else if (v == "def") { sorting = Sorting.compose(Sorting.reverse(Sorting.def(buff)), Sorting.name); }
            else if (v == "agi") { sorting = Sorting.compose(Sorting.reverse(Sorting.agi(buff)), Sorting.name); }
            else if (v == "wis") { sorting = Sorting.compose(Sorting.reverse(Sorting.wis(buff)), Sorting.name); }
            else if (v == "total") { sorting = Sorting.compose(Sorting.reverse(Sorting.total(buff)), Sorting.name); }

            if (sorting == null)
                return tops;

            /* Find guardians that satisfy the stars conditions. */
            var gcs = [];
            if ('stars' in options) {
                var selector = Selector.stars(options['stars']);
                gcs.push.apply(gcs, Selector.select(selector));
            } else
                gcs.push.apply(gcs, this.all);
            
            /* Set the types. */
            for (var i = 0; i < gcs.length; i++) {
                if (gcs[i].canRebirth())
                    gcs[i].setType(Type.coolr);
                else
                    gcs[i].setType(Type.cool);
            }
            
            /* Classify the guardians based on their stars and sort the guardians. */
            for (var i = 0; i < tops.length; i++) {
                var top = tops[i];
                top.cards.push.apply(top.cards, Selector.select(top.selector, gcs));
                top.cards.sort(sorting);
                top.cards = top.cards.slice(0, Math.min(size, top.cards.length));
            }

            return tops;
        },

        getStarsImage: function(stars, width) {
            width = typeof(width) == 'undefined' ? 20 : width;
            s = "";
            for (var j = 0; j < stars; j++)
                s += "<img width='" + width + "px' src='images/rare_star" + image_ext + "' />";
            return s;
        },

        /** Decodes a card from a string. Custom current stats will be saved to "status". */
        decode: function(str) {
            var helper = function(str) {
                var id = -1;
                var type = 0;
                var level = 1;
                var stoned = null;
                var sks = [];
                var hp = 0;
                var mp = 0;
                var atk = 0;
                var def = 0;
                var agi = 0;
                var wis = 0;

                var tokens = str.split("&");
                
                for (var j = 0; j < tokens.length; j++) {
                    var token = tokens[j];
                    if (token.indexOf("id=") != -1)
                        id = token.substring(3);
                    else if (token.indexOf("type=") != -1)
                        type = parseInt(token.substring(5));
                    else if (token.indexOf("level=") != -1)
                        level = token.substring(6);
                    else if (token.indexOf("stoned=") != -1)
                        stoned = token.substring(7);
                    else if (token.indexOf("skills=") != -1)
                        sks = token.substring(7).split(",");
                    else if (token.indexOf("hp=") != -1)
                        hp = parseInt(token.substring(3));
                    else if (token.indexOf("mp=") != -1)
                        mp = parseInt(token.substring(3));
                    else if (token.indexOf("atk=") != -1)
                        atk = parseInt(token.substring(4));
                    else if (token.indexOf("def=") != -1)
                        def = parseInt(token.substring(4));
                    else if (token.indexOf("agi=") != -1)
                        agi = parseInt(token.substring(4));
                    else if (token.indexOf("wis=") != -1)
                        wis = parseInt(token.substring(4));
                }
                
                var g = Card.get(id);
                var t = Type.get(type);
                if (g == null || t == null)
                    return null;

                g.setType(t);
                g.setLevel(level);
                g.setSkills(List.map(Skill.get, sks));
                g.status = g.getStats();
                if (stoned != "clean" && stoned != "fsemp" && stoned != "fs" && stoned != "custom")
                    stoned = "clean";
                g.status.type = stoned;
                if (stoned == "custom") {
                    g.status.hp = hp;
                    g.status.mp = mp;
                    g.status.atk = atk;
                    g.status.def = def;
                    g.status.agi = agi;
                    g.status.wis = wis;
                }
                if (stoned == "fsemp" || stoned == "fs") {
                    g.status.hp += g.getStoneHP();
                    g.status.atk += g.getStoneATK();
                    g.status.def += g.getStoneDEF();
                    g.status.agi += g.getStoneAGI();
                    g.status.wis += g.getStoneWIS();
                }
                if (stoned == "fs")
                    g.status.mp += g.getStoneMP();
                return g;
            };
            str = str.replace(/[\r\n\t ]+/g, "");
            var lines = str.split("+");
            if (lines.length == 1)
                return helper(lines[0]);
            else
                return List.fold_left(function(res, line) { 
                    var card = helper(line);
                    if (card != null)
                        res.push(card);
                    return res;
                }, [], lines);
        },

        encode: function(c) {
            var helper = function(c) {
                var strs = [];
                strs.push("id=" + c.id);
                strs.push("type=" + c.type.id);
                strs.push("level=" + c.getLevel());
                strs.push("skills=" + List.map(function(s) { return s.id; }, c.getSkills()).join(","));
                if ("status" in c && "type" in c.status) {
                    strs.push("stoned=" + c.status.type);
                    if (c.status.type == "custom") {
                        strs.push("hp=" + c.status.hp);
                        strs.push("mp=" + c.status.mp);
                        strs.push("atk=" + c.status.atk);
                        strs.push("def=" + c.status.def);
                        strs.push("agi=" + c.status.agi);
                        strs.push("wis=" + c.status.wis);
                    }
                }
                return strs.join("&");
            };
            if (Array.isArray(c)) {
                return List.map(function(card) { return helper(card); }, c).join(" +\n");
            } else
                return helper(c);
        }

    };

    return cards;
})();
/** ======================================== End of Cards ======================================== */



/** ======================================== Ex Types ======================================== */
var ExType = (function() {
    var types = {
        all: [
            {id: 0, name: "EX1 (Red)", shortname: "red"},
            {id: 1, name: "EX2 (Blue)", shortname: "blue"}
        ]
    };
    types.red = types.all[0];
    types.blue = types.all[1];

    return types;
})();
/** ======================================== End of Ex Types ======================================== */



/** ======================================== Ex Skills ======================================== */
var ExSkillClass = function(d) {
    this.id = d[0];
    this.name = locale.exskills[d[0]];
    this.type = d[1];
    this.acs = d[3];     /* Selector of cards boosted by status-up effects. */
    this.hp = d[4];
    this.mp = d[5];
    this.atk = d[6];
    this.def = d[7];
    this.agi = d[8];
    this.wis = d[9];
    this.scs = d[10];    /* Selector of skills boosted by successful-rate-up effects. */
    this.sucup = d[11];
    this.pcs = d[12];    /* Selector of skills boosted by power-up effects. */
    this.powup = d[13];
    this.costdec = d[14]; /* Selector of skills with HP/MP cost decreased. */
    this.hpdec = d[15];
    this.mpdec = d[16];
};
ExSkillClass.prototype.applyStats = function(stats) {
    stats.hp = Math.floor(stats.hp * (1 + this.hp));
    stats.mp = Math.floor(stats.mp * (1 + this.mp));
    stats.atk = Math.floor(stats.atk * (1 + this.atk));
    stats.def = Math.floor(stats.def * (1 + this.def));
    stats.agi = Math.floor(stats.agi * (1 + this.agi));
    stats.wis = Math.floor(stats.wis * (1 + this.wis));
};
ExSkillClass.prototype.getPowUp = function(skill) {
    return this.pcs(skill) ? this.powup : 0;
}
ExSkillClass.prototype.getSucUp = function(skill) {
    return this.scs(skill) ? this.sucup : 0;
}
var ExSkill = (function() {
    var as = function(a) {
        return function(g) {
            return g.attribute.id == a.id;
        };
    };
    var all = function(g) { return true; };
    var none = function(g) { return false; };
    var death = function(s) { return s == Skill.death1 || s == Skill.death2 || s == Skill.death3 || s == Skill.death4; };
    var ls = function(s) { return s == Skill.ls; };
    var sd = function(s) { return s == Skill.sd; };
    var qs = function(s) { return s == Skill.qs; };
    var gs = function(s) { return s == Skill.gs; };
    var ds = function(s) { return s == Skill.ds; };
    var bg = function(s) { return s == Skill.bg; };
    var curse = function(s) { return s == Skill.curse; };
    var revival = function(s) { return s == Skill.revival; };
    var data = [
        [0,   ExType.red,  ["fire10"],          as(Attribute.fire),      0.10, 0.10, 0.10, 0.10, 0.10, 0.10, none, 0, none, 0, none, 0, 0],
        [1,   ExType.red,  ["fire12"],          as(Attribute.fire),      0.12, 0.12, 0.12, 0.12, 0.12, 0.12, none, 0, none, 0, none, 0, 0],
        [2,   ExType.red,  ["fire15"],          as(Attribute.fire),      0.15, 0.15, 0.15, 0.15, 0.15, 0.15, none, 0, none, 0, none, 0, 0],
        [3,   ExType.red,  ["earth2"],          as(Attribute.earth),     0.02, 0.02, 0.02, 0.02, 0.02, 0.02, none, 0, none, 0, none, 0, 0],
        [4,   ExType.red,  ["earth4"],          as(Attribute.earth),     0.04, 0.04, 0.04, 0.04, 0.04, 0.04, none, 0, none, 0, none, 0, 0],
        [5,   ExType.red,  ["earth6"],          as(Attribute.earth),     0.06, 0.06, 0.06, 0.06, 0.06, 0.06, none, 0, none, 0, none, 0, 0],
        [6,   ExType.red,  ["wind2"],           as(Attribute.wind),      0.02, 0.02, 0.02, 0.02, 0.02, 0.02, none, 0, none, 0, none, 0, 0],
        [7,   ExType.red,  ["wind4"],           as(Attribute.wind),      0.04, 0.04, 0.04, 0.04, 0.04, 0.04, none, 0, none, 0, none, 0, 0],
        [8,   ExType.red,  ["wind6"],           as(Attribute.wind),      0.06, 0.06, 0.06, 0.06, 0.06, 0.06, none, 0, none, 0, none, 0, 0],
        [9,   ExType.red,  ["poison10"],        as(Attribute.poison),    0.10, 0.10, 0.10, 0.10, 0.10, 0.10, none, 0, none, 0, none, 0, 0],
        [10,  ExType.red,  ["poison12"],        as(Attribute.poison),    0.12, 0.12, 0.12, 0.12, 0.12, 0.12, none, 0, none, 0, none, 0, 0],
        [11,  ExType.red,  ["poison15"],        as(Attribute.poison),    0.15, 0.15, 0.15, 0.15, 0.15, 0.15, none, 0, none, 0, none, 0, 0],
        [12,  ExType.red,  ["mecha2"],          as(Attribute.mecha),     0.02, 0.02, 0.02, 0.02, 0.02, 0.02, none, 0, none, 0, none, 0, 0],
        [13,  ExType.red,  ["mecha4"],          as(Attribute.mecha),     0.04, 0.04, 0.04, 0.04, 0.04, 0.04, none, 0, none, 0, none, 0, 0],
        [14,  ExType.red,  ["mecha6"],          as(Attribute.mecha),     0.06, 0.06, 0.06, 0.06, 0.06, 0.06, none, 0, none, 0, none, 0, 0],
        [15,  ExType.red,  ["light2"],          as(Attribute.light),     0.02, 0.02, 0.02, 0.02, 0.02, 0.02, none, 0, none, 0, none, 0, 0],
        [16,  ExType.red,  ["light4"],          as(Attribute.light),     0.04, 0.04, 0.04, 0.04, 0.04, 0.04, none, 0, none, 0, none, 0, 0],
        [17,  ExType.red,  ["light6"],          as(Attribute.light),     0.06, 0.06, 0.06, 0.06, 0.06, 0.06, none, 0, none, 0, none, 0, 0],
        [18,  ExType.red,  ["darkness2"],       as(Attribute.darkness),  0.02, 0.02, 0.02, 0.02, 0.02, 0.02, none, 0, none, 0, none, 0, 0],
        [19,  ExType.red,  ["darkness4"],       as(Attribute.darkness),  0.04, 0.04, 0.04, 0.04, 0.04, 0.04, none, 0, none, 0, none, 0, 0],
        [20,  ExType.red,  ["darkness6"],       as(Attribute.darkness),  0.06, 0.06, 0.06, 0.06, 0.06, 0.06, none, 0, none, 0, none, 0, 0],
        [21,  ExType.red,  ["hp1"],             all,                     0.01,    0,    0,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [22,  ExType.red,  ["hp2"],             all,                     0.02,    0,    0,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [23,  ExType.red,  ["hp3"],             all,                     0.03,    0,    0,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [24,  ExType.red,  ["hp5"],             all,                     0.05,    0,    0,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [25,  ExType.red,  ["hp7"],             all,                     0.07,    0,    0,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [26,  ExType.red,  ["mp5"],             all,                        0, 0.05,    0,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [27,  ExType.red,  ["mp7"],             all,                        0, 0.07,    0,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [28,  ExType.red,  ["mp10"],            all,                        0, 0.10,    0,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [29,  ExType.red,  ["atk2"],            all,                        0,    0, 0.02,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [30,  ExType.red,  ["atk4"],            all,                        0,    0, 0.04,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [31,  ExType.red,  ["atk6"],            all,                        0,    0, 0.06,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [32,  ExType.red,  ["atk10"],           all,                        0,    0, 0.10,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [33,  ExType.red,  ["atk12"],           all,                        0,    0, 0.12,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [34,  ExType.red,  ["atk15"],           all,                        0,    0, 0.15,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [35,  ExType.red,  ["def10"],           all,                        0,    0,    0, 0.10,    0,    0, none, 0, none, 0, none, 0, 0],
        [36,  ExType.red,  ["def12"],           all,                        0,    0,    0, 0.12,    0,    0, none, 0, none, 0, none, 0, 0],
        [37,  ExType.red,  ["def15"],           all,                        0,    0,    0, 0.15,    0,    0, none, 0, none, 0, none, 0, 0],
        [38,  ExType.red,  ["wis2"],            all,                        0,    0,    0,    0,    0, 0.02, none, 0, none, 0, none, 0, 0],
        [39,  ExType.red,  ["wis4"],            all,                        0,    0,    0,    0,    0, 0.04, none, 0, none, 0, none, 0, 0],
        [40,  ExType.red,  ["wis6"],            all,                        0,    0,    0,    0,    0, 0.06, none, 0, none, 0, none, 0, 0],
        [41,  ExType.blue, ["suc_death1"],      all,                        0,    0,    0,    0,    0,    0, death, 0.01, none, 0, none, 0, 0],
        [42,  ExType.blue, ["suc_death2"],      all,                        0,    0,    0,    0,    0,    0, death, 0.02, none, 0, none, 0, 0],
        [43,  ExType.blue, ["suc_death3"],      all,                        0,    0,    0,    0,    0,    0, death, 0.03, none, 0, none, 0, 0],
        [44,  ExType.blue, ["suc_sd3"],         all,                        0,    0,    0,    0,    0,    0, sd, 0.03, none, 0, none, 0, 0],
        [45,  ExType.blue, ["suc_sd5"],         all,                        0,    0,    0,    0,    0,    0, sd, 0.05, none, 0, none, 0, 0],
        [46,  ExType.blue, ["suc_sd7"],         all,                        0,    0,    0,    0,    0,    0, sd, 0.07, none, 0, none, 0, 0],
        [47,  ExType.blue, ["pow_qs1"],         all,                        0,    0,    0,    0,    0,    0, none, 0, qs, 0.01, none, 0, 0],
        [48,  ExType.blue, ["pow_qs2"],         all,                        0,    0,    0,    0,    0,    0, none, 0, qs, 0.02, none, 0, 0],
        [49,  ExType.blue, ["pow_qs3"],         all,                        0,    0,    0,    0,    0,    0, none, 0, qs, 0.03, none, 0, 0],
        [50,  ExType.blue, ["suc_gs2"],         all,                        0,    0,    0,    0,    0,    0, gs, 0.02, none, 0, none, 0, 0],
        [51,  ExType.blue, ["suc_gs3"],         all,                        0,    0,    0,    0,    0,    0, gs, 0.03, none, 0, none, 0, 0],
        [52,  ExType.blue, ["suc_gs5"],         all,                        0,    0,    0,    0,    0,    0, gs, 0.05, none, 0, none, 0, 0],
        [53,  ExType.blue, ["suc_ds2"],         all,                        0,    0,    0,    0,    0,    0, ds, 0.02, none, 0, none, 0, 0],
        [54,  ExType.blue, ["suc_ds3"],         all,                        0,    0,    0,    0,    0,    0, ds, 0.03, none, 0, none, 0, 0],
        [55,  ExType.blue, ["suc_ds5"],         all,                        0,    0,    0,    0,    0,    0, ds, 0.05, none, 0, none, 0, 0],
        [56,  ExType.blue, ["pow_curse25"],     all,                        0,    0,    0,    0,    0,    0, none, 0, curse, 0.25, none, 0, 0],
        [57,  ExType.blue, ["pow_curse40"],     all,                        0,    0,    0,    0,    0,    0, none, 0, curse, 0.40, none, 0, 0],
        [58,  ExType.blue, ["pow_curse50"],     all,                        0,    0,    0,    0,    0,    0, none, 0, curse, 0.50, none, 0, 0],
        [59,  ExType.blue, ["suc_revival10"],   all,                        0,    0,    0,    0,    0,    0, revival, 0.10, none, 0, none, 0, 0],
        [60,  ExType.blue, ["suc_revival15"],   all,                        0,    0,    0,    0,    0,    0, revival, 0.15, none, 0, none, 0, 0],
        [61,  ExType.blue, ["suc_revival20"],   all,                        0,    0,    0,    0,    0,    0, revival, 0.20, none, 0, none, 0, 0],
        [62,  ExType.red,  ["wis10"],           all,                        0,    0,    0,    0,    0, 0.10, none, 0, none, 0, none, 0, 0],
        [63,  ExType.red,  ["wis12"],           all,                        0,    0,    0,    0,    0, 0.12, none, 0, none, 0, none, 0, 0],
        [64,  ExType.red,  ["wis15"],           all,                        0,    0,    0,    0,    0, 0.15, none, 0, none, 0, none, 0, 0],
        [65,  ExType.blue, ["pow_qs6"],         all,                        0,    0,    0,    0,    0,    0, none, 0, qs, 0.06, none, 0, 0],
        [66,  ExType.blue, ["pow_qs8"],         all,                        0,    0,    0,    0,    0,    0, none, 0, qs, 0.08, none, 0, 0],
        [67,  ExType.blue, ["pow_qs10"],        all,                        0,    0,    0,    0,    0,    0, none, 0, qs, 0.10, none, 0, 0],
        [68,  ExType.blue, ["suc_sd10"],        all,                        0,    0,    0,    0,    0,    0, sd, 0.10, none, 0, none, 0, 0],
        [69,  ExType.blue, ["suc_sd12"],        all,                        0,    0,    0,    0,    0,    0, sd, 0.12, none, 0, none, 0, 0],
        [70,  ExType.blue, ["suc_sd15"],        all,                        0,    0,    0,    0,    0,    0, sd, 0.15, none, 0, none, 0, 0],
        [71,  ExType.red,  ["lightning10"],     as(Attribute.lightning),    0.10, 0.10, 0.10, 0.10, 0.10, 0.10, none, 0, none, 0, none, 0, 0],
        [72,  ExType.red,  ["lightning12"],     as(Attribute.lightning),    0.12, 0.12, 0.12, 0.12, 0.12, 0.12, none, 0, none, 0, none, 0, 0],
        [73,  ExType.red,  ["lightning15"],     as(Attribute.lightning),    0.15, 0.15, 0.15, 0.15, 0.15, 0.15, none, 0, none, 0, none, 0, 0],
        [74,  ExType.red,  ["atk8"],            all,                        0,       0, 0.08,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [75,  ExType.blue, ["costdec_bg200"],   all,                        0,    0,    0,    0,    0,    0, none, 0, none, 0, bg, 200, 0],
        [76,  ExType.blue, ["costdec_bg300"],   all,                        0,    0,    0,    0,    0,    0, none, 0, none, 0, bg, 300, 0],
        [77,  ExType.blue, ["costdec_bg500"],   all,                        0,    0,    0,    0,    0,    0, none, 0, none, 0, bg, 500, 0],
        [78,  ExType.red,  ["wind1"],           as(Attribute.wind),      0.01, 0.01, 0.01, 0.01, 0.01, 0.01, none, 0, none, 0, none, 0, 0],
        [79,  ExType.red,  ["wind3"],           as(Attribute.wind),      0.03, 0.03, 0.03, 0.03, 0.03, 0.03, none, 0, none, 0, none, 0, 0],
        [80,  ExType.blue, ["suc_ds1"],         all,                        0,    0,    0,    0,    0,    0, ds, 0.01, none, 0, none, 0, 0],
        [81,  ExType.red,  ["def2"],            all,                        0,    0,    0, 0.02,    0,    0, none, 0, none, 0, none, 0, 0],
        [82,  ExType.red,  ["def4"],            all,                        0,    0,    0, 0.04,    0,    0, none, 0, none, 0, none, 0, 0],
        [83,  ExType.red,  ["def6"],            all,                        0,    0,    0, 0.06,    0,    0, none, 0, none, 0, none, 0, 0],
        [84,  ExType.blue, ["costdec_bg600"],   all,                        0,    0,    0,    0,    0,    0, none, 0, none, 0, bg, 600, 0],
        [85,  ExType.blue, ["costdec_bg700"],   all,                        0,    0,    0,    0,    0,    0, none, 0, none, 0, bg, 700, 0],
        [86,  ExType.blue, ["costdec_bg900"],   all,                        0,    0,    0,    0,    0,    0, none, 0, none, 0, bg, 900, 0],
        [87,  ExType.red,  ["light10"],         as(Attribute.light),     0.10, 0.10, 0.10, 0.10, 0.10, 0.10, none, 0, none, 0, none, 0, 0],
        [88,  ExType.red,  ["light12"],         as(Attribute.light),     0.12, 0.12, 0.12, 0.12, 0.12, 0.12, none, 0, none, 0, none, 0, 0],
        [89,  ExType.red,  ["light15"],         as(Attribute.light),     0.15, 0.15, 0.15, 0.15, 0.15, 0.15, none, 0, none, 0, none, 0, 0],
        [90,  ExType.red,  ["water2"],          as(Attribute.water),     0.02, 0.02, 0.02, 0.02, 0.02, 0.02, none, 0, none, 0, none, 0, 0],
        [91,  ExType.red,  ["water4"],          as(Attribute.water),     0.04, 0.04, 0.04, 0.04, 0.04, 0.04, none, 0, none, 0, none, 0, 0],
        [92,  ExType.red,  ["water6"],          as(Attribute.water),     0.06, 0.06, 0.06, 0.06, 0.06, 0.06, none, 0, none, 0, none, 0, 0],
        [93,  ExType.blue, ["suc_ls3"],         all,                        0,    0,    0,    0,    0,    0, ls, 0.03, none, 0, none, 0, 0],
        [94,  ExType.blue, ["suc_ls5"],         all,                        0,    0,    0,    0,    0,    0, ls, 0.05, none, 0, none, 0, 0],
        [95,  ExType.blue, ["suc_ls7"],         all,                        0,    0,    0,    0,    0,    0, ls, 0.07, none, 0, none, 0, 0],
        [96,  ExType.red,  ["mp2"],             all,                        0, 0.02,    0,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [97,  ExType.red,  ["mp3"],             all,                        0, 0.03,    0,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [98,  ExType.blue, ["suc_gs1"],         all,                        0,    0,    0,    0,    0,    0, gs, 0.01, none, 0, none, 0, 0],
        [99,  ExType.red,  ["hp10"],            all,                     0.10,    0,    0,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [100, ExType.red,  ["hp12"],            all,                     0.12,    0,    0,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [101, ExType.red,  ["hp15"],            all,                     0.15,    0,    0,    0,    0,    0, none, 0, none, 0, none, 0, 0],
        [102, ExType.blue, ["suc_gs10"],        all,                        0,    0,    0,    0,    0,    0, gs, 0.10, none, 0, none, 0, 0],
        [103, ExType.blue, ["suc_gs12"],        all,                        0,    0,    0,    0,    0,    0, gs, 0.12, none, 0, none, 0, 0],
        [104, ExType.blue, ["suc_gs15"],        all,                        0,    0,    0,    0,    0,    0, gs, 0.15, none, 0, none, 0, 0]
    ];

    var skills = {
        all: [],
        red: [],
        blue: []
    };
    skills.ex1 = skills.red;
    skills.ex2 = skills.blue;

    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        var skill = new ExSkillClass(d);
        skills.all[i] = skill;
        if (skill.type == ExType.red)
            skills.red.push(skill);
        if (skill.type == ExType.blue)
            skills.blue.push(skill);
        for (var j = 0; j < d[2].length; j++) {
            var alias = d[2][j];
            skills[alias] = skill;
        }
    }

    skills.get = (function() {
        var skills_map = {};
        for (var i = 0; i < skills.all.length; i++)
            skills_map[skills.all[i].id] = skills.all[i];
        return function(id) {
            return id in skills_map ? skills_map[id] : null;
        };
    })();

    return skills;
})();
/** ======================================== End of Ex Skills ======================================== */



/** ======================================== Ex Cards ======================================== */
var ExCardClass = function(d) {
    this.id = d[0];
    this.name = d[1];
    this.description = d[2];
    this.event = d[3];
    this.border = d[4];
    this.stars = d[5];
    this.place = d[6];
    this.place2 = d[7];
    this.shape = d[8];
    this.attribute = d[9];
    this.skills = d[10];
    this.cskill = d[10][d[10].length - 1];

    for (var i = 0; i < this.skills.length; i++) {
        if (typeof this.skills[i] == 'undefined' || this.skills[i] == null)
            console.log("ERROR: Incorrect skills for " + this.id + " " + this.name + ".");
    };
};
ExCardClass.prototype.getImage = function(width) {
    width = typeof(width) == 'undefined' ? 100 : width;
    return "<img width='" + width + "px' src='" + sitebase + "images/" + locale.getLanguage() + "/guardians/card" + this.id + image_ext + "' />";
};
ExCardClass.prototype.getAvatar = function(width) {
    width = typeof(width) == 'undefined' ? 100 : width;
    return "<img width='" + width + "px' src='" + sitebase + "images/" + locale.getLanguage() + "/avatars/card_thu" + this.id + image_ext + "' />";
};
ExCardClass.prototype.getStarsImage = function(width) {
    width = typeof(width) == 'undefined' ? 20 : width;
    s = "";
    for (var j = 0; j < this.stars; j++)
        s += "<img width='" + width + "px' src='images/rare_star" + image_ext + "' />";
    return s;
};
ExCardClass.prototype.getPlaceName = function() {
    var res = this.place.name;
    var helper = function(n) {
        var m = n % 10;
        var suffix = m == 1 ? "st" : (m == 2 ? "nd " : (m == 3 ? "rd" : "th"));
        return n + suffix;                
    };
    if (this.place2) {
        var arr = [];
        if (Array.isArray(this.place2))
            arr = arr.concat(this.place2)
        else
            arr.push(this.place2);
        res = List.map(helper, arr).join(", ") + " " + res;
    }
    return res;
};
ExCardClass.prototype.getLink = function() {
    return "excards.html?" + locale.getURLArgs("id=" + this.id);
};
ExCardClass.prototype.hasSkill = function(s) {
    return List.mem(s, this.skills);
};
ExCardClass.prototype.getSkill = function() {
    return this.cskill;
};
ExCardClass.prototype.setSkill = function(s) {
    this.cskill = s;
};
var ExCard = (function() {
    var cmap = {};
    var notes = {};
    var ex1cards = [];
    var ex2cards = [];
    return {
        all: [],
        red: ex1cards,
        blue: ex2cards,
        ex1: ex1cards,
        ex2: ex2cards,
        notes: notes,
        add: function(d) {
            var card = new ExCardClass(d);
            ExCard.all.push(card);
            if (card.border == ExType.red)
                ExCard.red.push(card);
            else if (card.border == ExType.blue)
                ExCard.blue.push(card);
            cmap[card.id] = card;
        },
        addAll: function(ds) {
            List.iter(ExCard.add, ds);
        },
        get: function(id) {
            var c =  cmap[id];
            if (typeof c == 'undefined')
                c = null;
            return c;
        },
        mklnk: function(c) {
            if (typeof(c) == 'number' || typeof(c) == 'string') {
                c = ExCard.get(c);
            }
            if (c != null && 'id' in c && 'name' in c) {
                // Translate the name of the card to English.
                var en = goptions.isTranslationNeeded() && c.id in ename.guardians ? " (" + ename.guardians[c.id] + ")" : "";
                return "<a href='" + c.getLink() + "' class='gclnk excard-" + c.border.shortname + "'>" + c.name + en + "</a>" +
                    " " + 
                    "<a href='" + c.getLink() + "' target='_blank'><img src='images/external-link.png' /></a>";
            } else
                return "<span class='warning'>[CARD NOT LOADED]</span>";
        },
        addNotes: function(ns) {
            for (var key in ns)
                notes[key] = ns[key];
        },
        decode: function(str) {
            var helper = function(str) {
                var id = -1;
                var skill = null;
                var tokens = str.split("&");
                for (var j = 0; j < tokens.length; j++) {
                    var token = tokens[j];
                    if (token.indexOf("id=") != -1)
                        id = token.substring(3);
                    else if (token.indexOf("skill=") != -1)
                        skill = ExSkill.get(parseInt(token.substring(6)));
                }
                var c = ExCard.get(id);
                if (c == null || skill == null)
                    return null;
                c.setSkill(skill);
                return c;
            };
            str = str.replace(/[\r\n\t ]+/g, "");
            var lines = str.split("+");
            if (lines.length == 1)
                return helper(lines[0]);
            else
                return List.fold_left(function(res, line) { 
                    var card = helper(line);
                    if (card != null)
                        res.push(card);
                    return res;
                }, [], lines);
        },
        encode: function(c) {
            var helper = function(c) {
                return "id=" + c.id + "&skill=" + c.getSkill().id;
            };
            if (Array.isArray(c))
                return List.map(function(card) { return helper(card); }, c).join(" +\n");
            else
                return helper(c);
        }
    };
})();
/** ======================================== End of Ex Cards ======================================== */



/** ======================================== Selectors ======================================== */
var Selector = (function() {

    return {
        /** Returns nothing. */
        none: function(g) {
            return false;
        },
        /** Returns all. */
        all: function(g) {
            return true;
        },
        gen: function(f, t) {
            if (typeof(t) == 'number') {
                return function(g) {
                    return g[f] == t;
                };
            } else {
                var ts = String(t).split(",");
                return function(g) {
                    return List.fold_left(function(res, t) { return res || g[f] == t; }, false, ts);
                };
            }
        },
        /** Returns cards with one of the specified stars. */
        stars: function(t) {
            if (typeof(t) == 'number') {
                return function(g) {
                    return g.stars == t;
                };
            } else {
                var ts = String(t).split(",");
                return function(g) {
                    return List.fold_left(function(res, t) { return res || g.stars == t; }, false, ts);
                };
            }
        },
        /** Returns cards with one of the specified attributes. */
        attribute: function(t) {
            if (typeof(t) == 'number') {
                return function(g) {
                    return g.attribute.id == t;
                };
            } else {
                var ts = String(t).split(",");
                return function(g) {
                    return List.fold_left(function(res, t) { 
                        return t.length > 0 && (res || g.attribute.id == t || g.attribute.name.toLowerCase() == t.toLowerCase());
                    }, false, ts);
                };
            }
        },
        /** Returns cards with one of the specified IDs. */
        id: function(t) {
            if (typeof(t) == 'number') {
                return function(g) {
                    return g.id == t;
                };
            } else {
                var ts = String(t).split(",");
                return function(g) {
                    return List.fold_left(function(res, t) { return res || g.id == t; }, false, ts);
                };
            }
        },
        /** Returns cards with all of the specified names. */
        name: function(terms) {
            terms = terms.toLowerCase().split(",");
            return function(g) {
                var name = g.name.toLowerCase();
                return List.fold_left(function(res, n) { return res && name.indexOf(n) >= 0; }, true, terms);
            }
        },
        /** Returns cards with one of the specified places. */
        place: function(t) {
            var grounds = [
                Place.plains.id, Place.plains_night.id, Place.volcano.id, Place.volcano_night.id,
                Place.snowfield.id, Place.snowfield_night.id, Place.desert.id, Place.desert_night.id,
                Place.ocean.id, Place.ocean_night.id, Place.zeus.id
            ];
            if (typeof(t) == 'number') {
                return function(g) {
                    return g.place.id == t;
                };
            } else {
                var ts = String(t).split(",");
                return function(g) {
                    return List.fold_left(function(res, t) { 
                        return t.length > 0 && (
                            res ||
                                (grounds.indexOf(t) >= 0 && g.place == Place.grounds) ||
                                g.place.id == t || 
                                g.place.name.toLowerCase().indexOf(t.toLowerCase()) != -1
                        );
                    }, false, ts);
                };
            }
        },
        /** Returns cards with one of the specified borders. */
        border: function(t) {
            if (typeof(t) == 'number') {
                return function(g) {
                    return g.border.id == t;
                };
            } else {
                var ts = String(t).split(",");
                return function(g) {
                    return List.fold_left(function(res, t) { 
                        return t.length > 0 && (res || g.border.id == t || g.border.name.toLowerCase() == t.toLowerCase());
                    }, false, ts);
                };
            }
        },
        /** Returns cards with one of the specified shapes. */
        shape: function(t) {
            if (typeof(t) == 'number') {
                return function(g) {
                    return g.shape.id == t;
                };
            } else {
                var ts = String(t).split(",");
                return function(g) {
                    return List.fold_left(function(res, t) { 
                        return t.length > 0 && (res || g.shape.id == t || g.shape.name.toLowerCase().indexOf(t.toLowerCase()) != -1);
                    }, false, ts);
                };
            }
        },
        /** Returns cards with one of the specified skills. */
        skill: function(t) {
            if (typeof(t) == 'number') {
                return function(g) {
                    for (var i = 0; i < g.skills.length; i++) {
                        if (g.skills[i].id == t)
                            return true;
                    }
                    return false;
                };
            } else {
                var ts = String(t).split(",");
                return function(g) {
                    return List.fold_left(
                        function(res, t) { 
                            if (t.length == 0)
                                return false;
                            
                            if (res)
                                return true;
                            
                            if (t == "ls")
                                t = Skill.ls.id;
                            else if (t == "sd")
                                t = Skill.sd.id;
                            else if (t == "qs")
                                t = Skill.qs.id;
                            else if (t == "ep")
                                t = Skill.ep.id;
                            else if (t == "ds")
                                t = Skill.ds.id;
                            else if (t == "gs")
                                t = Skill.gs.id;
                            else if (t == "dr")
                                t = Skill.dr.id;
                            else if (t == "fb")
                                t = Skill.fb.id;
                            else if (t == "bg")
                                t = Skill.bg.id;
                            if (typeof(t) == 'string')
                                t = t.toLowerCase();
                            
                            return List.fold_left(function(res, skill) { return res || skill.id == t || skill.name.toLowerCase().indexOf(t) != -1}, false, g.skills);
                        }, 
                        false, ts
                    );
                };
            }
        },
        /** Returns the conjunction of the two specified selectors. */
        and: function(r1, r2) {
            if ($.isArray(r1) && (typeof r2 == 'undefined' || r2 == null)) {
                if (r1.length == 0)
                    return none_selector;
                else {
                    var res = r1[0];
                    for (var i = 1; i < r1.length; i++) {
                        res = this.and(res, r1[i])
                    }
                    return res;
                }
            } else {
                return function(g) {
                    return r1(g) && r2(g);
                };
            }
        },
        /** Returns the disjunction of the two specified selectors. */
        or: function(r1, r2) {
            if ($.isArray(r1) && (typeof r2 == 'undefined' || r2 == null)) {
                if (r1.length == 0)
                    return all_selector;
                else {
                    var res = r1[0];
                    for (var i = 1; i < r1.length; i++) {
                        res = this.or(res, r1[i])
                    }
                    return res;
                }
            } else {
                return function(g) {
                    return r1(g) || r2(g);
                };
            }
        },
        /** Returns the negation of the specified selector. */
        not: function(r) {
            return function(g) {
                return !r(g);
            };
        },
        /** Returns a custom selector from a string. */
        fromString: function(s) {
            var selector = this.all;
            var queries = s.split("&");
            for (var i = 0; i < queries.length; i++) {
                var query = queries[i].split("=");
                var name = query[0];
                var terms = query.length > 1 ? query[1] : "";
                if (name == "name")
                    selector = this.and(selector, this.name(terms));
                else if (name == "attr")
                    selector = this.and(selector, this.attribute(terms));
                else if (name == "place")
                    selector = this.and(selector, this.place(terms));
                else if (name == "border")
                    selector = this.and(selector, this.border(terms));
                else if (name == "id")
                    selector = this.and(selector, this.id(terms));
                else if (name == "stars")
                    selector = this.and(selector, this.stars(terms));
                else if (name == "shape")
                    selector = this.and(selector, this.shape(terms));
            }
            return selector;
        },

        mkQuery: function(options) {
            var queries = [];
            var h = function(n, vs) {
                var v = vs;
                if ($.isArray(vs))
                    v = vs.join(",");
                return n + "=" + v;
            };
            var names = ["id", "name", "stars", "attr", "place", "border", "shape", "skill"];
            for (var i = 0; i < names.length; i++) {
                if (names[i] in options)
                    queries.push(h(names[i], options[names[i]]));
            }
            return queries.join("&");
        },

        /** Returns a selector that finds matches among cards and their prototypes. */
        rec: function(r) {
            return function(g) {
                if (r(g))
                    return true;
                if (g.proto == null)
                    return false;
                g = getCard(g.proto);
                if (g == null)
                    return false;
                return r(g);
            };
        },
        /** Returns the cards selected by a specified selector. */
        select: function(r, gcs) {
            if (typeof gcs == 'undefined' || gcs == null)
                gcs = Card.all;
            
            return List.fold_left(
                function(res, g) { if (r(g)) res.push(g); return res; },
                [],
                gcs
            );
        }
    };
})();
/** ======================================== End of Selectors ======================================== */



/** ======================================== Coliseum Restrictions ======================================== */
var OldRestrictions = (function() {
    return [
        { name: "Seasand Cup: Deadmoond Desert and Cerulean Deep",
          selector: Selector.rec(Selector.place("desert,ocean,invitation"))
        },
        { name: "Seasand Cup: Deadmoond Desert and Cerulean Deep, No Gold",
          selector: Selector.and(Selector.not(Selector.border("almighty")), Selector.rec(Selector.place("desert,ocean,invitation")))
        },
        { name: "Seasand Cup: Fire, No Limited",
          selector: Selector.and(Selector.attribute("fire"), Selector.border("none"))
        },
        { name: "Unlimited Cup XI: Guardians with names containing 5 letters",
          selector: function(g) {
              return g.name.length == 5;
          }
        },
        { name: "Unlimited Cup XII: Guardians capable of learning the Revival ability only",
          selector: function(g) {
              return g.canLearnSkill(revival);
          }
        },
        { name: "Unlimited Cup XVII: Guardians with names ending in \"n\"",
          selector: function(g) {
              return g.name.charAt(g.name.length - 1) == 'n';
          }
        },
        { name: "Unlimited Cup XVIII: Seated Guardians",
          selector: Selector.rec(function(g) { 
              return g.id == "40021" || g.id == "40025" || g.id == "40038" || g.id == "40047" || g.id == "40053" ||
                  g.id == "40054" || g.id == "40055" || g.id == "40091" || g.id == "40146" || g.id == "40159" ||
                  g.id == "40160" || g.id == "40205" || g.id == "40207" || g.id == "40252" || g.id == "40253" ||
                  g.id == "30040" || g.id == "30061" || g.id == "30065" || g.id == "30066" || g.id == "20007" ||
                  g.id == "20022" || g.id == "20051" || g.id == "20056" || g.id == "20058" || g.id == "20067" ||
                  g.id == "20075" || g.id == "20094" || g.id == "10058" || g.id == "10061" || g.id == "10080" ||
                  g.id == "10084" || g.id == "00005" || g.id == "00043" || g.id == "00072";
          })
        },
        { name: "1st Berneside Cup: Berneside Guardians (Veteran and Elite)",
          selector: Selector.rec(function(g) {
              return g.place == Place.plains || g.place == Place.plains_night;
          })
        },
        { name: "1st Berneside Cup: Untradable Guardians (Special)",
          selector: function(g) {
              return g.id == "40085" || g.id == "40157" || g.id == "40159" || g.id == "40160" || g.id == "40202" ||
                  g.id == "40203" || g.id == "40217" || g.id == "40221" || g.id == "40222" || g.id == "40223" ||
                  g.id == "40231" || g.id == "40232" || g.id == "40233" || g.id == "30082" || g.id == "20063" ||
                  g.id == "20064" || g.id == "20065" || g.id == "20078" || g.id == "20079" || g.id == "20096" ||
                  g.id == "20097" || g.id == "10054" || g.id == "10055" || g.id == "10067" || g.id == "10068" ||
                  g.id == "10069" || g.id == "gilded scarab" || g.id == "evolved predator" || g.id == "10086" || g.id == "10087" ||
                  g.id == "sanguine serket" || g.id == "frost slime (quests)" || g.id == "00056" || g.id == "00057" || g.id == "00067" ||
                  g.id == "00068" || g.id == "00072" || g.id == "emerald carbuncle" || g.id == "ravishing elf" || g.id == "00083" ||
                  g.id == "chonchon (quests)" || g.id == "mimetic parandus";
          }
        },
        { name: "49th Unlimited Cup XIX: (Guardians with water in their artwork)",
          selector: function(g) {
              return g.id == "40328" || g.id == "40327" || g.id == "40214" || g.id == "40206" || g.id == "40147" ||
                  g.id == "40143" || g.id == "40102" || g.id == "40030" || g.id == "40025" || g.id == "40019" ||
                  g.id == "40017" || g.id == "40002" || g.id == "30076" || g.id == "30075" || g.id == "30066" ||
                  g.id == "30064" || g.id == "30063" || g.id == "30058" || g.id == "30042" || g.id == "30041" ||
                  g.id == "30040" || g.id == "30037" || g.id == "30006" || g.id == "30003" || g.id == "20110" ||
                  g.id == "20093" || g.id == "20084" || g.id == "20083" || g.id == "20077" || g.id == "20076" ||
                  g.id == "20075" || g.id == "20074" || g.id == "20073" || g.id == "20070" || g.id == "20069" ||
                  g.id == "20068" || g.id == "20047" || g.id == "20013" || g.id == "20005" || g.id == "20004" ||
                  g.id == "10100" || g.id == "frost slime" || g.id == "10074" || g.id == "10066" || g.id == "10060" ||
                  g.id == "10059" || g.id == "10045" || g.id == "10041" || g.id == "10040" || g.id == "10038" ||
                  g.id == "10030" || g.id == "10029" || g.id == "10004" || g.id == "10003" || g.id == "00095" ||
                  g.id == "00066" || g.id == "00065" || g.id == "00063" || g.id == "00062" || g.id == "00061" ||
                  g.id == "00060" || g.id == "00059" || g.id == "00058" || g.id == "00051" || g.id == "00046" ||
                  g.id == "00037" || g.id == "00007" || g.id == "00006" || g.id == "00005";
          }
        },
        { name: "51th Unlimited Cup XX: (Armed Guardians)",
          selector: function(g) {
              return List.mem(g.id, [
                  "40009", "40010", "40012", "40023", "40024", "40047", "40052", "40055", "40091", "40092",
                  "40093", "40136", "40137", "40145", "40147", "40159", "40181", "40078", "40204", "40206",
                  "40207", "40253", "40255", "40334",
                  "30008", "30017", "30025", "30026", "30028", "30031", "30034", "30038", "30045", "30046",
                  "30049", "30051", "30054", "30055", "30056", "30057", "30061", "30079", "30081",
                  "20004", "20009", "20015", "20018", "20023", "Mandarin Dragonling", "Violet Dragonling", "20030", "20035", "20036",
                  "20038", "20039", "20040", "20042", "20050", "20052", "20057", "20070", "20086", "20097",
                  "10002", "10005", "10006", "10007", "10018", "10019", "10020", "10022", "10023", "10027",
                  "10033", "10044", "10046", "10058", "10063", "10065", "10074", "10077", "10083", "10084",
                  "10086", "10087",
                  "00006", "00008", "00009", "00011", "00012", "00015", "00023", "00024", "00026", "00031",
                  "00032", "00033", "00038", "00054", "00064", "Skeleton", "00078", "00079", "Ravishing Elf"
              ]);
          }
        }
    ];
})();

var Restrictions = (function() {
    return [
        { name: "No Restriction",
          selector: function(g) { 
              return true; 
          } 
        },
        { name: "No Limited (color-bordered) Cards",
          selector: function(g) { 
              return g.border == Border.none; 
          } 
        },
        { name: "No Almighty Cards",
          selector: function(g) { 
              return g.border != Border.almighty; 
          } 
        }
    ];
})();
/** ======================================== End of Coliseum Restrictions ======================================== */






function clone(obj, deep) {
    deep = typeof deep == 'undefined' ? false : true;
    return jQuery.extend(deep, {}, obj);
}

function insertAttributesTable(e) {
    var s = "<table class='attributes'><tr><th></th>";
    var attributes = Attribute.all;
    for (var i = 0; i < attributes.length; i++) {
        s += "<th>" + attributes[i].getImage() + "</th>";
    }
    s += "</tr>";
    for (var i = 0; i < attributes.length; i++) {
        s += "<tr><th>" + attributes[i].getImage() + "</th>";
        for (var j = 0; j < attributes.length; j++) {
            s += "<td>";
            if (attributes[i].isCriticalTo(attributes[j]))
                s += "<font color='green'>+</font>";
            else if (attributes[i].isBlockedBy(attributes[j]))
                s += "<font color='red'>-</font>";
            s += "</td>";
        }    
        s += "</tr>";
    }
    s += "</table>";
    e.innerHTML = s;
}

function insertAttributesTextTable(e) {
    var s = "<table class='attributes'><tr><th></th>";
    var attributes = Attribute.all;
    for (var i = 0; i < attributes.length; i++) {
        s += "<th>" + attributes[i].name + "</th>";
    }
    s += "</tr>";
    for (var i = 0; i < attributes.length; i++) {
        s += "<tr><th>" + attributes[i].id + ": " + attributes[i].name + "</th>";
        for (var j = 0; j < attributes.length; j++) {
            s += "<td>";
            if (attributes[i].isCriticalTo(attributes[j]))
                s += "<font color='green'>+</font>";
            else if (attributes[i].isBlockedBy(attributes[j]))
                s += "<font color='red'>-</font>";
            s += "</td>";
        }    
        s += "</tr>";
    }
    s += "</table>";
    e.innerHTML = s;
}

function insertSkillsTable(e) {
    var s = "<table class='skills'><tr><th>Name</th><th>Description</th><th>Cost (HP)</th><th>Cost (MP)</th></tr>";
    for (var i = 0; i < Skill.all.length; i++) {
        s += "<tr>";
        s += "<td>" + Skill.all[i].name + "</td>";
        s += "<td>" + Skill.all[i].description + "</td>";
        s += "<td>" + Skill.all[i].cost.hp + "</td>";
        s += "<td>" + Skill.all[i].cost.mp + "</td>";
        s += "</tr>";
    }
    s += "</table>";
    e.innerHTML = s;
}



/** ======================================== Sorting ======================================== */
var Sorting = (function() {
    var comparator = function(x, y, vx, vy, rec) {
        var res = 0;
        if (vx < vy)
            res = -1;
        else if (vx > vy)
            res = 1;
        else if (typeof rec != 'undefined' && rec != null)
            res = rec(x, y);
        else
            res = 0;
        return res;
    };
    var stats_sort = function(buff, gattr, gbuff) {
        return function(x, y) {
            if (buff == 0)
                return comparator(x, y, gattr(x), gattr(y));
            else {
                var mx = 1;
                var my = 1;
                var skillsx = buff == 1 ? x.getRecommends() : x.skills;
                var skillsy = buff == 1 ? y.getRecommends() : y.skills;
                for (var i = 0; i < skillsx.length; i++)
                    mx += gbuff(skillsx[i]);
                for (var i = 0; i < skillsy.length; i++)
                    my += gbuff(skillsy[i]);
                return comparator(x, y, gattr(x) * mx, gattr(y) * my); 
            }
        };
    };
    return  {
        compose: function(cmp1, cmp2) {
            var c = function(cmp1, cmp2) {
                return function(x, y) {
                    var res = cmp1(x, y);
                    if (res == 0)
                        return cmp2(x, y);
                    else
                        return res;
                };
            };

            if (Array.isArray(cmp1) && typeof(cmp2) == 'undefined') {
                if (cmp1.length == 0)
                    throw "Empty sorting";
                else if (cmp1.length == 1)
                    return cmp1[0];
                else {
                    var cmp = cmp1[cmp1.length - 1];
                    for (var i = cmp1.length - 2; i >= 0; i--)
                        cmp = c(cmp1[i], cmp);
                    return cmp;
                }
            } else
                return c(cmp1, cmp2);
        },
        reverse: function(cmp) {
            return function(x, y) {
                return cmp(y, x);
            };
        },
        name: function(x, y) {
            if (x.name < y.name)
                return -1;
            else if (x.name > y.name)
                return 1;
            else
                return 0;
        },
        place: function(x, y) {
            if (x.place.sid < y.place.sid)
                return -1;
            else if (x.place.sid > y.place.sid)
                return 1;
            
            if ("place2" in x && "place2" in y) {
                var xp = Array.isArray(x.place2) ? x.place2[0] : x.place2;
                var yp = Array.isArray(y.place2) ? y.place2[0] : y.place2;
                if (xp < yp)
                    return -1;
                else if (xp > yp)
                    return 1;
            } 

            return 0;
        },
        id: function(x, y) {
            if (x.id < y.id)
                return -1;
            else if (x.id > y.id)
                return 1;
            else
                return 0;
        },
        event: function(x, y) {
            return comparator(x, y, x.event.id, y.event.id);  
        },
        attribute: function(x, y) {
            if (x.id == y.id)
                return 0;

            if (x.attribute.id < y.attribute.id)
                return -1;
            else if (x.attribute.id > y.attribute.id)
                return 1;
            else if (x.border.id < y.border.id)
                return -1;
            else if (x.border.id > y.border.id)
                return 1;
            else
                return 0;
        },
        border: function(x, y) {
            return comparator(x, y, x.border.id, y.border.id);
        },
        stars: function(x, y) {
            return comparator(x, y, -x.stars, -y.stars, function(x, y) { return comparator(x, y, x.border.id, y.border.id); });
        },
        skill: function(s1, s2) {
            var i1 = s1.stone;
            var i2 = s2.stone;

            if (i1 == 0 && i2 == 1)
                return -1;
            else if (i1 == 1 && i2 == 0)
                return 1;
            
            i1 = s1.level;
            i2 = s2.level;

            if (i1 < i2)
                return 1;
            else if (i1 > i2)
                return -1;
            
            i1 = s1.attribute.id;
            i2 = s2.attribute.id;
            
            if (i1 < i2)
                return -1;
            else if (i1 > i2)
                return 1;
            else
                return 0;
        },
        hp: function(buff) { 
            return stats_sort(buff, function(c) { return c.getMaxHP(); }, function(s) { return s.buff.self.hp; });
        },
        mp: function(buff) { 
            return stats_sort(buff, function(c) { return c.getMaxMP(); }, function(s) { return s.buff.self.mp; });
        },
        atk: function(buff) { 
            return stats_sort(buff, function(c) { return c.getMaxATK(); }, function(s) { return s.buff.self.atk; });
        },
        def: function(buff) { 
            return stats_sort(buff, function(c) { return c.getMaxDEF(); }, function(s) { return s.buff.self.def; });
        },
        agi: function(buff) { 
            return stats_sort(buff, function(c) { return c.getMaxAGI(); }, function(s) { return s.buff.self.agi; });
        },
        wis: function(buff) { 
            return stats_sort(buff, function(c) { return c.getMaxWIS(); }, function(s) { return s.buff.self.wis; });
        },
        total: function(buff) {
            return function(x, y) {
                if (buff == 0)
                    return comparator(x, y, x.getMaxHP() + x.getMaxMP() + x.getMaxATK() + x.getMaxDEF() + x.getMaxAGI() + x.getMaxWIS(), 
                                            y.getMaxHP() + y.getMaxMP() + y.getMaxATK() + y.getMaxDEF() + y.getMaxAGI() + y.getMaxWIS()); 
                else {
                    var mx_hp = 1, mx_mp = 1, mx_atk = 1, mx_def = 1, mx_agi = 1, mx_wis = 1;
                    var my_hp = 1, my_mp = 1, my_atk = 1, my_def = 1, my_agi = 1, my_wis = 1;
                    var skillsx = buff == 1 ? x.getRecommends() : x.skills;
                    var skillsy = buff == 1 ? y.getRecommends() : y.skills;
                    for (var i = 0; i < skillsx.length; i++) {
                        mx_hp += skillsx[i].buff.self.hp
                        mx_mp += skillsx[i].buff.self.mp
                        mx_atk += skillsx[i].buff.self.atk;
                        mx_def += skillsx[i].buff.self.def;
                        mx_agi += skillsx[i].buff.self.agi;
                        mx_wis += skillsx[i].buff.self.wis;
                    }
                    for (var i = 0; i < skillsy.length; i++) {
                        my_hp += skillsy[i].buff.self.hp
                        my_mp += skillsy[i].buff.self.mp
                        my_atk += skillsy[i].buff.self.atk;
                        my_def += skillsy[i].buff.self.def;
                        my_agi += skillsy[i].buff.self.agi;
                        my_wis += skillsy[i].buff.self.wis;
                    }
                    return comparator(x, y, 
                             x.getMaxHP() * mx_hp + x.getMaxMP() * mx_mp + x.getMaxATK() * mx_atk + x.getMaxDEF() * mx_def + x.getMaxAGI() * mx_agi + x.getMaxWIS() * mx_wis, 
                             y.getMaxHP() * my_hp + y.getMaxMP() * my_mp + y.getMaxATK() * my_atk + y.getMaxDEF() * my_def + y.getMaxAGI() * my_agi + y.getMaxWIS() * my_wis); 
                }
            };
        }
    };
})();
/** ======================================== End of Sorting ======================================== */



/** ======================================== Card Comparison ======================================== */
var Comparison = (function() {
    var key = locale.getLanguage() + ".comparison";
    var get = function() {
        var res = $.jStorage.get(key);
        if (typeof res == 'undefined' || res == null)
            res = [];
        return res;
    };
    var add = function(obj) {
        var res = get();
        res.push(obj);
        $.jStorage.set(key, res);
    };
    var clear = function() {
        $.jStorage.deleteKey(key);
    };
    return {
        getSize: function() {
            return get().length;
        },
        addCard: function(g) {
            var obj = {};
            obj.id = g.id;
            obj.tid = g.type.id;
            obj.skills = List.map(function(skill) {return skill.id;}, g.getSkills());
            add(obj);
        },
        getCards: function() {
            var gs = [];
            var objs = get();
            for (var i = 0; i < objs.length; i++) {
                var obj = objs[i];
                var g = Card.get(obj.id);
                if (g == null)
                    continue;
                g = clone(g);
                var t = Type.get(obj.tid);
                if (t == null)
                    continue;
                var sks = List.map(Skill.get, obj.skills);
                g.setType(t);
                g.setSkills(sks);
                gs.push(g);
            }
            return gs;
        },
        clear: function() {
            clear();
        }
    };

})();
/** ======================================== End of Card Comparison ======================================== */



/** ======================================== Damage Calculator ======================================== */
var MODE_UOHKO = "mode-uohko";
var MODE_OHKOBY = "mode-ohkoby";
var MODE_UQSKO = "mode-uqsko";
var MODE_QSKO = "mode-qsko";
var Calculator = (function() {
    var hasSkill = function(skills, skill) {
        for (var i = 0; i < skills.length; i++) {
            if (skills[i].id == skill.id)
                return true;
        }
        return false;
    };

    var skill_mult = [0.065, 0.12, 0.25, 0.5, 0.6];

    var calculator = {
        MODE_UOHKO: MODE_UOHKO,
        MODE_OHKOBY: MODE_OHKOBY,
        MODE_UQSKO: MODE_UQSKO,
        MODE_QSKO: MODE_QSKO,
        default_options: {
            qs: false,
            sap: false,
            nonrecommended: true,
            mode: MODE_UOHKO,
            merge_oneshotby: true,
            gs_critical: true,
            plus_normal: false,
            ex1s: {ex1: null, ex2: null},
            ex2s: {ex1: null, ex2: null}
        },
        skill_mult: skill_mult,
        skill4_mult: skill_mult[skill_mult.length - 2],
        skill4x_mult: skill_mult[skill_mult.length - 1],
        normal_mult: 1,
        critical_mult: 1.15,
        blocked_mult: 0.85,
        getDamage: function(aw, skill, buf, attr, dw, debuf) {
            return Math.floor(aw * (1 + skill + buf) * attr - (dw * (1 + debuf)) / 2);
        },
        isOHKO: function(g1, g2, options) {
            if (typeof options == 'undefined' || options == null)
                options = this.default_options;

            var status1 = g1.getStats();
            var status2 = g2.getStats();

            /* Apply EX1 effects. */
            if (options.ex1s.ex1 != null && options.ex1s.ex1.acs(g1))
                options.ex1s.ex1.applyStats(status1);
            if (options.ex2s.ex1 != null && options.ex2s.ex1.acs(g2))
                options.ex2s.ex1.applyStats(status2);

            /* For the opponent, consider all its skills. */
            var skills1 = g1.getSkills();
            var skills2 = options.nonrecommended ? g2.skills : g2.getRecommends();

            /* Buff and debuff. */
            var atk1 = 0;
            var wis1 = 0;
            var def2 = 0;
            var wis2 = 0;

            /* QS. */
            var qs = 0;
            if (options.mode == MODE_QSKO || options.qs) {
                if (hasSkill(skills1, Skill.qs) && status1.mp >= Skill.qs.cost.mp) {
                    var buff1 = atk1 + (options.ex1s.ex2 == null ? 0 : options.ex1s.ex2.getPowUp(Skill.qs));
                    var dmg = this.getDamage(status1.atk, -0.15, buff1, 1, status2.def, def2);
                    qs = Math.max(dmg, 1);
                    status1.mp -= Skill.qs.cost.mp;
                } else
                    qs = 0;
            }

            if (options.mode == MODE_QSKO)
                return qs >= g2.getHP();

            /* Apply buff and debuff. */
            for (var i = 0; i < skills1.length; i++) {
                var skill = skills1[i];
                if (!skill.isBuff() || status1.mp < skill.cost.mp)
                    continue;

                status1.mp -= skill.cost.mp;

                var buff = skill.buff.versus(g1, g2);
                atk1 += buff.atk;
                wis1 += buff.wis;
                if (!hasSkill(skills2, Skill.resistant)) {
                    def2 += buff.ddef;
                    wis2 += buff.dwis;
                }
            }
            for (var i = 0; i < skills2.length; i++) {
                var skill = skills2[i];
                if (!skill.isBuff() || status2.mp < skill.cost.mp)
                    continue;

                status2.mp -= skill.cost.mp;

                var buff = skill.buff.versus(g2, g1);
                def2 += buff.def;
                wis2 += buff.wis;
                if (!hasSkill(skills1, Skill.resistant)) {
                    atk1 += buff.datk;
                    wis1 += buff.dwis;
                }
            }

            /* Apply EP. */
            if (hasSkill(skills2, Skill.ep) && !hasSkill(skills1, Skill.resistant) && status2.mp >= Skill.ep.cost.mp) {
                status2.mp -= Skill.ep.cost.mp;
                atk1 = Math.min(0, atk1);
                wis1 = Math.min(0, wis1);
            }
            if (hasSkill(skills1, Skill.ep) && !hasSkill(skills2, Skill.resistant) && status1.mp >= Skill.ep.cost.mp) {
                status1.mp -= Skill.ep.cost.mp;
                def2 = Math.min(0, def2);
                wis2 = Math.min(0, wis2);
            }

            /* Normal attack. */
            var damage = this.getDamage(status1.atk, 0, atk1, 1, status2.def, def2);
            damage = Math.max(damage, 1);
            var normal = damage;

            if (!(options.sap && hasSkill(skills2, Skill.sap) && !hasSkill(skills1, Skill.resistant) && status2.mp >= Skill.sap.cost.mp)) {
                for (var i = 0; i < skills1.length; i++) {
                    var skill = skills1[i];
                    if (skill == Skill.gs && status1.mp >= skill.cost.mp) {
                        /* Attack by Gigant Smash. */
                        var sk = options.gs_critical ? 1 : -0.5;
                        var dmg = this.getDamage(status1.atk, sk, atk1, 1, status2.def, -1);
                        damage = Math.max(damage, dmg);
                    } else if (skill == Skill.cd && status1.mp >= skill.cost.mp) {
                        /* Attack by Crash Drain. */
                        var dmg = this.getDamage(status1.atk, this.skill_mult[skill.level - 1], atk1, 1, status2.def, def2);
                        damage = Math.max(damage, dmg);
                    } else if (skill.isPhysical() && status1.mp >= skill.cost.mp) {
                        /* Physical attack. */
                        var dmg = this.getDamage(status1.atk, this.skill_mult[skill.level - 1], atk1, 1, status2.def, def2);
                        damage = Math.max(damage, dmg);
                    } else if (skill.isElemental() && status1.mp >= skill.cost.mp) {
                        /* Elemental attack. */
                        var elm = 1;
                        if (hasSkill(skills2, Skill.fb) || skill.attribute.isBlockedBy(g2.attribute))
                            elm = 0.85;
                        else if (skill.attribute.isCriticalTo(g2.attribute))
                            elm = 1.15;
                        var dmg = this.getDamage(status1.wis, this.skill_mult[skill.level - 1], wis1, elm, status2.wis, wis2);
                        damage = Math.max(damage, dmg);
                    }
                }
            }

            if (hasSkill(skills1, Skill.bg)) {
                var hpcost = Skill.bg.cost.hp;
                if (options.ex1s.ex2 != null && options.ex1s.ex2.costdec(Skill.bg))
                    hpcost -= options.ex1s.ex2.hpdec;
                if (status1.hp >= hpcost) {
                    /* add 0.5 as a buff or multiply 1.5? */
                    var dmg = this.getDamage(status1.atk, 0.5, atk1, 1, status2.def, def2);
                    damage = Math.max(damage, dmg);
                }
            }

            damage += qs;

            if (options.plus_normal && g1.hasSkill(Skill.ls))
                damage += normal;
            
            return damage >= g2.getHP();
        },

        getUOHKO: function(g, opponents, options) {
            var unable = [];
            var res = {title: "Unable To OHKO", id: "uohko", cards: unable, ccount: 0, tcount: 0};
            for (var i = 0; i < opponents.length; i++) {
                var opponent = clone(opponents[i]);
                opponent.setStoned(true);
                var ts = [];
                for (var j = 0; j < Type.all.length; j++) {
                    var t = Type.all[j];
                    if (!opponent.hasType(t))
                        continue;
                    opponent.setType(t);
                    opponent.setLevel(opponent.getMaxLevel());
                    if (!this.isOHKO(g, opponent, options))
                        ts.push(t);
                }
                if (ts.length > 0) {
                    unable.push({opponent: opponent, types: ts});
                    res.ccount++;
                    res.tcount += ts.length;
                }
            }
            return [res];
        },

        getUQSKO: function(g, opponents, options) {
            options.mode = MODE_QSKO;
            var unable = [];
            var res = {title: "Unable To QS-KO", id: "uqsko", cards: unable, ccount: 0, tcount: 0};
            for (var i = 0; i < opponents.length; i++) {
                var opponent = clone(opponents[i]);
                opponent.setStoned(true);
                var ts = [];
                for (var j = 0; j < Type.all.length; j++) {
                    var t = Type.all[j];
                    if (!opponent.hasType(t))
                        continue;
                    opponent.setType(t);
                    opponent.setLevel(opponent.getMaxLevel());
                    if (!this.isOHKO(g, opponent, options))
                        ts.push(t);
                }
                if (ts.length > 0) {
                    unable.push({opponent: opponent, types: ts});
                    res.ccount++;
                    res.tcount += ts.length;
                }
            }
            return [res];
        },

        getQSKO: function(g, opponents, options) {
            options.mode = MODE_QSKO;
            var unable = [];
            var res = {title: "QS-KO", id: "qsko", cards: unable, ccount: 0, tcount: 0};
            for (var i = 0; i < opponents.length; i++) {
                var opponent = clone(opponents[i]);
                opponent.setStoned(true);
                var ts = [];
                for (var j = 0; j < Type.all.length; j++) {
                    var t = Type.all[j];
                    if (!opponent.hasType(t))
                        continue;
                    opponent.setType(t);
                    opponent.setLevel(opponent.getMaxLevel());
                    if (this.isOHKO(g, opponent, options))
                        ts.push(t);
                }
                if (ts.length > 0) {
                    unable.push({opponent: opponent, types: ts});
                    res.ccount++;
                    res.tcount += ts.length;
                }
            }
            return [res];
        },

        isOHKOBy: function(g1, g2, options) {
            var res = {
                qs: false,
                normal: false,
                physical: false,
                elemental: false,
                critical: false,
                blocked: false,
                element4x: false,
                critical4x: false,
                blocked4x: false,
                gs: false,
                bg: false,
                cd: false
            };

            if (typeof options == 'undefined' || options == null)
                options = this.default_options;

            var status1 = g1.getStats();
            var status2 = g2.getStats();

            /* For the opponent, consider only recommended skills. */
            var skills1 = g1.getSkills();
            var skills2 = options.nonrecommended ? g2.skills : g2.getRecommends();
            
            /* Buff and debuff. */
            var def1 = 0;
            var wis1 = 0;
            var atk2 = 0;
            var wis2 = 0;

            /* QS. */
            var qs = 0;
            if (hasSkill(skills2, Skill.qs) && status2.mp >= Skill.qs.cost.mp) {
                var dmg = this.getDamage(status2.atk, -0.15, atk2, 1, status1.def, def1);
                qs = Math.max(dmg, 1);
                status2.mp -= Skill.qs.cost.mp;
            } else
                qs = 0;
            res['qs'] = qs >= g1.getHP();

            /* Reset the damage by QS if QS should be ignored. */
            if (!options.qs)
                qs = 0;
            
            /* Apply buff and debuff. */
            for (var i = 0; i < skills1.length; i++) {
                var skill = skills1[i];
                if (!skill.isBuff() || status1.mp < skill.cost.mp)
                    continue;

                status1.mp -= skill.cost.mp;

                var buff = skill.buff.versus(g1, g2);
                def1 += buff.def;
                wis1 += buff.wis;
                if (!hasSkill(skills2, Skill.resistant)) {
                    atk2 += buff.datk;
                    wis2 += buff.dwis;
                }
            }
            for (var i = 0; i < skills2.length; i++) {
                var skill = skills2[i];
                if (!skill.isBuff() || status2.mp < skill.cost.mp)
                    continue;

                status2.mp -= skill.cost.mp;
                
                var buff = skill.buff.versus(g2, g1);
                atk2 += buff.atk;
                wis2 += buff.wis;
                if (!hasSkill(skills1, Skill.resistant)) {
                    def1 += buff.ddef;
                    wis1 += buff.dwis;
                }
            }
            
            /* Apply EP. */
            if (hasSkill(skills2, Skill.ep) && !hasSkill(skills1, Skill.resistant) && status2.mp >= Skill.ep.cost.mp) {
                def1 = Math.min(0, def1);
                wis1 = Math.min(0, wis1);
                status2.mp -= Skill.ep.cost.mp;
            }
            if (hasSkill(skills1, Skill.ep) && !hasSkill(skills2, Skill.resistant) && status1.mp >= Skill.ep.cost.mp) {
                atk2 = Math.min(0, atk2);
                wis2 = Math.min(0, wis2);
                status1.mp -= Skill.ep.cost.mp;
            }
            
            /* Normal attack. */
            var damage = this.getDamage(status2.atk, 0, atk2, 1, status1.def, def1);
            damage = Math.max(damage, 1) + qs;
            res['normal'] = damage >= g1.getHP();
            
            if (!(options.sap && hasSkill(skills1, Skill.sap) && !hasSkill(skills2, Skill.resistant))) {
                if (hasSkill(skills2, Skill.gs) && status2.mp >= Skill.gs.cost.mp) {
                    /* Attack by Gigant Smash. */
                    var sk = options.gs_critical ? 1 : -0.5;
                    damage = this.getDamage(status2.atk, sk, atk2, 1, status1.def, -1);
                    damage = Math.max(damage, 1) + qs;
                    res['gs'] = damage >= g1.getHP();
                }

                /** Note: the last one is for Fire+4x. */
                var max_skill_level = this.skill_mult.length - 2;

                /* Physical attack. */
                damage = this.getDamage(status2.atk, this.skill_mult[max_skill_level], atk2, 1, status1.def, def1);
                damage = Math.max(damage, 1) + qs;
                res['physical'] = damage >= g1.getHP();
                
                if (!hasSkill(skills1, Skill.fb)) {
                    /* Normal elemental+4 attack. */
                    damage = this.getDamage(status2.wis, this.skill_mult[max_skill_level], wis2, this.normal_mult, status1.wis, wis1);
                    damage = Math.max(damage, 1) + qs;
                    res['elemental'] = damage >= g1.getHP();
                    
                    /* Critical elemental+4 attack. */
                    damage = this.getDamage(status2.wis, this.skill_mult[max_skill_level], wis2, this.critical_mult, status1.wis, wis1);
                    damage = Math.max(damage, 1) + qs;
                    res['critical'] = damage >= g1.getHP();
                }
                
                /* Blocked elemental+4 attack. */
                damage = this.getDamage(status2.wis, this.skill_mult[max_skill_level], wis2, this.blocked_mult, status1.wis, wis1);
                damage = Math.max(damage, 1) + qs;
                res['blocked'] = damage >= g1.getHP();

                var elem4xs = [Skill.fire4x, Skill.lightning4x];

                /* Element+4x attack. */
                if (!hasSkill(skills1, Skill.fb)) {
                    /* Normal Element+4x attack. */
                    if (List.exists(function(elem4x) { return !elem4x.attribute.isBlockedBy(g1.attribute) && !elem4x.attribute.isCriticalTo(g1.attribute); }, elem4xs)) {
                        damage = this.getDamage(status2.wis, this.skill4x_mult, wis2, this.normal_mult, status1.wis, wis1);
                        damage = Math.max(damage, 1) + qs;
                        res['element4x'] = damage >= g1.getHP();
                    }

                    /* Critical+4x attack. */
                    if (List.exists(function(elem4x) { return elem4x.attribute.isCriticalTo(g1.attribute); }, elem4xs)) {
                        damage = this.getDamage(status2.wis, this.skill4x_mult, wis2, this.critical_mult, status1.wis, wis1);
                        damage = Math.max(damage, 1) + qs;
                        res['critical4x'] = damage >= g1.getHP();
                    }
                }

                /* Blocked Element+4x attack. */
                if (hasSkill(skills1, Skill.fb) || List.exists(function(elem4x) { return elem4x.attribute.isBlockedBy(g1.attribute); }, elem4xs)) {
                    damage = this.getDamage(status2.wis, this.skill4x_mult, wis2, this.blocked_mult, status1.wis, wis1);
                    damage = Math.max(damage, 1) + qs;
                    res['blocked4x'] = damage >= g1.getHP();
                }

                /* Crash Drain */
                if (hasSkill(skills2, Skill.cd) && status2.mp >= Skill.cd.cost.mp) {
                    /* add 0.5 as a buff or multiply 1.5? */
                    var dmg = this.getDamage(status2.atk, 0.5, atk2, 1, status1.def, def1);
                    damage = Math.max(damage, dmg);
                    res['cd'] = damage >= g1.getHP();
                }
            }
            
            /* Blood Gambit (Soul Slash) */
            if (hasSkill(skills2, Skill.bg) && status2.hp >= Skill.bg.cost.hp) {
                /* add 0.5 as a buff or multiply 1.5? */
                var dmg = this.getDamage(status2.atk, 0.5, atk2, 1, status1.def, def1);
                damage = Math.max(damage, dmg);
                res['bg'] = damage >= g1.getHP();
            }
            
            return res;
        },

        getOHKOBy: function(g, opponents, options) {
            var res = {
                qs: [],
                normal: [],
                physical: [],
                elemental: [],
                critical: [],
                blocked: [],
                element4x: [],
                critical4x: [],
                blocked4x: [],
                gs: [],
                bg: [],
                cd: []
            };
            var ccounts = {
                qs: 0,
                normal: 0,
                physical: 0,
                elemental: 0,
                critical: 0,
                blocked: 0,
                element4x: 0,
                critical4x: 0,
                blocked4x: 0,
                gs: 0,
                bg: 0,
                cd: 0
            };
            var tcounts = {
                qs: 0,
                normal: 0,
                physical: 0,
                elemental: 0,
                critical: 0,
                blocked: 0,
                element4x: 0,
                critical4x: 0,
                blocked4x: 0,
                gs: 0,
                bg: 0,
                cd: 0
            };

            for (var i = 0; i < opponents.length; i++) {
                var opponent = clone(opponents[i]);
                opponent.setStoned(true);
                var ts = {
                    qs: [],
                    normal: [],
                    physical: [],
                    elemental: [],
                    critical: [],
                    blocked: [],
                    element4x: [],
                    critical4x: [],
                    blocked4x: [],
                    gs: [],
                    bg: [],
                    cd: []
                };
                for (var j = 0; j < Type.all.length; j++) {
                    var t = Type.all[j];
                    if (!opponent.hasType(t))
                        continue;
                    opponent.setType(t);
                    opponent.setLevel(opponent.getMaxLevel());
                    
                    var r = this.isOHKOBy(g, opponent, options);
                    if (options.merge_oneshotby) {
                        var b = false;
                        for (var key in r)
                            b = b || r[key];
                        if (b)
                            ts["normal"].push(t);
                    } else {
                        for (var key in r) {
                            if (r[key]) {
                                ts[key].push(t);
                            }
                        }
                    }
                }
                for (var key in ts) {
                    if (ts[key].length > 0) {
                        res[key].push({opponent: opponent, types: ts[key]});
                        ccounts[key] = ccounts[key] + 1;
                        tcounts[key] = tcounts[key] + ts[key].length;
                    }
                }
            }
            
            if (options.merge_oneshotby) {
                return [
                    { title: "OHKO By",
                      cards: res.normal,
                      ccount: ccounts.normal,
                      tcount: tcounts.normal
                    }
                ];
            } else {
                return [
                    { title: "OHKO By QS", 
                      id: "ohko_by_qs", 
                      cards: res.qs,
                      ccount: ccounts.qs,
                      tcount: tcounts.qs
                    },
                    { title: "OHKO By Normal Attack", 
                      id: "ohko_by_normal", 
                      cards: res.normal,
                      ccount: ccounts.normal,
                      tcount: tcounts.normal
                    },
                    { title: "OHKO By Physical+4", 
                      id: "ohko_by_physical", 
                      cards: res.physical,
                      ccount: ccounts.physical,
                      tcount: tcounts.physical
                    },
                    { title: "OHKO By Normal Element+4", 
                      id: "ohko_by_elemental", 
                      cards: res.elemental,
                      ccount: ccounts.elemental,
                      tcount: tcounts.elemental
                    },
                    { title: "OHKO By Critical Element+4", 
                      id: "ohko_by_critical", 
                      cards: res.critical,
                      ccount: ccounts.critical,
                      tcount: tcounts.critical
                    },
                    { title: "OHKO By Blocked Element+4", 
                      id: "ohko_by_blocked", 
                      cards: res.blocked,
                      ccount: ccounts.blocked,
                      tcount: tcounts.blocked
                    },
                    { title: "OHKO By Normal Element+4x", 
                      id: "ohko_by_element4x", 
                      cards: res.element4x,
                      ccount: ccounts.element4x,
                      tcount: tcounts.element4x
                    },
                    { title: "OHKO By Critical Element+4x", 
                      id: "ohko_by_critical4x", 
                      cards: res.critical4x,
                      ccount: ccounts.critical4x,
                      tcount: tcounts.critical4x
                    },
                    { title: "OHKO By Blocked Element+4x", 
                      id: "ohko_by_blocked4x", 
                      cards: res.blocked4x,
                      ccount: ccounts.blocked4x,
                      tcount: tcounts.blocked4x
                    },
                    { title: "OHKO By Gigant Smash", 
                      id: "ohko_by_smash", 
                      cards: res.gs,
                      ccount: ccounts.gs,
                      tcount: tcounts.gs
                    },
                    { title: "OHKO By Blood Gambit", 
                      id: "ohko_by_soulslash", 
                      cards: res.bg,
                      ccount: ccounts.bg,
                      tcount: tcounts.bg
                    },
                    { title: "OHKO By Crash Drain",
                      id: "ohko_by_cd", 
                      cards: res.cd,
                      ccount: ccounts.cd,
                      tcount: tcounts.cd
                    }
                ];
            }
        }
    };

    return calculator;
})();
/** ======================================== End of Damage Calculator ======================================== */



/** ======================================== Favorites ======================================== */
var Favorite = (function() {
    var FAVORITE_CARDS = "favorite-cards-" + locale.getLanguage();
    var FAVORITE_EXCARDS = "favorite-excards-" + locale.getLanguage();

    var get = function() {
        var cs = $.jStorage.get(FAVORITE_CARDS);
        if (typeof cs == 'undefined' || cs == null)
            cs = [];
        return cs;
    };

    var exget = function() {
        var cs = $.jStorage.get(FAVORITE_EXCARDS);
        if (typeof cs == 'undefined' || cs == null)
            cs = [];
        return cs;
    };

    return {
        getCards: function() {
            var cards = get();
            /* Make a clone to allow multiset. */
            cards = List.map(function(card) { return clone(card, true); }, List.map(Card.decode, cards));
            cards.sort(Sorting.name);
            return cards;
        },
        getExCards: function() {
            var cards = exget();
            cards = List.map(function(card) { return clone(card, true); }, List.map(ExCard.decode, cards));
            cards.sort(Sorting.name);
            return cards;
        },
        getCardsCodes: function() {
            return get();
        },
        getExCardsCodes: function() {
            return exget();
        },
        clearCards: function() {
            $.jStorage.set(FAVORITE_CARDS, []);
        },
        clearExCards: function() {
            $.jStorage.set(FAVORITE_EXCARDS, []);
        },
        addCard: function(c) {
            Favorite.addEncodedCard(Card.encode(c));
        },
        addExCard: function(c) {
            Favorite.addEncodedExCard(ExCard.encode(c));
        },
        addCards: function(cs) {
            Favorite.addEncodedCards(Card.encode(cs));
        },
        addExCards: function(cs) {
            Favorite.addEncodedExCards(ExCard.encode(cs));
        },
        addEncodedCard: function(code) {
            var cards = get();
            cards.push(code);
            $.jStorage.set(FAVORITE_CARDS, cards);
        },
        addEncodedExCard: function(code) {
            var cards = exget();
            cards.push(code);
            $.jStorage.set(FAVORITE_EXCARDS, cards);
        },
        addEncodedCards: function(code) {
            var cards = get();
            cards = cards.concat(code);
            $.jStorage.set(FAVORITE_CARDS, cards);
        },
        addEncodedExCard: function(code) {
            var cards = exget();
            cards = cards.concat(code);
            $.jStorage.set(FAVORITE_EXCARDS, cards);
        },
        removeCard: function(c) {
            var cards = get();
            cards.remove(Card.encode(c));
            $.jStorage.set(FAVORITE_CARDS, cards);
        },
        removeExCard: function(c) {
            var cards = exget();
            cards.remove(ExCard.encode(c));
            $.jStorage.set(FAVORITE_EXCARDS, cards);
        }
    };
})();
/** ======================================== End of Favorites ======================================== */



/** ======================================== Functions for What Is New ======================================== */
WhatIsNew = (function() {
    var hasCard = function(str) {
        return str.match(/javascript:insertGuardian\("(\d+)"\)/g);
    };
    var getCards = function(str) {
        var regexp = /javascript:insertGuardian\("(\d+)"\)/g;
        var match = null;
        var res = [];
        while(match = regexp.exec(str)) {
            var card = Card.get(match[1]);
            if (card != null)
                res.push(card);
        }
        return res;
    };
    var hasExCard = function(str) {
        return str.match(/<a href='excards.html\?(?:lang=jp&)?id=(\d+)' class='gclnk/g);
    };
    var getExCards = function(str) {
        var regexp = /<a href='excards.html\?(?:lang=jp&)?id=(\d+)' class='gclnk/g;
        var match = null;
        var res = [];
        while(match = regexp.exec(str)) {
            var card = ExCard.get(match[1]);
            if (card != null)
                res.push(card);
        }
        return res;
    };

    return {
        /** Returns all what's new data. */
        get: function() { return []; },
        /** Returns cards and EX cards mentioned in what's new.
            The returned object is a map from a date to an object {cards: x, excards: y}
            where x and y are respectively the cards and EX cards mentioned in the date. */
        getCards: function() {
            var whatisnew = WhatIsNew.get();
            var cards = {};
            for (var date in whatisnew) {
                var items = whatisnew[date];
                if (!List.exists(hasCard, items) && !List.exists(hasExCard, items))
                    continue;
                cards[date] = {
                    cards: List.flatten(List.map(function(item) { return getCards(item); }, items)),
                    excards: List.flatten(List.map(function(item) { return getExCards(item); }, items))
                };
            }
            return cards;
        },
        /** Show what's new in a DOM element of a specified ID. */
        show: function(id) {
            $("#" + id).html("").append(
                $("<div id='whatisnew'></div>")
                    .append("<span class='title'>What's New</span>")
                    .append("<p><dl id='whatisnewlist'></dl></p>")
            );
            var whatisnew = WhatIsNew.get();
            for (var date in whatisnew) {
                var items = whatisnew[date];
                $("#whatisnewlist")
                    .append("<dt><time>" + date + "</time></dt>")
                    .append("<dd><ul></ul></dd>");
                for (var i = 0; i < items.length; i++) {
                    $("#whatisnewlist dd ul").last().append("<li>" + items[i] + "</li>");
                }
            }
        }
    };
})();
/** ======================================== End of What Is New ======================================== */


/** ======================================== Functions for Web Page Manipulation ======================================== */

/* Functions for the navigation menu. */
var Nav = {
    appendLanguageSuffix: function() {
        List.iter(function(id) {
            $("#" + id + " ul li a.langdep").each(function() {
                var href = $(this).attr("href");
                if (href.indexOf(".html") == href.length - 5 && locale.getLanguage() == LANG_JP) {
                    $(this).attr("href", href + "?lang=jp");
                }
            });
        }, ["top_menu", "bottom_menu"]);
        if (locale.getLanguage() == LANG_JP)
            $('#top_menu ul li a[title="Japanese"]').contents().unwrap();
        else
            $('#top_menu ul li a[title="English"]').contents().unwrap();
    },
    disable: function(id) {
        $('#' + id).contents().unwrap();
    },
    updateComparisonNumber: function() {
        /* Update the number of cards in the comparison. */
        $("#comparison_number").html(Comparison.getSize());
    },
    init: function(id) {
        Nav.appendLanguageSuffix();
        Nav.updateComparisonNumber();
        Nav.disable(id);
    }
};

/** ======================================== End of Functions for Web Page Manipulation ======================================== */
