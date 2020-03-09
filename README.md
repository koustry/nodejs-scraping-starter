# Simple NodeJS web scraper

This project is a simple web scraper of ["Portail de la Publicité Légale des Entreprises"](https://www.pple.fr) website  written in `NodeJS`.

*Le portail PPLE.fr s’appuie sur une licence R2B souscrite auprès de l’INSEE pour opérer la recherche d’entreprises à travers la base Sirene tenue à jour par l’INSEE.*

## Installation

Use the package manager `Yarn` to install the project.
Required NodeJS version >= 10 and mongo DB >= 4.2.3

```bash
yarn install 
```

## Usage 

Departments list are in the data dir. Pick up a __department__ and pass it as parameter with the __task pool size__ :

```bash
yarn run scraper-app Department-Alpes-Maritimes 100
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
