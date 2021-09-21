build:
	docker-compose -f docker-compose.dev.yml build

up:
	docker-compose -f docker-compose.dev.yml up -d

down: 
	docker-compose down

up-prod:
	docker-compose up -d