// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract ProjectFollower {
    address public owner;

    struct Project {
        string name;
        address[] followers;
        mapping(address => bool) isFollower;
    }

    mapping(string => Project) private projects;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, unicode"Nur der Besitzer kann Projekte hinzuf\u00fcgen");
        _;
    }

    function addProject(string memory _name) public onlyOwner {
        require(bytes(_name).length > 0, unicode"Projektname darf nicht leer sein");
        require(bytes(projects[_name].name).length == 0, unicode"Projekt existiert bereits");
        projects[_name].name = _name;
    }

    function followProject(string memory _name) public {
        require(bytes(projects[_name].name).length > 0, unicode"Projekt existiert nicht");
        require(!projects[_name].isFollower[msg.sender], unicode"Du folgst diesem Projekt bereits");
        projects[_name].followers.push(msg.sender);
        projects[_name].isFollower[msg.sender] = true;
    }

    function unfollowProject(string memory _name) public {
        require(bytes(projects[_name].name).length > 0, unicode"Projekt existiert nicht");
        require(projects[_name].isFollower[msg.sender], unicode"Du folgst diesem Projekt nicht");
        projects[_name].isFollower[msg.sender] = false;

        // Entferne den Follower aus dem Array
        for (uint i = 0; i < projects[_name].followers.length; i++) {
            if (projects[_name].followers[i] == msg.sender) {
                projects[_name].followers[i] = projects[_name].followers[projects[_name].followers.length - 1];
                projects[_name].followers.pop();
                break;
            }
        }
    }

    function getFollowers(string memory _name) public view returns (address[] memory) {
        require(bytes(projects[_name].name).length > 0, unicode"Projekt existiert nicht");
        return projects[_name].followers;
    }
}
