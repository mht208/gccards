
/** ======================================== Quests ======================================== */
var QUEST_TYPE_HUNT = {id: 0, name: "Hunt"};
var QUEST_TYPE_DUNGEON = {id: 1, name: "Dungeon"};
var QUEST_REWARD_CARD = 0;
var QUEST_REWARD_STONE = 1;
var QUEST_REWARD_RECOVERY_POTION = 2;
var QUEST_REWARD_GOLD_SLIME = 3;
var QUEST_REWARD_TICKET = 4;
var QUEST_REWARD_GP = 5;
var QUEST_REWARD_BP = 6;
var QUEST_TARGET_LIST = 0;
var QUEST_TARGET_QUERY = 1;
var Quest = (function() {
    /** Quest ID, Name, Type, Event, Difficuty, Requestor, Description, Task, Targets, Rewards, Honor */
    var mkTarget = function(targets) {
        if (typeof targets == 'undefined' || targets == null)
            return {
                targets: new Array(),
                toString: function() {
                    return "";
                }
            };
        var ts = new Array();
        for (var i = 0; i < targets.length; i++) {
            var type = targets[i][0];
            var cards = targets[i][1];
            var quantity = targets[i][2];
            var description = targets[i][3];
            var query = null;
            if (type == QUEST_TARGET_LIST)
                cards = List.map(function (cid) { return Card.get(cid); }, cards);
            if (type == QUEST_TARGET_QUERY) {
                query = cards;
                cards = Selector.select(Selector.fromString(query));
            }
            ts.push({
                cards: cards,
                quantity: quantity,
                toString: function() {
                    if (type == QUEST_TARGET_QUERY)
                        return Card.mklnks(query, description) + " x" + this.quantity;
                    else
                        return List.map(function(card) { return Card.mkextlnk(card); }, this.cards).join(", ") + " x" + this.quantity;
                }
            });
        }
        return { targets: ts,
                 toString: function() {
                     return List.map(function(target) { return target.toString(); }, this.targets).join("; ");
                 }
               };
    };
    var mkReward = function(type, name, quantity) {
        return {
            type: type,
            name: name,
            quantity: quantity,
            toString: function() {
                var suffix = quantity == 0 ? "" : " x" + quantity;
                if (this.type == QUEST_REWARD_CARD)
                    return Card.mklnk(this.name) + suffix;
                else
                    return this.name + suffix;
            }
        };
    };
    var data = new Array(
        new Array("0001", "Bounty of the Land I", QUEST_TYPE_HUNT, Event.none, 1, "Keeper of the Peace",
                  "The Keeper seeks tamers to capture a wild Guardian terrorizing Northern Cross.",
                  "Travel to Berneside Plains (Day) and hunt down the Gilded Scarab (avian silhouette).",
                  mkTarget([[QUEST_TARGET_LIST, ["10072"], 1]]),
                  mkReward(QUEST_REWARD_STONE, "Agility Stone", 1),
                  0),
        new Array("0002", "Aurum Agni I", QUEST_TYPE_DUNGEON, Event.none, 1, "The Holy Valkyrie",
                  "The knighthood needs daring tamers to aid in the search for a missing child.",
                  "Travel to a cave in the northwest corner of the continent and there search for the missing girl.",
                  mkTarget([]),
                  mkReward(QUEST_REWARD_STONE, "Sorcerer Stone", 1),
                  0),
        new Array("0003", "The Forbidden Experiment I", QUEST_TYPE_HUNT, Event.none, 1, "Conrad",
                  "I need able tamers to aid in my experiment. If all goes well, you'll be as pleased with the results as I.",
                  "Travel to Berneside Plains (Day) and hunt down 3 skeletons (humanoid silhouette).",
                  mkTarget([[QUEST_TARGET_LIST, ["00023"], 3]]),
                  mkReward(QUEST_REWARD_STONE, "Strength Stone", 1),
                  0),
        new Array("0004", "For Whom the Bomb Blows I", QUEST_TYPE_HUNT, Event.none, 2, "Mr. Perfect",
                  "Are there any Guardian Masters out there who can possibly rival perfection?",
                  "Travel to Berneside Plains (Day) and capture 10 Guardians in a single hunt.",
                  mkTarget([[QUEST_TARGET_QUERY, Selector.mkQuery({place: Place.plains.id}), 10, "Cards in Berneside Plains (Day)"]]),
                  mkReward(QUEST_REWARD_STONE, "Strength Stone", 1),
                  0),
        new Array("0005", "Princess on the Lam I", QUEST_TYPE_DUNGEON, Event.none, 1, "Chancellor",
                  "Urgent! The princess of the realm has gone missing! Seeking brave Guardian Masters to aid in the search!",
                  "Travel to the cave to the northwest and find the princess on the 5th floor of the dungeon within.",
                  mkTarget([]),
                  mkReward(QUEST_REWARD_STONE, "Life Stone", 1),
                  0),
        new Array("0006", "Oh Darling, My Darling I", QUEST_TYPE_HUNT, Event.none, 1, "Spoony Bard",
                  "I desire only to meet the Guardian who stole my heart once more. Someone, anyone, please--hunt her down!",
                  "Travel to Storm Reach Snowfield (Day) and hunt down the Seductive Vapak (humanoid silhouette).",
                  mkTarget([[QUEST_TARGET_LIST, ["00072"], 1]]),
                  mkReward(QUEST_REWARD_STONE, "Wisdom Stone", 1),
                  0),
        new Array("0007", "The Tides of Fortune I", QUEST_TYPE_HUNT, Event.none, 1, "Guston",
                  "At his wits' end, the harried fisherman means to arm himself to end the constant torment he suffers at the hands of traveling tamers.",
                  "Travel to the Glaverow Volcanic Zone (Day) and hunt down 3 Verethragna (canine silhouette).",
                  mkTarget([[QUEST_TARGET_LIST, ["10017"], 1]]),
                  mkReward(QUEST_REWARD_STONE, "Guardian Stone", 1),
                  0),
        new Array("0008", "Every Weed Bearing Seed", QUEST_TYPE_DUNGEON, Event.none, 1, "Wild One",
                  "Looking for tamers to collect rare weed for medicinal purposes.",
                  "Travel to the cave to the northwest and find the rare weed on the 5th floor of the dungeon within.",
                  mkTarget([]),
                  mkReward(QUEST_REWARD_TICKET, "Hunting ticket", 1),
                  0),
        new Array("0009", "For Whom the Bomb Blows II", QUEST_TYPE_HUNT, Event.none, 2, "Mr. Perfect",
                  "My perfection has reached the next level. Let any Guardian Masters who dare to think they can rival me come and try.",
                  "Travel to the Glaverow Volcanic Zone (Day) and capture 10 Guardians in a single hunt.",
                  mkTarget([[QUEST_TARGET_QUERY, Selector.mkQuery({place: Place.volcano.id}), 10, "Cards in " + Place.volcano.name]]),
                  mkReward(QUEST_REWARD_GP, "50 GP", 0),
                  0),
        new Array("0010", "The Forbidden Experiment II", QUEST_TYPE_HUNT, Event.none, 2, "Conrad",
                  "I'm need able tamers to aid in my experiment. If all goes well, you'll be as please with the results as I.",
                  "Travel to Berneside Plains (Day) and hunt down 5 mothmen (avian silhouette).",
                  mkTarget([[QUEST_TARGET_LIST, ["00021"], 5]]),
                  mkReward(QUEST_REWARD_STONE, "Agility Stone", 1),
                  0),
        new Array("0011", "Aurum Agni II", QUEST_TYPE_DUNGEON, Event.none, 2, "The Holy Valkyrie",
                  "The knighthood has decoded a portion of the Forgotten Guardian. We now require aid to discern the validity of its claims.",
                  "Travel to the cave in the northwest and slay the Guardians on the 10th floor of the dungeon within.",
                  mkTarget([]),
                  mkReward(QUEST_REWARD_TICKET, "Coliseum Pass", 1),
                  0),
        new Array("0012", "For Whom the Bomb Blows III", QUEST_TYPE_HUNT, Event.none, 3, "Mr. Perfect",
                  "My perfection has reached the next level. Let any Guardian Masters who dare to think they can rival me come and try.",
                  "Travel to the Berneside Plains (Day) and capture 15 Guardians in a single hunt.",
                  mkTarget([[QUEST_TARGET_QUERY, Selector.mkQuery({place: Place.plains.id}), 15, "Cards in " + Place.plains.name]]),
                  mkReward(QUEST_REWARD_GP, "100 GP", 0),
                  0),
        new Array("0013", "Bounty of the Land II", QUEST_TYPE_HUNT, Event.none, 2, "Keeper of the Peace",
                  "The Keeper seeks tamers to capture a wild Guardian terrorizing Northern Cross.",
                  "Travel to Storm Reach Snowfield (Day) and hunt down the Evolved Predator (canine silhouette).",
                  mkTarget([[QUEST_TARGET_LIST, ["10075"], 1]]),
                  mkReward(QUEST_REWARD_STONE, "Sorcerer Stone (I)", 1),
                  0),
        new Array("0014", "Cracking the Case I", QUEST_TYPE_DUNGEON, Event.none, 1, "Detective",
                  "With whom does the guilt lie? Com, and watch a master of investigation solve the mystery of a heinous crime right before your eyes!",
                  "Travel to the cave in the northwest and find evidence on the 5th floor of the dungeon within.",
                  mkTarget([]),
                  mkReward(QUEST_REWARD_STONE, "Strength Stone", 1),
                  0),
        new Array("0015", "Green Destiny", QUEST_TYPE_HUNT, Event.none, 3, "Soothsayer",
                  "The coming apocalypse casts its shadow over all. Only the glow of emerald can light the way to the salvation.",
                  "Travel to Berneside Plains (Day) and hunt down the Emerald Carbuncle (circular silhouette).",
                  mkTarget([[QUEST_TARGET_LIST, ["00073"], 1]]),
                  mkReward(QUEST_REWARD_STONE, "Life Stone (I)", 1),
                  0),
        new Array("0016", "For Whom the Bomb Blows IV", QUEST_TYPE_HUNT, Event.none, 2, "Mr. Perfect",
                  "My perfection has reached the next level. Let any Guardian Masters who dare to think they can rival me come and try.",
                  "Travel to the Storm Reach Snowfield (Day) and capture 12 Guardians in a single hunt.",
                  mkTarget([[QUEST_TARGET_QUERY, Selector.mkQuery({place: Place.snowfield.id}), 12, "Cards in " + Place.snowfield.name]]),
                  mkReward(QUEST_REWARD_GP, "50 GP", 0),
                  0),
        new Array("0017", "Princess on the Lam II", QUEST_TYPE_DUNGEON, Event.none, 2, "Chancellor",
                  "Urgent! The princess of the realm has gone missing! Seeking brave Guardian Masters to aid in the search!",
                  "Travel to the cave to the northwest and find the princess on the 10th floor of the dungeon within.",
                  mkTarget([]),
                  mkReward(QUEST_REWARD_STONE, "Guardian Stone (I)", 1),
                  0),
        new Array("0018", "When Love Freezes Over", QUEST_TYPE_HUNT, Event.none, 3, "Curious Man",
                  "Rumors abound of the magic of the frost worm. I seek tamers to aid me in discovering the truth behind them.",
                  "Travel to the Storm Reach Snowfield (Day) and hunt down 8 frost worms (serpentine silhouette)..",
                  mkTarget([[QUEST_TARGET_LIST, ["00039"], 8]]),
                  mkReward(QUEST_REWARD_STONE, "Strength Stone (I)", 1),
                  0),
        new Array("0019", "Oh Darling, My Darling II", QUEST_TYPE_HUNT, Event.none, 2, "Spoony Bard",
                  "I desire only to meet the Guardian who stole my heart once more. Someone, anyone, please--hunt her down!",
                  "Travel to Berneside Plains (Day) and hunt down the Ravishing Elf (humanoid silhouette).",
                  mkTarget([[QUEST_TARGET_LIST, ["00082"], 1]]),
                  mkReward(QUEST_REWARD_STONE, "Wisdom Stone (I)", 1),
                  0),
        new Array("0020", "Tale of the Guardian Cutter I", QUEST_TYPE_DUNGEON, Event.none, 3, "Timid Noble",
                  "S-Seeking Guardian M-Masters to retrieve the b-bowl of Atlas. T-Time is of the e-essence!",
                  "Travel to the cave to the northwest and find the bowl of Atlas on the 15th floor of the dungeon within.",
                  mkTarget([]),
                  mkReward(QUEST_REWARD_STONE, "Agility Stone (II)", 1),
                  0),
        new Array("0021", "Tamers of the 5th Degree", QUEST_TYPE_HUNT, Event.none, 1, "Lord Wyvern",
                  "The empire is now issuing trials for tamers throughout the realm. All are welcome to accept and challenge.",
                  "Travel to Berneside Plains (Day) and hunt 6 humanoid-silhouette Guardians in a single hunt.",
                  mkTarget([[QUEST_TARGET_QUERY, Selector.mkQuery({place: Place.plains.id, shape: Shape.humanoid.id}),
                             6, "Humanoid-silhouette Guardians in " + Place.plains.name]]),
                  mkReward(QUEST_REWARD_GP, "50 GP", 0),
                  0),
        new Array("0022", "Oh Darling, My Darling III", QUEST_TYPE_HUNT, Event.none, 2, "Spoony Bard",
                  "I desire only to meet the Guardian who stole my heart once more. Someone, anyone, please--hunt her down!",
                  "Travel to Glaverow Volcanic Zone (Day) and hunt down the Chaste Chonchon (circular silhouette).",
                  mkTarget([[QUEST_TARGET_LIST, ["00084"], 1]]),
                  mkReward(QUEST_REWARD_STONE, "Guardian Stone (I)", 1),
                  0),
        new Array("0023", "Princess on the Lam III", QUEST_TYPE_DUNGEON, Event.none, 3, "Chancellor",
                  "Urgent! The princess of the realm has gone missing! Seeking brave Guardian Masters to aid in the search!",
                  "Travel to the cave to the northwest and find the princess on the 15th floor of the dungeon within.",
                  mkTarget([]),
                  mkReward(QUEST_REWARD_STONE, "Guardian Stone (II)", 1),
                  0),
        new Array("0024", "The Forbidden Experiment III", QUEST_TYPE_HUNT, Event.none, 2, "Conrad",
                  "I need able tamers to aid in my experiment. If all goes well, you'll be as please with the results as I.",
                  "Travel to Berneside Plains (Day) and hunt down 5 Raiju (canine silhouette).",
                  mkTarget([[QUEST_TARGET_LIST, ["00014"], 5]]),
                  mkReward(QUEST_REWARD_TICKET, "Coliseum Pass", 1),
                  0),
        new Array("0025", "For Whom the Bomb Blows V", QUEST_TYPE_HUNT, Event.none, 2, "Mr. Perfect",
                  "My perfection has reached the next level. Let any Guardian Masters who dare to think they can rival me come and try.",
                  "Travel to the Deadmoon Desert (Day) and capture 10 Guardians in a single hunt.",
                  mkTarget([[QUEST_TARGET_QUERY, Selector.mkQuery({place: Place.desert.id}), 10, "Cards in " + Place.desert.name]]),
                  mkReward(QUEST_REWARD_GP, "100 GP", 0),
                  0),
        new Array("0035", "The Forbidden Experiment IV", QUEST_TYPE_HUNT, Event.none, 2, "Conrad", 
                  "I need able tamers to aid in my experiment. If all goes well, you'll be as pleased with the results as I.", 
                  "Travel to Deadmoon Desert (Day) and capture 5 Simurgh (avian silhouette).",
                  mkTarget([[QUEST_TARGET_LIST, ["10047"], 5]]),
                  mkReward(QUEST_REWARD_GOLD_SLIME, "Gold Slime", 5),
                  15),
        new Array("0039", "Tamers of the 4th Degree", QUEST_TYPE_HUNT, Event.none, 3, "Lord Wyvern", 
                  "I would have the imperial Guardian Masters undertake a special test of their mettle--and I expect nothing less than for them to pass gloriously!", 
                  "Travel to Glaverow Volcanic Zone (Day) and capture 4 circular silhouette Guardians in a single hunt.",
                  mkTarget([[QUEST_TARGET_QUERY, Selector.mkQuery({shape: Shape.orbs.id}), 4, "Circular-silhouette Guardians in " + Place.volcano.name]]),
                  mkReward(QUEST_REWARD_BP, "Maximum BP +2", 0),
                  0),
        new Array("0048", "Bounty of the Land IV", QUEST_TYPE_HUNT, Event.none, 3, "Keeper of the Peace", 
                  "The Keeper seeks tamers to capture a wild Guardian terrorizing Northern Cross", 
                  "Travel to Berneside Plains (Night) and there capture a Rampaging Yale (canine silhouette).",
                  mkTarget([[QUEST_TARGET_LIST, ["10099"], 1]]),
                  mkReward(QUEST_REWARD_STONE, "Life Stone (III)", 2),
                  20),
        new Array("0049", "Oh Master, My Master II", QUEST_TYPE_HUNT, Event.none, 3, "Butler", 
                  "I wish to obtain fire Guardians for my gentleman employer. Only the best tamers need apply.", 
                  "Travel to Glaverow Volcanoic Zone (Day) and there capture a total of 15 sirens and will-o'-the-wisps.",
                  mkTarget([[QUEST_TARGET_LIST, ["00006", "00001"], 15]]),
                  mkReward(QUEST_REWARD_RECOVERY_POTION, "Recovery potion", 3),
                  20),
        new Array("0051", "Tamers of the 3rd Degree", QUEST_TYPE_HUNT, Event.none, 3, "Lord Wyvern", 
                  "The Imperial Guardian Masters will give a demonstration of their abilities.", 
                  "Travel to Storm Reach Snowfields (Day) and capture 6 canine-sihouette Guardians in a single hunt..",
                  mkTarget([[QUEST_TARGET_QUERY, Selector.mkQuery({place: Place.snowfield.id, shape: Shape.canine.id}),
                             6, "Canine-silhouette Cards in " + Place.snowfield.name]]),
                  mkReward(QUEST_REWARD_RECOVERY_POTION, "Recovery potion", 3),
                  20),
        new Array("0052", "Oh Darling, My Darling VI", QUEST_TYPE_HUNT, Event.none, 3, "Spoony Bard", 
                  "I glimpsed a new facet of feminine loveliness, but I can't be sure until I see her up close and personal!", 
                  "Travel to Cerulean Deep (Day) and capture a Melancholy Pele (circular silhouette).",
                  mkTarget([[QUEST_TARGET_LIST, ["10102"], 1]]),
                  mkReward(QUEST_REWARD_STONE, "Guardian Stone (IV)", 1),
                  20),
        new Array("0053", "To Toil in the Soil", QUEST_TYPE_HUNT, Event.none, 2, "Timid Noble", 
                  "I n-need strong Guardians. S-seeking tamers to capture them for m-me.", 
                  "Travel to Berneside Plains (Day) and there capture a total of 18 earth-attribute Guardians.",
                  mkTarget([[QUEST_TARGET_QUERY, Selector.mkQuery({place: Place.plains.id, attr: Attribute.earth.id}), 
                             18, "Earth-attribute Cards in " + Place.plains.name]]),
                  mkReward(QUEST_REWARD_STONE, "Sorcerer Stone (III)", 1),
                  15),
        new Array("0055", "Aloha, Mr. Pazuzu", QUEST_TYPE_DUNGEON, Event.none, 3, "Man", 
                  "I wish to ascend Thanatos' Peak. If I can brave the dangers of the mountain, perhaps I can finally reach a decision...", 
                  "Travel to Thanatos' Peak and escort the requestor to the 20th floor of the dungeon within",
                  mkTarget([]),
                  mkReward(QUEST_REWARD_STONE, "Guardian Stone (III)", 1),
                  20)
    );
    var quests = {
        all: new Array()
    };
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        var quest = {
            id: d[0],
            name: d[1],
            type: d[2],
            event: d[3],
            difficuty: d[4],
            requestor: d[5],
            description: d[6],
            task: d[7],
            target: d[8],
            reward: d[9],
            honor: d[10],
            getDifficutyStars: function() {
                var res = "";
                for (var i = 0; i < this.difficuty; i++)
                    res += "<img width='16px' src='images/quest_star.png' />";
                return res;
            }
        };
        quests.all[i] = quest;
    }
    return quests;
})();
/** ======================================== End of Quests ======================================== */
