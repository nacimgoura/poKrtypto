App = {
	web3Provider: null,
	contracts: {},

	init: function() {
		// Load pokemons.
		$.getJSON('../pokemons.json', function(data) {
			var pokemonsRow = $('#pokemonRow');
			var pokemonTemplate = $('#pokemonTemplate');

			for (i = 0; i < data.length; i++) {
				pokemonTemplate.find('.panel-title').text(data[i].name);
				pokemonTemplate.find('img').attr('src', data[i].picture);
				pokemonTemplate.find('.pokemon-life').text(data[i].life);
				pokemonTemplate.find('.pokemon-attack').text(data[i].attack);
				pokemonTemplate.find('.btn-capture').attr('data-id', data[i].id);
				pokemonTemplate.find('.pokemon-price').text(calculatePrice(data[i].id));

				pokemonsRow.append(pokemonTemplate.html());
			}
		});

		return App.initWeb3();
	},

	initWeb3: function() {
		if (typeof web3 !== 'undefined') {
			App.web3Provider = web3.currentProvider;
		} else {
			// If no injected web3 instance is detected, fall back to Ganache
			App.web3Provider = new Web3.providers.HttpProvider(
				'http://localhost:7545'
			);
		}
		web3 = new Web3(App.web3Provider);

		return App.initContract();
	},

	initContract: function() {
		$.getJSON('Capture.json', function(data) {
			// Get the necessary contract artifact file and instantiate it with truffle-contract
			var CaptureArtifact = data;
			App.contracts.Capture = TruffleContract(CaptureArtifact);

			// Set the provider for our contract
			App.contracts.Capture.setProvider(App.web3Provider);

			// Use our contract to retrieve and mark the captured pokemon
			return App.markCaptured();
		});

		return App.bindEvents();
	},

	bindEvents: function() {
		$(document).on('click', '.btn-capture', App.handleCapture);
		$(document).on('click', '.btn-release', App.handleRelease);
	},

	markCaptured: function() {
		web3.eth.getAccounts(function(error, accounts) {
			if (error) {
				console.log(error);
			}

			var account = accounts[0];
			App.contracts.Capture.deployed()
				.then(function(instance) {
					captureInstance = instance;

					return instance.getPokemons.call();
				})
				.then(function(pokemons) {
					console.log(pokemons);
					for (i = 0; i < pokemons.length; i++) {
						if (pokemons[i] !== '0x0000000000000000000000000000000000000000') {
							if (pokemons[i] === account) {
								$('.panel-pokemon')
									.eq(i)
									.find('.btn-capture')
									.addClass('hidden btn-default')
									.removeClass('btn-primary')
									.attr('disabled', true);
								$('.panel-pokemon')
									.eq(i)
									.find('.btn-release')
									.removeClass('hidden');
							} else {
								$('.panel-pokemon')
									.eq(i)
									.find('.btn-capture')
									.text('Captured')
									.addClass('btn-default')
									.removeClass('btn-primary')
									.attr('disabled', true);
							}
						}
					}
				})
				.catch(function(err) {
					console.log(err.message);
				});
		});
	},

	handleCapture: function(event) {
		event.preventDefault();

		var pokemonId = parseInt($(event.target).data('id'));

		web3.eth.getAccounts(function(error, accounts) {
			if (error) {
				console.log(error);
			}

			var price = calculatePrice(pokemonId);

			var account = accounts[0];
			App.contracts.Capture.deployed()
				.then(function(instance) {
					// Execute capture as a transaction by sending account
					return instance.catchPokemon(pokemonId, {
						from: account,
						value: web3.toWei(price),
						gas: 21000 * price
					});
				})
				.then(function(result) {
					console.log(result);
					return App.markCaptured();
				})
				.catch(function(err) {
					console.log(err.message);
				});
		});
	},

	handleRelease: function(event) {
		event.preventDefault();

		var pokemonId = parseInt($(event.target).data('id'));

		web3.eth.getAccounts(function(error, accounts) {
			if (error) {
				console.log(error);
			}

			var price = calculatePrice(pokemonId);

			var account = accounts[0];
			App.contracts.Capture.deployed()
				.then(function(instance) {
					// Execute capture as a transaction by sending account
					return instance.releasePokemon(pokemonId, {
						from: account,
						gas: 21000
					});
				})
				.then(function(result) {
					console.log(result);
					return App.markCaptured();
				})
				.catch(function(err) {
					console.log(err.message);
				});
		});
	}
};

$(function() {
	$(window).load(function() {
		App.init();
	});
});

function calculatePrice(pokemonId) {
	var price = pokemonId % 3;

	if (price === 0) {
		price = 25;
	} else if (price === 2) {
		price = 12;
	} else if (price === 1) {
		price = 3;
	} else {
		throw new Error('error', 'unable to buy this!');
	}
	return price;
}
