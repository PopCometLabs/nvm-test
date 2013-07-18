var async = require('async');

var fs = require('fs'),
    util = require('util'),
    child = require('child_process');

var max_node = '0.10';


fs.readFile('package.json', function (err, data) {
    var package = JSON.parse(data.toString());

    var engines = package.engines && package.engines.node;
    if (! engines) {
        return;
    }

    // we either do a range or a list of specific versions
    //
    // in the case of range, iterate from start to end (or max node
    // version 0.10)
    //
    // in the case of versions, run on each one
    var start, end = max_node, doingRange = false, versions = [];

    engines.split(' ').forEach(function (engine) {
        if (engine[0] === '>') {
            start = engine.slice(2);
            doingRange = true;
        } else if (engine[0] === '<') {
            end = engine.slice(2);
        } else {
            versions.push(engine);
        }
    });

    async.eachLimit(doingRange ? [ start, end ] : versions, 1, function (each, callback) {
        console.log('--> testing', each);
        child.exec('echo "source ~/.nvm/nvm.sh && nvm use ' + each + ' && npm test" | bash', function (err, stdout, stderr) {
            if (err) {
                console.log(stderr);
            }

            console.log(stdout);
            callback(err);
        });
    }, function (err) {
        if (err) {
            console.log(err);
        }
    });
});

