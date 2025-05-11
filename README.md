# PATH-FINDER

![HTML](https://img.shields.io/badge/HTML-60%25-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-22.6%25-yellow)
![C++](https://img.shields.io/badge/C++-12.1%25-blue)
![CSS](https://img.shields.io/badge/CSS-5%25-purple)
![Makefile](https://img.shields.io/badge/Makefile-0.3%25-lightgrey)

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [UI Demonstrations](#ui-demonstrations)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Introduction
**PATH-FINDER** is a project designed to solve pathfinding problems efficiently. The project comprises two main functionalities:
1. **Map-Based Pathfinding**: Implements four different algorithms to find the shortest path on a map and compares their runtimes to determine the most efficient one.
2. **Maze-Based Pathfinding**: Takes a maze as input and performs the same functionality as the first part, finding the shortest path and comparing algorithm efficiency.

This project is developed to provide interactive visualizations and insights into the performance of popular pathfinding algorithms.

## Features
- **Multiple Algorithms**: Implements four pathfinding algorithms to calculate the shortest path.[A*,Dijkstra,Floyd warshall, Bellman Ford]
- **Algorithm Comparison**: Compares the runtime of algorithms and identifies the most efficient one.
- **Interactive Visualizations**: Dynamically visualizes the pathfinding process for both map and maze inputs.
- **Cross-Platform Support**: Runs seamlessly in a web browser.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/VAISHNAVISARANGA/PATH-FINDER.git
   ```
2. Navigate to the project directory:
   ```bash
   cd PATH-FINDER
   ```
3. Open `UI_pathfinder.html` and `UI__MAZE.html`in your web browser to visualize the Map and Maze respectively.
## Usage
1. **Map-Based Pathfinding**:
   - Select a map as input.
   - Choose the start place and end place.
   - The application will display the path and runtime of all four algorithms.
   - After running all algorithms, the application will recommend the most efficient one.

2. **Maze-Based Pathfinding**:
   - Upload or select a maze as input.
   - Manually enter the dimensions of the Maze.
   - Choose the start and end points.
   - Select one of the four algorithms to calculate the shortest path.
   - Similar to the map-based implementation, the application will display the path and recommend the best algorithm based on runtime.

## UI Demonstrations
### Map-Based Pathfinding
[![Map-Based Pathfinding Video](https://github.com/VAISHNAVISARANGA/PATH-FINDER/blob/main/UI_MAP.mp4)

### Maze-Based Pathfinding
[![Maze-Based Pathfinding Video](https://github.com/VAISHNAVISARANGA/PATH-FINDER/blob/main/UI_Maze%20(1).mp4)


## Technologies Used
- **HTML (60%)**: Structure and layout of the application.
- **JavaScript (22.6%)**: Core logic for pathfinding and interactivity.
- **C++ (12.1%)**: Backend computation for algorithm efficiency (if applicable).
- **CSS (5%)**: Styling and design.
- **Makefile (0.3%)**: Build automation (if applicable).

## Contributing
Contributions to PATH-FINDER are welcome! To contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your fork and submit a pull request.

## License
This project is licensed under the [MIT License](LICENSE).

---

### Acknowledgments
Special thanks to all contributors and open-source libraries used in this project.# PATH-FINDER
