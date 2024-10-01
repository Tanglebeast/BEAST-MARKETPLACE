// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract NFTandERC20Voting is Ownable {
    using SafeMath for uint256;

    struct Poll {
        string question;
        string description;
        string[] options;
        mapping(uint256 => uint256) votes;
        uint256 endTime;
        bool isActive;
        uint256 totalVotes;
        address[] nftContractAddresses;
        address erc20TokenAddress;
        bool isERC20Poll;
        uint8 erc20Decimals;
    }

    struct UserVote {
        uint256 pollId;
        uint256 optionId;
        uint256 voteCount;
    }

    Poll[] public polls;
    mapping(address => UserVote[]) public userVotes;
    mapping(address => bool) public pollCreators;
    address public constant ERC20_TOKEN_ADDRESS = 0x6852f7B4ba44667F2Db80E6f3A9f8A173b03cD15;

    event PollCreated(uint256 pollId, string question, string description, string[] options, uint256 endTime, address[] nftContractAddresses, address erc20TokenAddress, bool isERC20Poll);
    event Voted(address indexed user, uint256 pollId, uint256 optionId, uint256 voteCount);
    event VoteRemoved(address indexed user, uint256 pollId, uint256 optionId, uint256 voteCount);
    event PollCreatorAdded(address indexed creator);
    event PollCreatorRemoved(address indexed creator);

    constructor() Ownable(msg.sender) {
        pollCreators[msg.sender] = true;
    }

    modifier onlyPollCreator() {
        require(pollCreators[msg.sender], "Not authorized to create polls");
        _;
    }

    function addPollCreator(address _creator) external onlyOwner {
        require(!pollCreators[_creator], "Address is already a poll creator");
        pollCreators[_creator] = true;
        emit PollCreatorAdded(_creator);
    }

    function removePollCreator(address _creator) external onlyOwner {
        require(pollCreators[_creator], "Address is not a poll creator");
        pollCreators[_creator] = false;
        emit PollCreatorRemoved(_creator);
    }

    function createNFTPoll(
        string memory _question,
        string memory _description,
        string[] memory _options,
        uint256 _durationInHours,
        address[] memory _nftContractAddresses
    ) external onlyPollCreator {
        require(_options.length > 0, "Options cannot be empty");
        require(_nftContractAddresses.length > 0, "NFT contract addresses cannot be empty");
        uint256 endTime = block.timestamp.add(_durationInHours.mul(1 hours));

        Poll storage newPoll = polls.push();
        newPoll.question = _question;
        newPoll.description = _description;
        newPoll.options = _options;
        newPoll.endTime = endTime;
        newPoll.isActive = true;
        newPoll.nftContractAddresses = _nftContractAddresses;
        newPoll.isERC20Poll = false;

        emit PollCreated(polls.length - 1, _question, _description, _options, endTime, _nftContractAddresses, address(0), false);
    }

    function createERC20Poll(
        string memory _question,
        string memory _description,
        string[] memory _options,
        uint256 _durationInHours
    ) external onlyOwner {
        require(_options.length > 0, "Options cannot be empty");
        uint256 endTime = block.timestamp.add(_durationInHours.mul(1 hours));

        IERC20Metadata token = IERC20Metadata(ERC20_TOKEN_ADDRESS);
        uint8 decimals = token.decimals();

        Poll storage newPoll = polls.push();
        newPoll.question = _question;
        newPoll.description = _description;
        newPoll.options = _options;
        newPoll.endTime = endTime;
        newPoll.isActive = true;
        newPoll.erc20TokenAddress = ERC20_TOKEN_ADDRESS;
        newPoll.isERC20Poll = true;
        newPoll.erc20Decimals = decimals;

        emit PollCreated(polls.length - 1, _question, _description, _options, endTime, new address[](0), ERC20_TOKEN_ADDRESS, true);
    }

    function vote(uint256 _pollId, uint256 _optionId, uint256 _voteCount) external {
        require(_pollId < polls.length, "Poll does not exist");
        Poll storage poll = polls[_pollId];
        require(block.timestamp < poll.endTime, "Poll has ended");
        require(poll.isActive, "Poll is not active");
        require(_optionId < poll.options.length, "Invalid option");

        uint256 availableVotes;
        if (poll.isERC20Poll) {
            IERC20 token = IERC20(poll.erc20TokenAddress);
            uint256 balance = token.balanceOf(msg.sender);
            availableVotes = balance.div(10**uint256(poll.erc20Decimals));
        } else {
            availableVotes = getNFTBalance(msg.sender, _pollId);
        }

        uint256 usedVotes = getTotalVotesUsed(msg.sender, _pollId);
        require(usedVotes.add(_voteCount) <= availableVotes, "Not enough available votes");

        poll.votes[_optionId] = poll.votes[_optionId].add(_voteCount);
        poll.totalVotes = poll.totalVotes.add(_voteCount);

        userVotes[msg.sender].push(UserVote({
            pollId: _pollId,
            optionId: _optionId,
            voteCount: _voteCount
        }));

        emit Voted(msg.sender, _pollId, _optionId, _voteCount);
    }

    function removeVote(uint256 _pollId, uint256 _optionId, uint256 _voteCount) external {
        require(_pollId < polls.length, "Poll does not exist");
        Poll storage poll = polls[_pollId];
        require(block.timestamp < poll.endTime, "Poll has ended");
        require(poll.isActive, "Poll is not active");
        require(_optionId < poll.options.length, "Invalid option");

        uint256 totalRemoved = 0;
        for (uint256 i = 0; i < userVotes[msg.sender].length; i++) {
            if (userVotes[msg.sender][i].pollId == _pollId && userVotes[msg.sender][i].optionId == _optionId) {
                if (userVotes[msg.sender][i].voteCount >= _voteCount.sub(totalRemoved)) {
                    userVotes[msg.sender][i].voteCount = userVotes[msg.sender][i].voteCount.sub(_voteCount.sub(totalRemoved));
                    totalRemoved = _voteCount;
                    break;
                } else {
                    totalRemoved = totalRemoved.add(userVotes[msg.sender][i].voteCount);
                    userVotes[msg.sender][i].voteCount = 0;
                }
            }
        }

        require(totalRemoved == _voteCount, "Not enough votes to remove");

        poll.votes[_optionId] = poll.votes[_optionId].sub(_voteCount);
        poll.totalVotes = poll.totalVotes.sub(_voteCount);

        emit VoteRemoved(msg.sender, _pollId, _optionId, _voteCount);
    }

    function getPoll(uint256 _pollId) external view returns (
        string memory question,
        string memory description,
        string[] memory options,
        uint256[] memory votes,
        bool isActive,
        uint256 endTime,
        uint256 totalVotes,
        address[] memory nftContractAddresses,
        address erc20TokenAddress,
        bool isERC20Poll,
        uint8 erc20Decimals
    ) {
        Poll storage poll = polls[_pollId];
        question = poll.question;
        description = poll.description;
        options = poll.options;
        votes = new uint256[](options.length);
        
        for (uint256 i = 0; i < options.length; i++) {
            votes[i] = poll.votes[i];
        }
        
        isActive = poll.isActive;
        endTime = poll.endTime;
        totalVotes = poll.totalVotes;
        nftContractAddresses = poll.nftContractAddresses;
        erc20TokenAddress = poll.erc20TokenAddress;
        isERC20Poll = poll.isERC20Poll;
        erc20Decimals = poll.erc20Decimals;
    }

    function getUserVotes(address _user) external view returns (UserVote[] memory) {
        return userVotes[_user];
    }

    function getNFTBalance(address _user, uint256 _pollId) public view returns (uint256) {
        uint256 totalBalance = 0;
        Poll storage poll = polls[_pollId];
        for (uint256 i = 0; i < poll.nftContractAddresses.length; i++) {
            IERC721 nftContract = IERC721(poll.nftContractAddresses[i]);
            totalBalance = totalBalance.add(nftContract.balanceOf(_user));
        }
        return totalBalance;
    }

    function getTotalVotesUsed(address _user, uint256 _pollId) public view returns (uint256) {
        UserVote[] storage votes = userVotes[_user];
        uint256 totalVotesUsed = 0;
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].pollId == _pollId) {
                totalVotesUsed = totalVotesUsed.add(votes[i].voteCount);
            }
        }
        return totalVotesUsed;
    }
}