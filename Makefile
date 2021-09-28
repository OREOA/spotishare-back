build:
	docker-compose -f docker-compose.dev.yml build

up:
	docker-compose -f docker-compose.dev.yml up -d

down: 
	docker-compose down --remove-orphans

up-prod:
	docker-compose up -d

db-migrate:
	docker exec -it spotishare npx prisma migrate dev --name migrate