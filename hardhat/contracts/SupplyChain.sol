// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

/**
 * @title SupplyChain
 * @dev SupplyChain contract
 * @notice This contract is used to manage orders in a PizzaBlock
 */
contract SupplyChain {
    enum Role {
        COOK,
        DELIVERY_GUY,
        CUSTOMER
    }

    enum Status {
        ORDERED,
        PREPARING,
        READY,
        DELIVERING,
        COMPLETED
    }

    struct Order {
        uint256 id;
        address customer;
        address cook;
        address deliveryGuy;
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
    event OrderReady(uint256 id, address cook);
    event OrderDelivered(uint256 id, address deliveryGuy, address customer);

    uint private ordersCount = 0;
    address private cook = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
    address private deliveryGuy = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;

    constructor() {
        employees[cook] = Employee(cook, Role.COOK);
        employees[deliveryGuy] = Employee(deliveryGuy, Role.DELIVERY_GUY);
    }

    /**
     * @dev Modifier to check if the caller is an employee
     */
    modifier onlyEmployee() {
        require(
            employees[msg.sender].role == Role.COOK ||
                employees[msg.sender].role == Role.DELIVERY_GUY,
            "Only employees can call this function"
        );
        _;
    }

    /**
     * @dev Add an employee
     * @param _id employee address
     * @param _role employee role
     */
    function addEntity(address _id, Role _role) public {
        employees[_id] = Employee(_id, _role);
    }

    /**
     * @dev Update order
     * @param _id order id
     * @param _status order status
     */
    function updateOrderStatus(
        uint256 _id,
        Status _status
    ) public onlyEmployee {
        orders[_id].status = _status;
    }

    /**
     * @dev Update order
     * @param _id order id
     * @param _cook cook address
     */
    function updateOrderCook(uint256 _id, address _cook) public onlyEmployee {
        orders[_id].cook = _cook;
    }

    /**
     * @dev Update order
     * @param _id order id
     * @param _deliveryGuy delivery guy address
     */
    function updateOrderDeliveryGuy(
        uint256 _id,
        address _deliveryGuy
    ) public onlyEmployee {
        orders[_id].deliveryGuy = _deliveryGuy;
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
            Status.ORDERED
        );
        emit OrderPlaced(orderId, msg.sender, msg.value);
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
}
