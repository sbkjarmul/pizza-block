# PizzaBlock dApp

## 1 Goal

Design and implement an autonomous system for ordering pizzas.

## 2 Requirements Gathering

### 2.1 Pizza supply chain

    1. System (ordered)
    2. Kitchen (preparing)
    3. Delivery (delivering)
    4. Customer's location (order completed)

### 2.2 System actors

    1. Cook - take order from system, change order status, make pizza
    2. Delivery Guy - transport pizza beetwen location
    3. Hot Storage - store pizza in hot temperatures (waiting for delivery)
    4. Customer - pay / sign order as delivered (completed)

### 2.3 Problem solution map

    1. Ordered pizza is not delivered - Customer can receive his money back if pizza wont be completed. Customer must confirm that pizza is delivered.
    2. Pizza is delivered with delay - Customer can receive automatic refund % if delivery takes more than estimated time.
    3. Less employeess - system is autonomous:
        - smart contracts,
        - AI chatbot,
    4. Sales - Customer collects tokens for big orders and can pay with them.
    5. Audit - blockchain is a ledger

### 2.4 Why blockchain?

    1. Data redundancy - data can't be lost
    2. Payment and verification - fast automatic payment system and easily verified with on-chain identities
    3. Automatic system - smart contract's logic,
    4. Transparency - a cook and delivery person is assigned to each order
