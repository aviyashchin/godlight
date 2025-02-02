# GodLight 
Created by Aesop Yashchin

# Built with love and cursed by the gods
🕹️ Aesop's first Video Game 🎮
[Play GodLight](https://godlight.vercel.app/)

## About
GodLight is a competitive multiplayer brawler featuring the gods of Mount Olympus. Each area in the arena comes with a unique curse that shapes their gameplay, creating a challenging experience.

## Features
* 13 playable gods from Greek mythology
* Unique passive curses for each area in the stadium
* Fast-paced competitive gameplay
* No "good" abilities - only interesting drawbacks to master
* Local multiplayer with split-screen

## Playable Characters
Each area in the arena carries a curse that affects their gameplay:

* **Zeus**: Lightning randomly strikes (5 damage)
* **Poseidon**: Whirpools spawn randomly and trap whoever is in them when they spawn
* **Hades**: Skeletal warriors spawn and attack whatever is near them (3 melee damage, 1 ranged damage, cannot leave Hades area)
* **Athena**: Attacks have a 10 percent chance to heal enemies (as much health as damage)
* **Ares**: 10 less shield 
* **Aphrodite**: Everyone in the Aphrodite area is drawn to each other (slows them down if they try to run away)
* **Apollo**: Your side of the screen turns really bright
* **Artemis**: Moonbeams randomly appear, silver arrows rain down (1 arrow, 3 damage)
* **Hephaestus**: Your regular attack does 5 less damage
* **Hermes**: Harder to turn (you can still turn, just slower)
* **Dionysus**: Screen spins slowly
* **Demeter**: Flowers grab and slow everyone
* **Hera**: You slowly lose buffs

## How to Play
1. Visit [godlight.vercel.app](https://godlight.vercel.app/)
2. Select your god
3. Learn to use their curse to your advantage
4. Battle other players

## Contributing
Feel free to open issues or submit pull requests

## License
MIT License

## Contact
* Website: [godlight.vercel.app](https://godlight.vercel.app/)
* Twitter: [@AesopGames](#)
* Discord: [Join our community](#)

## File Layout

GodLight/
├── index.html
├── js/
│   ├── main.js
│   ├── helpers.js
│   ├── classes/
│   │   ├── ProjectileAttack.js
│   │   ├── MeleeAttack.js
│   │   ├── PieZone.js
│   │   ├── PowerUp.js
│   │   ├── Player.js        <-- (unchanged except for HUD hook, if desired)
│   │   ├── Enemy.js         <-- updated enemy AI
│   │   └── CurseManager.js  <-- new file for curse logic
│   └── scenes/
│       ├── MainScene.js     <-- updated with audio, split-screen HUD & curse manager
│       ├── WinScene.js
│       └── HelpScene.js
├── assets/
│   ├── audio/
│   │   ├── bgMusic.mp3
│   │   └── lightning.mp3
│   └── images/
│       └── *(optional placeholder images)*
├── README.md
└── package.json
