/** To be supported: Crash Drain, Deep Sleep, Poison Attack */

var TEAM_SIZE = 10;
var STAR_SIZE = 5;
var SKILL_SIZE = 3;
var SKILL_NONE = -1;
var MAX_LEVEL = 70;
var ANIMATION_DURATION = 500;
var SLIDE_DISTANCE = 100;
var RESET_NONE = 0;
var RESET_PREVIOUS = 1;
var RESET_ZERO = 2;

var MSG_BUFF = 1;
var MSG_ATTACK = 2;
var MSG_DAMAGE = 3;
var MSG_QS = 4;
var MSG_LS = 5;
var MSG_SD = 6;
var MSG_DS = 7;
var MSG_EP = 8;
var MSG_SAP = 9;
var MSG_REVIVAL = 10;
var MSG_DEFEATED = 11;
var MSG_OTHER = 999;
var SIMULATOR_DEBUG = false;

var HEAL_MULT = 0.55;
var MAJORHEAL_MULT = 0.85;
/* Apply healing skills when the HP is below 90%. */
var HEAL_APPLY_MULT = 0.9;
var MAJORHEAL_APPLY_MULT = 0.9;

var DEACTIVATE = {};
DEACTIVATE[Skill.life.name] = [Skill.ds, Skill.dr];
DEACTIVATE[Skill.gs.name] = [Skill.ds];
DEACTIVATE[Skill.bg.name] = [Skill.ds];
DEACTIVATE[Skill.cd.name] = [Skill.ds, Skill.dr];
DEACTIVATE[Skill.dr.name] = [Skill.ds, Skill.dr];
DEACTIVATE[Skill.sd.name] = [Skill.revival, Skill.ls, Skill.sd, Skill.curse, Skill.nervepinch];
DEACTIVATE[Skill.mr.name] = [Skill.mr, Skill.ds, Skill.dr, Skill.life, Skill.cd];
DEACTIVATE[Skill.tb.name] = [Skill.revival, Skill.ls, Skill.sd];
DEACTIVATE[Skill.nervepinch.name] = [Skill.ds, Skill.dr, Skill.ls, Skill.revival, Skill.sd, Skill.nervepinch];
DEACTIVATE[Skill.deathpredator.name] = [Skill.ls, Skill.revival, Skill.sd];

function Simulator(my_party, oppo_party, options) {
    // ========== Start of mkRes ==========
    var mkRes = function() {
        return {
            win: false,
            messages: new Array(),
            append: function(d, g1, g2, msg, typ) {
                if (!options.battle_message)
                    return;

                if (SIMULATOR_DEBUG) {
                    console.log("-----------------------------------------");
                    console.log("Append: " + msg);
                    console.log("Append: g1: " + g1.name);
                    console.log("Append: g2: " + g2.name);
                    console.log("Append: Attacker: " + d.attacker);
                    console.log("Append: Defender: " + d.defender);
                    console.log("Append: Type: " + typ);
                }

                /* Clone the cards such that the status at this time can be saved. */
                var atk = clone(g1);
                atk.battle = clone(g1.battle, true);
                var def = clone(g2);
                def.battle = clone(g2.battle, true);
                var me = (d.me == d.attacker) ? atk : (d.me == d.defender ? def : null);
                var oppo = (d.oppo == d.attacker) ? atk : (d.oppo == d.defender ? def : null);

                /* Check if this is the first appearance of the cards in the battle. */
                List.iter(function (g) {
                    var first = typeof g.battle.first == 'undefined' || g.battle.first == true;
                    if (first)
                        g.battle.first = false;
                }, new Array(g1, g2));
    
                /* Insert the message. */
                this.messages.push({me: me, oppo: oppo, m: msg, t: typ, a: atk, d: def});
            }
        };
    };
    // ========== End of mkRes ==========

    // ========== Start of mkData ==========
    var mkData = function() {
        List.iter(function(p) {
            var name = p.name;
            var cards = p.cards;
            for (var i = 0; i < cards.length; i++) {
                var g = cards[i];
                if (typeof g.battle == 'undefined')
                    g.battle = {};

                /* Make a backup of the original status before EX1 buff. */
                if (typeof g.ostatus == 'undefined' || g.ostatus == null)
                    g.ostatus = clone(g.status);

                g.battle.party = name;
                /* Apply buffs of Ex cards. */
                if (p.ex1 != null) {
                    var skill = p.ex1.getSkill();
                    if (skill.acs(g)) {
                        g.status.hp = Math.floor(g.ostatus.hp * (1 + skill.hp));
                        g.status.mp = Math.floor(g.ostatus.mp * (1 + skill.mp));
                        g.status.atk = Math.floor(g.ostatus.atk * (1 + skill.atk));
                        g.status.def = Math.floor(g.ostatus.def * (1 + skill.def));
                        g.status.agi = Math.floor(g.ostatus.agi * (1 + skill.agi));
                        g.status.wis = Math.floor(g.ostatus.wis * (1 + skill.wis));
                    }
                }
                g.battle.status = clone(g.status, true);
                g.battle.position = i;
                g.battle.atk = 0;                      /* The ATK buff of this card */
                g.battle.def = 0;                      /* The DEF buff of this card */
                g.battle.agi = 0;                      /* The AGI buff of this card */
                g.battle.wis = 0;                      /* The WIS buff of this card */
                g.battle.first = true;                 /* Indicate in the messages the first appearance of this card. */
                g.battle.appeared = false;             /* Indicate if this card has appeared. */
                g.battle.attacked = false;             /* Indicate if this card has been attacked. */
                g.battle.buffed = false;               /* Indicate if buff/debuff skills has been applied. */
                g.battle.confused = false;             /* Indicate if a card has been confused by Mind Rift. */
                g.battle.protect = false;              /* Indicate if a card is protected by Full Barrier. */
                g.battle.paralyzed = false;            /* Indicate if a card is paralyzed. */
                g.battle.resistant_effective = false;  /* Indicate if a card is protected by Resistant. */
                g.battle.ls = g.hasSkill(Skill.ls);                 /* Can cast LS? */
                g.battle.revival = g.hasSkill(Skill.revival);       /* Can cast Revival? */
                g.battle.ds = g.hasSkill(Skill.ds);                 /* Can cast DS? */
                g.battle.sds = g.hasSkill(Skill.sds);               /* Can cast Shadow DS? */
                g.battle.ep = g.hasSkill(Skill.ep);                 /* Can cast EP? */
                g.battle.sap = g.hasSkill(Skill.sap);               /* Can cast Sap? */
                g.battle.dr = g.hasSkill(Skill.dr);                 /* Can cast Deadly Reflex? */
                g.battle.sd = g.hasSkill(Skill.sd);                 /* Can cast SD? */
                g.battle.mr = g.hasSkill(Skill.mr);                 /* Can cast Mind Rift? */
                g.battle.fb = g.hasSkill(Skill.fb);                 /* Can cast Full Barrier? */
                g.battle.curse = g.hasSkill(Skill.curse);           /* Can cast Curse? */
                g.battle.np = g.hasSkill(Skill.np);                 /* Can cast Nerve Pinch? */
                g.battle.resistant = g.hasSkill(Skill.resistant);   /* Can cast Resistant? */
            }
        }, new Array(
            {name: "me", cards: my_party.cards, ex1: my_party.ex1, ex2: my_party.ex2}, 
            {name: "opponent", cards: oppo_party.cards, ex1: oppo_party.ex1, ex2: oppo_party.ex2}
        ));

        return {
            me: "me",
            oppo: "oppo",
            attacker: null,
            defender: null,
            my_cards: my_party.cards,
            my_ex1: my_party.ex1,
            my_ex2: my_party.ex2,
            my_current: 0,
            my_meter: 0,
            my_prev_meter: 0,
            oppo_cards: oppo_party.cards,
            oppo_ex1: oppo_party.ex1,
            oppo_ex2: oppo_party.ex2,
            oppo_current: 0,
            oppo_meter: 0,
            oppo_prev_meter: 0,
            
            /* Sets the attacker. The defender will be set accordingly. */
            setAttacker: function(x) {
                this.attacker = x;
                if (x == this.me)
                    this.defender = this.oppo;
                else
                    this.defender = this.me;
            },

            /** Performs an action under the context where the attacker and the defender has been swapped. */
            swap: function(f) { 
                var tmp = this.attacker;
                this.attacker = this.defender;
                this.defender = tmp;
                var res = f();
                tmp = this.attacker;
                this.attacker = this.defender;
                this.defender = tmp;
                return res;
            },

            /** Performs an action under the context where the attacker has been confused. */
            confused: function(f) {
                var tmp = this.defender;
                this.defender = this.attacker;
                var res = f();
                this.defender = tmp;
                return res;
            },

            getCard: function(x) { return x == this.me ? this.my_cards[this.my_current] : this.oppo_cards[this.oppo_current]; },
            getMyCard: function() { return this.getCard(this.me); },
            getOpponentCard: function() { return this.getCard(this.oppo); },
            getAttackerCard: function() { return this.getCard(this.attacker); },
            getDefenderCard: function() { return this.getCard(this.defender); },

            getEx1: function(x) { return x == this.me ? this.my_ex1 : this.oppo_ex1; },
            getMyEx1: function(x) { return this.getEx1(this.me); },
            getOpponentEx1: function(x) { return this.getEx1(this.oppo); },
            getAttackerEx1: function(x) { return this.getEx1(this.attacker); },
            getDefenderEx1: function(x) { return this.getEx1(this.defender); },
            getEx2: function(x) { return x == this.me ? this.my_ex2 : this.oppo_ex2; },
            getMyEx2: function(x) { return this.getEx2(this.me); },
            getOpponentEx2: function(x) { return this.getEx2(this.oppo); },
            getAttackerEx2: function(x) { return this.getEx2(this.attacker); },
            getDefenderEx2: function(x) { return this.getEx2(this.defender); },

            getLastCard: function(x) { 
                var res = null;
                if (x == this.me) {
                    res = this.my_cards[this.my_current];
                    if (typeof res == 'undefined')
                        res = this.my_cards[this.my_current - 1];
                } else {
                    res = this.oppo_cards[this.oppo_current];
                    if (typeof res == 'undefined')
                        res = this.oppo_cards[this.oppo_current - 1];
                }
                return res;
            },
            getMyLastCard: function() { return this.getLastCard(this.me); },
            getOpponentLastCard: function() { return this.getLastCard(this.oppo); },
            getAttackerLastCard: function() { return this.getLastCard(this.attacker); },
            getDefenderLastCard: function() { return this.getLastCard(this.defender); },

            isPartyDefeated: function(x) { return x == this.me ? this.my_current >= this.my_cards.length : this.oppo_current >= this.oppo_cards.length; },
            isMyPartyDefeated: function() { return this.isPartyDefeated(this.me); },
            isOpponentPartyDefeated: function() { return this.isPartyDefeated(this.oppo); },
            isAttackerPartyDefeated: function() { return this.isPartyDefeated(this.attacker); },
            isDefenderPartyDefeated: function() { return this.isPartyDefeated(this.defender); },

            nextCard: function(x) { if (x == this.me) this.my_current += 1; else this.oppo_current += 1; },
            nextAttackerCard: function() { this.nextCard(this.attacker); },
            nextDefenderCard: function() { this.nextCard(this.defender); },
            prevCard: function(x) { if (x == this.me) this.my_current -= 1; else this.oppo_current -= 1; },
            prevAttackerCard: function() { this.prevCard(this.attacker); },
            prevDefenderCard: function() { this.prevCard(this.defender); },

            resetMeters: function(opt) {
                if (opt == RESET_PREVIOUS) {
                    this.my_meter = this.my_prev_meter;
                    this.oppo_meter2 = prev_meter;
                } else if (opt == RESET_ZERO) {
                    this.my_meter = 0;
                    this.oppo_meter = 0;
                }
            },

            nextRound: function() {
                var g1 = this.getMyCard();
                var g2 = this.getOpponentCard();

                this.my_prev_meter = this.my_meter;
                this.oppo_prev_meter = this.oppo_meter;

                var agi1 = 0;
                var agi2 = 0;
                if (options.agibuff == 0) {
                    agi1 = Math.max(1, (g1.battle.status.agi * (1 + g1.battle.agi)));
                    agi2 = Math.max(1, (g2.battle.status.agi * (1 + g2.battle.agi)));
                } else if (options.agibuff == 1) {
                    agi1 = g1.battle.status.agi;
                    agi2 = g2.battle.status.agi;
                } else if (options.agibuff == 2) {
                    agi1 = g1.attacked ? 
                        Math.max(1, (g1.battle.status.agi * (1 + g1.battle.agi))) : 
                        g1.battle.status.agi;
                    agi2 = g2.attacked ?
                        Math.max(1, (g1.battle.status.agi * (1 + g1.battle.agi))) :
                        g2.battle.status.agi;
                }
                var rounds1 = (options.meter - this.my_meter) / agi1;
                var rounds2 = (options.meter - this.oppo_meter) / agi2;
                if (rounds1 <= rounds2) {
                    this.my_meter = 0;
                    this.oppo_meter += Math.floor(rounds1 * agi2);
                    this.setAttacker(this.me);
                } else {
                    this.my_meter += Math.floor(rounds2 * agi1);
                    this.oppo_meter = 0;
                    this.setAttacker(this.oppo);
                }
            }
        };

    };
    // ========== End of mkData ==========

    var applyBuff = function(r, d, g1, g2, skill) {
        /* MP of Death Predator has been consumed during attacking phase. */
        if (skill != Skill.dp) {
            if (skill.cost.mp > g1.battle.status.mp)
                return;

            g1.battle.status.mp -= skill.cost.mp;
            
            r.append(d, g1, g2, g1.name + "'s " + skill.name, MSG_BUFF);
        }

        var buff = skill.buff.versus(g1, g2);

        g1.battle.atk += buff.atk;
        g1.battle.def += buff.def;
        g1.battle.agi += buff.agi;
        g1.battle.wis += buff.wis;
        /* Disable debuffs if g2 is protected by Resistant. */
        if (!g2.battle.resistant_effective) {
            g2.battle.atk += buff.datk;
            g2.battle.def += buff.ddef;
            g2.battle.agi += buff.dagi;
            g2.battle.wis += buff.dwis;
        }

        var msgs = new Array();
        if (buff.atk != 0)
            msgs.push(g1.name + "'s ATK " + (buff.atk > 0 ? "increased" : "lowered") + " by " + Math.abs(Math.floor(g1.battle.status.atk * buff.atk)));
        if (buff.datk < 0 && !g2.battle.resistant_effective)
            msgs.push(g2.name + "'s ATK lowered by " + Math.abs(Math.floor(g2.battle.status.atk * buff.datk)));
        if (buff.def != 0)
            msgs.push(g1.name + "'s DEF " + (buff.def > 0 ? "increased" : "lowered") + " by " + Math.abs(Math.floor(g1.battle.status.def * buff.def)));
        if (buff.ddef < 0 && !g2.battle.resistant_effective)
            msgs.push(g2.name + "'s DEF lowered by " + Math.abs(Math.floor(g2.battle.status.def * buff.ddef)));
        if (buff.agi != 0)
            msgs.push(g1.name + "'s AGI " + (buff.agi > 0 ? "increased" : "lowered") + " by " + Math.abs(Math.floor(g1.battle.status.agi * buff.agi)));
        if (buff.dagi < 0 && !g2.battle.resistant_effective)
            msgs.push(g2.name + "'s AGI lowered by " + Math.abs(Math.floor(g2.battle.status.agi * buff.dagi)));
        if (buff.wis != 0)
            msgs.push(g1.name + "'s WIS " + (buff.wis > 0 ? "increased" : "lowered") + " by " + Math.abs(Math.floor(g1.battle.status.wis * buff.wis)));
        if (buff.dwis < 0 && !g2.battle.resistant_effective)
            msgs.push(g2.name + "'s WIS lowered by " + Math.abs(Math.floor(g2.battle.status.wis * buff.dwis)));

        var msg = msgs.join("\n");
        if (msg.length > 0)
            r.append(d, g1, g2, msg, MSG_BUFF);
    };

    var applyBuffs = function(r, d, g1, g2) {
        /* Do nothing if the buff/debuff skills of g1 have been applied. */
        if (g1.battle.buffed)
            return;
        g1.battle.buffed = true;

        List.iter(function(skill) {
            if (skill.isBuff())
                applyBuff(r, d, g1, g2, skill);
        }, g1.getSkills());
    };
    
    var applyHeal = function(r, d, g1, g2) {
        if (g1.battle.status.mp < Skill.heal.cost.mp)
            return;

        g1.battle.status.mp -= Skill.heal.cost.mp;
        g1.battle.status.hp += Math.floor(g1.status.hp * HEAL_MULT);
        g1.battle.status.hp = Math.min(g1.battle.status.hp, g1.status.hp);
        r.append(d, g1, g2, g1.name + "'s " + Skill.heal.name, MSG_OTHER);
    };

    var applyGreaterHeal = function(r, d, g1, g2) {
        if (g1.battle.status.mp < Skill.majorheal.cost.mp)
            return;

        g1.battle.status.mp -= Skill.majorheal.cost.mp;
        g1.battle.status.hp += Math.floor(g1.status.hp * MAJORHEAL_MULT);
        g1.battle.status.hp = Math.min(g1.battle.status.hp, g1.status.hp);
        r.append(d, g1, g2, g1.name + "'s " + Skill.majorheal.name, MSG_OTHER);
    };

    var applyLifeDrain = function(r, d, g1, g2) {
        if (g1.battle.status.mp < Skill.life.cost.mp)
            return;

        g1.batle.status.mp -= Skill.life.cost.mp;
        r.append(d, g1, g2, g1.name + "'s " + Skill.life.name, MSG_OTHER);

        var damage = Math.max(1, Math.floor(g1.battle.status.atk - g2.battle.status.def / 2));
        damage = Math.min(g2.battle.status.hp, damage);
        g2.battle.status.hp -= damage;
        r.append(d, g1, g2, damage + " damage to " + g2.name, MSG_OTHER);
    
        var absorbed = Math.max(1, Math.floor(damage * 0.6));
        g1.battle.status.hp += absorbed;
        g1.battle.status.hp = Math.min(g1.battle.status.hp, g1.status.hp);        
        r.append(d, g1, g2, "Absorbed " + absorbed + " HP", MSG_OTHER);
    };

    var applyManaDrain = function(r, d, g1, g2) {
        if (g1.battle.status.mp < Skill.mana.cost.mp)
            return;

        g1.batle.status.mp -= Skill.mana.cost.mp;
        r.append(d, g1, g2, g1.name + "'s " + Skill.mana.name, MSG_OTHER);

        var damage = Math.max(1, Math.floor(g1.battle.status.wis - g2.battle.status.wis / 2));
        damage = Math.min(g2.battle.status.mp, damage);
        g2.battle.status.mp -= damage;
        r.append(d, g1, g2, damage + " damage to " + g2.name, MSG_OTHER);
        
        /* MP absorbed = MP Damage * 0.6 */
        var absorbed = Math.max(1, Math.floor(damage * 0.6));
        g1.battle.status.mp += absorbed;
        g1.battle.status.mp = Math.min(g1.battle.status.mp, g1.status.mp);
        r.append(d, g1, g2, "Absorbed " + absorbed + " MP", MSG_OTHER);
    };

    var getDeathRate = function(aw, skill, buf, attr, dw, debuf) {
        return 1 - (((dw * (1 + debuf)) / 2) / (aw * (1 + skill + buf) * attr));
    };

    var applyDeath = function(r, d, g1, g2, skill) {
        r.append(d, g1, g2, g1.name + "'s " + skill.name, MSG_ATTACK);

        var atk = g1.battle.status.wis;
        var sk = Calculator.skill_mult[skill.level - 1];
        var buff1 = g1.battle.wis;
        var attr = skill.attribute.isCriticalTo(g2.attribute) ? 1.15 : (skill.attribute.isBlockedBy(g2.attribute) ? 0.85 : 1);
        var def = g2.battle.status.wis;
        var buff2 = g2.battle.wis;
        var rate = getDeathRate(atk, sk, buff1, attr, def, buff2);

        /* Apply EX2 buff. */
        var ex2 = d.getAttackerEx2();
        var exskill = ex2 == null ? null : ex2.getSkill();
        if (exskill != null && exskill.scs(skill))
            rate += exskill.sucup;

        if (Math.random() < rate) {
            g1.battle.status.mp -= skill.cost.mp;
            g2.battle.status.hp = 0;
            r.append(d, g1, g2, g2.name + " dies instantly", MSG_OTHER);
        } else {
            r.append(d, g1, g2, g2.name + " defies " + skill.name, MSG_OTHER);
        }
    };

    var applyQS = function(r, d, g1, g2) {
        /* Only apply QS at the first appearance. */
        if (g1.battle.appeared)
            return false;
        g1.battle.appeared = true;

        if (!g1.hasSkill(Skill.qs))
            return false;

        var qskill = doAttack(r, d, g1, g2, Skill.qs);

        if (qskill) {
            /* Reset ATB bars after a QS-kill. */
            d.resetMeters(options.qs_reset);
        }

        return qskill;
    };

    var applyFB = function(r, d, g1, g2) {
        if (g1.battle.fb && g1.battle.status.mp >= Skill.fb.cost.mp) {
            g1.battle.status.mp -= Skill.fb.cost.mp;
            g1.battle.fb = false;
            g1.battle.protect = true;
            r.append(d, g1, g2, g1.name + "'s " + Skill.fb.name, MSG_OTHER);
            r.append(d, g1, g2, g1.name + "'s resistences increase", MSG_OTHER);
        }
    };

    var applyMR = function(r, d, g1, g2) {
        var res = false;
        if (g1.battle.mr && g1.battle.status.mp >= Skill.mr.cost.mp) {
            g1.battle.mr = false;
            g1.battle.status.mp -= Skill.mr.cost.mp;
            r.append(d, g1, g2, g1.name + "'s " + Skill.mr.name, MSG_OTHER);
            if (Math.random() < options[d.attacker].mr && !g2.battle.resistant_effective) {
                r.append(d, g1, g2, g2.name + " is confused", MSG_OTHER);
                g2.battle.confused = true;
                res = true;

                /* Disable SD, DS, MR, and DR if g2 is confused. */
                g2.battle.sd = false;
                g2.battle.ds = false;
                g2.battle.mr = false;
                g2.battle.dr = false;
            } else
                r.append(d, g1, g2, g2.name + " is unaffected", MSG_OTHER);
        }
        return res;
    };

    var applyLS = function(r, d, g1, g2) {
        if (g1.battle.paralyzed > 0)
            return false;

        var res = false;
        if (g1.battle.ls && g1.battle.status.mp > 0) {
            g1.battle.ls = false;

            var rate = options[d.attacker].ls;
            /* Apply EX2 buff. */
            var ex2 = d.getAttackerEx2();
            var exskill = ex2 == null ? null : ex2.getSkill();
            if (exskill != null && exskill.scs(Skill.ls))
                rate += exskill.sucup;

            if (Math.random() < rate) {
                g1.battle.status.hp = 1;
                g1.battle.status.mp = 0;
                r.append(d, g1, g2, g1.name + "'s " + Skill.ls.name, MSG_OTHER);
                r.append(d, g1, g2, g1.name + " endures", MSG_OTHER);
                res = true;
            }
        }

        return res;
    };

    var applySD = function(r, d, g1, g2) {
        var res = false;

        if (g1.battle.sd && g1.battle.status.mp > 0) {
            g1.battle.sd = false;
            r.append(d, g1, g2, g1.name + "'s " + Skill.sd.name, MSG_SD);

            var rate = options[d.attacker].sd;
            /* Apply EX2 buff. */
            var ex2 = d.getAttackerEx2();
            var exskill = ex2 == null ? null : ex2.getSkill();
            if (exskill != null && exskill.scs(Skill.sd))
                rate += exskill.sucup;

            if (Math.random() < rate) {
                var damage = g1.battle.status.mp;
                g2.battle.status.hp -= damage;
                g1.battle.status.hp = 0;
                g1.battle.status.mp = 0;
                r.append(d, g1, g2, damage + " damage to " + g2.name, MSG_DAMAGE);
                res = true;
            } else {
                r.append(d, g1, g2, g1.name + "'s " + Skill.sd.name + " fails", MSG_OTHER);
            }
        }

        return res;
    };

    var applySap = function(r, d, g1, g2) {
        var res = false;
        if (g1.battle.sap && Skill.sap.cost.mp <= g1.battle.status.mp) {
            g1.battle.sap = false;
            r.append(d, g1, g2, g1.name + "'s " + Skill.sap.name, MSG_BUFF);
            if (Math.random() < options[d.attacker].sap && !g2.battle.resistant_effective) {
                g1.battle.status.mp -= Skill.sap.cost.mp;
                g2.battle.status.mp = 0;
                r.append(d, g1, g2, g2.name + " is sapped", MSG_BUFF);
                res = true;
            } else
                r.append(d, g1, g2, g2.name + " is unaffected", MSG_BUFF);
        }
        return res;
    };

    var applyEP = function(r, d, g1, g2) {
        var res = false;
        if (g1.battle.ep && Skill.ep.cost.mp <= g1.battle.status.mp && 
            (g2.battle.atk > 0 || g2.battle.def > 0 || g2.battle.agi > 0 || g2.battle.wis > 0)) {
            g1.battle.ep = false;
            r.append(d, g1, g2, g1.name + "'s " + Skill.ep.name, MSG_BUFF);
            if (!g2.battle.resistant_effective) {
                g1.battle.status.mp -= Skill.ep.cost.mp;
                g2.battle.atk = Math.min(0, g2.battle.atk);
                g2.battle.def = Math.min(0, g2.battle.def);
                g2.battle.agi = Math.min(0, g2.battle.agi);
                g2.battle.wis = Math.min(0, g2.battle.wis);
                r.append(d, g1, g2, g2.name + "'s enhancements fade.", MSG_BUFF);
                res = true;
            } else
                r.append(d, g1, g2, g2.name + " is unaffected", MSG_BUFF);
        }
        return res;
    };

    var applyDS = function(r, d, g1, g2) {
        if (g1.battle.paralyzed > 0)
            return false;

        var rate = options[d.attacker].ds;
        /* Apply EX2 buff. */
        var ex2 = d.getAttackerEx2();
        var exskill = ex2 == null ? null : ex2.getSkill();
        if (exskill != null && exskill.scs(Skill.ds))
            rate += exskill.sucup;

        if (g1.battle.ds && Skill.ds.cost.mp <= g1.battle.status.mp && Math.random() < rate) {
            g1.battle.status.mp -= Skill.ds.cost.mp;
            r.append(d, g1, g2, g1.name + " evades the attack.", MSG_DS);
            return true;
        } else
            return false;
    };

    var applySDS = function(r, d, g1, g2) {
        if (g1.battle.paralyzed > 0)
            return false;

        if (g1.battle.sds && Skill.sds.cost.mp <= g1.battle.status.mp) {
            g1.battle.status.mp -= Skill.sds.cost.mp;
            r.append(d, g1, g2, g1.name + " evades the attack.", MSG_DS);
            return true;
        } else
            return false;
    };

    var applyRevival = function(r, d, g1, g2) {
        if (g1.battle.paralyzed > 0)
            return false;

        var res = false
        
        if (g1.battle.revival) {
            g1.battle.revival = false;

            var rate = options[d.attacker].revival;
            /* Apply EX2 buff. */
            var ex2 = d.getAttackerEx2();
            var exskill = ex2 == null ? null : ex2.getSkill();
            if (exskill != null && exskill.scs(Skill.revival))
                rate += exskill.sucup;

            if (Skill.revival.cost.mp <= g1.battle.status.mp && Math.random() < rate) {
                g1.battle.status.mp -= Skill.revival.cost.mp;
                g1.battle.status.hp = g1.status.hp;

                /* Make this card appear next time as the first appearance. */
                g1.battle.first = true;
                
                r.append(d, g1, g2, g1.name + "'s " + Skill.revival.name, MSG_OTHER);
                r.append(d, g1, g2, g1.name + " came back to life", MSG_REVIVAL);
                res = true;
            } else
                r.append(d, g1, g2, g1.name + " failed to revive", MSG_OTHER);
        }

        return res;
    };

    var applyDR = function(r, d, g1, g2, damage) {
        if (g1.battle.paralyzed > 0)
            return;

        if (g1.battle.dr && damage > 0 && g1.battle.status.mp >= Skill.dr.cost.mp) {
            g1.battle.status.mp -= Skill.dr.cost.mp;
            r.append(d, g1, g2, g1.name + "'s " + Skill.dr.name, MSG_ATTACK);
            damage = Math.floor(damage * 1.2);
            g2.battle.status.hp -= damage;
            r.append(d, g1, g2, damage + " damage to " + g2.name, MSG_DAMAGE);
            if (doAttack(r, d, g1, g2, Skill.dr))
                d.resetMeters(options.dr_reset);
        }
    };

    var applyCurse = function (r, d, g1, g2, damage) {
        var res = false;

        if (g1.battle.curse) {
            g1.battle.curse = false;

            r.append(d, g1, g2, g1.name + "'s " + Skill.curse.name, MSG_OTHER);

            if (!g2.battle.resistant_effective) {
                var mult = 1;
                /* Apply EX2 buff. */
                var ex2 = d.getAttackerEx2();
                var exskill = ex2 == null ? null : ex2.getSkill();
                if (exskill != null && exskill.pcs(Skill.curse))
                    mult = (1 + exskill.powup);
                
                var damage = Math.max(1, Math.floor(0.15 * g2.status.mp * mult));
                g2.battle.status.mp -= Math.min(g2.battle.status.mp, damage);
                r.append(d, g1, g2, g2.name + "'s MP reduced by " + damage, MSG_OTHER);
                res = true;
            } else
                r.append(d, g1, g2, g2.name + " is unaffected", MSG_OTHER);
        }

        return res;
    };

    var applyNervePinch = function (r, d, g1, g2, damage) {
        var res = false;

        if (g1.battle.np) {
            g1.battle.np = false;

            var rate = options[d.attacker].np;
            if (Skill.np.cost.mp <= g1.battle.status.mp) {
                g1.battle.status.mp -= Skill.np.cost.mp;
                
                if (Math.random() < rate && !g2.battle.resistant_effective) {
                    g2.battle.paralyzed = 1;
                    r.append(d, g1, g2, g1.name + "'s " + Skill.np.name, MSG_OTHER);
                    r.append(d, g1, g2, g2.name + " is paralyzed", MSG_OTHER);
                    res = true;
                } else
                    r.append(d, g1, g2, g2.name + " is unaffected", MSG_OTHER);
            }
        }

        return res;
    };

    var applyResistant = function (r, d, g1, g2, damage) {
        var res = false;

        if (g1.battle.resistant) {
            g1.battle.resistant = false;

            if (Skill.resistant.cost.mp <= g1.battle.status.mp) {
                g1.battle.status.mp -= Skill.resistant.cost.mp;
                g1.battle.resistant_effective = true;
                
                g1.battle.resistant_effective = true;
                r.append(d, g1, g2, g1.name + "'s " + Skill.resistant.name, MSG_OTHER);
                res = true;
            }
        }
        
        return res;
    };

    var getSkillDamage = function(d, g1, g2, skill) {
        var atk = 0;
        var sk = 0;
        var buff1 = 0;
        var def = 0;
        var buff2 = 0;
        var damage = 0;

        var mpcost = skill == null ? 0 : skill.cost.mp;
        var hpcost = skill == null ? 0 : skill.cost.hp;
        var ex2 = d.getAttackerEx2();
        if (ex2 != null && ex2.getSkill().costdec(skill)) {
            mpcost -= ex2.getSkill().mpdec;
            hpcost -= ex2.getSkill().hpdec;
        }

        if (skill == null) {
            atk = g1.battle.status.atk;
            sk = 0;
            buff1 = g1.battle.atk;
            attr = 1;
            def = g2.battle.status.def;
            buff2 = g2.battle.def;
            damage = Math.max(1, Calculator.getDamage(atk, sk, buff1, attr, def, buff2));
        } else if (skill == Skill.qs && mpcost <= g1.battle.status.mp) {
            atk = g1.battle.status.atk;
            sk = -0.15;
            buff1 = 0;

            /* Apply EX2 buff. */
            if (ex2 != null && ex2.getSkill().pcs(Skill.qs))
                buff1 += ex2.getSkill().powup;

            attr = 1;
            def = g2.battle.status.def;
            buff2 = g2.battle.def;
            damage = Math.max(1, Calculator.getDamage(atk, sk, buff1, attr, def, buff2));
        } else if (skill == Skill.gs && mpcost <= g1.battle.status.mp) {
            atk = g1.battle.status.atk;

            var rate = options[d.attacker].gs;
            /* Apply EX2 buff. */
            if (ex2 != null && ex2.getSkill().scs(skill))
                rate += ex2.getSkill().sucup;

            if (Math.random() < rate)
                sk = 1;
            else
                sk = -0.5;
            buff1 = g1.battle.atk;
            def = g2.battle.status.def;
            buff2 = -1;
            attr = 1;
            damage = Math.max(1, Calculator.getDamage(atk, sk, buff1, attr, def, buff2));
        } else if (skill == Skill.bg && hpcost < g1.battle.status.hp) {
            atk = g1.battle.status.atk;
            sk = Calculator.skill_mult[skill.level - 1];
            buff1 = g1.battle.atk;
            attr = 1;
            def = g2.battle.status.def;
            buff2 = g2.battle.def;
            damage = Math.max(1, Calculator.getDamage(atk, sk, buff1, attr, def, buff2));
        } else if (skill == Skill.cd && mpcost <= g1.battle.status.mp) {
            atk = g1.battle.status.atk;
            sk = Calculator.skill_mult[skill.level - 1];
            buff1 = g1.battle.atk;
            attr = 1;
            def = g2.battle.status.def;
            buff2 = g2.battle.def;
            damage = Math.max(1, Calculator.getDamage(atk, sk, buff1, attr, def, buff2));
        } else if (skill.isPhysical() && skill != Skill.gs && skill != Skill.bg && skill != Skill.cd && mpcost <= g1.battle.status.mp) {
            atk = g1.battle.status.atk;
            sk = Calculator.skill_mult[skill.level - 1];
            buff1 = g1.battle.atk;
            attr = 1;
            def = g2.battle.status.def;
            buff2 = g2.battle.def;
            damage = Math.max(1, Calculator.getDamage(atk, sk, buff1, attr, def, buff2));
        } else if (skill.isElemental() && mpcost <= g1.battle.status.mp) {
            atk = g1.battle.status.wis;
            sk = Calculator.skill_mult[skill.level - 1];
            buff1 = g1.battle.wis;
            attr = g2.battle.protect ? 0.85 : (skill.attribute.isCriticalTo(g2.attribute) ? 1.15 : (skill.attribute.isBlockedBy(g2.attribute) ? 0.85 : 1));
            def = g2.battle.status.wis;
            buff2 = g2.battle.wis;
            damage = Math.max(1, Calculator.getDamage(atk, sk, buff1, attr, def, buff2));
        }

        return damage;
    };

    var getBestSkill = function(d, g1, g2) {
        /* Always use normal attack if the opponent casted LS. */
        if (g2.battle.status.hp == 1)
            return null;

        if (g1.hasSkill(Skill.gs) && g1.battle.status.mp >= Skill.gs.cost.mp)
            return Skill.gs;

        var res = null;
        var damage = getSkillDamage(d, g1, g2, null);

        var sks = g1.getSkills();
        for (var i = 0; i < sks.length; i++) {
            /* Ignore QS in attacking phase. */
            if (sks[i] == Skill.qs)
                continue;
            var dmg = getSkillDamage(d, g1, g2, sks[i]);
            if (dmg >= g2.battle.status.hp) {
                damage = dmg;
                res = sks[i];
                break;
            }
            if (dmg > damage) {
                damage = dmg;
                res = sks[i];
            }
        }
        
        if (damage < g2.battle.status.hp) {
            if (g1.battle.status.hp < g1.status.hp) {
                /* Do not over-healing. */
                if (g1.hasSkill(Skill.majorheal) && g1.battle.status.mp >= Skill.majorheal.cost.mp && g1.battle.status.hp <= g1.status.hp * MAJORHEAL_APPLY_MULT)
                    return Skill.majorheal;
                else if (g1.hasSkill(Skill.heal) && g1.battle.status.mp >= Skill.heal.cost.mp && g1.battle.status.hp <= g1.status.hp * HEAL_APPLY_MULT)
                    return Skill.heal;
            }
            
            if (g1.hasSkill(Skill.mana) && g1.battle.status.mp < g1.status.mp && g2.battle.status.mp > 0 && g1.battle.status.mp >= Skill.mana.cost.mp)
                return Skill.mana;
            
            if (g1.hasSkill(Skill.life) && g1.battle.status.hp < g1.status.hp && g1.battle.status.mp >= Skill.life.cost.mp)
                return Skill.life;
        }
        
        return res;
    };

    var doAttack = function(r, d, g1, g2, skill) {
        var damage = 0;
        var killed = false;

        if (typeof skill == 'undefined')
            skill = getBestSkill(d, g1, g2);

        /* Apply some special skills. */
        if (skill == Skill.heal)
            applyHeal(r, d, g1, g2);
        else if (skill == Skill.majorheal)
            applyGreaterHeal(r, d, g1, g2);
        else if (skill == Skill.life)
            applyLifeDrain(r, d, g1, g2);
        else if (skill == Skill.mana)
            applyManaDrain(r, d, g1, g2);
        else if (skill != null && skill.isDeath())
            applyDeath(r, d, g1, g2, skill);
        else if ((damage = getSkillDamage(d, g1, g2, skill)) > 0) {
            var name = skill == null ? "Normal Attack" : skill.name;

            /* Consume MP. */
            if (skill != null) {
                var mpcost = skill.cost.mp;
                var hpcost = skill.cost.hp;
                var ex2 = d.getAttackerEx2();
                if (ex2 != null && ex2.getSkill().costdec(skill)) {
                    mpcost -= ex2.getSkill().mpdec;
                    hpcost -= ex2.getSkill().hpdec;
                }
                g1.battle.status.mp -= mpcost;
                g1.battle.status.hp -= hpcost;
            }

            r.append(d, g1, g2, g1.name + "'s " + name, skill == Skill.qs ? MSG_QS : MSG_ATTACK);

            /* A physical attack is evaded. */
            if ((skill == null || skill.isPhysical() && skill != Skill.gs && skill != Skill.bg && skill != Skill.cd) && 
                (d.swap(function() { return applyDS(r, d, g2, g1); }) || d.swap(function() { return applySDS(r, d, g2, g1); })))
                return;

            g2.battle.status.hp -= damage;

            if (skill == Skill.gs) {
                if (damage <= g1.battle.status.atk)
                    r.append(d, g1, g2, "Glancing blow", MSG_OTHER);
                else
                    r.append(d, g1, g2, "Critical hit!", MSG_OTHER);
            }

            r.append(d, g1, g2, damage + " damage to " + g2.name, MSG_DAMAGE);

            /* Apply the additional effect caused by Hard Slash. */
            if (skill != null && skill.id == Skill.slash2.id) {
                g2.battle.agi -= 0.1;
                r.append(d, g1, g2, "AGI reduced by " + Math.floor(g2.battle.status.agi * 0.1), MSG_BUFF);
            }
            
            /* Apply the additional effect caused by Heavy Blow. */
            if (skill != null && skill.id == Skill.physical2.id) {
                g2.battle.def -= 0.1;
                r.append(d, g1, g2, "DEF reduced by " + Math.floor(g2.battle.status.def * 0.1), MSG_BUFF);
            }

            /* Apply the additional effect caused by Lifeleech. */
            if (skill == Skill.cd) {
                var absorbed = Math.floor(damage * 0.9);
                g1.battle.status.hp += absorbed;
                g1.battle.status.hp = Math.min(g1.status.hp, g1.battle.status.hp);
                r.append(d, g1, g2, absorbed + " HP absorbed", MSG_BUFF);
            }

            /* Apply the additional effect caused by Reaper's Luck (Death Predator). */
            if (g2.battle.status.hp <= 0 && skill == Skill.dp) {
                applyBuff(r, d, g1, g2, skill);
            }
        }

        if (g2.battle.status.hp > 0 && skill != Skill.dr) {
            d.swap(function() { applyDR(r, d, g2, g1, damage); });
        } else if (g2.battle.status.hp <= 0 && !d.swap(function() { return applyLS(r, d, g2, g1); })) {
            killed = true;
            d.nextDefenderCard();

            /* Perform SD if the attacker is different from the defender. */
            if (g1 != g2 && d.swap(function() { return applySD(r, d, g2, g1); })) {
                if (g1.battle.status.hp <= 0)
                    d.nextAttackerCard();
            } else {
                if (d.swap(function() { return applyRevival(r, d, g2, g1); }))
                    d.prevDefenderCard();
                else if (!d.swap(function() { return applyCurse(r, d, g2, g1); }) &&
                         !d.swap(function() { return applyNervePinch(r, d, g2, g1); }))
                    r.append(d, g1, g2, "Defeated " + g2.name, MSG_DEFEATED);
            }
        }

        return killed;
    };

    // ========== Start of battle ==========
    this.battle = function() {
        var r = mkRes();
        var d = mkData();

        var count = 0;
        while(true) {
            d.setAttacker(d.me);
            if (d.isOpponentPartyDefeated()) {
                r.append(d, d.getMyLastCard(), d.getOpponentLastCard(), "Won Battle", MSG_OTHER);
                r.win = true;
                break;
            } else if (d.isMyPartyDefeated()) {
                r.append(d, d.getMyLastCard(), d.getOpponentLastCard(), "Lost Battle", MSG_OTHER);
                r.win = false;
                break;
            } 

            d.nextRound();

            var attacker = d.getAttackerCard();
            var defender = d.getDefenderCard();

            if (attacker.battle.paralyzed > 0) {
                r.append(d, attacker, defender, attacker.name + " is unable to act.");
                attacker.battle.paralyzed -= 1;
                continue;
            }

            /* The attacker may be defeated by the defender with Deadly Reflex. */
            if (applyQS(r, d, attacker, defender) || attacker.battle.status.hp <= 0) continue;
            if (d.swap(function() { return applyQS(r, d, defender, attacker); }) || defender.battle.status.hp <= 0) continue;

            applyResistant(r, d, attacker, defender);
            if (defender.battle.paralyzed == 0)
                d.swap(function() { applyResistant(r, d, defender, attacker); });

            applyBuffs(r, d, attacker, defender);
            if (defender.battle.paralyzed == 0)
                d.swap(function() { applyBuffs(r, d, defender, attacker); });

            applyFB(r, d, attacker, defender);
            if (defender.battle.paralyzed == 0)
                d.swap(function() { applyFB(r, d, defender, attacker); });

            applySap(r, d, attacker, defender);
            applyEP(r, d, attacker, defender);;

            if (attacker.hasSkill(Skill.transposition) && defender.battle.status.mp == 0) {
                r.append(d, attacker, defender, attacker.name + "'s " + Skill.transposition.name, MSG_OTHER);
                /* TODO: Messages missing */
                r.append(d, attacker, defender, "Defeated " + defender.name, MSG_DEFEATED);
                d.nextDefenderCard();
                d.resetMeters(options.transposition_reset);
                continue;
            }
            if (defender.battle.paralyzed == 0 && defender.hasSkill(Skill.transposition) && attacker.battle.status.mp == 0) {
                r.append(d, defender, attacker, defender.name + "'s " + Skill.transposition.name, MSG_OTHER);
                /* TODO: Messages missing */
                r.append(d, defender, attacker, "Defeated " + attacker.name, MSG_DEFEATED);
                d.nextAttackerCard();
                d.resetMeters(options.transposition_reset);
                continue;
            }

            if (defender.battle.paralyzed == 0) {
                d.swap(function() { applySap(r, d, defender, attacker); });
                d.swap(function() { applyEP(r, d, defender, attacker); });
            }

            applyMR(r, d, attacker, defender);
            if (defender.battle.paralyzed == 0)
                d.swap(function() { applyMR(r, d, defender, attacker); });

            if (attacker.battle.confused && Math.random() < options[d.attacker].mr2) {
                d.confused(function() { doAttack(r, d, attacker, attacker); });
            } else
                doAttack(r, d, attacker, defender);
        }

        return r;
    };
    // ========== End of battle ==========  
};