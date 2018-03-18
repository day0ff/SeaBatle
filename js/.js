window.onload=initialization;
const CHAR_START = 64;
function initialization(){
	setStorage();
	createBoard();
	let counter = 0;
	(function positionShips(){
		model.setShips();
		if(controller.rules){
			//showShips();
			displayShips();
			view.begin();
		}else{
			model.ships = new Array();
			controller.rules = true;
			counter++;
			console.log("Fail to generate " + counter +" times");
			if(counter<controller.fails){return positionShips();}
				else{view.error();}
		}
	}());	
}
// model
var model = {
	boardSize: 10,
	shipsType:[4,3,2,1],
	ships:[],
	setShips:function(){
		for(let i=0;i<this.shipsType.length;i++){
			for(let j=0;j<this.shipsType[i];j++){
				let ship;
				switch(i){
					case 0:  
					ship = new Mine();
					break;
					case 1:  
					ship = new Boat();
					break;
					case 2:  
					ship = new BattleShip();
					break;
					case 3:  
					ship = new DreadNout();
					break;
				}
				ship.setLocations();
				this.ships.push(ship);
			}
		}
	},
	fire: function (event){
		 if(event.button == 0){
			for(let i=0;i<model.ships.length;i++){
				let ship = model.ships[i];
				let index = ship.locations.indexOf(this.id);
				if (index >= 0) {
					ship.locations.splice(ship.locations.indexOf(this.id),1);
					view.hitShip(this);
					if(ship.locations.length<=0){
						view.drowned(ship);
						model.ships.splice(model.ships.indexOf(ship),1);
						if(model.ships.length==0){
							let records = getStorage().records;
							let record = false;
							for(let j = 0;j<records.length;j++){
								if(controller.guesses<=records[j].terns){
									record = true;
									break;
								}
							}
							if(record){view.record();}
								else{view.winner();}
							}
						//showShips();
					}
					return false;
				}
			}
			view.miss(this);
		} else if(event.button == 1){
			view.flag(this);
		}
	}
}	
var controller = {
	guesses: 0,
	rules:true,
	failCounter: 1000,
	fails: 20,
	play: function(){
	}
}
var view = {
	begin: function(){
		let message = "Good luck!";
		console.log(message);
		prependFirstMessage(message);
		messageAlert(message,2000);
	},
	hitShip: function(elem){
		elem.innerHTML = "";
		elem.setAttribute('class','hit');
		elem.style.backgroundSize = getCellSize() + "vw " + getCellSize() + "vw";
		let shipId = "ship" + elem.getAttribute('id');
		document.getElementById(shipId).setAttribute('class','hit');
		controller.guesses++;
		let message = "Gues: " + controller.guesses + " / HIT  " + elem.id;
		console.log(message);
		prependFirstMessage(message);
		messageAlert(message,1000);
	},
	miss: function(elem){
		if(elem.getAttribute("class").indexOf("hit")== -1){
			//elem.innerHTML = "MISS";
			elem.innerHTML = "&#9898;";
			elem.setAttribute('class','miss');
		}
		controller.guesses++;
		let message = "Gues: " + controller.guesses + " / MISS " + elem.id;
		console.log(message);
		prependFirstMessage(message);
		//messageAlert(message,5000);
	},
	flag: function(elem){
		//elem.innerHTML = "F";
		elem.innerHTML = "&#9650;";
		elem.setAttribute('class','flag');
		let message = "Flag set: " + elem.id;
		console.log(message);
		//prependFirstMessage(message);
	},
	drowned: function(ship){
		let message = "Ships left : " + (model.ships.length - 1);
		console.log(message);
		prependFirstMessage(message);
		message = ship.name + " was sunk!"
		console.log(message);
		prependFirstMessage(message);
		messageAlert(message,2000);
	},
	winner:function(){
		let message = "moves spent : " + controller.guesses;
		console.log(message);
		prependFirstMessage(message);
		message = "You have WON!";
		console.log(message);
		prependFirstMessage(message);
		let td = document.getElementsByTagName("td");
		for(let i = 0; i<td.length;i++){
			//td[i].removeEventListener('click', model.fire, false);
			td[i].removeEventListener('mousedown', model.fire, false);
		}
		messageAlert(message,10000);
		initialization();
	},
	record: function(){
		let message = "moves spent : " + controller.guesses;
		console.log(message);
		prependFirstMessage(message);
		message = "You have WON!";
		console.log(message);
		prependFirstMessage(message);
		message = "New record : " + controller.guesses + " terns.";
		console.log(message);
		prependFirstMessage(message);
		let td = document.getElementsByTagName("td");
		for(let i = 0; i<td.length;i++){
			td[i].removeEventListener('mousedown', model.fire, false);
		}
		recordForm(controller.guesses);
	},
	error: function(){
		let message = "Can not set ships on board";
		console.log(message);
		prependFirstMessage(message);
		messageAlert(message,5000);
	}
}
var storage = {
	records: [{name: "Plaer1", terns: 90},{name: "Plaer2", terns: 92},{name:"Plaer3",terns:94},{name:"Plaer4",terns:96},{name:"Plaer5",terns:98}]	
}
function saveRecord(name,terns){
	let obj = {name: name, terns: terns};
	let storage = getStorage();
	let newStorage  = {records: []};
	for(let i = 0; i < storage.records.length; i++){
		if(obj.terns<storage.records[i].terns){
			newStorage.records[i] = obj;
			obj = storage.records[i];
		}else{newStorage.records[i] = storage.records[i]}
	}
	saveStorage(newStorage);
	document.body.removeChild(document.getElementById("record"));
	initialization();
}
function saveStorage(storage){
	clearStorage();
	let sObj = JSON.stringify(storage);
	localStorage.setItem('storage', sObj);
	getRecords();
}
function getRecords(){
	let records = getStorage().records;
	let recordList = document.getElementById("recordList");
	recordList.innerHTML = "";
	let table = document.createElement("table");
	let tr = document.createElement("tr");
	let td = document.createElement("td");
	td.innerHTML = "name";
	td.style.width =  getCellSize()*2 + "vw";
	tr.appendChild(td);
	td = document.createElement("td");
	td.innerHTML = "terns";
	tr.appendChild(td);
	table.appendChild(tr);	
	for(let i =0;i<5;i++){
		tr = document.createElement("tr");
		td = document.createElement("td");
		td.innerHTML = "&nbsp;";
		//if(records[i].terns!=undefined){td.innerHTML = records[i].name;}
		td.innerHTML = records[i].name;
		tr.appendChild(td);	
		td = document.createElement("td");
		td.innerHTML = "";
		//if(records[i].terns!=undefined){td.innerHTML = records[i].terns};
		td.innerHTML = records[i].terns;
		tr.appendChild(td);	
		table.appendChild(tr);	
	}
	recordList.appendChild(table);	
}
function setStorage(){
	if(localStorage.getItem("storage")==undefined){
		let sObj = JSON.stringify(storage);
		localStorage.setItem('storage', sObj);
	}
	getRecords();
}
function getStorage(){
	return JSON.parse(localStorage.getItem("storage"));	
}
function clearStorage(){
	localStorage.clear();
}
// Ship Object
	function Ship(name,size){
		this.name = name,
		this.size = size,
		this.locations = [],
		this.locationArea = [],
		this.hits = []
	}
	Ship.prototype.setHits = function(){
		for(let i=0;i<this.size;i++){
			this.hits[i]="healthy";
		}
	}
	Ship.prototype.setLocations = function(){
		let locations = [], failCounter = 0;
		do {
			locations = this.generateShip();
			failCounter++;
			if(failCounter>=controller.failCounter){
				controller.rules = false;
				break;
			} 
		} while (this.collision(locations));
		this.locations = locations;
		this.setHits();
		this.setLocationArea();
	}
	Ship.prototype.setLocationArea = function(){
		for(let i=0;i<this.locations.length;i++){
			let id = this.locations[i];
			let indexY = +id[1] - 1;
			let result = id[0] + indexY;
			if (this.locationArea.indexOf(result) == -1) this.locationArea.push(result);
			indexY = +id[1] + 1;
			result = id[0] + indexY;
			if (this.locationArea.indexOf(result) == -1) this.locationArea.push(result);
			result = id;
			if (this.locationArea.indexOf(result) == -1) this.locationArea.push(result);
			let indexX = String.fromCharCode(id.charCodeAt(0) - 1);
			result = indexX + id[1];
			if (this.locationArea.indexOf(result) == -1) this.locationArea.push(result);
			indexX = String.fromCharCode(id.charCodeAt(0) + 1);
			result = indexX + id[1];
			if (this.locationArea.indexOf(result) == -1) this.locationArea.push(result);
			index = String.fromCharCode(id.charCodeAt(0) - 1);
			indexY = +id[1] -1;
			result = index + indexY;
			if (this.locationArea.indexOf(result) == -1) this.locationArea.push(result);
			index = String.fromCharCode(id.charCodeAt(0) - 1);
			indexY = +id[1] +1;
			result = index + indexY;
			if (this.locationArea.indexOf(result) == -1) this.locationArea.push(result);
			index = String.fromCharCode(id.charCodeAt(0) + 1);
			indexY = +id[1] -1;
			result = index + indexY;
			if (this.locationArea.indexOf(result) == -1) this.locationArea.push(result);
			index = String.fromCharCode(id.charCodeAt(0) + 1);
			indexY = +id[1] +1;
			result = index + indexY;
			if (this.locationArea.indexOf(result) == -1) this.locationArea.push(result);
		}
	}
	Ship.prototype.generateShip = function() {
		let direction = Math.floor(Math.random() * 2);
		let row, col;

		if (direction === 1) {
			row = Math.floor(Math.random() * model.boardSize);
			col = Math.floor(Math.random() * (model.boardSize - this.size + 1));
		} else {
			row = Math.floor(Math.random() * (model.boardSize - this.size + 1));
			col = Math.floor(Math.random() * model.boardSize );
		}

		let newShipLocations = [];
		for (let i = 0; i < this.size; i++) {
			if (direction === 1) {
				newShipLocations.push(String.fromCharCode(CHAR_START + row + 1) + "" + (col + i));
			} else {
				newShipLocations.push(String.fromCharCode(CHAR_START + row + i + 1) + "" + col);
			}
		}
		return newShipLocations;
	}
	Ship.prototype.collision = function(locations) {
		for (let i = 0; i < model.ships.length; i++) {
			let ship = model.ships[i];
			for (let j = 0; j < locations.length; j++) {
				if (ship.locationArea.indexOf(locations[j]) >= 0) {
					return true;
				}
			}
		}
		return false;
	}
	function Mine(){
		Ship.call(this,"Mine",1);
	}
	Mine.prototype = new Ship();
	Mine.prototype.constructor = Mine;
	function Boat(){
		Ship.call(this,"Boat",2);
	}
	Boat.prototype = new Ship();
	Boat.prototype.constructor = Boat;
	function BattleShip(){
		Ship.call(this,"BattleShip",3);
	}
	BattleShip.prototype = new Ship();
	BattleShip.prototype.constructor = BattleShip;
	function DreadNout(){
		Ship.call(this,"DreadNout",4);
	}
	DreadNout.prototype = new Ship();
	DreadNout.prototype.constructor = DreadNout;

// Board
function createBoard(){
	let board = document.getElementById("board");
	board.innerHTML ="";
	let table = document.createElement('table');
	let tr;
	mackeTh();
	mackeTd()
	mackeTh();
	board.appendChild(table);
	function mackeTh(){
		let th;
		tr = document.createElement('tr');
		for(let i = 0; i< model.boardSize + 2;i++){ 
			th = document.createElement('th');
			if(i!=0&&i!=model.boardSize+1){th.innerHTML = String.fromCharCode(CHAR_START + i);}
			th.setAttribute('class','hat');	
			th.style.width = getCellSize() + "vw";
			th.style.height = getCellSize() + "vw";
			tr.appendChild(th);
		}
		table.appendChild(tr);	
	}
	function mackeTd(){
		let th;
		for(let i = 0; i< model.boardSize;i++){ 
			tr = document.createElement('tr');
			for(let j = 0; j< model.boardSize + 2;j++){
				td = document.createElement('td');
				if(j!=0&&j!=model.boardSize+1){
					let idTitle = String.fromCharCode(CHAR_START + j) + i;
					td.setAttribute('id',idTitle);
					td.setAttribute('class','field');	
					//td.addEventListener("click", model.fire);
					td.addEventListener("mousedown", model.fire);
				}else{
						td.innerHTML =  i;
						td.setAttribute('class','hat');	
					}
				td.style.width = getCellSize() + "vw";
				td.style.height = getCellSize() + "vw";
				tr.appendChild(td);	
			}
			table.appendChild(tr);	
		}
	}
}
function getCellSize(){
	return Math.floor(40/(model.boardSize + 2));
}
function showShips(){
	for(let i=0;i<model.ships.length;i++){
		let ship = model.ships[i];
		let txt ="";
		for(let j=0;j<ship.locations.length;j++){
			//document.getElementById(ship.locations[j]).innerHTML = ship.name;
			let elem = document.getElementById(ship.locations[j]);
			elem.innerHTML = "";
			elem.setAttribute('class','ship');
			elem.style.backgroundSize = getCellSize() + "vw " + getCellSize() + "vw";
			txt += " "+ship.locations[j];
		}
		console.log(ship.name + " : " + txt + " / " + ship.locations.length);
	}
}
function displayShips(){
	let elem = document.getElementById("ships");
	elem.innerHTML="";
	for(let i=0;i<model.ships.length;i++){
		let ship = model.ships[i];
		let table = document.createElement("table"); 
		let td = document.createElement("td"); 
		td.innerHTML = ship.name + "&nbsp:";
		td.style.verticalAlign =  "middle";
		td.style.width =  getCellSize()*2 + "vw";
		//td.style.height =  (getCellSize() - 1) + "vw";
		table.appendChild(td);
		for(let j=0;j<ship.locations.length;j++){
			let td = document.createElement("td"); 
			//td.setAttribute('class','field ship');
			td.setAttribute('class','ship');
			let idTitle = "ship" + ship.locations[j];
			td.setAttribute('id',idTitle);
			td.style.width = (getCellSize() - 1) + "vw";
			td.style.height = (getCellSize() - 1) + "vw";
			td.style.backgroundSize = (getCellSize() - 1) + "vw " + (getCellSize() - 1) + "vw";
			td.innerHTML = "";
			table.appendChild(td);
		}
		elem.appendChild(table);
	}
}
function prependFirstMessage(message){
	let newMessage = document.getElementById('lastMassage').innerHTML;
	document.getElementById('lastMassage').innerHTML = message;
	let parentElement = document.getElementById('messageArea');
	let theFirstChild = parentElement.firstChild;
	let p = document.createElement('p');
	p.innerHTML = newMessage;
	parentElement.insertBefore(p, theFirstChild);
}
function messageAlert(message,duration){
	let div = document.createElement("div");
	div.setAttribute("onclick","this.style.display='none';");
	div.setAttribute("class","messageAlert");
	let h1 = document.createElement("h1");
	h1.innerHTML = message;
	div.appendChild(h1);	
	setTimeout(function(){div.parentNode.removeChild(div);},duration);
	document.body.appendChild(div);
}
function collapseCell(cell){
	getStorage();
	if(cell.nextElementSibling.style.display=="none"||cell.nextElementSibling.style.display=="undefined"){	cell.nextElementSibling.style.display="block";}
	else {cell.nextElementSibling.style.display="none";}
}
function recordForm(terns){
	let form = document.createElement("form");
	form.setAttribute("id","record");
	let h1 = document.createElement("h1");
	h1.innerHTML = "Congratulations!<br/>You set a new record : " + terns + " terns.";
	form.appendChild(h1);
	let label = document.createElement("label");
	label.setAttribute("for","name");
	label.innerHTML = "Enter your Name :";
	form.appendChild(label);
	let input = document.createElement("input");
	input.setAttribute("type","text");
	input.setAttribute("name","name");
	input.setAttribute("placeholder","Enter your Name");
	form.appendChild(input);
	input = document.createElement("input");
	input.setAttribute("type","button");
	input.setAttribute("value","OK");
	let method = "saveRecord(form.name.value,"+ terns +")";
	input.setAttribute("onclick", method);
	form.appendChild(input);
	document.body.appendChild(form);
}