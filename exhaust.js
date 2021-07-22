const m = require('max-api');

// Global Data
let parameters = {};
let resolution = 3;
let cartProd = [];
let internalCounter = 0;

m.addHandler('dump', () => {
	m.outlet('dump', parameters);
})

m.addHandler('parameter', (name, min, max) => {
	// Create a new parameter configuration;
	let _min = min;
	let _max = max;

	if (min > max) {
		_min = max,
		_max = min
	}

	parameters[name] = {
		min: _min,
		max: _max
	};
});

m.addHandler('resolution', x => {
	// How many steps to divide each parameter range into;
	resolution = x;
});

m.addHandler('calculate', () => {
	// Calculate the cartesian products of all the parameters;
	let allParams = [];
	for (const [key, value] of Object.entries(parameters)) {
		const paramSteps = range(value.min, value.max);
		parameters[key]['steps'] = paramSteps;
		allParams.push(paramSteps)
	};
	cartProd = product(allParams);
	m.post(cartProd.length, 'parameter combinations!')
});

m.addHandler('iterate', () => {
	if (internalCounter === cartProd.length) {
		m.outlet('done')
	} else {
		// Output the current status
		m.outlet(internalCounter);
		// move to the next parameter configuration
		const chosenParams = cartProd[internalCounter];
		// now prepend the parameter names to the indices.

		chosenParams.forEach((p, idx) => {
			m.outlet(Object.keys(parameters)[idx], p)
		})
		
		internalCounter += 1;
	}
})

m.addHandler('clear', () => {
	// Clear the parameters
	parameters = {};
	cartProd = [];
});

m.addHandler('reset', () => {
	internalCounter = 0;
})

m.addHandler('set', i => {
	internalCounter = i;
})

m.addHandler('delete', parameter => {
	delete parameters[parameter];
});

// INLINE LIBRARY FOR EASE
const product = (elements) => {
	if (!Array.isArray(elements)) {
		throw new TypeError();
	}

	var end = elements.length - 1,
		result = [];

	function addTo(curr, start) {
		var first = elements[start],
			last = (start === end);

		for (var i = 0; i < first.length; ++i) {
			var copy = curr.slice();
			copy.push(first[i]);

			if (last) {
				result.push(copy);
			} else {
				addTo(copy, start + 1);
			}
		}
	}

	if (elements.length) {
		addTo([], 0);
	} else {
		result.push([]);
	}
	return result;
}

// Function for generating array from range
const range = (start, stop) => {
	// increment is calculated as divisions of the parameter range
	const increment = Math.abs(start - stop) / resolution;
	return Array.from({ length: (stop - start) / increment + 1}, (_, i) => start + (i * increment));
}
