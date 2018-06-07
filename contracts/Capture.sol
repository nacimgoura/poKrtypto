pragma solidity ^0.4.23;

// for capture pokemon
contract Capture {

    address[48] public pokemons; // max 48 dressors
    mapping (address => uint) pokemonByDresser; // return pokemon by dresser address
    // mapping (uint => address) DresserByPokemon; // return dresser address by pokemon

    constructor() public {
        
    }

    modifier checkIfBelong(uint _pokemonId) {
         // check if pokemon exist
        require(_pokemonId >= 1 && _pokemonId <= 47);
        _;
    }

    /**
        catch pokemon if it doesn't belong to anyone
     */
    function catchPokemon(uint _pokemonId) public payable checkIfBelong(_pokemonId) returns (uint) {
        // check if dresser has not already pokemon
        require(pokemonByDresser[msg.sender] == 0);
        // check if pokemon has not already dresser
        require(pokemons[_pokemonId - 1] == 0);
        // check if transaction has a price
        uint price = calculatePrice(_pokemonId);
        require(msg.value == price * 1 ether);
        
        // affect pokemon at dresser
        pokemonByDresser[msg.sender] = _pokemonId;
        // affect dresser at pokemon
        pokemons[_pokemonId - 1] = msg.sender;
        return _pokemonId - 1;
    }

    /** 
        release pokemon and receive 5 ether
    */
    function releasePokemon(uint _pokemonId) public checkIfBelong(_pokemonId) payable returns (uint) {
        pokemonByDresser[msg.sender] = 0;
        // desaffect dresser at pokemon
        pokemons[_pokemonId - 1] = 0;
        msg.sender.transfer(5 ether);
        return _pokemonId;
    }

    // Retrieving the pokemon list for the dresser
    function getPokemons() public view returns (address[48]) {
        return pokemons;
    }

    function getPokemonOwner(uint _pokemonId) public view returns (address) {
        return pokemons[_pokemonId - 1];
    }

    // calculate the price according to the pokemonId
    function calculatePrice(uint _pokemonId) internal pure returns (uint) {
        uint price = _pokemonId % 3;

        if (price == 2) {
            price = 12;
        } else if (price == 1) {
            price = 3;
        } else {
            price = 25;
        }
        return price;
    }

}