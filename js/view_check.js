
var endl = "<br/>\n";

function out(msg) {
    $("#log").append(msg);
}

function pass(msg) {
    return "<font color='green'>" + msg + "<font>";
}

function fail(msg) {
    return "<font color='red'>" + msg + "<font>";
}

function isPosInt(n) {
    return /^[0-9]+$/.test(String(n));
}

function checkCardStats() {
    out("Checking card stats: ");
    var passed = true;
    Card.iter(function(card) {
        var fields = ["hp", "mp", "atk", "def", "agi", "wis"];
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (!isPosInt(card[field])) {
                out(endl + fail(card.name + "'s " + field.toUpperCase() + " has a wrong value: " + card[field]));
                passed = false;
            }
        }
    });
    if (passed)
        out(pass("OK") + endl);
    else
        out(endl);
}

function selfCheck() {
    checkCardStats();
}