# PPLE SCRAPER AS API

This project is a simple scraper of ["Portail de la Publicité Légale des Entreprises"](https://www.pple.fr) website.

*Le portail PPLE.fr s’appuie sur une licence R2B souscrite auprès de l’INSEE pour opérer la recherche d’entreprises à travers la base Sirene tenue à jour par l’INSEE.*

*À partir des données de la base Sirene, PPLE propose une sélection d’entreprises en correspondance avec les bases de données partenaires d’Actulegales.fr, de Bodacc.fr et d’Infogreffe.fr.*

## Getting started 

First create the `.env`file inside the project root :

```bash
cp .env.example .env
```

### Run with Docker 

Using __Docker Compose__ run the following commands inside the project root to start docker services :

```bash
docker-compose up --build -d
docker-compose logs -f server
```

### Run with NodeJS

Be sure to have a mongoDB deamon running or just start MongoDB Docker Service :

```bash
docker-compose up database -d
```

Change in `.env` the following var to `MONGO_HOST=localhost`.

Start server with `npm`:

```bash
npm install
npm start
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
