const Capture = artifacts.require('./Capture.sol');

module.exports = function(deployer) {
	deployer.deploy(Capture);
};
