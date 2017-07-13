// Integer count for the number of layers in the program
var count = 0;


// Dictionary for soil types
var sp = {
	'Uniform Loose Sand': [101, 118],
	'Uniform Dense Sand': [112, 130],
	'Mixed Loose Sand': [110, 124],
	'Mixed Dense Sand': [118, 135],
	'Soft Silt': [115, 135],
	'Hard/Firm Silt': [120, 140],
	'Stiff Silt': [125, 145],
	'Silty Clay': [115, 135],
	'Soft Rock': [125, 130]
};


/*
	Uses local storage (cookies) to retrieve any modified soil types the user may have used previously
	If the browser does not support local storage, the user will get an alert that the saving modified soil types will not work, but the program will function normally aside from that
*/
function initsp()
{
	if (typeof (Storage) !== "undefined")
	{
		if (!localStorage.soilTypes)
			localStorage.soilTypes = JSON.stringify(sp);
		else
			sp = JSON.parse(localStorage.soilTypes);
	}
	else
		alert("Your device does not support local storage. The program will still function normally, however, modifications to the soil types will not be accessible after the program is closed.");
}


// Checks if a textbox is empty
function isEmpty(id)
{
	return (id.length < 1);
}


/*
	Retrieves moist unit weight of soil from dictionary
	If the layer is underwater option is checked, the unit weight given is the saturated unit weight
*/
function getUnitWeight(i)
{
	var option = document.getElementById("soil" + i).value;
	var unit_weight = sp[option][0];

	if (document.getElementById("uw" + i).checked)
		unit_weight = sp[option][1] - 62.43;

	return unit_weight;
}


// Internal method for removing a div if it exists
function removeIfExists(id)
{
	if (document.contains(document.getElementById(id)))
		document.getElementById(id).remove();
}


// Prints the unit weight for a layer's soil type as the layer is modified
function outputUnitWeight(i)
{
	removeIfExists("unitweight" + i);

	if (document.getElementById("soil" + i).value == "Choose a soil type")
		return;

	var unit_weight = getUnitWeight(i);

	var newdiv = document.createElement('div');
	newdiv.innerHTML = "The unit weight of this layer is " + unit_weight + " lb/ft^3";
	newdiv.id = 'unitweight' + i;
	document.getElementById("div" + i).appendChild(newdiv);
}


// Prints the number of layers according to the user input at the beginning
function getCount()
{
	count = document.getElementById("numlayers").value;

	if (isEmpty(count))
	{
		alert("Count is empty");
		return;
	}

	printLayers();

	document.getElementById("submit").disabled = true;
}


// Retrieves the dropdown menu for soil types as the list can be modified
function getDropdown(i)
{
	var newId = "soil" + i;

	var dropdown = "<select id='" + newId + "' onchange='outputUnitWeight(" + i + ");'>";
	dropdown += "<option>Choose a soil type</option>";
	for (var key in sp)
		dropdown += "<option>" + key + "</option>";

	dropdown += "</select>";
	return dropdown;
}


// Calculates K given every layer is filled out
function calculateK()
{
	removeIfExists("kcalc");

	// These variables for factor of safety and allowable settlement can be modified if the values change
	var factor_of_safety = 2;
	var delta_L = 0.5; //Note this is in inches for half inch settlement

	// Sum of all skin frictions per layer
	var sumfs = 0;

	var diameter = document.getElementById("diam").value;
	if (isEmpty(diameter))
	{
		alert("No diameter entered.");
		return;
	}
	var perimeter = 2 * Math.PI * (diameter / 24);

	var newdiv = document.createElement('div');
	newdiv.innerHTML = "<hr>";

	for (var i = 1; i <= count; i++)
	{
		if (document.getElementById("soil" + i).value == "Choose a soil type")
		{
			alert("No soil type chosen for layer " + i);
			return;
		}

		var unit_weight = getUnitWeight(i);

		// The value for blow count should be the average value for the entire layer
		var blow_count = document.getElementById("bcnt" + i).value;

		if (isEmpty(blow_count))
		{
			alert("No blow count entered for layer " + i);
			return;
		}

		// Angle of internal friction
		var phi = (0.3 * blow_count + 27) * (Math.PI / 180);

		// Earth pressure coefficient
		var kp = (1 + Math.sin(phi)) / (1 - Math.sin(phi));

		var layer_depth = document.getElementById("layer" + i).value;
		if (isEmpty(layer_depth))
		{
			alert("No layer depth entered for layer " + i);
			return;
		}
		var depth = parseInt(layer_depth);

		var stress = unit_weight * depth;
		var skin_friction = kp * stress * Math.tan(phi * 0.75);
		var qs = skin_friction * depth * perimeter;
		var qd = qs / factor_of_safety;
		var k = Math.floor(qd) / delta_L;

		newdiv.innerHTML += "K for layer " + i + " is " + k + " lb/in<br><br>";

		sumfs += qs;
	}

	var qd = sumfs / factor_of_safety;
	var k = Math.floor(qd) / delta_L;

	newdiv.innerHTML += "K for all layers is " + k + " lb/in";
	newdiv.id = 'kcalc';
	document.getElementById("k").appendChild(newdiv);
}


// Returns the HTML for a single layer depending on what count is at
function getLayer(i)
{
	var newdiv = document.createElement('div');

	var newBc = "bcnt" + i;
	var newLa = "layer" + i;
	var newUw = "uw" + i;

	var dropdown = getDropdown(i);

	newdiv.innerHTML = "<br>Layer " + i + ": " + dropdown;
	newdiv.innerHTML += " &emsp; <input type='number' size='3' id='" + newBc + "'>";
	newdiv.innerHTML += " &emsp; <input type='number' id='" + newLa + "' size='2'>";
	newdiv.innerHTML += "<br> <input type='checkbox' onchange='outputUnitWeight(" + i + ");' id='" + newUw + "'>Select if layer is underwater";
	newdiv.innerHTML += "&emsp;<input type='button' value='Clear Layer' onclick='clearLayer(" + i + ");'><br>";
	newdiv.id = "div" + i;
	return newdiv;
}

// Closes all open sections and empties all fields in each layer
function clearPage()
{
	for (var i = 1; i <= count; i++)
	{
		clearLayer(i);
	}
	closeSoils();
	removeIfExists("kcalc");
}


// Prints the HTML for the number of layers the user inputted at the beginning
function printLayers()
{
	document.getElementById("layers").innerHTML = "Layer Content &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;   Average Blow Count&emsp;&emsp;&emsp;Layer Depth (ft)<br>";

	for (var i = 1; i <= count; i++)
	{
		var newdiv = getLayer(i);

		document.getElementById("layers").appendChild(newdiv);
	}

	var newdiv = document.createElement('div');
	newdiv.innerHTML = "<br><input type='button' value='Submit' id='complete' onClick='calculateK();'>";
	newdiv.innerHTML += "&emsp;<input type='button' value='Add a layer' onclick='addLayer();'>";
	newdiv.innerHTML += "&emsp;<input type='button' value='Remove a layer' onclick='removeLayer();'>";
	newdiv.innerHTML += "&emsp;<input type='button' value='Add/Edit soil type' id='addp1' onclick='printSoils();'> ";
	newdiv.innerHTML += "&emsp;<input type='button' value='Clear page' onclick='clearPage();'>";
	document.getElementById("buttons").innerHTML = newdiv.innerHTML;
}


// Clears all user input on a given layer
function clearLayer(i)
{
	document.getElementById("soil" + i).selectedIndex = 0;
	document.getElementById("bcnt" + i).value = "";
	document.getElementById("layer" + i).value = "";
	document.getElementById("uw" + i).checked = false;
	removeIfExists("unitweight" + i);
}


// Appends new layer given the user pressed the "Add Layer" button
function addLayer()
{
	count++;

	var newdiv = getLayer(count);

	document.getElementById("layers").appendChild(newdiv);
}


// Removes the last layer given the user pressed the "Remove Layer" button. Does not allow user to remove layer if there is only one layer left
function removeLayer()
{
	if (count == 1)
	{
		alert("Can not remove any more layers.");
		return;
	}

	document.getElementById("div" + count).remove();
	count--;
}


// Adjusts all soil type dropdowns given the dictionary for soil types was modified
function resetDropdowns()
{
	for (var i = 1; i <= count; i++)
	{
		var dropdown = getDropdown(i);
		document.getElementById("soil" + i).innerHTML = dropdown;
		removeIfExists("unitweight" + i);
	}
}


// Saves dictionary for soil types to local storage given the browser can support local storage
function saveDict()
{
	if (typeof (Storage) !== "undefined")
		localStorage.soilTypes = JSON.stringify(sp);
}


// Removes sections for modifying soils given the user submitted changes to a soil type or voluntarily closed it
function closeSoils()
{
	removeIfExists("modsoil");
	removeIfExists("soiltypes");
	document.getElementById("addp1").value = "Add/Edit soil type";
	document.getElementById("addp1").setAttribute("onclick", "printSoils();");
}


// Adds new soil type to dictionary given all fields have been filled out
function addToDict()
{
	var name = document.getElementById("name").value;
	var um = document.getElementById("moiweight").value;
	var us = document.getElementById("satweight").value;

	if (isEmpty(name))
	{
		alert("No name entered");
		return;
	}

	if (isEmpty(um) || isEmpty(us))
	{
		alert("Unit weight not entered");
		return;
	}

	if (sp[name] != undefined)
	{
		if (sp[name][0] == um && sp[name][1] == us)
		{
			alert("No values modified");
			return;
		}
		alert(name + " modified");
	}
	else
	{
		alert(name + " added");
	}

	sp[name] = [um, us];
	closeSoils();
	saveDict();
	resetDropdowns();
}


// Deletes soil type from dictionary given the user pressed the "Delete" button. Will confirm with user they want to delete the soil type
function removeFromDict()
{
	var option = document.getElementById("modify").value;

	if (confirm("Are you sure you want to delete " + option + "?") == true)
	{
		delete sp[option];
		closeSoils();
		saveDict();
		resetDropdowns();
	}
}

// Outputs the HTML to modify an existing soil type or add a new type to the dictionary and dropdown menus
function modify()
{
	removeIfExists("modsoil");

	var option = document.getElementById("modify").value;

	if (option == "Current Values:")
		return;

	var newdiv = document.createElement('div');
	newdiv.id = "modsoil";

	if (option == "Add another type")
	{
		newdiv.innerHTML = '<hr><br>Type of Soil&emsp;<input type="text" id="name"><br><br>';
		newdiv.innerHTML += 'Unit Weight (moist)&emsp;<input type="number" id="moiweight"><br><br>';
		newdiv.innerHTML += 'Unit Weight (saturated)&emsp;<input type="number" id="satweight"><br><br>';
		newdiv.innerHTML += '<input type="submit" onclick="addToDict();">';
	}
	else
	{
		newdiv.innerHTML = "<hr><br>Type of Soil&emsp;<input type='text' id='name' value= '" + option + "'><br><br>";
		newdiv.innerHTML += "Unit Weight (moist)&emsp;<input type='number' id='moiweight' value = '" + sp[option][0] + "'><br><br>";
		newdiv.innerHTML += "Unit Weight (saturated)&emsp;<input type='number' id='satweight' value= '" + sp[option][1] + "'><br><br>";
		newdiv.innerHTML += '<input type="submit" onclick="addToDict();">';
		newdiv.innerHTML += "&emsp;<input type='button' value='Delete' onclick='removeFromDict();'>";
	}
	document.getElementById("soiltypes").appendChild(newdiv);
}


// Outputs HTML for choosing to modify an existing soil type or add a new type to dictionary and dropdown menus
function printSoils()
{
	document.getElementById("addp1").value = "Close soil modifier";
	document.getElementById("addp1").setAttribute("onclick", "closeSoils();");

	var newdiv = document.createElement('div');

	var dropdown = "<select id='modify' onchange='modify();'><option>Current Values:</option>";
	for (var key in sp)
		dropdown += "<option>" + key + "</option>";

	dropdown += "<option id='add'>Add another type</option></select>";

	newdiv.innerHTML = "<br>Which value do you wish to modify?<br>" + dropdown + "<br>";
	newdiv.id = "soiltypes";
	document.getElementById("addtodict").appendChild(newdiv);
}