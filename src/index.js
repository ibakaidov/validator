/*

var Validator = require('./validator');

var required = Validator.required();
var validAge = Validator.range(1, 100);
var validColor = Validator.oneOf(['blue', 'black', 'green', 'orange', 'red', 'yellow', 'green']);

var validation = {
    name: {
        firstName: required,
        lastName: required
    },
    age: [required, validAge],
    favoriteColor: validColor
};

var v = new Validator(validation);

v({
    favoriteColor: 'purple'
});


v({
    favoriteColor: 'black'
});

v({
    name: {
        firstName: 'dave'
    },
    favoriteColor: 'black'
});

v({ 
    name: {
        firstName: 'dave',
        lastName: 'evad'
    }
});

v({ 
    name: {
        firstName: 'dave',
        lastName: 'evad'
    },
    age: 50
});

*/


// gives back a function to validate
function Validator(validation) {
    return function(data, stopOnFail) {
        var errors = Validator.validate(data, validation, stopOnFail);

        return errors;  
    };
}

// converts shorthand rules into functional rules
// Validator.getRules = function(validation) {
//     if (typeof validation === 'function') return [validation];

//     if (Array.isArray(validation)) {
//         var rules = [];
        
//         validation.forEach(function(val) {
//             var indexRules = Validator.getRules(val);
            
//             rules = rules.concat(indexRules);
//         });
        
//         return rules;
//     }
    
//     if (typeof validation === 'object' && !Array.isArray(validation)) {
//         var child = {};
        
//         for (var property in validation) {
//             child[property] = Validator.getRules(validation[property]);
//         }
        
//         return child;
//     }
// };

// main data processor
Validator.validate = function(data, validation, stopOnFail) {
    var errors = {};
    
    // do this so that we can still validate subobjects
    if (typeof data === 'undefined') data = {};
    
    //console.log('validateObject', data, validation);

    for (var property in validation) {
        var value = data[property];
        var rule = validation[property];
        
        // sub objects
        if (typeof rule === 'object' && !Array.isArray(rule)) {
            // console.log(property + ' is a subobject');
            
            var subvalidation = Validator.validate(value, rule, stopOnFail);
            
            if (typeof subvalidation !== 'undefined') {
                errors[property] = subvalidation;

                console.log('errors[property]', property, errors[property]);
                
                //TODO not working
                if (errors[property].length && stopOnFail) {
                    console.log('should be returning');
                    
                    return errors;
                }
            }
        }
        
        // single validation rule - just convert it to an array and process it below
        if (typeof rule === 'function') {
            rule = [rule];
        }

        // process actual validation rules
        if (Array.isArray(rule)) {
            for (var i=0; i<rule.length; i++) {
                var r = rule[i];
                
                // console.log('testing', property, r.name, value);
                
                var passed = r(value);
                
                if (!passed) {
                    errors[property] = errors[property] || [];
                    
                    errors[property].push(r.name);
                    
                    if (stopOnFail) return errors;
                }
            }
        }
    }
    
    return Object.keys(errors).length !== 0 ? errors : undefined;
};

// validation rules

Validator.required = function() {
    return function required(value) {
        //TODO make this better; accomodate for strings and number
        return typeof value !== 'undefined';
    };
};

Validator.number = function() {
    return function isNumber(value) {
        if (typeof value === 'undefined') return true;

        return !isNaN(value);
    };
};

Validator.range = function(lower, upper) {
    return function range(value) {
        if (typeof value === 'undefined') return true;
        
        return value >= lower && value <= upper;
    };
};

Validator.oneOf = function(options) {
    return function oneOf(value) {
        if (typeof value === 'undefined') return true;

        return options.indexOf(value) !== -1;
    };
};

Validator.regexMatch = function(regex) {
    return function regexMatch(value) {
        if (typeof value === 'undefined') return true;

        return true;
    };
};

module.exports = Validator;