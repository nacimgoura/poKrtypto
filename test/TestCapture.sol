pragma solidity ^0.4.23;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Capture.sol";

contract TestCapture {
    Capture capture = Capture(DeployedAddresses.Capture());

    // Testing the function
    function testUserCanAdoptPokemon() public {
        //uint returnedId = capture.catchPokemon.value(1)(8);
        uint returnedId = capture.catchPokemon(8);

        uint expected = 8;

        Assert.equal(returnedId, expected, "Adoption of pokemon ID 8 should be recorded.");
    }

    // Testing retrieval of a single ppokemon's owner
    function testGetDresserAddressByPokemonId() public {
        // Expected owner is this contract
        address expected = this;

        address adopter = capture.getPokemonOwner(8);
        // address adopter = capture.transfer("capture.getPokemonOwner", 8);

        Assert.equal(adopter, expected, "Owner of pet ID 8 should be recorded.");
    }

    // Testing retrieval of all pet owners
    function testGetDresserAddressByPokemonIdInArray() public {
        // Expected owner is this contract
        address expected = this;

        // Store adopters in memory rather than contract's storage
        address[16] memory pokemons = capture.getPokemons();

        Assert.equal(pokemons[8], expected, "Owner of pokemon ID 8 should be recorded.");
    }
}