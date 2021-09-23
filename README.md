See frontend: https://github.com/OREOA/spotishare-front

# Spotishare backend
## Development:
### Prerequisites:
* Node.js 14.x
* Docker
* Spotify API access
* .env file (check example.env)

### Backend:
Backend depends on two containers: Node.js server and PostgreSQL database

**Start development**
1. Build docker image `make build`
2. Start docker container with database `make up`
3. Migrate db schema if needed `make db-migrate`
3. Server running at `http://localhost:5000`
4. Stop server `make down`