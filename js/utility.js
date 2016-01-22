var Util = {};

Util.comma = d3.format(',f');
Util.decimalize = d3.format('.2f');
Util.decimalizeOne = d3.format('.1f');
Util.percentize = d3.format('%'); // divides by 100 and adds a percentage symbol
Util.percentizeDecOne = d3.format('.1%');
Util.percentizeDec = d3.format('.2%');

// converts a number in string format into a float
Util.strToFloat = function(str) {
	if (typeof str !== 'string') return str;
	return parseFloat(str.replace(/[^\d\.\-]/g, ""));
};

// create an array based on start number, end number, and step
Util.createArray = function(startNum, endNum, step) {
	if (typeof step === 'undefined') var step = 1;
	var array = [];
	for (var i = startNum; i <= endNum; i += step) array.push(i);
	return array;
};