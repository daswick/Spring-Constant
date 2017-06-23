var count = 0;

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

function isEmpty(id)
{
	return (id.length < 1);
}

function getUnitWeight(i)
{
	var option = document.getElementById("soil" + i).value;
	var unit_weight = sp[option][0];

	if (document.getElementById("uw" + i).checked)
		unit_weight = sp[option][1] - 62.43;

	return unit_weight;
}

function removeIfExists(id)
{
	if (document.contains(document.getElementById(id)))
		document.getElementById(id).remove();
}

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

function getDropdown(i)
{
	var newId = "soil" + i;
	var newNo = "none" + i;

	var dropdown = "<select id='" + newId + "' onchange='outputUnitWeight(" + i + ");'>";
	dropdown += "<option id='" + newNo + "'>Choose a soil type</option>";
	for (var key in sp)
		dropdown += "<option id='" + key + "'>" + key + "</option>";

	dropdown += "</select>";
	return dropdown;
}

function calculateK()
{
	var sumfs = 0;
	var diameter = document.getElementById("diam").value;

	if (isEmpty(diameter))
	{
		alert("No diameter entered.");
		return;
	}

	var perimeter = 2 * Math.PI * (diameter / 24);

	removeIfExists("kcalc");

	var newdiv = document.createElement('div');
	newdiv.innerHTML = "<hr>";

	for (var i = 1; i <= count; i++)
	{
		var bc = document.getElementById("bcnt" + i).value;

		if (isEmpty(bc))
		{
			alert("No blow count entered for layer " + i);
			return;
		}

		var phi = (0.3 * bc + 27) * (Math.PI / 180);

		var kp = (1 + Math.sin(phi)) / (1 - Math.sin(phi));

		var unit_weight = getUnitWeight(i);

		var layer_depth = document.getElementById("layer" + i).value;
		if (isEmpty(layer_depth))
		{
			alert("No layer depth entered for layer " + i);
			return;
		}
		var depth = parseInt(layer_depth);

		var stress = unit_weight * depth;
		var skin_friction = kp * stress * Math.tan(phi * 0.75);
		var qu = skin_friction * depth;

		newdiv.innerHTML += "K for layer " + i + " is " + Math.floor(qu * perimeter) + "<br><br>";

		sumfs += qu;
	}

	var k = Math.floor(sumfs * perimeter);

	newdiv.innerHTML += "K for all layers is " + k;
	newdiv.id = 'kcalc';
	document.getElementById("k").appendChild(newdiv);
}

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
	newdiv.innerHTML += "&emsp;&emsp;<input type='button' value='Clear Layer' onclick='clearLayer(" + i + ");'><br>";
	newdiv.id = "div" + i;
	return newdiv;
}

function printLayers()
{
	document.getElementById("layers").innerHTML = "";
	document.getElementById("buttons").innerHTML = "";

	var div1 = document.createElement('div');
	div1.innerHTML = "Layer Content &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;  Blow Count&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;   Layer Depth (ft)<br>";
	document.getElementById("layers").append(div1);

	for (var i = 1; i <= count; i++)
	{
		var newdiv = getLayer(i);

		document.getElementById("layers").append(newdiv);
	}

	var newdiv = document.createElement('div');
	newdiv.innerHTML = "<br><input type='button' value='Submit' id='complete' onClick='calculateK();'>";
	newdiv.innerHTML += "&emsp;<input type='button' value='Add a layer' onclick='addLayer();'>";
	newdiv.innerHTML += "&emsp;<input type='button' value='Remove a layer' onclick='removeLayer();'>";
	newdiv.innerHTML += "&emsp;<input type='button' value='Add/Edit soil type' id='addp1' onclick='printSoils();'> ";
	document.getElementById("buttons").append(newdiv);
}

function clearLayer(i)
{
	document.getElementById("soil" + i).selectedIndex = 0;
	document.getElementById("bcnt" + i).value = "";
	document.getElementById("layer" + i).value = "";
	document.getElementById("uw" + i).checked = false;
	removeIfExists("unitweight" + i);
}

function addLayer()
{
	count++;

	var newdiv = getLayer(count);

	document.getElementById("layers").append(newdiv);
}

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

function resetDropdowns()
{
	for (var i = 1; i <= count; i++)
	{
		var dropdown = getDropdown(i);
		document.getElementById("soil" + i).innerHTML = dropdown;
		removeIfExists("unitweight" + i);
	}
}

function saveDict()
{
	if (typeof (Storage) !== "undefined")
		localStorage.soilTypes = JSON.stringify(sp);
}

function addToDict()
{
	var name = document.getElementById("name").value;
	var ud = document.getElementById("dryweight").value;
	var us = document.getElementById("satweight").value;

	if (isEmpty(name))
	{
		alert("No name entered");
		return;
	}

	if (isEmpty(ud) || isEmpty(us))
	{
		alert("Unit weight not entered");
		return;
	}

	if (sp[name] != undefined)
	{
		if (sp[name][0] == ud && sp[name][1] == us)
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

	sp[name] = [ud, us];
	document.getElementById("addp1").disabled = false;
	document.getElementById("modsoil").remove();
	document.getElementById("soiltypes").remove();
	saveDict();
	resetDropdowns();
}

function removeFromDict()
{
	var option = document.getElementById("modify").value;

	if (confirm("Are you sure you want to delete " + option + "?") == true)
	{
		delete sp[option];
		document.getElementById("addp1").disabled = false;
		document.getElementById("modsoil").remove();
		document.getElementById("soiltypes").remove();
		saveDict();
		resetDropdowns();
	}
}

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
		newdiv.innerHTML += 'Unit Weight (moist)&emsp;<input type="number" id="dryweight"><br><br>';
		newdiv.innerHTML += 'Unit Weight (saturated)&emsp;<input type="number" id="satweight"><br><br>';
		newdiv.innerHTML += '<input type="submit" onclick="addToDict();">';
	}
	else
	{
		newdiv.innerHTML = "<hr><br>Type of Soil&emsp;<input type='text' id='name' value= '" + option + "'><br><br>";
		newdiv.innerHTML += "Unit Weight (moist)&emsp;<input type='number' id='dryweight' value = '" + sp[option][0] + "'><br><br>";
		newdiv.innerHTML += "Unit Weight (saturated)&emsp;<input type='number' id='satweight' value= '" + sp[option][1] + "'><br><br>";
		newdiv.innerHTML += '<input type="submit" onclick="addToDict();">';
		newdiv.innerHTML += "&emsp;<input type='button' value='Delete' onclick='removeFromDict();'>";
	}
	document.getElementById("soiltypes").append(newdiv);
}

function printSoils()
{
	document.getElementById("addp1").disabled = true;

	var newdiv = document.createElement('div');

	var dropdown = "<select id='modify' onchange='modify();'><option id='none'>Current Values:</option>";
	for (var key in sp)
		dropdown += "<option>" + key + "</option>";

	dropdown += "<option id='add'>Add another type</option></select>";

	newdiv.innerHTML = "<br>Which value do you wish to modify?<br>" + dropdown + "<br>";
	newdiv.id = "soiltypes";
	document.getElementById("addtodict").appendChild(newdiv);
}