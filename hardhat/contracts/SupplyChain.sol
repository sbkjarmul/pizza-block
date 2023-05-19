// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

/**
 * @title SupplyChain
 * @dev SupplyChain contract
 * @notice This contract is used to manage orders in a PizzaBlock
 */
contract SupplyChain {
    enum Role {
        CUSTOMER,
        COOK,
        DELIVERY_MAN
    }

    enum Status {
        NOT_EXISTS,
        PLACED,
        PREPARING,
        READY,
        DELIVERING,
        COMPLETED
    }

    struct Order {
        uint256 id;
        address customer;
        address cook;
        address deliveryMan;
        uint256 price;
        Status status;
    }

    struct Employee {
        address id;
        Role role;
    }

    mapping(address => Employee) public employees;
    mapping(uint256 => Order) public orders;

    event OrderPlaced(uint256 id, address customer, uint256 price);
    event OrderPreparing(uint256 id, address cook);
    event OrderReady(uint256 id, address cook);
    event OrderInDelivery(uint256 id, address deliveryMan);
    event OrderCompleted(uint256 id, address deliveryMan, address customer);

    uint private ordersCount = 0;
    address private owner;
    address private cook = 0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c;
    address private deliveryMan = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;
    address payable private companyWallet;

    constructor() {
        employees[cook] = Employee(cook, Role.COOK);
        employees[deliveryMan] = Employee(deliveryMan, Role.DELIVERY_MAN);
        companyWallet = payable(msg.sender);
        owner = msg.sender;
    }

    /**
     * @dev Modifier to check if the caller is an employee
     */
    modifier onlyEmployee() {
        // require(
        //     msg.sender == cook || msg.sender == deliveryMan,
        //     "Only employees can call this function"
        // );
        require(
            employees[msg.sender].role == Role.COOK ||
                employees[msg.sender].role == Role.DELIVERY_MAN,
            "Only employees can call this function"
        );
        _;
    }

    /**
     * @dev Modifier to check if the caller is the owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @dev Update company wallet address
     * @param _companyWallet company wallet address
     */
    function updateCompanyWalletAddress(
        address payable _companyWallet
    ) public onlyOwner {
        require(
            _companyWallet != address(0),
            "Company wallet address cannot be zero address"
        );
        companyWallet = _companyWallet;
    }

    /**
     * @dev Add an employee
     * @param _id employee address
     * @param m_role employee role
     */
    function addEmployee(address _id, string memory m_role) public onlyOwner {
        require(_id != address(0), "Employee address cannot be zero address");
        require(
            employees[_id].id == address(0),
            "Employee already exists with this address"
        );
        Role _role = convertToRoleEnum(m_role);
        employees[_id] = Employee(_id, _role);
    }

    /**
     * @dev Remove an employee
     * @param _id employee address
     */
    function removeEmployee(address _id) public onlyOwner {
        require(_id != address(0), "Employee address cannot be zero address");
        require(
            employees[_id].id != address(0),
            "Employee does not exist with this address"
        );
        delete employees[_id];
    }

    /**
     * @dev Place an order
     */
    function placeOrder() public payable {
        require(msg.value > 0, "Price must be greater than 0");
        ordersCount++;
        uint orderId = ordersCount;
        require(orders[orderId].id == 0, "Order already exists");
        orders[orderId] = Order(
            orderId,
            msg.sender,
            address(0),
            address(0),
            msg.value,
            Status.PLACED
        );
        emit OrderPlaced(orderId, msg.sender, msg.value);
    }

    /**
     * @dev Prepare order
     * @param _id order id
     */
    function prepareOrder(uint256 _id) public onlyEmployee {
        require(orders[_id].id != 0, "Order does not exist with this id");
        require(
            orders[_id].status == Status.PLACED,
            "Order must be in PLACED status"
        );
        updateOrderStatus(_id, Status.PREPARING);
        updateOrderCook(_id, msg.sender);
        emit OrderPreparing(_id, msg.sender);
    }

    /**
     * @dev Set order ready to delivery
     * @param _id order id
     */
    function readyOrder(uint256 _id) public onlyEmployee {
        require(orders[_id].id != 0, "Order does not exist with this id");
        require(
            orders[_id].status == Status.PREPARING,
            "Order must be in PREPARING status"
        );
        updateOrderStatus(_id, Status.READY);
        emit OrderReady(_id, msg.sender);
    }

    /**
     * @dev Deliver order
     * @param _id order id
     */
    function deliverOrder(uint256 _id) public onlyEmployee {
        require(orders[_id].id != 0, "Order does not exist with this id");
        require(
            orders[_id].status == Status.READY,
            "Order must be in READY status"
        );
        updateOrderStatus(_id, Status.DELIVERING);
        updateOrderdeliveryMan(_id, msg.sender);
        emit OrderInDelivery(_id, msg.sender);
    }

    /**
     * @dev Complete order
     * @param _id order id
     */
    function completeOrder(uint256 _id) public onlyEmployee {
        require(orders[_id].id != 0, "Order does not exist with this id");
        require(
            orders[_id].status == Status.DELIVERING,
            "Order must be in DELIVERING status"
        );
        updateOrderStatus(_id, Status.COMPLETED);
        transferMoney(companyWallet, orders[_id].price);
        emit OrderCompleted(_id, msg.sender, orders[_id].customer);
    }

    /**
     * @dev Update order
     * @param _id order id
     * @param _status order status
     */
    function updateOrderStatus(uint256 _id, Status _status) private {
        orders[_id].status = _status;
    }

    /**
     * @dev Update order
     * @param _id order id
     * @param _cook cook address
     */
    function updateOrderCook(uint256 _id, address _cook) private {
        orders[_id].cook = _cook;
    }

    /**
     * @dev Update order
     * @param _id order id
     * @param _deliveryMan delivery guy address
     */
    function updateOrderdeliveryMan(uint256 _id, address _deliveryMan) private {
        orders[_id].deliveryMan = _deliveryMan;
    }

    /**
     * @dev Withdraw money from contract
     */
    function transferMoney(address payable _to, uint256 _amount) private {
        _to.transfer(_amount);
    }

    /**
     * @dev Get order status
     * @param _id order id
     */
    function getOrderStatus(uint256 _id) public view returns (Status) {
        return orders[_id].status;
    }

    /**
     * @dev Get order price
     * @param _id order id
     */
    function getOrderPrice(uint256 _id) public view returns (uint256) {
        return orders[_id].price;
    }

    /**
     * @dev Get order cook
     * @param _id order id
     */
    function getOrderCook(uint256 _id) public view returns (address) {
        return orders[_id].cook;
    }

    /**
     * @dev Get contract owner address
     */
    function getOwner() public view returns (address) {
        return owner;
    }

    /**
     * @dev Get company wallet address
     */
    function getCompanyWalletAddress() public view onlyOwner returns (address) {
        return companyWallet;
    }

    function convertToRoleEnum(
        string memory m_role
    ) private pure returns (Role) {
        bytes32 encodedRole = keccak256(abi.encodePacked(m_role));
        bytes32 encodedRole0 = keccak256(abi.encodePacked("CUSTOMER"));
        bytes32 encodedRole1 = keccak256(abi.encodePacked("DELIVERY_MAN"));
        bytes32 encodedRole2 = keccak256(abi.encodePacked("COOK"));

        if (encodedRole == encodedRole0) {
            return Role.CUSTOMER;
        } else if (encodedRole == encodedRole1) {
            return Role.DELIVERY_MAN;
        } else if (encodedRole == encodedRole2) {
            return Role.COOK;
        }

        revert("Employee role is not valid");
    }

    function convertToStatusEnum(
        string memory m_status
    ) private pure returns (Status) {
        bytes32 endcodedStatus = keccak256(abi.encodePacked(m_status));
        bytes32 endcodedStatus0 = keccak256(abi.encodePacked("NOT_EXISTS"));
        bytes32 endcodedStatus1 = keccak256(abi.encodePacked("PLACED"));
        bytes32 endcodedStatus2 = keccak256(abi.encodePacked("PREPARING"));
        bytes32 endcodedStatus3 = keccak256(abi.encodePacked("READY"));
        bytes32 endcodedStatus4 = keccak256(abi.encodePacked("DELIVERING"));
        bytes32 endcodedStatus5 = keccak256(abi.encodePacked("COMPLETED"));

        if (endcodedStatus == endcodedStatus0) {
            return Status.NOT_EXISTS;
        } else if (endcodedStatus == endcodedStatus1) {
            return Status.PLACED;
        } else if (endcodedStatus == endcodedStatus2) {
            return Status.PREPARING;
        } else if (endcodedStatus == endcodedStatus3) {
            return Status.READY;
        } else if (endcodedStatus == endcodedStatus4) {
            return Status.DELIVERING;
        } else if (endcodedStatus == endcodedStatus5) {
            return Status.COMPLETED;
        }

        revert("Order status is not valid");
    }
}
