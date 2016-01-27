var Util = {};

Util.comma = d3.format(',.1f');
Util.monetize = d3.format('$,f');
Util.percentize = d3.format('.1%');

// assigns an ID attribute to each object in an array of objects
Util.assignId = function(array) {
	for (var i = 0; i < array.length; i++) array[i].id = i;
};

// converts a number from a string format to a float format
Util.strToFloat = function(str) {
	if (typeof str !== 'string') return str;
	return parseFloat(str.replace(/[^\d\.\-]/g, ""));
};

// get unique elements in an array
Util.getUnique = function(array) {
	var results = [];
	for (var i = 0; i < array.length; i++) {
		if (results.indexOf(array[i]) === -1) results.push(array[i]);
	}
	return results;
};
