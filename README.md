# FabCar

## What is FabCar
FabCar is a web-based application meant to provide a graphical user interface for the Fabcar application presented in the Hyperledger Fabric ["Writing your first application" tutorial](https://hyperledger-fabric.readthedocs.io/en/release-1.2/write_first_app.html).

## How to set up FabCar
1. Follow the Hyperledger Fabric tutorial to install Fabric and its related dependencies.
2. Once done, follow the tutorial found on [this page](https://hyperledger-fabric.readthedocs.io/en/release-1.2/write_first_app.html) until just before the "Querying the Ledger" part.
3. Place the "fabcar-backend.js" file into the same directory as the Hyperledger "registerUser.js" and "enrollAdmin.js" files. Start the Express server with the following command.
     ```sh
    $ node fabcar-backend.js
    ```
4. Once the express server is up, build and run the React front-end found in the "fabcar-front" folder.
5. FabCar should be available at localhost:3000

## How to use FabCar
The FabCar interface is broken into three separate screens; the top left info screen, top right navigation screen and bottom block viewer.

When the application is first started, the latest block will be retrieved from the ledger and added to the blocklist as shown below.
 ![screenshot](https://github.com/TheIanSim/FabCar/blob/master/Media/Screen%20Shot%202018-08-10%20at%2012.14.26%20AM.png)

There will also be a small status indicator in the lower right corner to indicate if the application is connected to the back-end server.

FabCar has 4 main functions:

- Query a single car
- Query all cars
- Transfer a car
- Create a car

These functions mirror the original command-line based fabcar application found in the Hyperledger documentation.

The info screen displays information pertinent to the selected function such as displaying the information of a car selected as shown.
![screenshot](https://github.com/TheIanSim/FabCar/blob/master/Media/Screen%20Shot%202018-08-10%20at%2012.15.07%20AM.png)

or displaying all cars when "Query All" is called
![screenshot](https://github.com/TheIanSim/FabCar/blob/master/Media/Screen%20Shot%202018-08-10%20at%2012.15.28%20AM.png)

The "Feed" panel shows in real-time what the application is doing to interact with the underlying Blockchain.

For example, In a query request, the application only needs to query the peers as shown.
 ![screenshot](https://github.com/TheIanSim/FabCar/blob/master/Media/Screen%20Shot%202018-08-10%20at%2012.15.45%20AM.png)


When a transfer or create request is invoked, the application has to make sure there is consensus amongst the peers before the change is committed to the ledger. Only then is the block added to the Blockchain and updated as shown.
![screenshot](https://github.com/TheIanSim/FabCar/blob/master/Media/Screen%20Shot%202018-08-10%20at%2012.16.16%20AM.png)

The Blockchain viewer will also update reactively to any new blocks that have been added to the chain, even blocks not contributed by this client.

Feed messages will allow the user to see what is happening on the chaincode level when an invoke transaction is being called. ![screenshot](https://github.com/TheIanSim/FabCar/blob/master/Media/Screen%20Shot%202018-08-10%20at%2012.16.33%20AM.png)

The blockchain viewer will show the block number, channel the block is on, and the transaction IDs of transactions on that block.
![screenshot](https://github.com/TheIanSim/FabCar/blob/master/Media/Screen%20Shot%202018-08-10%20at%2012.19.41%20AM.png)



## What technologies are being used
FabCar's single-page application front-end is being powered by React; using create-react-app to bootstrap the project. A NodeJS Express server is used for the backend which, together with Socket.io, allow for the real-time updating of blocks.
Interfacing with the blockchain ledger is done via Hyperledger's Node SDK. All transactions are signed using the "user1" identity.

## Media
Screenshots are available [HERE](/Media).
A YouTube demonstration is also available [Part 1](https://youtu.be/hWPlVqPRyp4), [Part 2](https://youtu.be/ipUDXU-eOYs).
