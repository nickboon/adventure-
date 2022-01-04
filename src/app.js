(function () {
	// This is the JavaScript code - without this we couldn't construct the moving parts of the game.
	// Lines preceeded by "//" are called comments.. they are not read as code when the program runs.
	
	// Here we get references to the HTML elements on the page so the JavaScript can use them.
	// If you look in index.html you will see these elements wrapped in angle brackets and with a specified id
	// e.g. <h1 id="currentLocationHeader"></h1> -- this is an element used to display an important header text.
	// When the game starts this is "Kitchen", but as you move around the game the text is replaced (see ChangeGameStateTo function below).
	const locationHeader = document.getElementById('currentLocationHeader');
	const currentStateSection = document.getElementById('currentStateSection');
	const playerActionsSection = document.getElementById('playerActionsSection');
	const bagSection = document.getElementById('bagSection');

	// We need to define some variables to keep track of the game state.
	// Variables STORE some kind of data in memory.. so they have a name or identifier by which you may retrieve the associated data.
	// Once they are declared, you can assign a value to them. 
	// When you see "let" or "const", it means a variable is being declared.
	// Const is short for "constant" - once assigned you can't change the value it holds (So, technically, it is not variable... I might be being imprecise here).
	// You can change the value if a variable is declared with 'let'.
	// These once are going to change as the game progresses, so I used 'let':
	let startingGameState = '';
	let currentGameState = '';
	let currentLocation = '';

	// Functions DO things: e.g. Perform calculations, save a value in a variable for later, or create more functions.
	// They can take in input (between the braces after the function name) and can optionaly return output.
	// Function declarations or definitions look like this:
	//
	// function addOneTo(input){ return input + 1; }
	//
	// Once you have defined a function, you can execute (or "call", or "invoke") it like this, with it's name and the input you have chosen in brackets:
	//
	// addOneTo(4);

	// a function to pass the required state when constructing options for the player
	function goTo(state) {
		return function () {
			return state;
		};
	}

	// more helper functions to supply various states you might need to jump to
	function goToCurrentLocation() {
		return currentLocation;
	}

	function goToStartingGameState() {
		return startingGameState;
	}

	function goToCurrentGameState() {
		return currentGameState;
	}

	// a function to create the actions a player can chose from to progress from the current state.
	function createPlayerAction(description, getNextState) {
		return {
			description: description,
			getNextState: getNextState,
		};
	}

	function createContinueAction() {
		return createPlayerAction('Continue', goToCurrentLocation);
	}

	function createStartAgainAction() {
		return createPlayerAction('Start again', goToStartingGameState);
	}

	// Here we create dropdown lists of options to add to the page.
	// An option has a value, which is not visible on the page though available to the game code,
	// and some text, which is what the player sees in the dropdown, e.g "Go south".
	function appendOption(selector, text, getValue) {
		const option = document.createElement('option');
		option.text = text;
		option.value = getValue();
		selector.appendChild(option);
	}

	function createDropdownIn(section, placeholder) {
		// A select HTML element holds the dropdown options.
		// We create a new one here:
		const dropdown = document.createElement('select');
		// Scroll up to the previous function see the definition of "appendOption" which is called in the next line
		appendOption(dropdown, placeholder, goToCurrentGameState);

		// When the player selects a new option, a change event triggers whatever functions we assign here .. in this case ChangeGameState.
		// The value of the option (stored in event.target.value) is the key for the next game state.
		dropdown.addEventListener('change', function (event) {
			ChangeGameStateTo(event.target.value);
		});

		// add the newly created drop down to the section element in the HTML in index.html
		section.append(dropdown);

		return dropdown;
	}

	function isBagEmpty() {
		// If the bag is empty it has a string of text saying "No Items" - you can see this defined in the index.html file
		// When you see "===" the code is checking if the two operands either sideare equal,
		// rather than assigning a value to a variable.
		return bagSection.firstChild.nodeType === Node.TEXT_NODE;
	}

	function addToBag(action) {
		let bagSectionDropdown = bagSection.firstChild;
		// If blocks are used to run code only if the expression in the brackets is true,
		// otherwise it skips it.
		if (isBagEmpty()) {
			bagSection.innerHTML = '';
			bagSectionDropdown = createDropdownIn(
				bagSection,
				'Select an item to use:'
			);
		}

		appendOption(bagSectionDropdown, action.description, action.getNextState);
	}

	function resetBagOptions() {
		// nothing to reset ifbag is empty
		if (isBagEmpty()) {
			return; // skip the rest of the code in the function
		}

		// The placeholder is the thing describing the dropdown: e.g "Select an item to use:" defined above.
		var placeholder = bagSection.firstChild.firstChild;
		// if you click it you shouldn't go anywhere so it point to the current state
		placeholder.value = currentGameState;
		// the placeholder should now be shown in the dropdown as if it was selected,
		// rather than any of the player options.
		placeholder.selected = true;
	}

	function buildActionOptions(actions) {
		const playerActionDropdown = createDropdownIn(
			playerActionsSection,
			'Choose an action: '
		);
		actions.forEach(function (action) {
			appendOption(
				playerActionDropdown,
				action.description,
				action.getNextState
			);
		});
	}

	// THIS IS THE MAIN FUNCTION IN THE GAME.
	// It loads a new state in response to player's choice 
	// Selecting an option in the dropdown gives us a state key.
	// Using the key we get the state from the gameStates variable and update the
	// contents of the html elements on the page (This is what is defined in index.html)
	function ChangeGameStateTo(stateKey) {
		const newGameState = gameStates[stateKey];
		// store current game state in currentGameState variable.
		currentGameState = stateKey;

		// set the current location if state is set in a particular location
		if (newGameState.location) {
			locationHeader.innerHTML = newGameState.location;
			currentLocation = stateKey;
		}

		// load state description
		currentStateSection.innerHTML = newGameState.description;

		// load player actions
		playerActionsSection.innerHTML = '';
		buildActionOptions(newGameState.playerActions);

		// run any game actions for the new state
		if (newGameState.gameActions) {
			// gameActions is an array of game action functions -
			// here each one is called in turn
			newGameState.gameActions.forEach((gameAction) => gameAction());
		}

		// reset bag
		resetBagOptions();
	}

	// states
	const player = {}; // This is an empty object - we can add properties describing player data here,
	// at a later time - see hasDrunkCoffee

	// These are all the locations and events that happen in the game.
	// Some are locations and so have a location name, which allows the game to kep track of where the player is. If it doesn't have a location name, it's some sort of event that could potentially happen anywhere. Player actions are the options the player is presented with in order to progress in the game. You have to give it a description and the game state it will move on to. Game actions are things the game will do when it moves to that state. This is not something the player can choose.
	// Try adding new states to expand the game!

	// gameStates is a JavaScript object - you write them by defining variables inside curly braces.
	// These variables don't need a "let" keyword but you can reassign them.
	// They are regarded as a special type of variable "belonging" to the object containing them
	// and are referred to as "properties" of that object.
	// Here is an example object:
	//
	// const myNewPerson = {
	//     name: 'Jonathon',
	//     id: 'Thing 2',
	//     age: 44
	// }
	//
	// In objects the properties are assigned with colons (:) rather than the equals sign (=)
	// This gameStates object holds many other objects, representing all the states the game can be in.
	const gameStates = {
		kitchen: {
			location: 'Kitchen',
			description: 'There is a kettle, a mug and a jar of coffee.',
			// These states have lists of playerActions and optionally, gameActions.
			// Lists in JavaScript are called "arrays" and they look like this:
			//
			// [ 'this array only contains one thing - this string of characters']
			//
			// or this:
			//
			// [
			//      'this array has this sentance..',
			//      '..and also this one. after the requiste comma, which separates items in an array'
			//]
			playerActions: [
				createPlayerAction('Go south', goTo('bedroom')),
				createPlayerAction('Make coffee', goTo('makeCoffee')),
			],
		},
		makeCoffee: {
			description: 'You have made a nice hot mug of coffee.',
			playerActions: [createContinueAction()],
			// all the functions in the gameActions array will be called by the ChangeGameStateTo function above
			gameActions: [
				function () {
					addToBag(createPlayerAction('Mug Of Coffee', goTo('drinkCoffee')));
				},
			],
		},
		drinkCoffee: {
			description: 'The Coffee is delicious.',
			playerActions: [createContinueAction()],
			gameActions: [
				function () {
					player.hasDrunkCoffee = true;
				},
			],
		},
		bedroom: {
			location: 'Bedroom',
			description: 'There is a bed and a book',
			playerActions: [
				createPlayerAction('Go north', goTo('kitchen')),
				createPlayerAction('Go south', goTo('outside')),
				createPlayerAction('Go to sleep', () =>
					// this is called a ternary expression
					// if player.hasDrunkCoffee is true 'can't sleep' will be returned,
					// if it is false 'sleeping will'
					player.hasDrunkCoffee ? 'cantSleep' : 'sleeping'
				),
				createPlayerAction('Read book', goTo('readBook')),
			],
		},
		cantSleep: {
			description:
				'The coffee you drank earlier is making it hard to drop off...',
			playerActions: [createContinueAction()],
		},
		sleeping: {
			description: 'zzzzz...',
			playerActions: [createContinueAction()],
		},
		readBook: {
			description: 'The book tells you that you must go outside to win.',
			playerActions: [createContinueAction()],
		},
		outside: {
			location: 'Outside',
			description: 'You are outside. YOU WIN!! CONGRATULATIONS!!',
			playerActions: [createStartAgainAction()],
		},
	};

	// now everything is set up, assign and load the starting state
	startingGameState = 'kitchen';
	ChangeGameStateTo(startingGameState);
})();

// For a more exhaustive definition of JavaScript, I can recommend this book:
// https://cdn.tc-library.org/Rhizr/Files/daaz74mzphKfnHsen/files/JavaScript-%20The%20Good%20Parts.pdf
