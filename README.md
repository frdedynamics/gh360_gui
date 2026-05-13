# GH360 Robot Arm Web GUI

Created with React.

## Installation

Make sure Node is downloaded on your computer.

You can check it with

```bash
node -v
```
node version should be >22.*
# Run the project locally

## Clone the project

```bash
git clone https://github.com/frdedynamics/gh360_gui.git
```
## Move to the React project directory
```bash
cd gh360_gui/gh360_gui
```
## Install dependencies

```bash
npm i
```

## Run the local server
```bash
npm run dev
```

## In order to run locally without a robot
Clone the repository: https://github.com/LauEls/gh360_replay_environment
and follow the instructions to set up the docker container in order to simulate the communication with the robot.
The program will still run without, but you won't receive any data to show, nor will it be possible to simulate moving the robot.

## License

[MIT](https://choosealicense.com/licenses/mit/)
